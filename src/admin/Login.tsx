/**
 * The console's door.
 *
 * Two ways in, and they are not two credential systems:
 *
 * 1. **Google SSO** — Google Identity Services in the browser mints an ID token, which the backend's
 *    existing `POST /auth/sso/google` exchanges for a Qafilaa session. `hd`/`login_hint` narrow the
 *    chooser to the admin address, but that is convenience; the address is checked again after the
 *    exchange, and the real gate is `Policies.Ops` on the server.
 *
 * 2. **A fixed code** — the backend's `Auth:Demo` path, which accepts one configured six-digit code
 *    for one configured address. It writes into the same OTP store, with the same lifetime, behind
 *    the same rate limiter as a mailed code; nothing downstream knows the difference. With no
 *    `Auth:Demo` entry configured the same form still works as an ordinary emailed OTP.
 *
 * **None of this is the security boundary and it must never be mistaken for one.** Everything here
 * runs on the operator's machine, where it can be edited. The boundary is `Ops:AdminEmails` on the
 * API — a session for any other account authenticates fine and then 403s on every ops route.
 */
import { useEffect, useState } from 'react';

import { ADMIN_EMAIL, ApiError, requestCode, signInWithCode, signInWithGoogle, type AdminIdentity } from './api';
import { DAYLIGHT, HG, SG, inputStyle } from './theme';
import { Badge, Banner, Button, Field, Styles } from './ui';

/**
 * The Google **web** OAuth client (`client_type: 3` in the app's `google-services.json`).
 *
 * Baked in rather than left to a build-time variable because it is not a secret — a browser client id
 * is published in every page that uses it — and because the alternative was a console that silently
 * shipped without its SSO button whenever someone forgot the env var. `VITE_GOOGLE_CLIENT_ID` still
 * overrides it.
 *
 * **This exact id is already in the backend's `Google:Audiences` allow-list**, so a token it mints is
 * accepted by `POST /auth/sso/google` with no server change. The one thing that is NOT automatic:
 * `https://qafilaa.in` must be listed as an **Authorised JavaScript origin** on this OAuth client in
 * the Google Cloud console, or Google refuses to render the button at all (`origin_mismatch`).
 */
const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  '410180123105-t83q80dul2h1hfr6f0k840jtv91oefqv.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(config: { client_id: string; callback: (r: { credential?: string }) => void }): void;
          renderButton(el: HTMLElement, opts: Record<string, unknown>): void;
        };
      };
    };
  }
}

export function Login({ onSignedIn }: { onSignedIn: (identity: AdminIdentity) => void }) {
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [ssoReady, setSsoReady] = useState(false);

  /* Google Identity Services, loaded lazily so the script is not fetched for anyone who never opens
     this route. Failure to load is not fatal — the code path below is a complete way in. */
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const mount = () => {
      const el = document.getElementById('qf-gsi');
      if (!window.google || !el) return;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          if (!response.credential) return;
          setBusy(true);
          setError(null);
          try {
            onSignedIn(await signInWithGoogle(response.credential));
          } catch (e) {
            setError(describe(e));
          } finally {
            setBusy(false);
          }
        },
      });
      window.google.accounts.id.renderButton(el, {
        theme: 'outline', size: 'large', width: 320, text: 'signin_with', shape: 'pill',
      });
      setSsoReady(true);
    };

    if (window.google) { mount(); return; }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = mount;
    document.head.appendChild(script);
  }, [onSignedIn]);

  async function send() {
    setBusy(true);
    setError(null);
    try {
      await requestCode(email.trim());
      setSent(true);
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      onSignedIn(await signInWithCode(email.trim(), code.trim()));
    } catch (e) {
      setError(describe(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="qf-admin"
      style={{ ...(DAYLIGHT as unknown as React.CSSProperties), background: 'var(--bg)', minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}
    >
      <Styles />
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <div
            aria-hidden
            style={{
              width: 46, height: 46, borderRadius: 13, background: 'var(--acc)', color: 'var(--ctaInk)',
              display: 'grid', placeItems: 'center', margin: '0 auto 14px', font: `600 20px ${SG}`,
            }}
          >
            Q
          </div>
          <h1 style={{ font: `600 24px ${SG}`, color: 'var(--ink)', margin: '0 0 6px', letterSpacing: '-.02em' }}>
            Qafilaa Ops
          </h1>
          <p style={{ font: `400 14px/1.6 ${HG}`, color: 'var(--mut)', margin: 0 }}>
            One account holds this console. Everything here is audited.
          </p>
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 22 }}>
          {error ? (
            <Banner tone="danger" title={error.message}>
              {error.detail ?? 'Try again, or use the other method below.'}
            </Banner>
          ) : null}

          <div style={{ display: 'grid', placeItems: 'center', minHeight: ssoReady ? 44 : 0 }}>
            <div id="qf-gsi" />
          </div>

          {GOOGLE_CLIENT_ID && !ssoReady ? (
            <Banner tone="warn" title="The Google button did not load">
              Usually this origin is not on the OAuth client&rsquo;s authorised list, or a blocker stopped
              Google&rsquo;s script. The code sign-in below works either way.
            </Banner>
          ) : null}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
            <div style={{ height: 1, background: 'var(--line)', flex: 1 }} />
            <span style={{ font: `500 11px ${SG}`, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
              or
            </span>
            <div style={{ height: 1, background: 'var(--line)', flex: 1 }} />
          </div>

          <Field label="Admin email">
            <input
              className="qf-a"
              style={inputStyle}
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setSent(false); }}
              autoComplete="username"
              spellCheck={false}
            />
          </Field>

          {sent ? (
            <>
              <Field label="Six-digit code" hint="The fixed code if this address is configured in Auth:Demo; otherwise the one just emailed.">
                <input
                  className="qf-a"
                  style={{ ...inputStyle, font: `500 18px ${SG}`, letterSpacing: '.28em', textAlign: 'center' }}
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={(e) => { if (e.key === 'Enter' && code.length === 6) void verify(); }}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </Field>
              <Button variant="primary" full onClick={() => void verify()} disabled={busy || code.length !== 6}>
                {busy ? 'Checking…' : 'Sign in'}
              </Button>
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <Button variant="ghost" onClick={() => { setSent(false); setCode(''); }}>Use a different address</Button>
              </div>
            </>
          ) : (
            <Button variant="primary" full onClick={() => void send()} disabled={busy || !email.includes('@')}>
              {busy ? 'Sending…' : 'Continue with a code'}
            </Button>
          )}
        </div>

        <p style={{ font: `400 12.5px/1.6 ${HG}`, color: 'var(--sur)', textAlign: 'center', marginTop: 18 }}>
          <Badge tone="accent">{ADMIN_EMAIL}</Badge>
          <br />
          <span style={{ display: 'inline-block', marginTop: 8 }}>
            Any other account can sign in and will be refused by the API on every request.
          </span>
        </p>
      </div>
    </div>
  );
}

function describe(e: unknown): { message: string; detail?: string } {
  if (e instanceof ApiError) return { message: e.message, detail: e.detail };
  return { message: 'Something went wrong.', detail: e instanceof Error ? e.message : undefined };
}

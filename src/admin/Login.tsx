/**
 * The console's door — a two-panel sign-in.
 *
 * ## The split, and why the left half is dark
 *
 * The brand half uses the **`deep` tone from the site's own tone table** (`src/site/tokens.ts`) —
 * `#0A5057` ground, `#A9F4F9` accent — not a dark palette invented here. Those tones are real: the
 * scroll engine defines all five and the landing page merely flattens them to `light` for one
 * continuous paper stock. Borrowing `deep` for a surface the engine never touches is using the design
 * system rather than departing from it, and it does the job a brand panel exists for: the console
 * stops looking like a form floating in a void, and the two halves say plainly which side is *about*
 * and which is *do*.
 *
 * The topographic contours are the site's contour field, redrawn simply. They are the right motif for
 * a product about riding through mountains, and they are generated rather than shipped as an asset,
 * so they cost nothing and scale to any panel size.
 *
 * ## Two ways in, and neither is the security boundary
 *
 * 1. **Google SSO** — GIS mints an ID token; `POST /auth/sso/google` exchanges it. The client id is a
 *    web client already listed in the backend's `Google:Audiences`.
 * 2. **A fixed code** — the backend's `Auth:Demo` path: one configured six-digit code for one
 *    configured address, same OTP store, same lifetime and same rate limiter as a mailed code. With
 *    nothing configured it is an ordinary emailed OTP, which is arguably what you want day to day.
 *
 * **The email check here is UX.** It explains a refusal instead of handing over a session that 403s on
 * everything. The real gate is `Policies.Ops` on the API, which nothing in this file can influence.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { ADMIN_EMAIL, ApiError, requestCode, signInWithCode, signInWithGoogle, type AdminIdentity } from './api';
import { DAYLIGHT, EYEBROW, HG, SG, inputStyle } from './theme';
import { Banner, Button, Field, Styles } from './ui';

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
 * the Google Cloud console, or the popup dies with `no registered origin` / `invalid_client`.
 */
const GOOGLE_CLIENT_ID =
  (import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined) ??
  '410180123105-t83q80dul2h1hfr6f0k840jtv91oefqv.apps.googleusercontent.com';

/** The site's `deep` tone, verbatim from `src/site/tokens.ts`. */
const DEEP = {
  bg: '#0A5057',
  ink: '#F7F5F0',
  mut: '#BFE0E2',
  sur: '#A7D2D5',
  line: '#12666F',
  acc: '#A9F4F9',
  ctaInk: '#04262A',
} as const;

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
    <div className="qf-admin" style={{ ...(DAYLIGHT as unknown as React.CSSProperties), minHeight: '100vh' }}>
      <Styles />
      <LoginStyles />

      <div className="qf-login">
        <BrandPanel />

        <div className="qf-login-form">
          <div style={{ width: '100%', maxWidth: 400 }}>
            <header style={{ marginBottom: 26 }}>
              <h1 style={{ font: `600 27px ${SG}`, color: 'var(--ink)', margin: '0 0 8px', letterSpacing: '-.02em' }}>
                Sign in
              </h1>
              <p style={{ font: `400 14.5px/1.6 ${HG}`, color: 'var(--mut)', margin: 0 }}>
                One account holds this console, and every change it makes is audited.
              </p>
            </header>

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
                Google&rsquo;s script was blocked, or this origin is not registered. The code sign-in below
                works either way.
              </Banner>
            ) : null}

            {ssoReady ? <OriginHelp /> : null}

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
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
                <CodeBoxes
                  value={code}
                  onChange={setCode}
                  onComplete={() => { if (!busy) void verify(); }}
                />
                <Button variant="primary" full onClick={() => void verify()} disabled={busy || code.length !== 6}>
                  {busy ? 'Checking…' : 'Sign in'}
                </Button>
                <div style={{ textAlign: 'center', marginTop: 10 }}>
                  <Button variant="ghost" onClick={() => { setSent(false); setCode(''); }}>
                    Use a different address
                  </Button>
                </div>
              </>
            ) : (
              <Button variant="primary" full onClick={() => void send()} disabled={busy || !email.includes('@')}>
                {busy ? 'Sending…' : 'Continue with a code'}
              </Button>
            )}

            <p style={{ font: `400 12.5px/1.6 ${HG}`, color: 'var(--sur)', marginTop: 22, textAlign: 'center' }}>
              Only <strong style={{ color: 'var(--mut)' }}>{ADMIN_EMAIL}</strong> may hold a session here.
              Any other account signs in and is then refused by the API on every request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- brand */

/** What the console actually holds. Concrete, because "powerful admin tools" tells an operator nothing. */
const INSIDE: readonly (readonly [string, string])[] = [
  ['Riders', 'Everyone who signed up, who finished setup, who never joined a trip'],
  ['Live map', 'Where riders are right now, and how stale each fix is'],
  ['Safety', 'Every alert the cascade has raised, and what happened to it'],
  ['Release', 'The force-update gate, with the guardrails that stop a fleet lockout'],
];

function BrandPanel() {
  return (
    <aside className="qf-login-brand" style={{ background: DEEP.bg, color: DEEP.ink }}>
      <Contours />

      <div className="qf-brand-inner">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            aria-hidden
            style={{
              width: 42, height: 42, borderRadius: 12, background: DEEP.acc, color: DEEP.ctaInk,
              display: 'grid', placeItems: 'center', font: `600 19px ${SG}`, flex: '0 0 42px',
            }}
          >
            Q
          </div>
          <div>
            <div style={{ font: `600 17px ${SG}`, letterSpacing: '-.01em' }}>Qafilaa</div>
            <div style={{ font: `500 11px ${SG}`, letterSpacing: '.16em', textTransform: 'uppercase', color: DEEP.sur }}>
              Ops console
            </div>
          </div>
        </div>

        <div className="qf-brand-mid">
          <h2
            style={{
              font: `600 clamp(28px, 3.4vw, 42px) ${SG}`,
              lineHeight: 1.12, letterSpacing: '-.03em', margin: '0 0 16px', maxWidth: '13ch',
            }}
          >
            Ride together.<br />
            <span style={{ color: DEEP.acc }}>No one left behind.</span>
          </h2>
          <p style={{ font: `400 15px/1.65 ${HG}`, color: DEEP.mut, margin: 0, maxWidth: '42ch' }}>
            This is the operator side of a safety product. Everything behind this screen describes real
            riders on real roads — so it is read-only wherever reading is enough, and audited wherever
            it is not.
          </p>
        </div>

        <ul className="qf-brand-list">
          {INSIDE.map(([label, note]) => (
            <li key={label} style={{ display: 'flex', gap: 12, padding: '11px 0', borderTop: `1px solid ${DEEP.line}` }}>
              <span aria-hidden style={{ color: DEEP.acc, font: `400 13px ${SG}`, lineHeight: 1.5, flex: '0 0 auto' }}>—</span>
              <span>
                <span style={{ display: 'block', font: `600 13.5px ${HG}` }}>{label}</span>
                <span style={{ display: 'block', font: `400 12.5px/1.5 ${HG}`, color: DEEP.sur, marginTop: 2 }}>{note}</span>
              </span>
            </li>
          ))}
        </ul>

        <div style={{ font: `400 12px ${HG}`, color: DEEP.sur }}>
          <a
            className="qf-a"
            href="https://qafilaa.in"
            style={{ color: DEEP.mut, textDecoration: 'none', borderBottom: `1px solid ${DEEP.line}`, paddingBottom: 2 }}
          >
            qafilaa.in
          </a>
        </div>
      </div>
    </aside>
  );
}

/**
 * The contour field, generated rather than shipped.
 *
 * Nested closed rings, each perturbed by two sine terms at different frequencies — enough to read as
 * terrain without pretending to be any actual place, which is the same reason the live map refuses to
 * draw a basemap. Deterministic, so it never flickers between renders.
 */
function Contours() {
  const rings = useMemo(() => {
    const out: string[] = [];
    for (let r = 0; r < 11; r++) {
      const radius = 56 + r * 27;
      const wob = 1 + r * 0.55;
      const pts: string[] = [];
      for (let a = 0; a <= 360; a += 6) {
        const rad = (a * Math.PI) / 180;
        const d = radius + Math.sin(rad * 3 + r * 0.7) * wob * 3.2 + Math.sin(rad * 5 - r * 0.4) * wob * 1.6;
        pts.push(`${(260 + Math.cos(rad) * d).toFixed(1)},${(300 + Math.sin(rad) * d * 0.78).toFixed(1)}`);
      }
      out.push(`M${pts.join('L')}Z`);
    }
    return out;
  }, []);

  return (
    <svg
      className="qf-contours"
      viewBox="0 0 520 620"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
    >
      {rings.map((d, i) => (
        <path
          key={i}
          d={d}
          fill="none"
          stroke={DEEP.acc}
          strokeWidth={i === 4 ? 1.6 : 1}
          opacity={i === 4 ? 0.3 : 0.13}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------- help */

/**
 * The two ways a Google sign-in fails here, both configuration rather than bugs.
 *
 * A `<details>` rather than a banner because neither is wrong *yet* — the button works once the origin
 * is registered, and shouting on every visit would be noise. But when it does fail, it fails inside
 * Google's own popup, which this page can neither see nor style, so the explanation has to be sitting
 * here in advance rather than produced on demand.
 */
function OriginHelp() {
  return (
    <details style={{ marginTop: 12 }}>
      <summary className="qf-a" style={{ cursor: 'pointer', font: `500 12.5px ${HG}`, color: 'var(--sur)' }}>
        Google says &ldquo;Access blocked&rdquo;?
      </summary>
      <div style={{ font: `400 12.5px/1.65 ${HG}`, color: 'var(--mut)', marginTop: 8 }}>
        <p style={{ margin: '0 0 8px' }}>
          <strong>&ldquo;no registered origin&rdquo; / <code>invalid_client</code></strong> — this site is not
          on the OAuth client&rsquo;s <em>Authorised JavaScript origins</em>. Add <code>https://qafilaa.in</code>{' '}
          to the web client in Google Cloud Console → APIs &amp; Services → Credentials. There is no API for
          this; it is a console-only change.
        </p>
        <p style={{ margin: 0 }}>
          <strong>Signed in, then refused</strong> — only <code>{ADMIN_EMAIL}</code> may hold a session. Any
          other Google account authenticates fine and is then rejected on every request by the server&rsquo;s
          ops allow-list, which is the real gate.
        </p>
      </div>
    </details>
  );
}

/* ------------------------------------------------------------------ layout */

/**
 * Layout rules that cannot be inline.
 *
 * Below 900 the brand panel becomes a short banner above the form rather than disappearing: it still
 * says which product this is, which matters on a phone where there is no window title to read. Its
 * list and contours are dropped there — they are context, not instructions, and the form should be
 * reachable without scrolling.
 */
function LoginStyles() {
  return (
    <style>{`
      .qf-login{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);min-height:100vh}
      .qf-login-brand{position:relative;overflow:hidden;display:flex}
      .qf-brand-inner{position:relative;z-index:1;display:flex;flex-direction:column;gap:34px;
                      padding:clamp(32px,4vw,60px);width:100%}
      .qf-brand-mid{margin-top:auto}
      .qf-brand-list{list-style:none;margin:0;padding:0}
      .qf-contours{position:absolute;inset:0;width:100%;height:100%;
                   animation:qfdrift 34s ease-in-out infinite alternate}
      @keyframes qfdrift{from{transform:translate3d(-2%,-1%,0) scale(1.03)}
                         to{transform:translate3d(2%,1%,0) scale(1.09)}}

      .qf-login-form{display:grid;place-items:center;padding:clamp(28px,4vw,56px);background:var(--bg)}

      /* One box per digit. Fixed height, flexible width, so six of them fit any column without
         overflowing and without the last one being clipped. */
      .qf-otp{flex:1 1 0;min-width:0;height:54px;text-align:center;border-radius:12px;
              border:1px solid var(--line);background:var(--card);color:var(--ink);
              font:600 22px 'Space Grotesk',sans-serif;font-variant-numeric:tabular-nums;outline:none;
              transition:border-color .12s,box-shadow .12s}
      .qf-otp:focus{border-color:var(--acc)}
      @media (max-width:420px){.qf-otp{height:48px;font-size:19px}}

      @media (prefers-reduced-motion:reduce){.qf-contours{animation:none}}

      @media (max-width:900px){
        .qf-login{grid-template-columns:1fr;min-height:auto}
        .qf-brand-inner{gap:18px;padding:24px 20px}
        .qf-brand-mid h2{font-size:26px}
        .qf-brand-mid p,.qf-brand-list,.qf-contours{display:none}
        .qf-login-form{padding:28px 20px 48px}
      }
    `}</style>
  );
}

/**
 * Six boxes, one per digit.
 *
 * ## Why boxes rather than one letter-spaced input
 *
 * A single input with `letter-spacing` looks segmented until you edit it: the caret sits between
 * tracked-out glyphs, backspace is ambiguous, and the spacing pushes the last digit against the
 * border. Boxes make the shape of the thing you are typing match the thing itself — six digits,
 * separately — and they show progress without a counter.
 *
 * ## The details that make them usable rather than annoying
 *
 * Boxes are a classic accessibility trap, so: paste fills all six from any box (people paste OTPs far
 * more often than they type them); backspace on an empty box steps back and clears the one before, so
 * a mistake takes one keypress rather than two; arrow keys move; a non-digit is simply ignored rather
 * than rejected with an error; and the whole group is one `aria-label` so a screen reader announces
 * "verification code" once instead of six anonymous text fields.
 *
 * Autofill still works — the first box carries `autocomplete="one-time-code"`, and a browser filling
 * it with the whole code is handled by the same paste path.
 */
function CodeBoxes({
  value, onChange, onComplete,
}: { value: string; onChange: (v: string) => void; onComplete: () => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  function put(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, '');
    if (cleaned.length === 0) return;

    // A paste (or an autofilled OTP) arrives as many characters in one box: take it as the whole code.
    if (cleaned.length > 1) {
      const next = cleaned.slice(0, 6);
      onChange(next);
      const focus = Math.min(next.length, 5);
      refs.current[focus]?.focus();
      if (next.length === 6) onComplete();
      return;
    }

    const chars = value.padEnd(6, ' ').split('');
    chars[index] = cleaned;
    const next = chars.join('').trimEnd();
    onChange(next);

    if (index < 5) refs.current[index + 1]?.focus();
    if (next.replace(/\s/g, '').length === 6) onComplete();
  }

  function onKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const chars = value.padEnd(6, ' ').split('');
      if (chars[index] !== ' ' && chars[index] !== undefined) {
        chars[index] = ' ';
        onChange(chars.join('').trimEnd());
      } else if (index > 0) {
        // Empty box: step back AND clear, so one press undoes one digit.
        chars[index - 1] = ' ';
        onChange(chars.join('').trimEnd());
        refs.current[index - 1]?.focus();
      }
      return;
    }
    if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
    if (e.key === 'Enter' && value.length === 6) onComplete();
  }

  return (
    <div style={{ marginBottom: 14 }}>
      <span style={{ ...EYEBROW, display: 'block', marginBottom: 8 }}>Six-digit code</span>

      <div
        role="group"
        aria-label="Six-digit verification code"
        style={{ display: 'flex', gap: 8 }}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { refs.current[i] = el; }}
            className="qf-a qf-otp"
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1}`}
            value={d.trim()}
            onChange={(e) => put(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            autoFocus={i === 0}
          />
        ))}
      </div>

      <span style={{ display: 'block', font: `400 12.5px/1.5 ${HG}`, color: 'var(--sur)', marginTop: 8 }}>
        The fixed code if this address is configured in <code>Auth:Demo</code>; otherwise the one just
        emailed.
      </span>
    </div>
  );
}

function describe(e: unknown): { message: string; detail?: string } {
  if (e instanceof ApiError) return { message: e.message, detail: e.detail };
  return { message: 'Something went wrong.', detail: e instanceof Error ? e.message : undefined };
}

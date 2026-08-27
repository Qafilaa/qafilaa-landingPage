/**
 * The console shell: sign-in gate, left rail, and whichever panel is selected.
 *
 * ## Why this route is client-only
 *
 * Every other route on this site is prerendered to static HTML by `prerender.mjs` and hydrated. This
 * one must not be. Prerendering an authenticated console would emit a real HTML file whose first
 * paint is the signed-out state, then hydrate into something else — a guaranteed hydration mismatch
 * — and it would put an operator surface in the static bundle where a crawler can find it. So
 * `entry-server` renders a bare shell for `/admin` and everything below mounts in the browser.
 *
 * ## Why the panel lives in the hash
 *
 * The site has no router library and this is not the place to introduce one. A hash (`/admin#users`)
 * survives reload and back/forward without any server-side route configuration, which matters because
 * the site is served from S3/CloudFront where a deep path would need its own rewrite rule to exist at
 * all. One file changed, no infrastructure.
 */
import { useCallback, useEffect, useState } from 'react';

import { clearSession, readIdentity, type AdminIdentity, type UserQuery } from './api';
import { ForceUpdate } from './ForceUpdate';
import { Login } from './Login';
import { Flags, Overview, Runtime, Support, Users } from './panels';
import { DAYLIGHT, HG, SG } from './theme';
import { Button, Styles } from './ui';

type PanelKey = 'overview' | 'users' | 'release' | 'flags' | 'support' | 'runtime';

const PANELS: { key: PanelKey; label: string; icon: string; hint: string }[] = [
  { key: 'overview', label: 'Overview', icon: '◱', hint: 'Counts and the signup trend' },
  { key: 'users', label: 'Riders', icon: '◉', hint: 'Everyone who has signed up' },
  { key: 'release', label: 'Force update', icon: '▲', hint: 'The version gate' },
  { key: 'flags', label: 'Feature flags', icon: '⌥', hint: 'Runtime switches' },
  { key: 'support', label: 'Support', icon: '✉', hint: 'The help-centre queue' },
  { key: 'runtime', label: 'Runtime config', icon: '⚙', hint: 'What the API is running with' },
];

function panelFromHash(): PanelKey {
  const raw = (typeof window === 'undefined' ? '' : window.location.hash.replace('#', '')).toLowerCase();
  return PANELS.some((p) => p.key === raw) ? (raw as PanelKey) : 'overview';
}

export function AdminApp() {
  const [identity, setIdentity] = useState<AdminIdentity | null>(null);
  const [panel, setPanel] = useState<PanelKey>('overview');
  const [userQuery, setUserQuery] = useState<UserQuery | undefined>(undefined);
  const [ready, setReady] = useState(false);

  /* Session is read after mount, never during render: `sessionStorage` does not exist on the server
     and reading it in a render would differ between the two passes. */
  useEffect(() => {
    setIdentity(readIdentity());
    setPanel(panelFromHash());
    setReady(true);
    const onHash = () => setPanel(panelFromHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const go = useCallback((key: PanelKey) => {
    setPanel(key);
    if (typeof window !== 'undefined') window.location.hash = key;
  }, []);

  const goToUsers = useCallback((q: UserQuery) => { setUserQuery(q); go('users'); }, [go]);

  function signOut() {
    clearSession();
    setIdentity(null);
  }

  if (!ready) return null;
  if (!identity) return <Login onSignedIn={setIdentity} />;

  return (
    <div className="qf-admin" style={{ ...(DAYLIGHT as unknown as React.CSSProperties), background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>
      <Styles />
      <div className="qf-shell">
        <nav className="qf-rail" aria-label="Console sections">
          <div className="qf-railhead" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22, padding: '0 6px' }}>
            <div
              aria-hidden
              style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--acc)', color: 'var(--ctaInk)', display: 'grid', placeItems: 'center', font: `600 14px ${SG}` }}
            >
              Q
            </div>
            <div>
              <div style={{ font: `600 14px ${SG}`, color: 'var(--ink)', lineHeight: 1.2 }}>Qafilaa Ops</div>
              <div style={{ font: `400 11.5px ${HG}`, color: 'var(--sur)' }}>Admin console</div>
            </div>
          </div>

          {PANELS.map((p) => {
            const active = panel === p.key;
            return (
              <button
                key={p.key}
                className="qf-a"
                onClick={() => { if (p.key === 'users') setUserQuery(undefined); go(p.key); }}
                title={p.hint}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 40,
                  padding: '0 12px', marginBottom: 3, borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid transparent', whiteSpace: 'nowrap',
                  background: active ? 'var(--acc)' : 'transparent',
                  color: active ? 'var(--ctaInk)' : 'var(--mut)',
                  font: `${active ? 600 : 500} 14px ${HG}`,
                }}
              >
                <span aria-hidden style={{ font: `400 13px ${SG}`, opacity: active ? 1 : 0.7 }}>{p.icon}</span>
                {p.label}
              </button>
            );
          })}

          <div className="qf-railhead" style={{ marginTop: 'auto', paddingTop: 22 }}>
            <div style={{ padding: '12px', background: 'var(--ctr)', borderRadius: 12 }}>
              <div style={{ font: `600 12.5px ${HG}`, color: 'var(--ink)', wordBreak: 'break-all' }}>{identity.email}</div>
              <div style={{ font: `400 11.5px ${HG}`, color: 'var(--sur)', margin: '2px 0 10px' }}>
                signed in via {identity.via === 'sso' ? 'Google' : 'a code'}
              </div>
              <Button variant="secondary" full onClick={signOut}>Sign out</Button>
            </div>
          </div>
        </nav>

        <main className="qf-main">
          {panel === 'overview' ? <Overview onGoToUsers={goToUsers} /> : null}
          {panel === 'users' ? <Users initial={userQuery} /> : null}
          {panel === 'release' ? <ForceUpdate /> : null}
          {panel === 'flags' ? <Flags /> : null}
          {panel === 'support' ? <Support /> : null}
          {panel === 'runtime' ? <Runtime /> : null}
        </main>
      </div>
    </div>
  );
}

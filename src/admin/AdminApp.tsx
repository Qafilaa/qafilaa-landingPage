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
import { Live } from './Live';
import { Audit, Flags, Overview, Runtime, Safety, Trips, Users } from './panels';
import { Support } from './Support';
import { DAYLIGHT, HG, SG } from './theme';
import { Button, Styles } from './ui';

type PanelKey =
  | 'overview' | 'live' | 'users' | 'trips' | 'safety' | 'release' | 'flags' | 'support' | 'audit'
  | 'runtime';

/**
 * The rail, in the order an operator actually needs things.
 *
 * Safety sits high and deliberately above the release and config tooling: this is the console for a
 * product whose whole promise is getting help to a downed rider, so "is anyone in trouble" outranks
 * "what is the minimum build". The groups are separated by a rule rather than by headings, which
 * would cost a third of the rail's height to say very little.
 */
const PANELS: { key: PanelKey; label: string; icon: string; hint: string; group: number }[] = [
  { key: 'overview', label: 'Overview', icon: '◱', hint: 'Counts, the signup trend and recent changes', group: 0 },
  { key: 'live', label: 'Live map', icon: '◎', hint: 'Where riders are right now', group: 0 },
  { key: 'safety', label: 'Safety', icon: '△', hint: 'Every alert the cascade has raised', group: 0 },

  { key: 'users', label: 'Riders', icon: '◉', hint: 'Everyone who has signed up', group: 1 },
  { key: 'trips', label: 'Trips', icon: '◈', hint: 'Every trip and its crew', group: 1 },
  { key: 'support', label: 'Support', icon: '✉', hint: 'The help-centre queue', group: 1 },

  { key: 'release', label: 'Force update', icon: '▲', hint: 'The version gate', group: 2 },
  { key: 'flags', label: 'Feature flags', icon: '⌥', hint: 'Runtime switches', group: 2 },
  { key: 'audit', label: 'Audit trail', icon: '≡', hint: 'Who changed what, and why', group: 2 },
  { key: 'runtime', label: 'Runtime config', icon: '⚙', hint: 'What the API is running with', group: 2 },
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

  /** Cross-panel navigation from a dashboard tile: jump, optionally with a pre-applied rider filter. */
  const go2 = useCallback((key: string, q?: UserQuery) => {
    setUserQuery(q);
    go(key as PanelKey);
  }, [go]);

  /**
   * Sign out, and leave the URL where the next sign-in should start.
   *
   * The panel lives in the hash, so signing out of `/admin#users` used to leave that hash in place:
   * the address bar still claimed a panel nobody was signed in to, and the next session opened on
   * whatever the last one happened to be looking at rather than the overview.
   */
  function signOut() {
    clearSession();
    setIdentity(null);
    setUserQuery(undefined);
    setPanel('overview');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.pathname);
    }
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

          {PANELS.map((p, i) => {
            const active = panel === p.key;
            const newGroup = i > 0 && PANELS[i - 1].group !== p.group;
            return (
              <div key={p.key}>
                {newGroup ? <div className="qf-railrule" aria-hidden /> : null}
              <button
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
              </div>
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
          {panel === 'overview' ? <Overview onGo={go2} /> : null}
          {panel === 'live' ? <Live /> : null}
          {panel === 'users' ? <Users initial={userQuery} /> : null}
          {panel === 'trips' ? <Trips /> : null}
          {panel === 'safety' ? <Safety /> : null}
          {panel === 'release' ? <ForceUpdate /> : null}
          {panel === 'flags' ? <Flags /> : null}
          {panel === 'support' ? <Support /> : null}
          {panel === 'audit' ? <Audit /> : null}
          {panel === 'runtime' ? <Runtime /> : null}
        </main>
      </div>
    </div>
  );
}

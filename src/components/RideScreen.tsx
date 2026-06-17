import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

export type RideState = 'live' | 'stale' | 'offline';

type PanelKind = 'pin' | 'broadcast' | 'sos' | null;
type RiderKey = 'ak' | 'rs' | 'jp' | 'md' | 'vt';

interface RideScreenProps {
  state?: RideState;
}

const TEAL = '#20D6A8';
const STALE = '#5A6B67';

interface RiderInfo {
  name: string;
  role: string;
  dist: string;
  left: string;
  top: string;
  color: string;
}

function buildRiders(state: RideState): Record<RiderKey, RiderInfo> {
  const amber = '#FFB020';
  const green = '#36D399';
  const offline = state === 'offline' || state === 'stale';
  const c = offline ? STALE : null;
  return {
    ak: { name: 'Aman Kohli', role: 'Lead', dist: '0.0 km · ahead', left: '62%', top: '16%', color: c || TEAL },
    rs: { name: 'Ravi Sharma', role: 'Rider', dist: '0.9 km back', left: '46%', top: '34%', color: c || amber },
    jp: { name: 'You · Jai P.', role: 'On route', dist: 'leading the pack', left: '54%', top: '52%', color: c || TEAL },
    md: { name: 'Manoj Das', role: 'Rider', dist: '2.1 km back', left: '33%', top: '64%', color: c || green },
    vt: {
      name: 'Vikram Thapa',
      role: 'Sweep',
      dist: offline ? 'last seen 4m ago' : '5.6 km back',
      left: '24%',
      top: '67%',
      color: c || green,
    },
  };
}

const ROUTE_D =
  'M 88 470 C 96 430 92 410 99 384 C 110 350 150 350 162 312 C 170 286 120 286 126 264 C 132 240 130 226 138 204 C 150 168 172 140 186 96 C 192 74 196 60 200 44';

/** The full Qafilaa ride screen rendered inside the marketing phone frames. */
export function RideScreen({ state = 'live' }: RideScreenProps) {
  const [focus, setFocus] = useState<RiderKey>('jp');
  const [panel, setPanel] = useState<PanelKind>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [toastKind, setToastKind] = useState<'ok' | 'sos'>('ok');
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const send = (text: string, kind: 'ok' | 'sos' = 'ok') => () => {
    window.clearTimeout(toastTimer.current);
    setPanel(null);
    setToast(text);
    setToastKind(kind);
    toastTimer.current = window.setTimeout(() => setToast(null), 3000);
  };

  const m = {
    live: { route: TEAL, dash: 'none', ring: TEAL, dim: 0, pulse: 0.8, flow: 1, status: 'All live · synced now', statusColor: TEAL, dot: TEAL, sigBars: 4, sigLabel: 'LTE' },
    stale: { route: STALE, dash: 'none', ring: STALE, dim: 0.16, pulse: 0, flow: 0, status: 'Stale · 1m since update', statusColor: '#FFB020', dot: '#FFB020', sigBars: 2, sigLabel: '1 bar' },
    offline: { route: STALE, dash: '2 9', ring: STALE, dim: 0.3, pulse: 0, flow: 0, status: 'Signal lost · last-known', statusColor: '#FFB020', dot: '#FFB020', sigBars: 0, sigLabel: 'No signal' },
  }[state];

  const riders = buildRiders(state);
  const f = riders[focus];
  const sel = (key: RiderKey) => (focus === key ? riders[key].color : 'transparent');
  const live = m.flow === 1;
  const sigOff = 'rgba(255,255,255,0.16)';
  const sigColor = (i: number) =>
    state === 'offline' ? sigOff : m.sigBars >= i ? (state === 'stale' ? '#FFB020' : TEAL) : sigOff;

  const acc = live
    ? { bg: 'rgba(54,211,153,0.16)', stroke: '#36D399', text: '5 of 5 · all accounted for', synced: 'synced now', icon: <path d="M5 12.5 10 17 19 7" /> }
    : { bg: 'rgba(255,176,32,0.16)', stroke: '#FFB020', text: '4 of 5 live · 1 last-known', synced: 'updating…', icon: (<><path d="M12 8v5" /><path d="M12 16.5v.01" /></>) };

  const routeColor = m.route;
  const ringColor = m.ring;
  const vtDot = state === 'offline' ? STALE : '#36D399';

  const sheetBase: CSSProperties = {
    position: 'absolute',
    left: 12,
    right: 12,
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 21,
    padding: '16px 14px 18px',
    borderRadius: 18,
    maxHeight: '86%',
    overflowX: 'hidden',
    overflowY: 'auto',
    boxShadow: '0 -20px 50px rgba(0,0,0,0.55)',
  };
  const grabber: CSSProperties = { width: 38, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' };
  const sheetCancel: CSSProperties = { width: '100%', height: 40, marginTop: 12, border: 'none', borderRadius: 12, background: 'transparent', color: '#9FB0AC', font: '600 12.5px Inter', cursor: 'pointer' };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: '#0A1110',
        fontFamily: 'Inter, system-ui, sans-serif',
        color: '#F2F6F5',
        userSelect: 'none',
      }}
    >
      {/* ===== MAP TERRAIN ===== */}
      <svg viewBox="0 0 300 600" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}>
        <defs>
          <radialGradient id="rs-vig" cx="56%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#15241F" />
            <stop offset="62%" stopColor="#0D1614" />
            <stop offset="100%" stopColor="#080F0D" />
          </radialGradient>
          <radialGradient id="rs-summit" cx="62%" cy="16%" r="34%">
            <stop offset="0%" stopColor="rgba(32,214,168,0.20)" />
            <stop offset="100%" stopColor="rgba(32,214,168,0)" />
          </radialGradient>
          <linearGradient id="rs-route" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor={routeColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={routeColor} />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="600" fill="url(#rs-vig)" />
        <rect x="0" y="0" width="300" height="600" fill="url(#rs-summit)" />
        <g fill="none" stroke="rgba(120,200,180,0.07)" strokeWidth="1">
          <path d="M-20 90 C 60 60 120 120 200 92 C 260 70 300 104 330 88" />
          <path d="M-20 150 C 70 122 130 176 210 150 C 270 128 305 158 330 146" />
          <path d="M-20 224 C 60 198 120 250 205 224 C 270 200 305 232 330 220" />
          <path d="M-20 300 C 70 276 140 326 215 300 C 280 278 305 306 330 296" />
          <path d="M-20 380 C 60 356 130 404 210 380 C 275 358 305 386 330 376" />
          <path d="M-20 460 C 70 438 130 482 215 460 C 280 440 305 466 330 458" />
          <path d="M-20 536 C 60 516 130 558 210 536 C 280 518 305 542 330 536" />
        </g>
        <g fill="none" stroke="rgba(120,200,180,0.05)" strokeWidth="1">
          <path d="M64 -20 C 54 160 96 320 76 540" />
          <path d="M150 -20 C 162 170 132 330 158 540" />
          <path d="M232 -20 C 220 160 256 320 226 540" />
        </g>
        <path d="M40 250 C 70 232 96 244 100 268 C 104 292 78 312 50 304 C 26 296 18 266 40 250 Z" fill="rgba(46,123,162,0.10)" stroke="rgba(120,200,180,0.10)" strokeWidth="1" />
        <path d={ROUTE_D} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.4" strokeDasharray="2 7" />
        <path d={ROUTE_D} fill="none" stroke={routeColor} strokeWidth="10" strokeLinecap="round" opacity="0.16" />
        <path id="rs-routepath" d={ROUTE_D} fill="none" stroke="url(#rs-route)" strokeWidth="3.4" strokeLinecap="round" strokeDasharray={m.dash} />
        <path d={ROUTE_D} fill="none" stroke={routeColor} strokeWidth="3.4" strokeLinecap="round" strokeDasharray="3 16" opacity={m.flow} style={{ animation: 'rs-flow 2.2s linear infinite' }} />
        <circle r="3.4" fill="#FFFFFF" opacity={m.flow}>
          <animateMotion dur="6.5s" repeatCount="indefinite" rotate="auto">
            <mpath href="#rs-routepath" />
          </animateMotion>
        </circle>
      </svg>

      {/* dim for offline/stale */}
      <div style={{ position: 'absolute', inset: 0, background: '#080F0D', opacity: m.dim, pointerEvents: 'none' }} />

      {/* radar sweep at You (live) */}
      <div style={{ position: 'absolute', left: '54%', top: '52%', width: 150, height: 150, transform: 'translate(-50%,-50%)', opacity: m.flow, pointerEvents: 'none', WebkitMaskImage: 'radial-gradient(circle, #000 0, #000 50%, transparent 72%)', maskImage: 'radial-gradient(circle, #000 0, #000 50%, transparent 72%)' }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'conic-gradient(from 0deg, rgba(32,214,168,0.28), rgba(32,214,168,0) 70%)', animation: 'rs-spin 4.5s linear infinite' }} />
      </div>

      {/* ===== GAP CHIPS ===== */}
      <GapChip left="40%" top="58%" delay="0s">1.4 km</GapChip>
      <GapChip left="50%" top="42%" delay="1s">0.9 km</GapChip>
      <GapChip left="55%" top="25%" delay="2s">3.0 km</GapChip>

      {/* rally points + hazard */}
      <RallyPin left="70%" top="26%" label="3" color={routeColor} onClick={() => setFocus('jp')} />
      <RallyPin left="42%" top="44%" label="2" color={routeColor} onClick={() => setFocus('jp')} />
      <div style={{ position: 'absolute', left: '40%', top: '62%', transform: 'translate(-50%,-50%)', width: 22, height: 22, borderRadius: 7, background: '#FFB020', boxShadow: '0 4px 10px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#1A0F00', fontSize: 13, fontWeight: 700, lineHeight: 1 }}>!</span>
      </div>

      {/* ===== RIDER PINS ===== */}
      {/* AK lead */}
      <div data-rs-pin onClick={() => setFocus('ak')} style={{ position: 'absolute', left: '62%', top: '16%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ position: 'relative', width: 40, height: 40 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `2.5px solid ${ringColor}`, background: '#243430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>AK</div>
          <div style={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: 999, background: '#36D399', border: '2px solid #0A1110' }} />
        </div>
        <span style={{ padding: '2px 7px', borderRadius: 999, background: 'rgba(32,214,168,0.16)', color: routeColor, fontSize: 9.5, fontWeight: 600 }}>Lead</span>
      </div>
      {/* RS */}
      <div data-rs-pin onClick={() => setFocus('rs')} style={{ position: 'absolute', left: '46%', top: '34%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ position: 'relative', width: 38, height: 38 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `2.5px solid ${ringColor}`, background: '#243430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>RS</div>
          <div style={{ position: 'absolute', right: -2, bottom: -2, width: 11, height: 11, borderRadius: 999, background: '#FFB020', border: '2px solid #0A1110' }} />
        </div>
      </div>
      {/* You JP */}
      <div data-rs-pin onClick={() => setFocus('jp')} style={{ position: 'absolute', left: '54%', top: '52%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ position: 'relative', width: 46, height: 46 }}>
          <div style={{ position: 'absolute', inset: -8, borderRadius: 999, background: ringColor, opacity: m.pulse, animation: 'rs-pulse 2.4s ease-out infinite' }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: '3px solid #20D6A8', background: '#20D6A8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A1110', fontSize: 14, fontWeight: 700 }}>JP</div>
        </div>
        <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(32,214,168,0.16)', color: routeColor, fontSize: 9.5, fontWeight: 600 }}>You</span>
      </div>
      {/* MD */}
      <div data-rs-pin onClick={() => setFocus('md')} style={{ position: 'absolute', left: '33%', top: '64%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ position: 'relative', width: 38, height: 38 }}>
          <div style={{ position: 'absolute', inset: 0, borderRadius: 999, border: `2.5px solid ${ringColor}`, background: '#243430', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600 }}>MD</div>
          <div style={{ position: 'absolute', right: -2, bottom: -2, width: 11, height: 11, borderRadius: 999, background: '#36D399', border: '2px solid #0A1110' }} />
        </div>
      </div>

      {/* focus callout */}
      <div style={{ position: 'absolute', left: f.left, top: f.top, transform: 'translate(-50%, calc(-100% - 26px))', zIndex: 6, padding: '8px 11px', borderRadius: 12, background: 'rgba(12,19,17,0.94)', border: `1px solid ${f.color}`, boxShadow: '0 14px 34px rgba(0,0,0,0.55)', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.1 }}>{f.name}</div>
        <div style={{ fontSize: 10.5, color: '#9FB0AC', marginTop: 2 }}>{f.role} · {f.dist}</div>
      </div>

      {/* ===== STATUS BAR ===== */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 104, background: 'linear-gradient(180deg, rgba(8,14,12,0.92), rgba(8,14,12,0))', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 11, left: 18, right: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, letterSpacing: '0.2px', pointerEvents: 'none' }}>
        <span>14:32</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
            <rect x="0" y="8" width="3" height="4" rx="1" fill={sigColor(1)} />
            <rect x="4.5" y="5" width="3" height="7" rx="1" fill={sigColor(2)} />
            <rect x="9" y="2.5" width="3" height="9.5" rx="1" fill={sigColor(3)} />
            <rect x="13.5" y="0" width="3" height="12" rx="1" fill={sigColor(4)} style={live ? { animation: 'rs-blink 1.4s ease-in-out infinite' } : undefined} />
          </svg>
          <span style={{ fontSize: 10, color: state === 'offline' ? '#FF8A80' : '#9FB0AC' }}>{m.sigLabel}</span>
          <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
            <rect x="0.5" y="0.5" width="20" height="11" rx="3" stroke="rgba(255,255,255,0.5)" />
            <rect x="21.5" y="3.5" width="2" height="5" rx="1" fill="rgba(255,255,255,0.5)" />
            <rect x="2.5" y="2.5" width="13" height="7" rx="1.5" fill="#36D399" />
          </svg>
        </div>
      </div>

      {/* ===== APP BAR ===== */}
      <div style={{ position: 'absolute', top: 42, left: 14, right: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(22,30,28,0.97)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F2F6F5" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14.5, fontWeight: 600, lineHeight: 1.1 }}>Spiti Loop · Day 3</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: m.dot, animation: 'rs-blink 1.8s ease-in-out infinite' }} />
            <span style={{ fontSize: 10.5, color: m.statusColor }}>{m.status}</span>
          </div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(22,30,28,0.97)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9FB0AC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z" /><path d="m2 12 10 5 10-5" /><path d="m2 17 10 5 10-5" /></svg>
        </div>
      </div>

      {/* compass */}
      <div style={{ position: 'absolute', right: 16, top: 92, width: 36, height: 36, borderRadius: 999, background: 'rgba(22,30,28,0.95)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
          <path d="M12 4 14 12 12 20 10 12 Z" fill="#FF5247" />
          <text x="12" y="3.6" textAnchor="middle" fontSize="4.5" fill="#9FB0AC" fontFamily="Inter">N</text>
        </svg>
      </div>

      {/* ===== BOTTOM SHEET ===== */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '10px 14px 26px', borderRadius: '22px 22px 0 0', background: 'rgba(12,19,17,0.99)', borderTop: '1px solid rgba(255,255,255,0.09)', boxShadow: '0 -18px 40px rgba(0,0,0,0.4)' }}>
        <div style={grabber} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ width: 20, height: 20, borderRadius: 999, background: acc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={acc.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">{acc.icon}</svg>
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{acc.text}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#6B7C78' }}>{acc.synced}</span>
        </div>

        {/* roster */}
        <div style={{ display: 'flex', gap: 9, paddingBottom: 12, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <RosterAvatar label="AK" dot="#36D399" caption="Lead" ring={sel('ak')} onClick={() => setFocus('ak')} />
          <RosterAvatar label="RS" dot="#FFB020" caption="0.9 km" ring={sel('rs')} onClick={() => setFocus('rs')} />
          <RosterAvatar label="JP" you caption="You" captionColor={routeColor} ring={sel('jp')} onClick={() => setFocus('jp')} />
          <RosterAvatar label="MD" dot="#36D399" caption="2.1 km" ring={sel('md')} onClick={() => setFocus('md')} />
          <RosterAvatar label="VT" dot={vtDot} caption="Sweep" captionColor="#6B7C78" muted ring={sel('vt')} onClick={() => setFocus('vt')} />
        </div>

        {/* next rally */}
        <div onClick={send('Routing to Rally Point 3 · 4.2 km · ~18 min')} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 13, background: 'rgba(32,214,168,0.07)', border: '1px solid rgba(32,214,168,0.16)', marginBottom: 11, cursor: 'pointer', transition: 'border-color .2s, background .2s' }}>
          <span style={{ width: 30, height: 30, borderRadius: 9, background: 'rgba(32,214,168,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={routeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Next · Rally Point 3</div>
            <div style={{ fontSize: 10.5, color: '#9FB0AC', marginTop: 1 }}>4.2 km ahead · ~18 min</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7C78" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
        </div>

        {/* actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setPanel('pin')} style={sheetActionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9FB0AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
            Drop pin
          </button>
          <button onClick={() => setPanel('broadcast')} style={sheetActionBtn}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9FB0AC" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11a9 9 0 0 1 18 0" /><path d="M7 14a5 5 0 0 1 10 0" /><circle cx="12" cy="17" r="1.4" fill="#9FB0AC" /></svg>
            Broadcast
          </button>
          <button onClick={() => setPanel('sos')} style={{ width: 84, height: 44, border: 'none', borderRadius: 12, background: '#FF5247', color: '#1A0807', font: "700 13px 'Space Grotesk',Inter", cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 12, border: '1.5px solid rgba(255,82,71,0.6)', animation: 'rs-pulse 2.6s ease-out infinite', pointerEvents: 'none' }} />
            SOS
          </button>
        </div>
      </div>

      {/* ===== ACTION OVERLAY ===== */}
      {panel && <div onClick={() => setPanel(null)} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(4,8,7,0.66)' }} />}

      {/* Drop pin sheet */}
      {panel === 'pin' && (
        <div style={{ ...sheetBase, background: 'rgba(15,23,20,0.98)', borderTop: '1px solid rgba(32,214,168,0.22)' }}>
          <div style={grabber} />
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 600 }}>Drop a pin</div>
          <div style={{ fontSize: 11, color: '#9FB0AC', marginTop: 2, marginBottom: 14 }}>Shared instantly with all 5 riders</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
            <PinOption onClick={send('Rally point dropped · shared with 5 riders')} iconBg="rgba(32,214,168,0.16)" stroke="#20D6A8" label="Rally point" icon={<><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.4" /></>} />
            <PinOption onClick={send('Hazard flagged · crew alerted ahead', 'sos')} iconBg="rgba(255,176,32,0.16)" stroke="#FFB020" label="Hazard" icon={<><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /></>} />
            <PinOption onClick={send('Fuel stop pinned · shared with crew')} iconBg="rgba(46,123,162,0.18)" stroke="#5FB0E5" label="Fuel stop" icon={<><path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15" /><path d="M3 20h12" /><path d="M14 9h2.5a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3" /></>} />
            <PinOption onClick={send('Viewpoint pinned · shared with crew')} iconBg="rgba(179,136,255,0.18)" stroke="#B388FF" label="Viewpoint" icon={<><path d="M3 7h3l2-2h8l2 2h3v12H3Z" /><circle cx="12" cy="13" r="3.2" /></>} />
          </div>
          <button onClick={() => setPanel(null)} style={sheetCancel}>Cancel</button>
        </div>
      )}

      {/* Broadcast sheet */}
      {panel === 'broadcast' && (
        <div style={{ ...sheetBase, background: 'rgba(15,23,20,0.98)', borderTop: '1px solid rgba(32,214,168,0.22)' }}>
          <div style={grabber} />
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 600 }}>Broadcast to convoy</div>
          <div style={{ fontSize: 11, color: '#9FB0AC', marginTop: 2, marginBottom: 14 }}>One tap · everyone hears you</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <BroadcastOption onClick={send('Broadcast: “Stopping for fuel” · sent')} emoji="⛽">Stopping for fuel</BroadcastOption>
            <BroadcastOption onClick={send('Broadcast: “Pushing ahead” · sent')} emoji="🏍️">Pushing ahead — catch up</BroadcastOption>
            <BroadcastOption onClick={send('Broadcast: “Need a minute” · sent')} emoji="✋">Need a minute — hold up</BroadcastOption>
            <BroadcastOption onClick={send('Broadcast: “Regroup at next rally” · sent')} emoji="📍">Regroup at next rally</BroadcastOption>
          </div>
          <button onClick={() => setPanel(null)} style={sheetCancel}>Cancel</button>
        </div>
      )}

      {/* SOS sheet */}
      {panel === 'sos' && (
        <div style={{ ...sheetBase, background: 'rgba(24,12,11,0.98)', borderTop: '1px solid rgba(255,82,71,0.4)' }}>
          <div style={grabber} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,82,71,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF5247" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </span>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 600 }}>Send emergency SOS</div>
              <div style={{ fontSize: 11, color: '#C9A6A2', marginTop: 1 }}>Your live location · 4,551 m · broadcasts to all riders</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, margin: '14px 0' }}>
            {['Medical', 'Mechanical', 'Stuck'].map((t) => (
              <span key={t} style={{ flex: 1, textAlign: 'center', padding: '8px 0', borderRadius: 10, background: 'rgba(255,82,71,0.10)', border: '1px solid rgba(255,82,71,0.2)', fontSize: 11, fontWeight: 600, color: '#FF8A80' }}>{t}</span>
            ))}
          </div>
          <button onClick={send('SOS broadcast · 4 riders responding', 'sos')} style={{ width: '100%', height: 48, border: 'none', borderRadius: 13, background: '#FF5247', color: '#1A0807', font: "700 14px 'Space Grotesk',Inter", cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
            <span style={{ position: 'absolute', inset: 0, borderRadius: 13, border: '1.6px solid rgba(255,82,71,0.6)', animation: 'rs-pulse 2s ease-out infinite', pointerEvents: 'none' }} />
            Broadcast SOS now
          </button>
          <button onClick={() => setPanel(null)} style={sheetCancel}>Cancel</button>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div style={{ position: 'absolute', left: 14, right: 14, top: 88, zIndex: 30, padding: '12px 14px', borderRadius: 14, background: 'rgba(13,20,18,0.98)', border: `1px solid ${toastKind === 'sos' ? 'rgba(255,82,71,0.4)' : 'rgba(54,211,153,0.35)'}`, boxShadow: '0 16px 40px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, background: toastKind === 'sos' ? 'rgba(255,82,71,0.18)' : 'rgba(54,211,153,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={toastKind === 'sos' ? '#FF5247' : '#36D399'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17 19 7" /></svg>
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 500, color: '#F2F6F5' }}>{toast}</span>
        </div>
      )}
    </div>
  );
}

function GapChip({ left, top, delay, children }: { left: string; top: string; delay: string; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', left, top, transform: 'translate(-50%,-50%)', padding: '3px 8px', borderRadius: 999, background: 'rgba(10,17,16,0.82)', border: '1px solid rgba(255,255,255,0.10)', color: '#9FB0AC', fontSize: 10.5, fontWeight: 500, whiteSpace: 'nowrap', pointerEvents: 'none', animation: 'rs-breathe 4s ease-in-out infinite', animationDelay: delay }}>
      {children}
    </div>
  );
}

function RallyPin({ left, top, label, color, onClick }: { left: string; top: string; label: string; color: string; onClick: () => void }) {
  return (
    <div data-rs-pin onClick={onClick} style={{ position: 'absolute', left, top, transform: 'translate(-50%,-50%)' }}>
      <div style={{ position: 'relative', width: 24, height: 24, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: 'rgba(32,214,168,0.16)', border: `1.5px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ transform: 'rotate(45deg)', color, fontSize: 11, fontWeight: 700 }}>{label}</span>
      </div>
    </div>
  );
}

function RosterAvatar({ label, dot, you, muted, caption, captionColor = '#9FB0AC', ring, onClick }: { label: string; dot?: string; you?: boolean; muted?: boolean; caption: string; captionColor?: string; ring: string; onClick: () => void }) {
  return (
    <div data-rs-av onClick={onClick} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative', width: 38, height: 38, borderRadius: 999, background: you ? '#20D6A8' : '#243430', border: `2px solid ${ring}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: you ? 700 : 600, color: you ? '#0A1110' : muted ? '#9FB0AC' : undefined }}>
        {label}
        {dot && <span style={{ position: 'absolute', right: -1, bottom: -1, width: 10, height: 10, borderRadius: 999, background: dot, border: '2px solid #0D1412' }} />}
      </div>
      <span style={{ fontSize: 9.5, color: captionColor }}>{caption}</span>
    </div>
  );
}

const sheetActionBtn: CSSProperties = {
  flex: 1,
  height: 44,
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 12,
  background: '#1A2421',
  color: '#F2F6F5',
  font: '600 12px Inter',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  transition: 'border-color .2s, background .2s',
};

function PinOption({ onClick, iconBg, stroke, label, icon }: { onClick: () => void; iconBg: string; stroke: string; label: string; icon: ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 12, borderRadius: 13, border: '1px solid rgba(255,255,255,0.10)', background: '#16201D', color: '#F2F6F5', font: '600 12.5px Inter', cursor: 'pointer', textAlign: 'left', minWidth: 0 }}>
      <span style={{ width: 30, height: 30, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">{icon}</svg>
      </span>
      {label}
    </button>
  );
}

function BroadcastOption({ onClick, emoji, children }: { onClick: () => void; emoji: string; children: ReactNode }) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 13, border: '1px solid rgba(255,255,255,0.10)', background: '#16201D', color: '#F2F6F5', font: '600 13px Inter', cursor: 'pointer', textAlign: 'left' }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      {children}
    </button>
  );
}

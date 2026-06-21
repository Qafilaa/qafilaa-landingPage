import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { ConvoyMap } from './ConvoyMap';

/* ============================================================
   QafilaaDemo — the playable "Try a ride" phone.
   A faithful port of the QafilaaDemo design prototype: an intro
   overlay ("Run a real ride") offering a 9-step guided tour or a
   free-explore mode, then the whole ride flow — create, invite,
   lobby, live map, rally points, signal loss, manual SOS,
   automatic crash detection and an all-clear recap.
   ============================================================ */

const C = {
  bg: '#0E1413',
  panel: '#1B2725',
  inset: '#16201D',
  token: '#243430',
  text: '#F2F6F5',
  muted: '#9FB0AC',
  dim: '#6B7C78',
  teal: '#20D6A8',
  green: '#36D399',
  amber: '#FFB020',
  red: '#FF5247',
  grey: '#5A6B67',
  body: '#B8C2BE',
} as const;

const DISPLAY = "'Space Grotesk', sans-serif";

type Phase = 'intro' | 'create' | 'invite' | 'lobby' | 'ride' | 'crash' | 'sos' | 'allclear';
type Mode = null | 'tour' | 'free';
type Signal = 'live' | 'offline';
type Sheet =
  | null
  | 'rider'
  | 'broadcast'
  | 'hub'
  | 'itinerary'
  | 'expenses'
  | 'checklist'
  | 'stays'
  | 'docs'
  | 'recap';

interface Rider {
  id: string;
  init: string;
  name: string;
  role: string;
  gap: string;
  eta: string;
  speed: string;
  batt: string;
  alt: string;
  bike: string;
  left: string;
  top: string;
  you?: boolean;
}

const RIDERS: Rider[] = [
  { id: 'vc', init: 'VC', name: 'Viren C', role: 'Lead', gap: '0.0 km · ahead', eta: '—', speed: '78 km/h', batt: '84%', alt: '4,720 m', bike: 'RE Himalayan 450', left: '66%', top: '13%' },
  { id: 'aj', init: 'AJ', name: 'Akash J', role: 'Rider', gap: '0.9 km back', eta: '4 min', speed: '71 km/h', batt: '19% low', alt: '4,610 m', bike: 'RE Scram 411', left: '51%', top: '32%' },
  { id: 'yt', init: 'YT', name: 'You · Yash T', role: 'You', gap: 'mid-pack', eta: '—', speed: '74 km/h', batt: '76%', alt: '4,551 m', bike: 'RE Himalayan 411', left: '59%', top: '51%', you: true },
  { id: 'th', init: 'TH', name: 'Tejas H', role: 'Rider', gap: '2.1 km back', eta: '9 min', speed: '69 km/h', batt: '61%', alt: '4,480 m', bike: 'RE Classic 350', left: '33%', top: '67%' },
  { id: 'gh', init: 'GH', name: 'Gaurav Hendre', role: 'Sweep', gap: '5.6 km back', eta: '22 min', speed: '—', batt: 'stale', alt: '4,390 m', bike: 'RE Meteor 350', left: '25%', top: '83%' },
];
const LOST = new Set(['gh', 'th']);
const LOST_MIN: Record<string, string> = { gh: '6m', th: '3m' };

interface Beat {
  phase: Phase;
  title: string;
  hint: string;
  signal?: Signal;
  ready5?: boolean;
  rally?: boolean;
}

const BEATS: Beat[] = [
  { phase: 'create', title: 'Create the ride', hint: 'Spiti loop, Day 4: Kaza → Chandratal on a Royal Enfield. Tap Create ride.' },
  { phase: 'invite', title: 'Invite your riders', hint: 'Share one code. Riders tap in and land on the map — no accounts at the trailhead.' },
  { phase: 'lobby', title: 'Lobby: lead & sweep', hint: 'Viren leads, Gaurav sweeps. Run the readiness check, then Start ride.' },
  { phase: 'ride', title: 'Live ride map', signal: 'live', ready5: true, hint: 'Everyone on one map. Tap a rider — try Gaurav, the sweep — for gap, ETA, speed and battery.' },
  { phase: 'ride', title: 'Drop a rally point', hint: 'Tap the rally button. Every rider gets the same pin, distance and ETA.' },
  { phase: 'ride', title: 'Signal lost', signal: 'offline', hint: 'Behind the ridge the bars die. Pins hold their last-known spot, timestamped — and a rally fallback appears.' },
  { phase: 'sos', title: 'Manual SOS', hint: 'Press and hold the SOS for 2s. It broadcasts to riders and emergency contacts, even on one bar.' },
  { phase: 'crash', title: 'Automatic crash detection', hint: 'No need to reach your phone — a hard impact is sensed and a countdown auto-escalates. Tap “I’m OK” to cancel.' },
  { phase: 'allclear', title: 'No one left behind', signal: 'live', rally: true, hint: 'Resolved, signal back, all 5 regrouped at the rally. That’s the whole point.' },
];

const READINESS = [
  { label: 'Fuel topped up', meta: 'all 5' },
  { label: 'Helmets & gear on', meta: 'confirmed' },
  { label: 'Offline maps cached', meta: 'Day 4' },
  { label: 'Medical cards shared', meta: '5 of 5' },
];

const tap: CSSProperties = { cursor: 'pointer', WebkitTapHighlightColor: 'transparent' };

interface State {
  phase: Phase;
  mode: Mode;
  beat: number;
  focus: string | null;
  signal: Signal;
  rally: boolean;
  joinCount: number;
  copied: boolean;
  crashCount: number;
  crashSent: boolean;
  sosFired: boolean;
  toast: string | null;
  toastKind: 'ok' | 'sos';
  returnTo: Phase;
  sheet: Sheet;
}

const INITIAL: State = {
  phase: 'intro',
  mode: null,
  beat: 0,
  focus: null,
  signal: 'live',
  rally: false,
  joinCount: 1,
  copied: false,
  crashCount: 18,
  crashSent: false,
  sosFired: false,
  toast: null,
  toastKind: 'ok',
  returnTo: 'ride',
  sheet: null,
};

export function QafilaaDemo() {
  const [s, setS] = useState<State>(INITIAL);
  const sRef = useRef(s);
  sRef.current = s;
  const timers = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearAll = useCallback(() => {
    timers.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t as unknown as ReturnType<typeof setInterval>);
    });
    timers.current = [];
  }, []);

  const patch = useCallback((p: Partial<State>) => setS((prev) => ({ ...prev, ...p })), []);

  const t = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
    return id;
  }, []);

  const showToast = useCallback(
    (text: string, kind: 'ok' | 'sos' = 'ok') => {
      patch({ toast: text, toastKind: kind });
      t(() => patch({ toast: null }), 2800);
    },
    [patch, t],
  );

  const startJoins = useCallback(() => {
    patch({ joinCount: 1 });
    let n = 1;
    const id = setInterval(() => {
      n += 1;
      patch({ joinCount: Math.min(5, n) });
      if (n >= 5) clearInterval(id);
    }, 650);
    timers.current.push(id as unknown as ReturnType<typeof setTimeout>);
  }, [patch]);

  const startCrash = useCallback(() => {
    patch({ crashCount: 18, crashSent: false });
    const id = setInterval(() => {
      setS((prev) => {
        if (prev.phase !== 'crash') {
          clearInterval(id);
          return prev;
        }
        const n = prev.crashCount - 1;
        if (n <= 0) {
          clearInterval(id);
          return { ...prev, crashCount: 0, crashSent: true };
        }
        return { ...prev, crashCount: n };
      });
    }, 1000);
    timers.current.push(id as unknown as ReturnType<typeof setTimeout>);
  }, [patch]);

  const go = useCallback((phase: Phase, p?: Partial<State>) => {
    setS((prev) => ({ ...prev, phase, focus: null, ...(p || {}) }));
  }, []);

  const armFreeCrash = useCallback(() => {
    t(() => {
      const st = sRef.current;
      if (st.mode === 'free' && st.phase === 'ride' && !st.sosFired) {
        patch({ returnTo: 'ride' });
        go('crash');
        startCrash();
      }
    }, 9000);
  }, [t, patch, go, startCrash]);

  const enterBeat = useCallback(
    (i: number) => {
      clearAll();
      const b = BEATS[i];
      const p: Partial<State> = { beat: i, phase: b.phase, focus: null };
      if (b.phase === 'invite') p.joinCount = 1;
      if (b.signal) p.signal = b.signal;
      if (b.ready5) p.joinCount = 5;
      if (b.rally) p.rally = true;
      if (b.phase === 'crash') {
        p.crashCount = 18;
        p.crashSent = false;
      }
      patch(p);
      if (b.phase === 'invite') startJoins();
      if (b.phase === 'crash') startCrash();
    },
    [clearAll, patch, startJoins, startCrash],
  );

  const tourNext = useCallback(() => {
    const st = sRef.current;
    if (st.beat >= BEATS.length - 1) {
      restart();
      return;
    }
    enterBeat(st.beat + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enterBeat]);

  const restart = useCallback(() => {
    clearAll();
    setS({ ...INITIAL });
  }, [clearAll]);

  const onSosFired = useCallback(() => {
    patch({ sosFired: true });
    showToast('SOS broadcast · riders + emergency contacts alerted', 'sos');
    t(() => {
      const st = sRef.current;
      if (st.mode === 'tour') tourNext();
      else patch({ phase: st.returnTo || 'ride' });
    }, 1300);
  }, [patch, showToast, t, tourNext]);

  useEffect(() => () => clearAll(), [clearAll]);

  // ---- derived ----
  const live = s.signal === 'live';
  const tour = s.mode === 'tour';
  const lastBeat = s.beat >= BEATS.length - 1;
  const beat = BEATS[s.beat] || BEATS[0];

  const fr = RIDERS.find((r) => r.id === s.focus) || null;
  const fLost = !!fr && !live && LOST.has(fr.id);
  const fcol = fr
    ? fLost
      ? C.grey
      : fr.you
        ? C.teal
        : fr.id === 'vc'
          ? C.teal
          : fr.id === 'aj'
            ? C.amber
            : C.green
    : C.teal;

  const canFinish = s.mode === 'free' && s.rally && s.sosFired;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        background: C.bg,
        fontFamily: 'Inter, system-ui, sans-serif',
        color: C.text,
        userSelect: 'none',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      {/* ===== shared status bar ===== */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 46,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 26px 0',
          zIndex: 55,
          pointerEvents: 'none',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>9:41</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="17" height="11" viewBox="0 0 18 12" fill={live ? C.text : 'rgba(255,255,255,0.32)'}>
            <rect x="0" y="8" width="3" height="4" rx="1" />
            <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
            <rect x="10" y="3" width="3" height="9" rx="1" opacity={live ? 1 : 0.35} />
            <rect x="15" y="0" width="3" height="12" rx="1" opacity={live ? 1 : 0.2} />
          </svg>
          <svg width="23" height="11" viewBox="0 0 25 12" fill="none">
            <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="rgba(255,255,255,0.45)" />
            <rect x="2" y="2" width="16" height="8" rx="1.5" fill={C.text} />
            <rect x="23" y="3.5" width="2" height="5" rx="1" fill="rgba(255,255,255,0.45)" />
          </svg>
        </div>
      </div>
      {/* home indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 7,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 118,
          height: 5,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.4)',
          zIndex: 54,
          pointerEvents: 'none',
        }}
      />

      {/* ===== PHASE: CREATE ===== */}
      {s.phase === 'create' && (
        <Sheetish>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em' }}>New ride</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, marginBottom: 18 }}>
            Route, days, and your bike. Then share one link.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, flex: 1 }}>
            <Field label="Ride name">
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 5 }}>Spiti loop</div>
            </Field>
            <div style={{ background: C.panel, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '13px 14px' }}>
              <div style={labelCss}>Today's leg</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 6 }}>
                <Pin sm />
                <span style={{ fontSize: 15, fontWeight: 500 }}>Kaza → Chandratal</span>
              </div>
              <div style={{ display: 'flex', gap: 7, marginTop: 11 }}>
                <Mini k="Day" v="4 of 8" />
                <Mini k="Distance" v="112 km" />
                <Mini k="Top alt" v="4,551 m" />
              </div>
            </div>
            <div
              style={{
                background: C.panel,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: '13px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 11,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: 'rgba(32,214,168,0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <BikeIcon />
              </div>
              <div style={{ flex: 1 }}>
                <div style={labelCss}>Your bike</div>
                <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 3 }}>Royal Enfield Himalayan</div>
              </div>
              <Chevron />
            </div>
          </div>
          <PrimaryBtn onClick={() => (tour ? tourNext() : (go('invite', { joinCount: 1 }), startJoins()))}>
            Create ride
          </PrimaryBtn>
        </Sheetish>
      )}

      {/* ===== PHASE: INVITE ===== */}
      {s.phase === 'invite' && (
        <Sheetish>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em' }}>Invite your riders</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, marginBottom: 16 }}>
            One link. No accounts, no app store at the trailhead.
          </div>
          <div style={{ background: C.panel, border: '1px solid rgba(32,214,168,0.22)', borderRadius: 16, padding: 15, marginBottom: 14 }}>
            <div style={labelCss}>Ride code</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
              <div style={{ flex: 1, fontFamily: DISPLAY, fontSize: 24, fontWeight: 600, letterSpacing: 2 }}>SPITI-4K9</div>
              <button
                className="qd-tap"
                onClick={() => {
                  patch({ copied: true });
                  t(() => patch({ copied: false }), 1500);
                }}
                style={{
                  height: 34,
                  padding: '0 14px',
                  border: '1px solid rgba(32,214,168,0.4)',
                  borderRadius: 10,
                  background: 'rgba(32,214,168,0.10)',
                  color: C.teal,
                  font: '600 12px Inter',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {s.copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div style={{ fontSize: 11.5, color: C.dim, marginTop: 8 }}>qafilaa.in/r/spiti-4k9</div>
          </div>
          <div style={{ ...labelCss, marginBottom: 9 }}>{s.joinCount >= 5 ? '5 riders joined' : `${s.joinCount} of 5 joined…`}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'hidden' }}>
            {RIDERS.slice(0, s.joinCount).map((r) => (
              <div
                key={r.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '9px 12px',
                  borderRadius: 12,
                  background: C.panel,
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    background: C.token,
                    border: `2px solid ${r.you || r.id === 'vc' ? C.teal : 'rgba(255,255,255,0.12)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: C.text,
                  }}
                >
                  {r.init}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: C.dim }}>{r.role}</div>
                </div>
                <span style={{ fontSize: 11, color: C.teal }}>joined</span>
              </div>
            ))}
          </div>
          <button
            className="qd-tap"
            onClick={() => {
              if (s.joinCount < 5) return;
              if (tour) tourNext();
              else go('lobby');
            }}
            style={{
              width: '100%',
              height: 50,
              marginTop: 14,
              border: 'none',
              borderRadius: 14,
              background: s.joinCount >= 5 ? C.teal : C.panel,
              color: s.joinCount >= 5 ? C.bg : C.dim,
              font: '600 15px Inter',
              cursor: s.joinCount >= 5 ? 'pointer' : 'default',
            }}
          >
            {s.joinCount >= 5 ? "Everyone's in →" : 'Waiting for riders…'}
          </button>
        </Sheetish>
      )}

      {/* ===== PHASE: LOBBY ===== */}
      {s.phase === 'lobby' && (
        <Sheetish>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600, letterSpacing: '-0.01em' }}>Ride lobby</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 4, marginBottom: 15 }}>
            Set lead &amp; sweep, run the readiness check, roll out.
          </div>
          <div style={{ ...labelCss, marginBottom: 8 }}>Roles</div>
          <div style={{ display: 'flex', gap: 9, marginBottom: 14 }}>
            <RoleCard init="VC" name="Viren C" role="Lead" ring={C.teal} roleColor={C.teal} />
            <RoleCard init="GH" name="Gaurav H" role="Sweep" ring={C.grey} roleColor={C.muted} initColor={C.muted} />
          </div>
          <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.45, marginBottom: 15 }}>
            Lead sets the pace from the front; sweep rides last so the ride isn't done until everyone's in.
          </div>
          <div style={{ ...labelCss, marginBottom: 9 }}>Readiness check</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
            {READINESS.map((c) => (
              <div
                key={c.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: C.panel,
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 999,
                    background: 'rgba(54,211,153,0.16)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Check size={13} color={C.green} w={3} />
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{c.label}</span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: C.green }}>{c.meta}</span>
              </div>
            ))}
          </div>
          <PrimaryBtn onClick={() => (tour ? tourNext() : (go('ride', { signal: 'live' }), armFreeCrash()))}>Start ride</PrimaryBtn>
        </Sheetish>
      )}

      {/* ===== PHASE: RIDE ===== */}
      {s.phase === 'ride' && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <ConvoyMap state={live ? 'live' : 'offline'} />
          {/* scrims */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 200, background: 'linear-gradient(180deg, rgba(8,14,12,0.92), rgba(8,14,12,0))', pointerEvents: 'none', zIndex: 6 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 300, background: 'linear-gradient(0deg, rgba(8,14,12,0.96) 30%, rgba(8,14,12,0))', pointerEvents: 'none', zIndex: 6 }} />

          {/* app bar */}
          <div style={{ position: 'absolute', top: 48, left: 0, right: 0, display: 'flex', alignItems: 'center', gap: 10, padding: '6px 14px', zIndex: 12 }}>
            <div style={roundBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Spiti loop</div>
              <div style={{ fontSize: 11.5, color: C.muted }}>Day 4 · Kaza → Chandratal</div>
            </div>
            <div className="qd-tap" role="button" aria-label="Trip hub" onClick={() => patch({ sheet: 'hub', focus: null })} style={{ ...roundBtn, ...tap }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="20" y2="6" />
                <line x1="8" y1="12" x2="20" y2="12" />
                <line x1="8" y1="18" x2="20" y2="18" />
                <circle cx="4" cy="6" r="0.6" />
                <circle cx="4" cy="12" r="0.6" />
                <circle cx="4" cy="18" r="0.6" />
              </svg>
            </div>
            <div
              className="qd-tap"
              role="button"
              aria-label="Toggle signal"
              onClick={() => patch({ signal: live ? 'offline' : 'live', focus: null })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                height: 32,
                padding: '0 10px',
                borderRadius: 999,
                background: 'rgba(20,30,28,0.7)',
                backdropFilter: 'blur(8px)',
                border: `1px solid ${live ? 'rgba(32,214,168,0.4)' : 'rgba(90,107,103,0.5)'}`,
                ...tap,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 999, background: live ? C.teal : C.grey }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: live ? C.teal : C.muted }}>{live ? 'Live' : 'Last-known'}</span>
            </div>
          </div>

          {/* connectivity (live) */}
          {live && (
            <div
              style={{
                position: 'absolute',
                top: 104,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '6px 13px',
                borderRadius: 999,
                background: 'rgba(14,20,19,0.78)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(32,214,168,0.28)',
                zIndex: 12,
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: 999, background: C.teal }} />
              <span style={{ fontSize: 11.5, color: C.teal }}>All live · synced now</span>
            </div>
          )}

          {/* connectivity + rally fallback (offline) */}
          {!live && (
            <div style={{ position: 'absolute', top: 100, left: 14, right: 14, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 13px', borderRadius: 10, background: 'rgba(40,17,16,0.86)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,82,71,0.4)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF8079" strokeWidth="2" strokeLinecap="round">
                  <path d="M2 2l20 20" />
                  <path d="M5 12.5a11 11 0 0 1 4-2.6M12 5c2.5 0 5 .9 7 2.5" />
                </svg>
                <span style={{ fontSize: 12, color: '#FF8079', flex: 1 }}>No signal — positions cached</span>
                <span style={{ fontSize: 10.5, color: C.dim }}>4m ago</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px', borderRadius: 14, background: 'rgba(36,52,48,0.95)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,176,32,0.45)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,176,32,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Pin color={C.amber} size={19} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>Head to next rally point</div>
                  <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>Chandratal camp · 8.2 km ahead</div>
                </div>
              </div>
            </div>
          )}

          {/* dropped rally pin */}
          {s.rally && (
            <div style={{ position: 'absolute', left: '44%', top: '38%', transform: 'translate(-50%,-100%)', zIndex: 8, animation: 'qd-pop .5s cubic-bezier(.22,.61,.36,1)' }}>
              <div style={{ width: 30, height: 30, borderRadius: '50% 50% 50% 0', transform: 'rotate(-45deg)', background: C.teal, boxShadow: '0 6px 16px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(45deg)' }}>
                  <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
                  <circle cx="12" cy="10" r="2.2" />
                </svg>
              </div>
            </div>
          )}

          {/* rider tap hotspots */}
          {RIDERS.map((r) => (
            <div
              key={r.id}
              className="qd-tap"
              onClick={() => patch({ focus: r.id, sheet: 'rider' })}
              style={{ position: 'absolute', left: r.left, top: r.top, width: 48, height: 48, transform: 'translate(-50%,-50%)', borderRadius: 999, zIndex: 9, ...tap }}
            />
          ))}

          {/* focus callout */}
          {fr && (
            <div
              style={{
                position: 'absolute',
                left: fr.left,
                top: fr.top,
                transform: 'translate(-50%, calc(-100% - 30px))',
                zIndex: 13,
                padding: '10px 12px',
                borderRadius: 13,
                background: 'rgba(14,20,19,0.96)',
                border: `1px solid ${fcol}`,
                boxShadow: '0 16px 38px rgba(0,0,0,0.6)',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.1 }}>{fr.name}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>
                {fr.role} · {fLost ? `last seen ${LOST_MIN[fr.id] || ''} ago` : fr.gap}
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 5, fontSize: 10.5, color: fLost ? C.dim : C.muted }}>
                <span>ETA {fLost ? '—' : fr.eta}</span>
                <span>·</span>
                <span>{fLost ? '—' : fr.speed}</span>
                <span>·</span>
                <span>{fr.batt}</span>
              </div>
            </div>
          )}

          {/* bottom controls */}
          <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '0 14px 22px', zIndex: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, margin: '0 auto 12px', width: 'max-content', maxWidth: '100%', padding: '8px 13px', borderRadius: 999, background: 'rgba(27,39,37,0.92)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.10)' }}>
              <Pin size={15} />
              <span style={{ fontSize: 12.5, color: C.text }}>Next · Chandratal camp</span>
              <span style={{ fontSize: 12.5, color: C.dim }}>8.2 km · 22 min</span>
            </div>
            <div style={{ background: 'rgba(27,39,37,0.94)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 18, padding: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                {live ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12.5 10 17 19 7" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.grey} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 7v5l3 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
                <span style={{ fontSize: 13, fontWeight: 500, color: live ? C.text : C.muted }}>
                  {live ? '5 of 5 · all accounted for' : 'Last known · 4 riders nearby'}
                </span>
                <span style={{ marginLeft: 'auto', fontSize: 11, color: C.dim }}>{live ? 'synced now' : '4m ago'}</span>
              </div>
              <div style={{ display: 'flex', gap: 9 }}>
                <button
                  className="qd-tap"
                  onClick={() => {
                    if (!s.rally) {
                      patch({ rally: true });
                      showToast('Rally point dropped · ETAs updated for 5 riders');
                    }
                  }}
                  style={{ flex: 1, height: 52, borderRadius: 13, background: C.token, border: `1px solid ${s.rally ? 'rgba(32,214,168,0.4)' : 'rgba(255,255,255,0.08)'}`, color: C.text, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                >
                  <Pin size={18} color={C.text} stroke />
                  <span style={{ fontSize: 10.5, color: C.muted }}>{s.rally ? 'Rally set' : 'Drop rally'}</span>
                </button>
                <button
                  className="qd-tap"
                  onClick={() => patch({ sheet: 'broadcast' })}
                  style={{ flex: 1, height: 52, borderRadius: 13, background: C.token, border: '1px solid rgba(255,255,255,0.08)', color: C.text, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}
                >
                  <Send size={18} color={C.text} />
                  <span style={{ fontSize: 10.5, color: C.muted }}>Broadcast</span>
                </button>
                <button
                  className="qd-tap"
                  onClick={() => patch({ returnTo: 'ride', phase: 'sos', focus: null, sheet: null })}
                  style={{ width: 62, height: 52, border: 'none', borderRadius: 13, background: C.red, color: C.bg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', font: "600 15px 'Space Grotesk',Inter", letterSpacing: 0.5 }}
                >
                  SOS
                </button>
                {canFinish && (
                  <button
                    className="qd-tap"
                    onClick={() => patch({ phase: 'allclear', signal: 'live', focus: null })}
                    style={{ width: 62, height: 52, border: '1px solid rgba(54,211,153,0.4)', borderRadius: 13, background: 'rgba(54,211,153,0.10)', color: C.green, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Check size={20} color={C.green} w={2.4} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIDE SHEETS ===== */}
      {s.sheet && s.sheet !== 'recap' && (
        <>
          <div className="qd-tap" onClick={() => patch({ sheet: null })} style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(4,8,7,0.62)', ...tap }} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 21,
              maxHeight: '88%',
              overflowY: 'auto',
              background: 'rgba(15,23,20,0.99)',
              borderTop: '1px solid rgba(32,214,168,0.18)',
              borderRadius: '22px 22px 0 0',
              boxShadow: '0 -20px 50px rgba(0,0,0,0.55)',
              padding: '10px 16px 22px',
              animation: 'qd-sheet .3s ease-out',
            }}
          >
            <div style={{ width: 36, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }} />

            {s.sheet === 'rider' && fr && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 999, border: `2.5px solid ${fcol}`, background: C.token, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: fr.you ? C.bg : C.text }}>
                    {fr.init}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{fr.name}</div>
                    <div style={{ fontSize: 11.5, color: fLost ? C.muted : C.teal, marginTop: 2 }}>
                      {fLost ? `Last seen ${LOST_MIN[fr.id] || ''} ago · last-known` : 'Live · synced now'}
                    </div>
                  </div>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(32,214,168,0.14)', color: fcol, fontSize: 10.5, fontWeight: 600 }}>{fr.role}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <Stat k="Gap" v={fr.gap} />
                  <Stat k="ETA to rally" v={fLost ? '—' : fr.eta} />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <Stat k="Speed" v={fLost ? '—' : fr.speed} />
                  <Stat k="Battery" v={fr.batt} />
                  <Stat k="Altitude" v={fr.alt} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 12, background: C.inset, marginBottom: 14 }}>
                  <BikeIcon color={C.muted} />
                  <span style={{ fontSize: 13, color: C.text }}>{fr.bike}</span>
                </div>
                <div style={{ display: 'flex', gap: 9 }}>
                  <SheetBtn
                    onClick={() => {
                      const nm = fr.name.split(' ')[0];
                      patch({ sheet: null });
                      showToast(`Pinged ${nm} · they’ll see it on their map`);
                    }}
                    icon={
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 11a9 9 0 0 1 18 0" />
                        <path d="M7 14a5 5 0 0 1 10 0" />
                        <circle cx="12" cy="17" r="1.4" fill={C.teal} />
                      </svg>
                    }
                  >
                    Ping
                  </SheetBtn>
                  <SheetBtn
                    onClick={() => {
                      const nm = fr.name.split(' ')[0];
                      patch({ sheet: null });
                      showToast(`Routing to ${nm}’s position`);
                    }}
                    icon={<Send size={15} color={C.teal} />}
                  >
                    Navigate
                  </SheetBtn>
                </div>
              </>
            )}

            {s.sheet === 'broadcast' && (
              <>
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Broadcast to the ride</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>One tap · everyone hears you</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <BcBtn onClick={() => bc('Stopping for fuel')} icon={<FuelIcon />}>Stopping for fuel</BcBtn>
                  <BcBtn onClick={() => bc('Pushing ahead — catch up')} icon={<ArrowRightIcon />}>Pushing ahead — catch up</BcBtn>
                  <BcBtn onClick={() => bc('Need a minute — hold up')} icon={<ClockIcon />}>Need a minute — hold up</BcBtn>
                  <BcBtn onClick={() => bc('Regroup at next rally')} icon={<Pin size={17} />}>Regroup at next rally</BcBtn>
                </div>
              </>
            )}

            {s.sheet === 'hub' && (
              <>
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Trip hub · Spiti loop</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>Everything for the ride, in one place.</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
                  <HubBtn onClick={() => patch({ sheet: 'itinerary' })} icon={<CalIcon />}>Itinerary</HubBtn>
                  <HubBtn onClick={() => patch({ sheet: 'stays' })} icon={<BedIcon />}>Stays</HubBtn>
                  <HubBtn onClick={() => patch({ sheet: 'docs' })} icon={<DocIcon />}>Documents</HubBtn>
                  <HubBtn onClick={() => patch({ sheet: 'expenses' })} icon={<RupeeIcon />}>Expenses</HubBtn>
                  <HubBtn onClick={() => patch({ sheet: 'checklist' })} icon={<ChecklistIcon />}>Checklist</HubBtn>
                  <HubBtn onClick={() => patch({ sheet: 'recap' })} accent icon={<RecapIcon />}>End ride</HubBtn>
                </div>
              </>
            )}

            {s.sheet === 'itinerary' && (
              <>
                <BackToHub onClick={() => patch({ sheet: 'hub' })} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Day 4 · Kaza → Chandratal</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>112 km · 2 legs · 1 night halt</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <LegRow tag="Leg 1" title="Kaza → Losar" sub="56 km · rally at Kunzum La" />
                  <LegRow tag="Leg 2" title="Losar → Chandratal" sub="56 km · rally at Batal dhaba" />
                  <LegRow tag="Night" title="Chandratal camp" sub="4,300 m · tents booked for 5" highlight />
                </div>
              </>
            )}

            {s.sheet === 'expenses' && (
              <>
                <BackToHub onClick={() => patch({ sheet: 'hub' })} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Shared expenses</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>Split equally · 5 riders</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 13, borderRadius: 13, background: 'rgba(255,176,32,0.08)', border: '1px solid rgba(255,176,32,0.28)', marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: C.muted }}>Your balance</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: C.amber, marginTop: 2 }}>You owe ₹640</div>
                  </div>
                  <button className="qd-tap" onClick={() => bc('Regroup at next rally')} style={{ height: 36, padding: '0 14px', border: 'none', borderRadius: 10, background: C.teal, color: C.bg, font: '600 12px Inter', cursor: 'pointer' }}>
                    Settle up
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <ExpRow emoji="⛽" title="Fuel · Kaza pump" by="Paid by Viren" amt="₹2,400" />
                  <ExpRow emoji="🍜" title="Lunch · Batal dhaba" by="Paid by You" amt="₹1,800" />
                  <ExpRow emoji="⛺" title="Camp · Chandratal" by="Paid by Tejas" amt="₹5,000" />
                </div>
              </>
            )}

            {s.sheet === 'checklist' && (
              <>
                <BackToHub onClick={() => patch({ sheet: 'hub' })} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Day 4 checklist</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>6 of 7 done · shared with the ride</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <ChkRow done>Fuel topped + 5L spare</ChkRow>
                  <ChkRow done>Tyre pressure checked</ChkRow>
                  <ChkRow done>Offline maps cached</ChkRow>
                  <ChkRow>Layers for Kunzum La pass</ChkRow>
                </div>
              </>
            )}

            {s.sheet === 'stays' && (
              <>
                <BackToHub onClick={() => patch({ sheet: 'hub' })} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Tonight's stay</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>Booked for the whole ride</div>
                <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: C.inset }}>
                  <div style={{ height: 96, background: 'repeating-linear-gradient(135deg, #1d2b27 0 12px, #18241f 12px 24px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ font: '600 11px ui-monospace,monospace', color: '#3f5650', letterSpacing: 1 }}>CHANDRATAL CAMP</span>
                  </div>
                  <div style={{ padding: 13 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Chandratal Lake Camp</div>
                    <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>Alpine tents · 4,300 m · check-in 5:00 PM</div>
                    <div style={{ display: 'flex', gap: 14, marginTop: 10, fontSize: 11.5, color: C.muted }}>
                      <span>5 beds</span>
                      <span>·</span>
                      <span>Dinner included</span>
                      <span>·</span>
                      <span>₹5,000</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {s.sheet === 'docs' && (
              <>
                <BackToHub onClick={() => patch({ sheet: 'hub' })} />
                <div style={{ fontFamily: DISPLAY, fontSize: 15, fontWeight: 600 }}>Documents &amp; permits</div>
                <div style={{ fontSize: 11, color: C.muted, margin: '2px 0 12px' }}>Carried for every rider</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <DocRow icon={<DocIcon color={C.muted} />} title="Inner Line Permit (ILP)" sub="Spiti · valid to Jun 22" badge="Verified" />
                  <DocRow icon={<CardIcon />} title="RC + Insurance" sub="5 bikes on file" badge="Complete" />
                  <DocRow icon={<IdIcon />} title="Driving licences" sub="5 of 5 verified" badge="Verified" />
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== RECAP ===== */}
      {s.sheet === 'recap' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 31, padding: '54px 20px 24px', display: 'flex', flexDirection: 'column', background: C.bg, backgroundImage: 'radial-gradient(360px 320px at 50% 22%, rgba(32,214,168,0.14), rgba(14,20,19,0) 70%)', animation: 'qd-sheet .35s ease-out' }}>
          <div className="qd-tap" onClick={() => patch({ sheet: null })} style={{ alignSelf: 'flex-start', width: 38, height: 38, borderRadius: 999, background: C.panel, border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...tap }}>
            <CloseIcon />
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 600, marginTop: 14 }}>Day 4 wrapped</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 6 }}>Kaza → Chandratal · all 5 in by 5:12 PM</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, marginTop: 18 }}>
            <RecapStat v="112" unit=" km" k="Distance" />
            <RecapStat v="4h 38m" k="Moving time" />
            <RecapStat v="4,551" unit=" m" k="Top altitude · Kunzum La" />
            <RecapStat v="5 / 5" k="Riders home · 0 left behind" color={C.teal} />
          </div>
          <div style={{ flex: 1 }} />
          <PrimaryBtn onClick={() => patch({ sheet: null })} display>
            Back to ride
          </PrimaryBtn>
        </div>
      )}

      {/* ===== CRASH ===== */}
      {s.phase === 'crash' && (
        <div style={{ position: 'absolute', inset: 0, padding: '58px 20px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.bg, backgroundImage: 'radial-gradient(360px 320px at 50% 28%, rgba(255,82,71,0.24), rgba(14,20,19,0) 70%)', zIndex: 30, animation: 'qd-sheet .3s ease-out' }}>
          <div style={{ position: 'relative', width: 56, height: 56, marginBottom: 14 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: C.red, opacity: 0.5, animation: 'qd-ring 1.8s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
                <path d="M12 9v4" />
                <path d="M12 16.6v.2" />
              </svg>
            </div>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 600 }}>Crash detected</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5, textAlign: 'center', lineHeight: 1.4 }}>
            A hard impact was sensed at 3:42 PM.
            <br />
            Are you okay?
          </div>
          <div style={{ position: 'relative', width: 150, height: 150, margin: '18px 0 16px' }}>
            <svg width="150" height="150" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="88" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
              <circle
                cx="100"
                cy="100"
                r="88"
                fill="none"
                stroke={C.red}
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray="553"
                strokeDashoffset={s.crashSent ? 0 : Math.round(553 * (1 - s.crashCount / 18))}
                transform="rotate(-90 100 100)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{s.crashSent ? 0 : s.crashCount}</div>
              <div style={{ fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: C.muted, marginTop: 6 }}>
                {s.crashSent ? 'SOS sent' : 'Sending SOS in'}
              </div>
            </div>
          </div>
          <div style={{ width: '100%', background: C.panel, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow icon={<PeopleIcon />}>Fellow riders notified</InfoRow>
            <InfoRow icon={<PhoneIcon />}>Emergency contacts alerted</InfoRow>
            <InfoRow icon={<Pin size={15} />}>Precise location shared for rescue</InfoRow>
          </div>
          <div style={{ flex: 1 }} />
          <button
            className="qd-tap"
            onClick={() => {
              clearAll();
              if (tour) tourNext();
              else go('ride');
            }}
            style={{ width: '100%', height: 54, border: 'none', borderRadius: 15, background: C.green, color: C.bg, font: '600 16px Inter', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}
          >
            <Check size={20} color={C.bg} w={2.6} />
            {s.crashSent ? 'Continue' : "I'm OK — cancel"}
          </button>
        </div>
      )}

      {/* ===== MANUAL SOS ===== */}
      {s.phase === 'sos' && (
        <div style={{ position: 'absolute', inset: 0, padding: '54px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', background: C.bg, zIndex: 30, animation: 'qd-sheet .3s ease-out' }}>
          <div className="qd-tap" onClick={() => patch({ phase: s.returnTo || 'ride', focus: null })} style={{ alignSelf: 'flex-start', width: 38, height: 38, borderRadius: 999, background: C.panel, border: '1px solid rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', ...tap }}>
            <CloseIcon />
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 23, fontWeight: 600, marginTop: 14, textAlign: 'center' }}>Send an SOS</div>
          <div style={{ fontSize: 12.5, color: C.muted, marginTop: 8, lineHeight: 1.5, textAlign: 'center', maxWidth: 250 }}>
            For a breakdown, medical issue, or a dead zone — not a crash. Hold so it can't fire by accident.
          </div>
          <SosHold onFired={onSosFired} />
          <div style={{ width: '100%', background: C.panel, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <InfoRow icon={<PeopleIcon />}>Notifies fellow riders nearby</InfoRow>
            <InfoRow icon={<PhoneIcon />}>Alerts your emergency contacts — even on one bar</InfoRow>
          </div>
        </div>
      )}

      {/* ===== ALL CLEAR ===== */}
      {s.phase === 'allclear' && (
        <div style={{ position: 'absolute', inset: 0, padding: '54px 22px 26px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.bg, backgroundImage: 'radial-gradient(360px 340px at 50% 30%, rgba(54,211,153,0.16), rgba(14,20,19,0) 70%)', zIndex: 30, animation: 'qd-sheet .4s ease-out' }}>
          <div style={{ position: 'relative', width: 92, height: 92, marginBottom: 20 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: C.green, opacity: 0.18, animation: 'qd-ring 2.6s ease-out infinite' }} />
            <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'rgba(54,211,153,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={46} color={C.green} w={2.4} />
            </div>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 25, fontWeight: 600 }}>0 left behind</div>
          <div style={{ fontSize: 13, color: C.muted, marginTop: 9, textAlign: 'center', lineHeight: 1.5, maxWidth: 260 }}>
            Akash's alert is resolved and all 5 riders regrouped at Chandratal camp. Signal restored.
          </div>
          <div style={{ width: '100%', marginTop: 24, background: C.panel, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 15, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <div style={{ width: 32, height: 32, borderRadius: 999, background: C.token, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>VC</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>Resolved by Viren</div>
                <div style={{ fontSize: 11, color: C.dim }}>2 min ago · synced to group</div>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>Minor fall, rider is okay. Bike rideable — continuing at a slower pace.</div>
          </div>
          <button className="qd-tap" onClick={() => restart()} style={{ width: '100%', marginTop: 18, height: 52, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, background: C.panel, color: C.text, font: "600 14px 'Space Grotesk',Inter", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v4h4" />
            </svg>
            Run it again
          </button>
        </div>
      )}

      {/* ===== toast ===== */}
      {s.toast && (
        <div
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            top: 84,
            zIndex: 45,
            padding: '11px 13px',
            borderRadius: 13,
            background: 'rgba(13,20,18,0.98)',
            border: `1px solid ${s.toastKind === 'sos' ? 'rgba(255,82,71,0.4)' : 'rgba(54,211,153,0.35)'}`,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'qd-sheet .3s ease-out',
          }}
        >
          <span style={{ width: 22, height: 22, borderRadius: 999, background: s.toastKind === 'sos' ? 'rgba(255,82,71,0.18)' : 'rgba(54,211,153,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={s.toastKind === 'sos' ? C.red : C.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              {s.toastKind === 'sos' ? <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /> : <path d="M5 12.5 10 17 19 7" />}
            </svg>
          </span>
          <span style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{s.toast}</span>
        </div>
      )}

      {/* ===== tour callout ===== */}
      {tour && s.phase !== 'intro' && (
        <div style={{ position: 'absolute', left: 12, right: 12, top: 50, zIndex: 48, padding: '12px 13px', borderRadius: 14, background: 'rgba(9,14,12,0.95)', border: '1px solid rgba(32,214,168,0.32)', boxShadow: '0 16px 40px rgba(0,0,0,0.55)', animation: 'qd-sheet .35s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: C.teal, fontWeight: 700 }}>Step {s.beat + 1} of 9</span>
            <div style={{ flex: 1, height: 3, borderRadius: 999, background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.round(((s.beat + 1) / BEATS.length) * 100)}%`, background: C.teal, borderRadius: 999, transition: 'width .4s' }} />
            </div>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 13.5, fontWeight: 600, marginBottom: 3 }}>{beat.title}</div>
          <div style={{ fontSize: 11, lineHeight: 1.45, color: C.body }}>{beat.hint}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button
              className="qd-tap"
              onClick={() => {
                clearAll();
                patch({ mode: 'free' });
                if (sRef.current.phase === 'ride') armFreeCrash();
              }}
              style={{ height: 32, padding: '0 12px', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 9, background: 'transparent', color: C.muted, font: '600 11px Inter', cursor: 'pointer' }}
            >
              Exit tour
            </button>
            <button className="qd-tap" onClick={() => tourNext()} style={{ flex: 1, height: 32, border: 'none', borderRadius: 9, background: C.teal, color: C.bg, font: "700 11.5px 'Space Grotesk',Inter", cursor: 'pointer' }}>
              {lastBeat ? 'Run it again' : 'Next →'}
            </button>
          </div>
        </div>
      )}

      {/* ===== intro overlay ===== */}
      {s.phase === 'intro' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 50, background: 'linear-gradient(180deg, rgba(8,13,11,0.6), rgba(8,13,11,0.92))', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: C.bg, border: '1px solid rgba(32,214,168,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 5px rgba(32,214,168,0.06)', marginBottom: 15 }}>
            <svg width="27" height="27" viewBox="0 0 30 30" fill="none" stroke={C.teal} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="22" r="2.5" />
              <circle cx="21" cy="8" r="2.5" />
              <path d="M11 22h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8h5" />
            </svg>
          </div>
          <div style={{ fontFamily: DISPLAY, fontSize: 21, fontWeight: 600 }}>Run a real ride</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, color: C.body, maxWidth: 240, margin: '8px 0 22px' }}>
            Spiti loop, Day 4. Create the ride, watch your crew join, lose signal, hit a crash, send an SOS — the actual app, in your hands.
          </div>
          <button
            className="qd-tap"
            onClick={() => {
              patch({ mode: 'tour' });
              enterBeat(0);
            }}
            style={{ width: '100%', maxWidth: 250, height: 48, border: 'none', borderRadius: 13, background: C.teal, color: C.bg, font: "700 14px 'Space Grotesk',Inter", cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 10 }}
          >
            Take the tour
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.bg} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m13 6 6 6-6 6" />
            </svg>
          </button>
          <button className="qd-tap" onClick={() => patch({ mode: 'free', phase: 'create', beat: 0, focus: null })} style={{ width: '100%', maxWidth: 250, height: 44, border: '1px solid rgba(255,255,255,0.14)', borderRadius: 13, background: 'rgba(255,255,255,0.03)', color: C.text, font: '600 13px Inter', cursor: 'pointer' }}>
            Explore freely
          </button>
        </div>
      )}
    </div>
  );

  function bc(msg: string) {
    patch({ sheet: null });
    showToast(`Broadcast · “${msg}”`);
  }
}

/* ===================== small building blocks ===================== */

const labelCss: CSSProperties = { fontSize: 10.5, letterSpacing: 0.4, textTransform: 'uppercase', color: C.dim };

const roundBtn: CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 999,
  background: 'rgba(20,30,28,0.7)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.10)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function Sheetish({ children }: { children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, padding: '54px 18px 28px', display: 'flex', flexDirection: 'column', animation: 'qd-sheet .35s ease-out' }}>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ background: C.panel, border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '13px 14px' }}>
      <div style={labelCss}>{label}</div>
      {children}
    </div>
  );
}

function Mini({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ flex: 1, background: C.token, borderRadius: 10, padding: '9px 11px' }}>
      <div style={{ fontSize: 10, color: C.dim }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 2 }}>{v}</div>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ flex: 1, background: C.inset, borderRadius: 11, padding: '10px 11px' }}>
      <div style={{ fontSize: 10, color: C.dim }}>{k}</div>
      <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 3 }}>{v}</div>
    </div>
  );
}

function RecapStat({ v, unit, k, color }: { v: string; unit?: string; k: string; color?: string }) {
  return (
    <div style={{ background: C.panel, border: '1px solid rgba(255,255,255,0.07)', borderRadius: 13, padding: 14 }}>
      <div style={{ fontFamily: DISPLAY, fontSize: 22, fontWeight: 600, color: color || C.text }}>
        {v}
        {unit && <span style={{ fontSize: 12, color: C.muted }}>{unit}</span>}
      </div>
      <div style={{ fontSize: 10.5, color: C.muted, marginTop: 3 }}>{k}</div>
    </div>
  );
}

function RoleCard({ init, name, role, ring, roleColor, initColor }: { init: string; name: string; role: string; ring: string; roleColor: string; initColor?: string }) {
  return (
    <div style={{ flex: 1, background: C.panel, border: `1px solid ${ring === C.teal ? 'rgba(32,214,168,0.3)' : 'rgba(255,255,255,0.08)'}`, borderRadius: 13, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
        <div style={{ width: 34, height: 34, borderRadius: 999, border: `2px solid ${ring}`, background: C.token, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: initColor || C.text }}>{init}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 10.5, color: roleColor }}>{role}</div>
        </div>
      </div>
    </div>
  );
}

function PrimaryBtn({ children, onClick, display }: { children: ReactNode; onClick: () => void; display?: boolean }) {
  return (
    <button
      className="qd-tap"
      onClick={onClick}
      style={{ width: '100%', height: 50, marginTop: display ? 0 : 14, border: 'none', borderRadius: 14, background: C.teal, color: C.bg, font: "600 15px Inter", cursor: 'pointer' }}
    >
      {children}
    </button>
  );
}

function SheetBtn({ children, onClick, icon }: { children: ReactNode; onClick: () => void; icon: ReactNode }) {
  return (
    <button className="qd-tap" onClick={onClick} style={{ flex: 1, height: 44, border: '1px solid rgba(255,255,255,0.10)', borderRadius: 12, background: C.token, color: C.text, font: '600 12.5px Inter', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
      {icon}
      {children}
    </button>
  );
}

function BcBtn({ children, onClick, icon }: { children: ReactNode; onClick: () => void; icon: ReactNode }) {
  return (
    <button className="qd-tap" onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.10)', background: C.inset, color: C.text, font: '600 13px Inter', cursor: 'pointer', textAlign: 'left' }}>
      {icon}
      {children}
    </button>
  );
}

function HubBtn({ children, onClick, icon, accent }: { children: ReactNode; onClick: () => void; icon: ReactNode; accent?: boolean }) {
  return (
    <button
      className="qd-tap"
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 13, borderRadius: 13, border: `1px solid ${accent ? 'rgba(54,211,153,0.3)' : 'rgba(255,255,255,0.10)'}`, background: accent ? 'rgba(54,211,153,0.08)' : C.inset, color: C.text, font: '600 12.5px Inter', cursor: 'pointer', textAlign: 'left' }}
    >
      <span style={{ width: 32, height: 32, borderRadius: 9, background: accent ? 'rgba(54,211,153,0.16)' : 'rgba(32,214,168,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{icon}</span>
      {children}
    </button>
  );
}

function BackToHub({ onClick }: { onClick: () => void }) {
  return (
    <div className="qd-tap" onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: C.muted, fontSize: 12, cursor: 'pointer', marginBottom: 10 }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Trip hub
    </div>
  );
}

function LegRow({ tag, title, sub, highlight }: { tag: string; title: string; sub: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 11, padding: 12, borderRadius: 12, background: highlight ? 'rgba(32,214,168,0.07)' : C.inset, border: `1px solid ${highlight ? 'rgba(32,214,168,0.18)' : 'rgba(255,255,255,0.07)'}` }}>
      <span style={{ fontSize: 11, color: C.teal, fontWeight: 600, width: 46, flexShrink: 0 }}>{tag}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  );
}

function ExpRow({ emoji, title, by, amt }: { emoji: string; title: string; by: string; amt: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 12px', borderRadius: 11, background: C.inset }}>
      <span style={{ fontSize: 16 }}>{emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: C.dim }}>{by}</div>
      </div>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{amt}</span>
    </div>
  );
}

function ChkRow({ children, done }: { children: ReactNode; done?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px', borderRadius: 11, background: C.inset, opacity: done ? 1 : 0.75 }}>
      <span style={{ width: 20, height: 20, borderRadius: 6, background: done ? 'rgba(54,211,153,0.16)' : 'transparent', border: done ? 'none' : '1.5px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {done && <Check size={12} color={C.green} w={3} />}
      </span>
      <span style={{ fontSize: 12.5, color: done ? C.text : C.muted }}>{children}</span>
    </div>
  );
}

function DocRow({ icon, title, sub, badge }: { icon: ReactNode; title: string; sub: string; badge: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: 12, borderRadius: 12, background: C.inset }}>
      {icon}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 10.5, color: C.dim }}>{sub}</div>
      </div>
      <span style={{ padding: '3px 9px', borderRadius: 999, background: 'rgba(54,211,153,0.14)', color: C.green, fontSize: 10, fontWeight: 600 }}>{badge}</span>
    </div>
  );
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {icon}
      <span style={{ fontSize: 12, color: C.muted }}>{children}</span>
    </div>
  );
}

/* ----- press & hold SOS ----- */
function SosHold({ onFired }: { onFired: () => void }) {
  const LEN = 578;
  const HOLD = 2000;
  const [offset, setOffset] = useState(LEN);
  const [hint, setHint] = useState('Hold to send');
  const iv = useRef<ReturnType<typeof setInterval> | null>(null);
  const start = useRef(0);
  const done = useRef(false);

  const stop = () => {
    if (iv.current) clearInterval(iv.current);
    iv.current = null;
  };
  const reset = () => {
    stop();
    if (done.current) return;
    setOffset(LEN);
    setHint('Hold to send');
  };
  const fire = () => {
    stop();
    done.current = true;
    setOffset(0);
    setHint('Sent');
    onFired();
  };
  const down = (e: React.SyntheticEvent) => {
    if (e.cancelable) e.preventDefault();
    if (done.current) return;
    stop();
    start.current = performance.now();
    setHint('Keep holding…');
    iv.current = setInterval(() => {
      const p = Math.min(1, (performance.now() - start.current) / HOLD);
      setOffset(LEN * (1 - p));
      if (p >= 1) fire();
    }, 40);
  };

  useEffect(() => () => stop(), []);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Hold to send SOS"
      onMouseDown={down}
      onTouchStart={down}
      onMouseUp={reset}
      onMouseLeave={reset}
      onTouchEnd={reset}
      onKeyDown={(e) => {
        if (e.repeat) return;
        if (e.key === 'Enter' || e.key === ' ') down(e);
      }}
      onKeyUp={reset}
      style={{ position: 'relative', width: 184, height: 184, margin: '30px 0 26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
    >
      <svg width="184" height="184" viewBox="0 0 200 200" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,82,71,0.18)" strokeWidth="6" />
        <circle cx="100" cy="100" r="92" fill="none" stroke={C.red} strokeWidth="6" strokeLinecap="round" strokeDasharray="578" strokeDashoffset={offset} transform="rotate(-90 100 100)" />
      </svg>
      <div style={{ width: 150, height: 150, borderRadius: 999, background: C.red, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 14px 36px rgba(255,82,71,0.3)' }}>
        <span style={{ fontSize: 28, fontWeight: 600, color: C.bg, letterSpacing: 1 }}>SOS</span>
        <span style={{ fontSize: 12, color: C.bg, marginTop: 5 }}>{hint}</span>
      </div>
    </div>
  );
}

/* ----- icons ----- */
function Check({ size, color, w = 3 }: { size: number; color: string; w?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}
function Pin({ size = 16, color = C.teal, sm, stroke }: { size?: number; color?: string; sm?: boolean; stroke?: boolean }) {
  const sz = sm ? 16 : size;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke ? 1.9 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}
function Send({ size = 18, color = C.teal }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-7-7 18-2.5-8L3 11Z" />
    </svg>
  );
}
function Chevron() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}
function BikeIcon({ color = C.teal }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17" r="3" />
      <circle cx="18.5" cy="17" r="3" />
      <path d="M5.5 17 10 8h4l3 5" />
      <path d="M9 8h3" />
    </svg>
  );
}
function FuelIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#5FB0E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v15" />
      <path d="M3 20h12" />
      <path d="M14 9h2.5a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V8l-3-3" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}
function ClockIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}
function CalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v3M16 3v3" />
    </svg>
  );
}
function BedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
      <path d="M3 14h18M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    </svg>
  );
}
function DocIcon({ color = C.teal }: { color?: string }) {
  return (
    <svg width={color === C.teal ? 16 : 18} height={color === C.teal ? 16 : 18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h8l4 4v16H6Z" />
      <path d="M14 2v4h4" />
    </svg>
  );
}
function RupeeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2a2.6 2.6 0 0 0-2.5-1.7c-1.5 0-2.6.9-2.6 2.1 0 2.7 5.2 1.6 5.2 4.4 0 1.2-1.1 2.2-2.7 2.2a2.7 2.7 0 0 1-2.6-1.8" />
    </svg>
  );
}
function ChecklistIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6.5 6 8.5 9.5 5M4 12.5 6 14.5 9.5 11M4 18.5 6 20.5 9.5 17" />
      <path d="M13 7h7M13 13h7M13 19h7" />
    </svg>
  );
}
function RecapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3 8-8" />
      <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
    </svg>
  );
}
function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18" />
    </svg>
  );
}
function IdIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="11" r="2" />
      <path d="M14 9h4M14 13h4" />
    </svg>
  );
}
function PeopleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18a4 4 0 0 0-8 0" />
      <circle cx="12" cy="8" r="3.5" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={C.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

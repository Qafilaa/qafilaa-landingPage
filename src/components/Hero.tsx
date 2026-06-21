import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { colors, fonts, layout } from '../theme';
import { site } from '../content';
import { getWaitlistCount } from '../api';
import { RideScreen } from './RideScreen';
import { WaitlistForm } from './WaitlistForm';
import { useReveal } from '../hooks/useReveal';

interface HeroProps {
  submitted: boolean;
  onSubmit: () => void;
}

const avatarBase: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 999,
  background: colors.token,
  border: '2px solid #070D0B',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  fontWeight: 600,
  color: colors.textMuted,
};

const chipLabel: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.6px',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontWeight: 600,
};

/** A single word in the headline, revealing with the prototype's flip-up. */
function HeadlineWord({ children, delay, color }: { children: ReactNode; delay?: number; color?: string }) {
  const { ref, style } = useReveal<HTMLSpanElement>({
    delay,
    duration: 0.7,
    from: 'translateY(105%) rotateX(-65deg)',
  });
  return (
    <span
      ref={ref}
      style={{ ...style, display: 'inline-block', transformOrigin: 'bottom', color }}
    >
      {children}
    </span>
  );
}

export function Hero({ submitted, onSubmit }: HeroProps) {
  const badge = useReveal({ duration: 0.8, from: 'translateY(22px)' });
  const sub = useReveal({ delay: 300, duration: 0.8, from: 'translateY(22px)' });
  const form = useReveal({ delay: 380, duration: 0.8, from: 'translateY(22px)' });
  const phone = useReveal({ delay: 180, duration: 1, from: 'translateY(26px)' });

  // Social-proof count: the base (50) plus real signups from the backend. Starts at the base so the
  // prerendered/SSR markup is right, then tracks the live count — refreshed on load, on a poll, and
  // the moment a signup lands — so the number climbs in real time (fails silently to the base).
  const [waitingCount, setWaitingCount] = useState<number>(site.waitlistCount);
  useEffect(() => {
    let active = true;

    const refresh = () =>
      getWaitlistCount()
        .then((count) => {
          if (active) {
            setWaitingCount(site.waitlistCount + count);
          }
        })
        .catch(() => {/* keep the last good count */});

    refresh();
    // Poll so the count stays live as other riders join.
    const poll = window.setInterval(refresh, 15000);
    return () => {
      active = false;
      window.clearInterval(poll);
    };
  }, []);

  // A fresh signup just landed — pull the new total immediately rather than waiting for the next poll.
  useEffect(() => {
    if (!submitted) {
      return;
    }
    let active = true;
    getWaitlistCount()
      .then((count) => {
        if (active) {
          setWaitingCount(site.waitlistCount + count);
        }
      })
      .catch(() => {/* keep the last good count */});
    return () => {
      active = false;
    };
  }, [submitted]);

  return (
    <section
      data-hero
      style={{ position: 'relative', padding: '80px 0 70px', overflow: 'hidden', minHeight: '82vh' }}
    >
      {/* real 3D terrain flythrough (lazy-loaded by useTerrain) over low-poly SVG fallback */}
      <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <canvas
          data-terrain
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0, transition: 'opacity 1.4s ease' }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(56% 60% at 64% 30%, rgba(32,214,168,0.14), transparent 62%), radial-gradient(50% 50% at 14% 4%, rgba(46,123,162,0.08), transparent 60%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: '60%',
            top: '30%',
            width: 620,
            height: 620,
            transform: 'translate(-50%,-50%)',
            borderRadius: 999,
            background: 'radial-gradient(circle, rgba(32,214,168,0.16), transparent 66%)',
            filter: 'blur(6px)',
            animation: 'qf-glow 7s ease-in-out infinite',
          }}
        />
        <svg
          data-terrain-svg
          viewBox="0 0 1440 760"
          preserveAspectRatio="xMidYMax slice"
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, width: '100%', height: '84%', transition: 'opacity 1.4s ease' }}
        >
          {/* far / mid-ground range (faded, behind content) */}
          <g stroke="rgba(120,210,184,0.10)" strokeWidth="1" strokeLinejoin="round">
            <polygon points="300,760 372,512 470,600 560,470 470,760" fill="#10241e" />
            <polygon points="560,470 660,560 760,452 660,760 470,760" fill="#0d1f1a" />
            <polygon points="760,452 880,560 1000,470 900,760 660,760" fill="#10241e" />
            <polygon points="1000,470 1120,560 1220,500 1300,760 900,760" fill="#0d1f1a" />
            <polygon points="560,470 530,510 588,508" fill="#1d4034" />
            <polygon points="760,452 732,494 790,492" fill="#1d4034" />
            <polygon points="1000,470 972,512 1030,510" fill="#1d4034" />
          </g>
          {/* near-left massif */}
          <g stroke="rgba(130,222,196,0.16)" strokeWidth="1.1" strokeLinejoin="round">
            <polygon points="-80,760 140,470 210,470 260,760" fill="#2e6f59" />
            <polygon points="140,470 300,300 210,470" fill="#3c8a6f" />
            <polygon points="300,300 210,470 260,760 420,760 300,300" fill="#163b30" />
            <polygon points="300,300 430,462 420,760" fill="#13322a" />
            <polygon points="430,462 560,372 560,760 420,760" fill="#245a48" />
            <polygon points="560,372 720,560 820,760 560,760" fill="#13322a" />
            <polygon points="300,300 268,356 350,353" fill="#5a9c84" />
            <polygon points="560,372 535,408 594,405" fill="#4f8c75" />
          </g>
          {/* near-right massif (tall far-right peak) */}
          <g stroke="rgba(130,222,196,0.16)" strokeWidth="1.1" strokeLinejoin="round">
            <polygon points="760,760 900,520 1010,400 960,760" fill="#163b30" />
            <polygon points="1010,400 1140,540 1160,760 960,760" fill="#245a48" />
            <polygon points="1140,540 1300,300 1320,760 1160,760" fill="#13322a" />
            <polygon points="1300,300 1440,520 1520,760 1320,760" fill="#2e6f59" />
            <polygon points="1300,300 1392,470 1440,520" fill="#3c8a6f" />
            <polygon points="1010,400 982,448 1048,445" fill="#4f8c75" />
            <polygon points="1300,300 1272,352 1340,349" fill="#5a9c84" />
          </g>
          {/* ridge routes (animated convoy dots) */}
          <path id="qf-ridge-l" d="M170 470 L300 300 L430 462 L560 372" fill="none" stroke="rgba(32,214,168,0.5)" strokeWidth="2" strokeDasharray="2 11" strokeLinecap="round" />
          <path id="qf-ridge-r" d="M900 520 L1010 400 L1140 540 L1300 300" fill="none" stroke="rgba(32,214,168,0.4)" strokeWidth="2" strokeDasharray="2 11" strokeLinecap="round" />
          <circle r="4.5" fill="#20D6A8">
            <animateMotion dur="8s" repeatCount="indefinite"><mpath href="#qf-ridge-l" /></animateMotion>
          </circle>
          <circle r="3.5" fill="rgba(32,214,168,0.75)">
            <animateMotion dur="10s" begin="2s" repeatCount="indefinite"><mpath href="#qf-ridge-r" /></animateMotion>
          </circle>
          {/* waypoint sparks */}
          <g fill="#20D6A8">
            <circle cx="420" cy="210" r="2" opacity="0.5" />
            <circle cx="1180" cy="180" r="2.4" opacity="0.6" />
            <circle cx="760" cy="150" r="1.8" opacity="0.4" />
            <circle cx="980" cy="250" r="2" opacity="0.45" />
          </g>
        </svg>
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 260px 70px rgba(7,13,11,0.7)' }} />
      </div>

      {/* bottom fade into page */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 140, zIndex: 1, background: 'linear-gradient(0deg,#070D0B 8%, transparent)', pointerEvents: 'none' }} />

      {/* content */}
      <div data-hero-inner style={{ position: 'relative', zIndex: 2, maxWidth: layout.maxWidth, margin: '0 auto', padding: '0 28px' }}>
        <div data-hero-grid style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: 40, alignItems: 'center' }}>
          {/* copy column */}
          <div data-hero-copy>
            <div
              ref={badge.ref}
              style={{
                ...badge.style,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '7px 14px 7px 10px',
                borderRadius: 999,
                background: 'rgba(32,214,168,0.10)',
                border: '1px solid rgba(32,214,168,0.28)',
                marginBottom: 26,
              }}
            >
              <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9 }}>
                <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: colors.accent, animation: 'qf-ping 2.2s ease-out infinite' }} />
                <span style={{ position: 'relative', width: 9, height: 9, borderRadius: 999, background: colors.accent }} />
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: colors.accent }}>{site.launchLabel}</span>
            </div>

            <h1
              style={{
                fontFamily: fonts.display,
                fontSize: 'clamp(46px, 6vw, 80px)',
                lineHeight: 1.0,
                fontWeight: 600,
                letterSpacing: '-0.028em',
                margin: 0,
                perspective: '700px',
              }}
            >
              <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
                <HeadlineWord>Built&nbsp;</HeadlineWord>
                <HeadlineWord delay={70}>by&nbsp;rider.</HeadlineWord>
              </span>
              <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
                <HeadlineWord delay={150} color={colors.accent}>For&nbsp;fellow&nbsp;</HeadlineWord>
                <HeadlineWord delay={220}>riders.</HeadlineWord>
              </span>
            </h1>

            <p
              ref={sub.ref}
              style={{ ...sub.style, color: colors.textMuted, fontSize: 18.5, lineHeight: 1.62, maxWidth: 520, margin: '26px 0 0', textWrap: 'pretty' }}
            >
              {site.heroSub}
            </p>

            <div ref={form.ref} style={{ ...form.style, marginTop: 34, maxWidth: 480 }}>
              <WaitlistForm
                submitted={submitted}
                onSubmit={onSubmit}
                source="hero"
                buttonLabel="Join the waitlist"
                successLabel="You're on the list. We'll call you before the first ride."
                inputBackground="rgba(14,20,19,0.9)"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div style={{ display: 'flex' }}>
                  <div style={avatarBase}>VC</div>
                  <div style={{ ...avatarBase, marginLeft: -9 }}>YT</div>
                  <div style={{ ...avatarBase, marginLeft: -9 }}>AJ</div>
                  <div style={{ ...avatarBase, marginLeft: -9, background: 'rgba(32,214,168,0.18)', color: colors.accent }}>+</div>
                </div>
                <span style={{ fontSize: 14, color: colors.textMuted }}>
                  <span style={{ color: colors.text, fontWeight: 600 }}>{waitingCount.toLocaleString()}+</span>{' '}
                  riders already waiting for the gate to open
                </span>
              </div>
            </div>
          </div>

          {/* phone column (3D tilt in hands) */}
          <div ref={phone.ref} data-hero-phone-wrap style={{ ...phone.style, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <div data-phone-float style={{ position: 'relative', animation: 'qf-float 7s ease-in-out infinite' }}>
              {/* floating telemetry chips */}
              <div data-float-chip style={{ position: 'absolute', top: 78, left: -92, zIndex: 3, padding: '11px 14px', borderRadius: 14, background: 'rgba(14,20,19,0.92)', border: '1px solid rgba(32,214,168,0.30)', boxShadow: '0 18px 44px rgba(0,0,0,0.5)', animation: 'qf-floats 5.5s ease-in-out infinite', willChange: 'transform' }}>
                <div style={chipLabel}>Lead · Viren</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: colors.accent, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: colors.accent, animation: 'qf-blink 1.8s ease-in-out infinite' }} />
                  Live now
                </div>
              </div>
              <div data-float-chip style={{ position: 'absolute', top: 286, right: -78, zIndex: 3, padding: '11px 14px', borderRadius: 14, background: 'rgba(14,20,19,0.92)', border: '1px solid rgba(255,176,32,0.30)', boxShadow: '0 18px 44px rgba(0,0,0,0.5)', animation: 'qf-floats 6.5s ease-in-out infinite', animationDelay: '1.2s', willChange: 'transform' }}>
                <div style={chipLabel}>Sweep gap</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  1.4 <span style={{ fontSize: 11, color: colors.textMuted }}>km</span>
                </div>
              </div>
              <div data-float-chip style={{ position: 'absolute', bottom: 30, left: -86, zIndex: 3, padding: '11px 14px', borderRadius: 14, background: 'rgba(14,20,19,0.92)', border: '1px solid rgba(255,255,255,0.12)', boxShadow: '0 18px 44px rgba(0,0,0,0.5)', animation: 'qf-floats 6s ease-in-out infinite', animationDelay: '0.6s', willChange: 'transform' }}>
                <div style={chipLabel}>Altitude</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  4,551 <span style={{ fontSize: 11, color: colors.textMuted }}>m</span>
                </div>
              </div>

              {/* floor glow under the phone */}
              <div style={{ position: 'absolute', left: '50%', bottom: -34, width: 248, height: 64, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(32,214,168,0.22), transparent 70%)', filter: 'blur(16px)', borderRadius: 999, zIndex: 0, pointerEvents: 'none' }} />

              <div data-phone-pose style={{ transform: 'perspective(1300px) rotateY(-13deg) rotateX(6deg)', transformStyle: 'preserve-3d' }}>
                <div data-tilt data-tilt-max="9" style={{ position: 'relative', transformStyle: 'preserve-3d', transition: 'transform .18s ease-out', willChange: 'transform' }}>
                  <div style={{ width: 300, padding: 9, background: '#000', borderRadius: 46, boxShadow: '0 50px 110px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)', position: 'relative' }}>
                    <div style={{ position: 'relative', width: 282, height: 600, borderRadius: 38, overflow: 'hidden', background: '#0A1110' }}>
                      <RideScreen state="live" />
                      <div data-glare style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(220px 220px at 30% 12%, rgba(255,255,255,0.14), transparent 60%)', opacity: 0.45, mixBlendMode: 'screen', zIndex: 8 }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

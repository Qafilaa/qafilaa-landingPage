import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, layout } from '../theme';
import { site } from '../content';
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

  return (
    <section
      data-hero
      style={{ position: 'relative', padding: '80px 0 70px', overflow: 'hidden', minHeight: '82vh' }}
    >
      {/* 3D diorama scene */}
      <div
        data-scene
        style={{ position: 'absolute', inset: 0, zIndex: 0, perspective: '1300px', perspectiveOrigin: '50% 42%', pointerEvents: 'none' }}
      >
        <div data-scene-inner style={{ position: 'absolute', inset: '-10%', transformStyle: 'preserve-3d', willChange: 'transform' }}>
          {/* aurora */}
          <div
            data-depth="6"
            style={{
              position: 'absolute',
              left: '-12%',
              right: '-12%',
              top: '-4%',
              height: '62%',
              background:
                'radial-gradient(60% 80% at 70% 10%, rgba(32,214,168,0.18), transparent 60%), radial-gradient(50% 70% at 25% 0%, rgba(46,123,162,0.16), transparent 60%)',
              filter: 'blur(8px)',
              animation: 'qf-aurora 18s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
          {/* starfield */}
          <div
            data-depth="10"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'radial-gradient(1.4px 1.4px at 12% 18%, rgba(255,255,255,0.7), transparent), radial-gradient(1.2px 1.2px at 32% 9%, rgba(255,255,255,0.5), transparent), radial-gradient(1.6px 1.6px at 54% 22%, rgba(255,255,255,0.65), transparent), radial-gradient(1.1px 1.1px at 71% 12%, rgba(255,255,255,0.5), transparent), radial-gradient(1.5px 1.5px at 86% 26%, rgba(255,255,255,0.6), transparent), radial-gradient(1.2px 1.2px at 44% 6%, rgba(255,255,255,0.45), transparent), radial-gradient(1.3px 1.3px at 92% 8%, rgba(255,255,255,0.55), transparent)',
              animation: 'qf-twinkle 5s ease-in-out infinite',
              willChange: 'transform',
            }}
          />
          {/* canvas particles (gps pings) */}
          <canvas data-particles style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', willChange: 'transform' }} />
          {/* FAR ridge */}
          <div data-depth="20" style={{ position: 'absolute', left: '-6%', right: '-6%', bottom: 0, height: '82%', willChange: 'transform' }}>
            <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%' }}>
              <path d="M0,360 L200,300 L200,520 L0,520 Z" fill="rgba(58,98,92,0.6)" />
              <path d="M200,300 L420,350 L420,520 L200,520 Z" fill="rgba(40,74,70,0.6)" />
              <path d="M420,350 L640,282 L640,520 L420,520 Z" fill="rgba(58,98,92,0.6)" />
              <path d="M640,282 L880,350 L880,520 L640,520 Z" fill="rgba(40,74,70,0.6)" />
              <path d="M880,350 L1120,300 L1120,520 L880,520 Z" fill="rgba(58,98,92,0.6)" />
              <path d="M1120,300 L1360,350 L1360,520 L1120,520 Z" fill="rgba(40,74,70,0.6)" />
              <path d="M1360,350 L1440,320 L1440,520 L1360,520 Z" fill="rgba(58,98,92,0.6)" />
            </svg>
          </div>
          {/* MID ridge */}
          <div data-depth="40" style={{ position: 'absolute', left: '-8%', right: '-8%', bottom: 0, height: '76%', willChange: 'transform' }}>
            <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%' }}>
              <path d="M0,360 L120,250 L120,500 L0,500 Z" fill="#215045" />
              <path d="M120,250 L260,340 L260,500 L120,500 Z" fill="#15352e" />
              <path d="M260,340 L400,210 L400,500 L260,500 Z" fill="#215045" />
              <path d="M400,210 L560,330 L560,500 L400,500 Z" fill="#15352e" />
              <path d="M560,330 L720,180 L720,500 L560,500 Z" fill="#215045" />
              <path d="M720,180 L900,330 L900,500 L720,500 Z" fill="#15352e" />
              <path d="M900,330 L1080,230 L1080,500 L900,500 Z" fill="#215045" />
              <path d="M1080,230 L1260,330 L1260,500 L1080,500 Z" fill="#15352e" />
              <path d="M1260,330 L1440,270 L1440,500 L1260,500 Z" fill="#215045" />
              <path d="M0,360 L120,250 L260,340 L400,210 L560,330 L720,180 L900,330 L1080,230 L1260,330 L1440,270" fill="none" stroke="rgba(140,220,200,0.22)" strokeWidth="1.3" />
            </svg>
          </div>
          {/* route layer (between mid and near) */}
          <div data-depth="54" style={{ position: 'absolute', left: '-8%', right: '-8%', bottom: 0, height: '60%', willChange: 'transform' }}>
            <svg viewBox="0 0 1440 500" preserveAspectRatio="xMidYMax meet" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path id="qf-route" d="M 120 470 C 320 410 280 320 460 300 C 640 280 700 250 820 200 C 940 150 1080 170 1300 90" fill="none" stroke="rgba(32,214,168,0.45)" strokeWidth="2.4" strokeDasharray="2 11" strokeLinecap="round" />
              <circle r="5" fill={colors.accent}>
                <animateMotion dur="10s" repeatCount="indefinite" rotate="auto"><mpath href="#qf-route" /></animateMotion>
              </circle>
              <circle r="4" fill="rgba(32,214,168,0.8)">
                <animateMotion dur="10s" begin="1.8s" repeatCount="indefinite"><mpath href="#qf-route" /></animateMotion>
              </circle>
              <circle r="4" fill="rgba(32,214,168,0.8)">
                <animateMotion dur="10s" begin="3.4s" repeatCount="indefinite"><mpath href="#qf-route" /></animateMotion>
              </circle>
              <circle r="3.4" fill="rgba(255,255,255,0.5)">
                <animateMotion dur="10s" begin="6s" repeatCount="indefinite"><mpath href="#qf-route" /></animateMotion>
              </circle>
            </svg>
          </div>
          {/* NEAR ridge */}
          <div data-depth="72" style={{ position: 'absolute', left: '-10%', right: '-10%', bottom: 0, height: '64%', willChange: 'transform' }}>
            <svg viewBox="0 0 1440 520" preserveAspectRatio="xMidYMax slice" style={{ width: '100%', height: '100%' }}>
              <path d="M0,470 L170,300 L170,520 L0,520 Z" fill="#17362d" />
              <path d="M170,300 L300,420 L300,520 L170,520 Z" fill="#0b1d18" />
              <path d="M300,420 L470,250 L470,520 L300,520 Z" fill="#17362d" />
              <path d="M470,250 L640,400 L640,520 L470,520 Z" fill="#0b1d18" />
              <path d="M640,400 L820,210 L820,520 L640,520 Z" fill="#17362d" />
              <path d="M820,210 L1000,400 L1000,520 L820,520 Z" fill="#0b1d18" />
              <path d="M1000,400 L1180,270 L1180,520 L1000,520 Z" fill="#17362d" />
              <path d="M1180,270 L1320,420 L1320,520 L1180,520 Z" fill="#0b1d18" />
              <path d="M1320,420 L1440,360 L1440,520 L1320,520 Z" fill="#17362d" />
              {/* snow caps */}
              <path d="M444,288 L470,250 L496,288 Z" fill="rgba(206,232,224,0.5)" />
              <path d="M792,250 L820,210 L848,250 Z" fill="rgba(206,232,224,0.5)" />
              <path d="M1154,306 L1180,270 L1206,306 Z" fill="rgba(206,232,224,0.5)" />
              {/* ridge rim light */}
              <path d="M0,470 L170,300 L300,420 L470,250 L640,400 L820,210 L1000,400 L1180,270 L1320,420 L1440,360" fill="none" stroke="rgba(32,214,168,0.45)" strokeWidth="1.8" />
            </svg>
          </div>
        </div>
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
                <HeadlineWord>Ride&nbsp;</HeadlineWord>
                <HeadlineWord delay={70}>together.</HeadlineWord>
              </span>
              <span style={{ display: 'block', overflow: 'hidden', paddingBottom: '0.06em' }}>
                <HeadlineWord delay={150} color={colors.accent}>No&nbsp;one&nbsp;</HeadlineWord>
                <HeadlineWord delay={220}>left&nbsp;behind.</HeadlineWord>
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
                buttonLabel="Get early access"
                successLabel="You're on the list. We'll call you before the first ride."
                inputBackground="rgba(14,20,19,0.9)"
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                <div style={{ display: 'flex' }}>
                  <div style={avatarBase}>AK</div>
                  <div style={{ ...avatarBase, marginLeft: -9 }}>RS</div>
                  <div style={{ ...avatarBase, marginLeft: -9 }}>MD</div>
                  <div style={{ ...avatarBase, marginLeft: -9, background: 'rgba(32,214,168,0.18)', color: colors.accent }}>+</div>
                </div>
                <span style={{ fontSize: 14, color: colors.textMuted }}>
                  <span style={{ color: colors.text, fontWeight: 600 }}>{site.waitlistCount.toLocaleString()}+</span>{' '}
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
                <div style={chipLabel}>Lead · Aman</div>
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

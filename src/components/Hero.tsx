import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { site } from '../content';
import { ConvoyMap } from './ConvoyMap';
import { WaitlistForm } from './WaitlistForm';
import { useReveal } from '../hooks/useReveal';
import { usePointerGlow } from '../hooks/usePointerGlow';

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

const chipBase: CSSProperties = {
  position: 'absolute',
  padding: '10px 13px',
  borderRadius: 14,
  background: 'rgba(20,28,26,0.92)',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
};

const chipLabel: CSSProperties = {
  fontSize: 10,
  letterSpacing: '0.5px',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontWeight: 600,
};

export function Hero({ submitted, onSubmit }: HeroProps) {
  const { containerRef, background, onMouseMove } = usePointerGlow();
  const badge = useReveal({});
  const heading = useReveal({ delay: 80 });
  const sub = useReveal({ delay: 160 });
  const form = useReveal({ delay: 240 });
  const phone = useReveal({ delay: 120, duration: 1 });

  return (
    <section
      data-hero
      ref={containerRef as React.RefObject<HTMLElement>}
      onMouseMove={onMouseMove}
      style={{
        position: 'relative',
        // Full-bleed so the ambient glow/terrain layers span the viewport;
        // the content below is re-constrained to the 1180px column.
        padding: '84px 0 60px',
        overflow: 'hidden',
      }}
    >
      {/* cursor-following ambient glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background,
          transition: 'background .15s linear',
        }}
      />

      {/* drifting topographic terrain + traveling convoy dots */}
      <div
        style={{
          position: 'absolute',
          inset: -80,
          pointerEvents: 'none',
          opacity: 0.5,
          animation: 'qf-drift 26s linear infinite alternate',
        }}
      >
        <svg viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
          <g fill="none" stroke="rgba(255,255,255,0.045)" strokeWidth="1.1">
            <path d="M-40 130 C 220 70 420 200 700 130 C 920 76 1080 170 1260 120" />
            <path d="M-40 220 C 200 160 460 280 720 210 C 940 152 1090 230 1260 200" />
            <path d="M-40 330 C 180 280 420 400 680 330 C 920 268 1100 330 1260 310" />
            <path d="M-40 440 C 240 390 420 510 700 440 C 940 378 1110 450 1260 430" />
            <path d="M-40 560 C 200 510 420 620 700 560 C 940 500 1110 560 1260 550" />
          </g>
          <path
            id="qf-hero-route"
            d="M 80 600 C 260 540 220 420 360 380 C 520 332 620 360 660 250 C 690 168 820 150 980 90"
            fill="none"
            stroke="rgba(32,214,168,0.30)"
            strokeWidth="2"
            strokeDasharray="2 9"
            strokeLinecap="round"
          />
          <circle r="4.5" fill={colors.accent}>
            <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
              <mpath href="#qf-hero-route" />
            </animateMotion>
          </circle>
          <circle r="3.5" fill="rgba(32,214,168,0.7)">
            <animateMotion dur="9s" begin="1.6s" repeatCount="indefinite">
              <mpath href="#qf-hero-route" />
            </animateMotion>
          </circle>
          <circle r="3.5" fill="rgba(32,214,168,0.7)">
            <animateMotion dur="9s" begin="3.0s" repeatCount="indefinite">
              <mpath href="#qf-hero-route" />
            </animateMotion>
          </circle>
          <circle r="3" fill="rgba(255,255,255,0.45)">
            <animateMotion dur="9s" begin="5.2s" repeatCount="indefinite">
              <mpath href="#qf-hero-route" />
            </animateMotion>
          </circle>
        </svg>
      </div>

      <div style={{ position: 'relative', maxWidth: layout.maxWidth, margin: '0 auto', padding: '0 28px' }}>
        <div
          data-hero-grid
          style={{
            position: 'relative',
            display: 'grid',
            gridTemplateColumns: '1.05fr 0.95fr',
            gap: 40,
            alignItems: 'center',
          }}
        >
          {/* copy column */}
        <div>
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
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  background: colors.accent,
                  animation: 'qf-ping 2.2s ease-out infinite',
                }}
              />
              <span style={{ position: 'relative', width: 9, height: 9, borderRadius: 999, background: colors.accent }} />
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: colors.accent }}>
              {site.launchLabel}
            </span>
          </div>

          <h1
            ref={heading.ref}
            style={{
              ...heading.style,
              fontFamily: fonts.display,
              fontSize: 'clamp(44px, 6vw, 76px)',
              lineHeight: 1.02,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              margin: 0,
            }}
          >
            Ride together.
            <br />
            <span style={{ color: colors.accent }}>No one</span> left behind.
          </h1>

          <p
            ref={sub.ref}
            style={{
              ...sub.style,
              color: colors.textMuted,
              fontSize: 18.5,
              lineHeight: 1.62,
              maxWidth: 520,
              margin: '26px 0 0',
              textWrap: 'pretty',
            }}
          >
            {site.heroSub}
          </p>

          {/* waitlist form */}
          <div ref={form.ref} style={{ ...form.style, marginTop: 34, maxWidth: 480 }}>
            <WaitlistForm
              submitted={submitted}
              onSubmit={onSubmit}
              buttonLabel="Get early access"
              successLabel="You're on the list. We'll call you before the first ride."
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
              <div style={{ display: 'flex' }}>
                <div style={avatarBase}>AK</div>
                <div style={{ ...avatarBase, marginLeft: -9 }}>RS</div>
                <div style={{ ...avatarBase, marginLeft: -9 }}>MD</div>
                <div
                  style={{
                    ...avatarBase,
                    marginLeft: -9,
                    background: 'rgba(32,214,168,0.18)',
                    color: colors.accent,
                  }}
                >
                  +
                </div>
              </div>
              <span style={{ fontSize: 14, color: colors.textMuted }}>
                <span style={{ color: colors.text, fontWeight: 600 }}>
                  {site.waitlistCount.toLocaleString()}+
                </span>{' '}
                riders already waiting for the gate to open
              </span>
            </div>
          </div>
        </div>

        {/* phone column */}
        <div
          ref={phone.ref}
          style={{ ...phone.style, position: 'relative', display: 'flex', justifyContent: 'center' }}
        >
          <div data-phone style={{ position: 'relative', animation: 'qf-float 7s ease-in-out infinite' }}>
            <div
              style={{
                width: 300,
                padding: 9,
                background: '#000',
                borderRadius: 46,
                boxShadow: '0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: 282,
                  height: 600,
                  borderRadius: 38,
                  overflow: 'hidden',
                  background: colors.surfaceInset,
                }}
              >
                <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <ConvoyMap state="live" />
                </div>
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 120,
                    background: 'linear-gradient(180deg, rgba(8,14,12,0.9), rgba(8,14,12,0))',
                    pointerEvents: 'none',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 200,
                    background: 'linear-gradient(0deg, rgba(8,14,12,0.96) 28%, rgba(8,14,12,0))',
                    pointerEvents: 'none',
                  }}
                />

                {/* status pill */}
                <div
                  style={{
                    position: 'absolute',
                    top: 18,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '6px 13px',
                    borderRadius: 999,
                    background: 'rgba(14,20,19,0.78)',
                    border: '1px solid rgba(32,214,168,0.3)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: colors.accent,
                      animation: 'qf-blink 2s ease-in-out infinite',
                    }}
                  />
                  <span style={{ fontSize: 11.5, color: colors.accent, fontWeight: 500 }}>All live · synced now</span>
                </div>

                {/* bottom card */}
                <div
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    bottom: 14,
                    padding: 14,
                    borderRadius: 18,
                    background: 'rgba(20,28,26,0.86)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={colors.success}
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12.5 10 17 19 7" />
                    </svg>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>5 of 5 · all accounted for</span>
                    <span style={{ marginLeft: 'auto', fontSize: 11, color: colors.textDim }}>synced now</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <div
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 12,
                        background: colors.token,
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 11, color: colors.textMuted }}>Rally pt</span>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 46,
                        borderRadius: 12,
                        background: colors.token,
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 11, color: colors.textMuted }}>Sweep</span>
                    </div>
                    <div
                      style={{
                        width: 54,
                        height: 46,
                        borderRadius: 12,
                        background: colors.danger,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#06120E' }}>SOS</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* floating telemetry chips */}
            <div
              data-float-chip
              style={{
                ...chipBase,
                top: 90,
                left: -78,
                border: '1px solid rgba(255,255,255,0.10)',
                animation: 'qf-floats 5.5s ease-in-out infinite',
              }}
            >
              <div style={chipLabel}>Lead · Aman</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3, color: colors.accent }}>Live now</div>
            </div>
            <div
              data-float-chip
              style={{
                ...chipBase,
                top: 300,
                right: -66,
                border: '1px solid rgba(255,176,32,0.30)',
                animation: 'qf-floats 6.5s ease-in-out infinite',
                animationDelay: '1.2s',
              }}
            >
              <div style={chipLabel}>Sweep gap</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                1.4 <span style={{ fontSize: 12, color: colors.textMuted }}>km</span>
              </div>
            </div>
            <div
              data-float-chip
              style={{
                ...chipBase,
                bottom: 36,
                left: -70,
                border: '1px solid rgba(255,255,255,0.10)',
                animation: 'qf-floats 6s ease-in-out infinite',
                animationDelay: '0.6s',
              }}
            >
              <div style={chipLabel}>Altitude</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                4,551 <span style={{ fontSize: 12, color: colors.textMuted }}>m</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

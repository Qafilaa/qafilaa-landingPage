import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { Eyebrow } from './Eyebrow';
import { useReveal } from '../hooks/useReveal';

const chip: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '10px 16px',
  borderRadius: 999,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
};

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div style={chip}>
      {icon}
      <span style={{ fontSize: 14, color: colors.text }}>{children}</span>
    </div>
  );
}

export function Safety() {
  const { ref, style } = useReveal<HTMLDivElement>({});

  return (
    <section
      id="safety"
      style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '60px 28px', scrollMarginTop: 80 }}
    >
      <div
        ref={ref}
        data-safety-card
        style={{
          ...style,
          transition: `opacity .9s ${EASE}, transform .9s ${EASE}`,
          position: 'relative',
          background: 'radial-gradient(700px 400px at 80% 0%, rgba(255,82,71,0.10), #0C1311 60%)',
          border: '1px solid rgba(255,82,71,0.22)',
          borderRadius: 24,
          padding: 'clamp(30px,4vw,56px)',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 540, position: 'relative' }}>
          <Eyebrow color={colors.danger}>When it matters most</Eyebrow>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: 'clamp(28px,3.6vw,42px)',
              lineHeight: 1.12,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              margin: '14px 0 0',
            }}
          >
            An SOS that actually knows where you are.
          </h2>
          <p style={{ color: colors.textMuted, fontSize: 17, lineHeight: 1.6, margin: '18px 0 0', textWrap: 'pretty' }}>
            Hold the SOS for two seconds and every rider in the convoy gets your live coordinates, altitude and last
            movement, even if you've dropped to one bar. Try it: press and hold.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30, flexWrap: 'wrap' }}>
            <Chip
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2 4 5v6c0 5 3.5 8.5 8 10 4.5-1.5 8-5 8-10V5Z" />
                </svg>
              }
            >
              Broadcasts to the whole group
            </Chip>
            <Chip
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              }
            >
              Works on a single bar
            </Chip>
          </div>
        </div>

        {/* interactive hold-to-send SOS (wired by useLandingFx) */}
        <div
          data-sos-visual
          style={{
            position: 'absolute',
            right: '6%',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 200,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            data-sos-btn
            role="button"
            tabIndex={0}
            aria-label="Demo SOS, press and hold for two seconds to preview the convoy alert. This is a demo and does not contact emergency services."
            style={{
              position: 'relative',
              width: 168,
              height: 168,
              borderRadius: 999,
              cursor: 'pointer',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span data-sos-ping style={{ position: 'absolute', width: 140, height: 140, borderRadius: 999, border: '1.5px solid rgba(255,82,71,0.5)', animation: 'qf-ping 2.6s ease-out infinite' }} />
            <span data-sos-ping style={{ position: 'absolute', width: 140, height: 140, borderRadius: 999, border: '1.5px solid rgba(255,82,71,0.5)', animation: 'qf-ping 2.6s ease-out infinite', animationDelay: '1.3s' }} />
            <div
              data-sos-ring
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                padding: 6,
                background: 'conic-gradient(var(--accent,#20D6A8) 0%, rgba(255,255,255,0.12) 0)',
                WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))',
                mask: 'radial-gradient(farthest-side, transparent calc(100% - 7px), #000 calc(100% - 6px))',
              }}
            />
            <span
              data-sos-core
              style={{
                width: 128,
                height: 128,
                borderRadius: 999,
                background: colors.danger,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 18px 50px rgba(255,82,71,0.4)',
                transition: 'transform .12s ease-out, background .3s',
              }}
            >
              <span data-sos-core-text style={{ fontFamily: fonts.display, fontSize: 28, fontWeight: 700, color: '#1A0807', lineHeight: 1 }}>SOS</span>
              <span data-sos-core-sub style={{ fontSize: 9.5, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(26,8,7,0.7)', fontWeight: 700, marginTop: 4 }}>Hold</span>
            </span>
          </div>
          <div data-sos-status aria-live="polite" style={{ fontSize: 13, color: colors.textMuted, textAlign: 'center', minHeight: 18, transition: 'color .3s' }}>
            Press &amp; hold for 2s
          </div>
        </div>
      </div>
    </section>
  );
}

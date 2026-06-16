import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';
import { useCyclingBanner } from '../hooks/useCyclingBanner';

const legendItem = (dot: string, label: string) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ width: 11, height: 11, borderRadius: 999, background: dot }} />
    <span style={{ fontSize: 14, color: colors.textMuted }}>{label}</span>
  </div>
);

const riderRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '13px 15px',
  borderRadius: 14,
  background: '#0F1714',
  border: '1px solid rgba(255,255,255,0.07)',
};

const avatar: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: 999,
  background: colors.token,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 12,
  fontWeight: 600,
};

export function OfflineSpotlight() {
  const phase = useCyclingBanner();

  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '60px 28px' }}>
      <Reveal
        style={{
          background: colors.surface,
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24,
          padding: 'clamp(28px,4vw,52px)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 48,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <div>
          <Eyebrow>Where it earns its keep</Eyebrow>
          <h2
            style={{
              fontFamily: fonts.display,
              fontSize: 'clamp(28px,3.4vw,40px)',
              lineHeight: 1.14,
              fontWeight: 600,
              letterSpacing: '-0.02em',
              margin: '14px 0 0',
            }}
          >
            The mountain takes your signal. It doesn't take your map.
          </h2>
          <p
            style={{
              color: colors.textMuted,
              fontSize: 17,
              lineHeight: 1.6,
              margin: '18px 0 0',
              maxWidth: 480,
              textWrap: 'pretty',
            }}
          >
            Live vs. last-known is always unmistakable. When a rider drops off, their pin doesn't vanish — it greys out
            at the spot you last saw them, with a timestamp, so you always know where to start looking.
          </p>
          <div style={{ display: 'flex', gap: 24, marginTop: 30, flexWrap: 'wrap' }}>
            {legendItem(colors.accent, 'Teal — live & synced')}
            {legendItem(colors.stale, 'Grey — last-known')}
          </div>
        </div>

        <div>
          {/* self-cycling connectivity banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 18px',
              borderRadius: 16,
              background: phase.bg,
              border: `1px solid ${phase.bd}`,
              transition: 'background .5s, border-color .5s',
            }}
          >
            <span
              style={{
                width: 11,
                height: 11,
                borderRadius: 999,
                background: phase.c,
                flexShrink: 0,
                transition: 'background .5s',
                animation: 'qf-blink 1.6s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 15, fontWeight: 500, color: phase.c, transition: 'color .5s' }}>{phase.t}</span>
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={riderRow}>
              <div style={{ ...avatar, color: colors.text }}>AK</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>
                  Aman Kohli <span style={{ color: colors.accent, fontSize: 12 }}>· Lead</span>
                </div>
                <div style={{ fontSize: 12, color: colors.accent }}>live now</div>
              </div>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: colors.success }} />
            </div>
            <div style={{ ...riderRow, opacity: 0.62 }}>
              <div style={{ ...avatar, color: colors.textMuted }}>VT</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: colors.textMuted }}>
                  Vikram T. <span style={{ color: colors.textDim, fontSize: 12 }}>· Sweep</span>
                </div>
                <div style={{ fontSize: 12, color: colors.textDim }}>last seen 4m ago · 5.6 km back</div>
              </div>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: colors.stale }} />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

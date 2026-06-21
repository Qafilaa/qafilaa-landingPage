import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const legendItem = (dot: string, label: string) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
    <span style={{ width: 11, height: 11, borderRadius: 999, background: dot }} />
    <span style={{ fontSize: 14, color: colors.textMuted }}>{label}</span>
  </div>
);

const sigRow: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
  padding: '13px 15px',
  borderRadius: 14,
  background: '#0F1714',
  border: '1px solid rgba(255,255,255,0.07)',
  transition: 'opacity .45s',
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
  color: colors.text,
};

const statusBase: CSSProperties = { fontSize: 12, color: colors.accent, transition: 'color .45s' };
const dotBase: CSSProperties = { width: 9, height: 9, borderRadius: 999, background: colors.success, transition: 'background .45s' };

export function OfflineSpotlight() {
  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '60px 28px' }}>
      <Reveal>
        <div
          data-split
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
              Live vs. last-known is always unmistakable. When a rider drops off, their pin doesn't vanish, it greys out
              at the spot you last saw them, with a timestamp, so you always know where to start looking.
            </p>
            <div style={{ display: 'flex', gap: 24, marginTop: 30, flexWrap: 'wrap' }}>
              {legendItem(colors.accent, 'Teal, live & synced')}
              {legendItem(colors.stale, 'Grey, last-known')}
            </div>
          </div>

          {/* interactive live vs last-known signal toggle (wired by useLandingFx) */}
          <div data-sig style={{ transition: 'filter .5s', willChange: 'filter' }}>
            {/* the signature toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 16 }}>
              <div>
                <div data-sig-title style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 600, transition: 'color .4s' }}>
                  Signal: all live
                </div>
                <div data-sig-hint style={{ fontSize: 12.5, color: '#9FB0AC', marginTop: 3, transition: 'color .4s' }}>
                  Flip it — drop the signal behind the ridge.
                </div>
              </div>
              <button
                data-sig-toggle
                role="switch"
                aria-checked="true"
                aria-label="Toggle live versus last-known"
                style={{
                  position: 'relative',
                  width: 104,
                  height: 40,
                  borderRadius: 999,
                  border: '1px solid rgba(32,214,168,0.45)',
                  background: 'rgba(32,214,168,0.12)',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background .45s, border-color .45s',
                }}
              >
                <span data-sig-on style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.5px', color: '#06120E', textTransform: 'uppercase', transition: 'opacity .3s' }}>
                  Live
                </span>
                <span data-sig-off style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.5px', color: '#9FB0AC', textTransform: 'uppercase', opacity: 0, transition: 'opacity .3s' }}>
                  Lost
                </span>
                <span data-sig-knob style={{ position: 'absolute', top: 3, left: 3, width: 32, height: 32, borderRadius: 999, background: colors.accent, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', transition: 'transform .45s cubic-bezier(.22,.61,.36,1), background .45s' }} />
              </button>
            </div>

            {/* banner */}
            <div data-sig-banner style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '15px 18px', borderRadius: 16, background: 'rgba(54,211,153,0.10)', border: '1px solid rgba(54,211,153,0.28)', transition: 'background .45s, border-color .45s' }}>
              <span data-sig-banner-dot style={{ width: 11, height: 11, borderRadius: 999, background: colors.success, flexShrink: 0, transition: 'background .45s', animation: 'qf-blink 1.6s ease-in-out infinite' }} />
              <span data-sig-banner-text style={{ fontSize: 15, fontWeight: 500, color: colors.success, transition: 'color .45s' }}>
                All live · 5 of 5 accounted for
              </span>
            </div>

            {/* roster */}
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div data-sig-row style={sigRow}>
                <div style={avatar}>VC</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Viren C <span style={{ color: colors.accent, fontSize: 12 }}>· Lead</span>
                  </div>
                  <div data-sig-status style={statusBase}>live now · ahead</div>
                </div>
                <span data-sig-dot style={dotBase} />
              </div>
              <div data-sig-row data-sig-live="live now · 2.1 km back" data-sig-lost="last seen 3m ago · 2.1 km back" style={sigRow}>
                <div style={avatar}>TH</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Tejas H</div>
                  <div data-sig-status style={statusBase}>live now · 2.1 km back</div>
                </div>
                <span data-sig-dot style={dotBase} />
              </div>
              <div data-sig-row data-sig-live="live now · 5.6 km back" data-sig-lost="last seen 6m ago · 5.6 km back" style={sigRow}>
                <div style={avatar}>GH</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>
                    Gaurav Hendre <span style={{ color: colors.textDim, fontSize: 12 }}>· Sweep</span>
                  </div>
                  <div data-sig-status style={statusBase}>live now · 5.6 km back</div>
                </div>
                <span data-sig-dot style={dotBase} />
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

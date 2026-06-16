import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';
import { ConvoyMap, type ConvoyState } from './ConvoyMap';

interface PhonePanelProps {
  state: ConvoyState;
  pill: { text: string; color: string; border: string };
  caption: string;
  sub: string;
  delay?: number;
}

const statusPill = (color: string, border: string): CSSProperties => ({
  position: 'absolute',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  padding: '6px 13px',
  borderRadius: 999,
  background: color === colors.accent ? 'rgba(14,20,19,0.78)' : 'rgba(14,20,19,0.82)',
  border: `1px solid ${border}`,
});

function PhonePanel({ state, pill, caption, sub, delay }: PhonePanelProps) {
  return (
    <Reveal style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }} delay={delay}>
      <div
        style={{
          width: 280,
          padding: 9,
          background: '#000',
          borderRadius: 44,
          boxShadow: '0 36px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 262,
            height: 560,
            borderRadius: 36,
            overflow: 'hidden',
            background: colors.surfaceInset,
          }}
        >
          <ConvoyMap state={state} />
          <div style={statusPill(pill.color, pill.border)}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: pill.color }} />
            <span style={{ fontSize: 11.5, color: pill.color, fontWeight: 500 }}>{pill.text}</span>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 600 }}>{caption}</div>
        <div style={{ color: colors.textMuted, fontSize: 14, marginTop: 4 }}>{sub}</div>
      </div>
    </Reveal>
  );
}

export function DeviceShowcase() {
  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '50px 28px 30px' }}>
      <Reveal style={{ textAlign: 'center', marginBottom: 46 }}>
        <Eyebrow>Built for the dark, the cold, and the gloves</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(28px,3.6vw,42px)',
            lineHeight: 1.12,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '16px 0 0',
          }}
        >
          Same map. Online or off.
        </h2>
      </Reveal>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(28px,6vw,90px)', flexWrap: 'wrap' }}>
        <PhonePanel
          state="live"
          pill={{ text: 'All live · synced now', color: colors.accent, border: 'rgba(32,214,168,0.3)' }}
          caption="In signal"
          sub="Live pins, gaps updating second by second"
        />
        <PhonePanel
          state="offline"
          pill={{ text: 'Signal lost · last-known', color: colors.warning, border: 'rgba(255,176,32,0.35)' }}
          caption="Past the last bar"
          sub="Pins hold their last spot, timestamped"
          delay={140}
        />
      </div>
    </section>
  );
}

import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';
import { RideScreen, type RideState } from './RideScreen';

interface PhonePanelProps {
  state: RideState;
  caption: string;
  sub: string;
  delay?: number;
}

function PhonePanel({ state, caption, sub, delay }: PhonePanelProps) {
  return (
    <Reveal style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }} delay={delay}>
      <div style={{ transformStyle: 'preserve-3d' }}>
        <div
          style={{
            width: 280,
            padding: 9,
            background: '#000',
            borderRadius: 44,
            boxShadow: '0 36px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.05)',
          }}
        >
          <div style={{ position: 'relative', width: 262, height: 560, borderRadius: 36, overflow: 'hidden', background: '#0A1110' }}>
            <RideScreen state={state} />
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background: 'radial-gradient(200px 200px at 30% 10%, rgba(255,255,255,0.13), transparent 60%)',
                opacity: 0.4,
                mixBlendMode: 'screen',
                zIndex: 8,
              }}
            />
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
        <PhonePanel state="live" caption="In signal" sub="Live pins, gaps updating second by second" />
        <PhonePanel state="offline" caption="Past the last bar" sub="Pins hold their last spot, timestamped" delay={140} />
      </div>
    </section>
  );
}

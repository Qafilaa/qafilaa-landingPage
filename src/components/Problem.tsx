import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

export function Problem() {
  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '40px 28px 20px' }}>
      <Reveal style={{ maxWidth: 780 }}>
        <Eyebrow>The problem</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(30px,4vw,46px)',
            lineHeight: 1.12,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '16px 0 0',
            textWrap: 'balance',
          }}
        >
          On a real ride, the lead can't see the sweep, and the group chat dies the moment the signal does.
        </h2>
        <p
          style={{
            color: colors.textMuted,
            fontSize: 18,
            lineHeight: 1.6,
            margin: '22px 0 0',
            maxWidth: 640,
            textWrap: 'pretty',
          }}
        >
          Someone takes a wrong fork. Someone stops for a photo. Bars vanish behind the ridge. Twenty minutes later half
          the ride is waiting at a junction with no way to know if the others are five minutes back or in trouble.
          Qafilaa is built for exactly that gap.
        </p>
      </Reveal>
    </section>
  );
}

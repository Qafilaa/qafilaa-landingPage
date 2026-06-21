import type { CSSProperties } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { Eyebrow } from './Eyebrow';
import { RideScreen } from './RideScreen';
import { useReveal } from '../hooks/useReveal';

interface Step {
  n: string;
  color: string;
  title: string;
  body: string;
  /** Last step drops the divider. */
  last?: boolean;
}

const steps: Step[] = [
  {
    n: '01',
    color: colors.accent,
    title: 'Start a ride & share one link',
    body: 'Name the ride and route, pick the bike. Your crew taps in and lands on the map — no accounts.',
  },
  {
    n: '02',
    color: colors.accent,
    title: 'Track gaps, drop a rally point',
    body: "Tap any rider for their gap, ETA and altitude. Drop a regroup pin and everyone's ETA updates.",
  },
  {
    n: '03',
    color: colors.warning,
    title: 'Lose signal — hold the last-known',
    body: 'Behind the ridge, pins grey out and freeze with a timestamp instead of vanishing.',
  },
  {
    n: '04',
    color: colors.danger,
    title: 'Hold SOS, then regroup',
    body: 'Broadcast your coordinates on a single bar, meet at the rally, finish with zero left behind.',
    last: true,
  },
];

const stepNum: CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 13,
  fontWeight: 600,
  width: 24,
  flexShrink: 0,
};

export function TryARide() {
  const head = useReveal<HTMLDivElement>({});
  const rail = useReveal<HTMLDivElement>({ delay: 80 });
  const phone = useReveal<HTMLDivElement>({ delay: 160, duration: 1, from: 'translateY(28px)' });

  return (
    <section
      id="demo"
      style={{ position: 'relative', maxWidth: layout.maxWidth, margin: '0 auto', padding: '64px 28px 50px', scrollMarginTop: 80 }}
    >
      <div
        ref={head.ref}
        style={{ ...head.style, transition: `opacity .9s ${EASE}, transform .9s ${EASE}`, marginBottom: 6 }}
      >
        <Eyebrow>The whole app, in your hands</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(30px,4vw,46px)',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '14px 0 0',
          }}
        >
          Don't watch the ride. Run one.
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 18, lineHeight: 1.6, margin: '18px 0 0', maxWidth: 560, textWrap: 'pretty' }}>
          This is the real product, not a video. Start a ride, watch your crew join, lose the signal behind a ridge,
          fire an SOS, and regroup — all right here, before you ever download.
        </p>
      </div>

      <div
        data-demo-grid
        style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 'clamp(28px,5vw,64px)', alignItems: 'center', marginTop: 40 }}
      >
        {/* step rail */}
        <div
          ref={rail.ref}
          style={{ ...rail.style, transition: `opacity .9s ${EASE}, transform .9s ${EASE}`, display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {steps.map((s) => (
            <div
              key={s.n}
              data-demo-step
              style={{
                display: 'flex',
                gap: 16,
                padding: '16px 0',
                borderBottom: s.last ? 'none' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <span style={{ ...stepNum, color: s.color }}>{s.n}</span>
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 600 }}>{s.title}</div>
                <div style={{ color: colors.textMuted, fontSize: 14.5, lineHeight: 1.5, marginTop: 4 }}>{s.body}</div>
              </div>
            </div>
          ))}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 22,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'rgba(32,214,168,0.07)',
              border: '1px solid rgba(32,214,168,0.18)',
              alignSelf: 'flex-start',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={colors.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span style={{ fontSize: 14, color: colors.text, fontWeight: 500 }}>
              Tap into the phone — explore the live map freely.
            </span>
          </div>
        </div>

        {/* playable phone */}
        <div
          ref={phone.ref}
          data-demo-phone
          style={{ ...phone.style, transition: `opacity 1s ${EASE}, transform 1s ${EASE}`, display: 'flex', justifyContent: 'center' }}
        >
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '50%', bottom: -30, width: 240, height: 60, transform: 'translateX(-50%)', background: 'radial-gradient(ellipse, rgba(32,214,168,0.22), transparent 70%)', filter: 'blur(16px)', borderRadius: 999, zIndex: 0, pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1, width: 340, padding: 10, background: '#000', borderRadius: 48, boxShadow: '0 50px 110px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)' }}>
              <div style={{ position: 'relative', width: 320, height: 712, borderRadius: 40, overflow: 'hidden', background: colors.surfaceInset }}>
                <RideScreen state="live" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

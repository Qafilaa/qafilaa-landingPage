import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const card: CSSProperties = {
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 30,
};

const numberBadge: CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 15,
  fontWeight: 600,
  width: 34,
  height: 34,
  borderRadius: 999,
  background: 'rgba(32,214,168,0.12)',
  border: '1px solid rgba(32,214,168,0.3)',
  color: colors.accent,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const stepLabel: CSSProperties = {
  fontSize: 12,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontWeight: 600,
};

const stepTitle: CSSProperties = { fontFamily: fonts.display, fontSize: 21, fontWeight: 600, margin: 0 };
const stepBody: CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.55, margin: '10px 0 0' };

const steps = [
  {
    n: '1',
    label: 'Set up',
    title: 'Start a ride',
    body: 'Name the route, pick a lead and a sweep, and set your first rally point. Takes about as long as fastening your helmet.',
    delay: 0,
  },
  {
    n: '2',
    label: 'Gather',
    title: 'Everyone joins',
    body: 'Share one link. Riders tap in and appear on the map instantly — no accounts to wrangle at the trailhead.',
    delay: 120,
  },
  {
    n: '3',
    label: 'Ride',
    title: 'No one left behind',
    body: 'Gaps, rally points, last-known pins and SOS keep the convoy whole — from the first switchback to the final descent.',
    delay: 240,
  },
];

export function HowItWorks() {
  return (
    <section
      id="how"
      style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '50px 28px', scrollMarginTop: 80 }}
    >
      <Reveal style={{ textAlign: 'center', marginBottom: 48 }}>
        <Eyebrow>How it works</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(30px,4vw,46px)',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '16px 0 0',
          }}
        >
          Three taps from gate to summit.
        </h2>
      </Reveal>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 20,
          position: 'relative',
        }}
      >
        {steps.map((step) => (
          <Reveal key={step.n} style={card} delay={step.delay} duration={0.8}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
              <span style={numberBadge}>{step.n}</span>
              <span style={stepLabel}>{step.label}</span>
            </div>
            <h3 style={stepTitle}>{step.title}</h3>
            <p style={stepBody}>{step.body}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

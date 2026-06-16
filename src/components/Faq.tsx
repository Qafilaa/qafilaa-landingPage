import type { CSSProperties } from 'react';
import { colors, fonts } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';

const item: CSSProperties = {
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '22px 24px',
};

const question: CSSProperties = { fontFamily: fonts.display, fontSize: 17.5, fontWeight: 600 };
const answer: CSSProperties = { color: colors.textMuted, fontSize: 15, lineHeight: 1.55, margin: '8px 0 0' };

const faqs = [
  {
    q: 'When does Qafilaa launch?',
    a: "We're rolling out to a first group of crews ahead of the summer riding season. Join the waitlist and you'll be near the front of the line.",
  },
  {
    q: 'Does it really work without internet?',
    a: "Yes — that's the core of it. Qafilaa caches the last-known position of every rider and syncs the moment any device finds signal. The map never goes blank on you.",
  },
  {
    q: 'Is it only for motorcycles?',
    a: "No. It's built for any group moving together where staying together matters — bikes, 4x4 convoys, cycling pelotons, trekking groups and expeditions.",
  },
  {
    q: 'Who can see my location?',
    a: 'Only the riders in your ride, and only while it\'s active. When the ride ends, live sharing stops. No public map, no strangers, ever.',
  },
  {
    q: 'What will it cost?',
    a: 'Waitlist riders get the first season free and locked-in early pricing after that. Final plans land before launch.',
  },
];

export function Faq() {
  return (
    <section
      id="faq"
      data-faq
      style={{ maxWidth: 820, margin: '0 auto', padding: '80px 28px 40px', scrollMarginTop: 80 }}
    >
      <Reveal style={{ textAlign: 'center', marginBottom: 40 }}>
        <Eyebrow>Questions</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(28px,4vw,42px)',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '16px 0 0',
          }}
        >
          Before you sign up
        </h2>
      </Reveal>

      <Reveal style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {faqs.map((faq) => (
          <div key={faq.q} style={item}>
            <div style={question}>{faq.q}</div>
            <p style={answer}>{faq.a}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

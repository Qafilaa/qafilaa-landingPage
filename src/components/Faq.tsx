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
    a: 'Mostly, with one honest limit. Qafilaa caches the last-known position of every rider, so the map never goes fully blank. But if two riders are both out of signal, neither sees the other move until one of you gets a bar back and the positions sync. No app can beam live GPS through a mountain without a satellite link, what we promise is that you always know each rider\'s last confirmed spot and the time it was logged.',
  },
  {
    q: 'Is it only for motorcycles?',
    a: "No. It's built for any group moving together where staying together matters, bikes, 4x4 groups, cycling pelotons, trekking groups and expeditions.",
  },
  {
    q: 'Do I need an account to join a ride?',
    a: 'No. Joining a ride takes one shared link, no account, no setup at the trailhead. The email field above is only for the launch waitlist, so we can send your crew\'s invite when a spot opens.',
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

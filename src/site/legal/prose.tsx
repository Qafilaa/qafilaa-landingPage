// Typographic primitives for the legal / policy routes.
//
// The values here are lifted verbatim from the pages transcribed out of
// `Qafilaa Site v2.dc.html` (slug, deck, h1, lede, h2, body, list, callout), so
// pages written by hand sit in the same system as the ones generated from the
// handoff. Change a value here only if the handoff changes.
import type { ReactNode } from 'react';

const SG = "'Space Grotesk',sans-serif";

const SLUG = {
  fontFamily: SG,
  fontSize: '11px',
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: '#6E6B63',
} as const;

const DECK = { fontFamily: SG, fontSize: '19px', fontWeight: 500, color: '#0A6068', marginTop: '22px' } as const;

const TITLE = {
  fontFamily: SG,
  fontWeight: 600,
  fontSize: 'clamp(38px,5vw,58px)',
  lineHeight: '1.04',
  letterSpacing: '-.025em',
  margin: '10px 0 0',
} as const;

const LEDE = {
  margin: '20px 0 0',
  maxWidth: '64ch',
  fontSize: '19px',
  lineHeight: '1.6',
  color: '#4A4842',
  textWrap: 'pretty',
} as const;

const UPDATED = {
  fontFamily: SG,
  fontSize: '12px',
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: '#6E6B63',
  marginTop: '18px',
} as const;

const BODY = { maxWidth: '70ch' } as const;

const HEAD2 = {
  fontFamily: SG,
  fontWeight: 600,
  fontSize: '23px',
  lineHeight: '1.25',
  letterSpacing: '-.01em',
  margin: '56px 0 0',
} as const;

const PARA = { margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' } as const;

const LIST = {
  margin: '14px 0 0',
  paddingLeft: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  fontSize: '16.5px',
  lineHeight: '1.6',
  color: '#4A4842',
} as const;

const BOX = {
  marginTop: '38px',
  maxWidth: '70ch',
  padding: '24px 28px',
  borderLeft: '2px solid #0E7C86',
  background: '#FFFFFF',
} as const;

const ROW = { display: 'flex', gap: '18px', padding: '12px 0', borderBottom: '1px solid #EAE5DB', flexWrap: 'wrap' } as const;
const ROW_KEY = { ...SLUG, flex: '0 0 190px' } as const;
const ROW_VAL = { flex: '1 1 260px', fontSize: '16.5px', lineHeight: '1.6', color: '#4A4842' } as const;

/** The shared document frame: slug, deck, title, lede, then the prose column. */
export function Doc({
  slug,
  deck,
  title,
  lede,
  updated,
  children,
}: {
  slug: string;
  deck: string;
  title: string;
  lede: ReactNode;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <article>
      <div style={SLUG}>{slug}</div>
      <div style={DECK}>{deck}</div>
      <h1 style={TITLE}>{title}</h1>
      <p style={LEDE}>{lede}</p>
      {updated ? <div style={UPDATED}>Last updated: {updated}</div> : null}
      <div style={BODY}>{children}</div>
    </article>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 style={HEAD2}>{children}</h2>;
}

export function P({ children }: { children: ReactNode }) {
  return <p style={PARA}>{children}</p>;
}

export function UL({ children }: { children: ReactNode }) {
  return <ul style={LIST}>{children}</ul>;
}

/** The teal-ruled summary block the handoff uses for "In plain English". */
export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={BOX}>
      <div style={SLUG}>{label}</div>
      {children}
    </div>
  );
}

/** Label / value rows, as the privacy policy uses for the Grievance Officer. */
export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <div style={{ marginTop: '20px' }}>
      {rows.map(([k, v]) => (
        <div key={k} style={ROW}>
          <div style={ROW_KEY}>{k}</div>
          <div style={ROW_VAL}>{v}</div>
        </div>
      ))}
    </div>
  );
}

export function Mail({ subject, children }: { subject?: string; children?: ReactNode }) {
  const href = subject ? `mailto:admin@qafilaa.in?subject=${encodeURIComponent(subject)}` : 'mailto:admin@qafilaa.in';
  return <a href={href}>{children ?? 'admin@qafilaa.in'}</a>;
}

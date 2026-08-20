// Chrome for the legal / support routes. Transcribed from the design's legal
// overlay (`Qafilaa Site v2.dc.html`, lines 813-835), with two changes: it is a
// real page rather than a fixed overlay, and the pills are links to the real
// prerendered URLs instead of hash targets.
//
// The handoff shipped six documents in one flat pill row. There are fifteen
// now, all of them required or store-facing, so the row is grouped — same
// pills, same palette, with the section labels the rest of the site uses.
import type { ReactNode } from 'react';

import { routePaths } from '../../routes';
import { LEGAL_GROUPS } from './groups';
import { LegalFoot } from './LegalFoot';

/**
 * The tone system never runs on these pages, so Daylight is pinned locally —
 * exactly the palette `openLegal()` used to set (lines 3149-3151). Note `--mut`
 * is darker here than the light tone's `#6E6B63`: a deliberate choice for long
 * prose.
 */
const DAYLIGHT = {
  '--bg': '#F7F5F0',
  '--ink': '#23241F',
  '--mut': '#4A4842',
  '--sur': '#6E6B63',
  '--line': '#EAE5DB',
  '--card': '#FFFFFF',
  '--acc': '#0A6068',
  '--acc2': '#0E7C86',
  '--ctr': '#E5E2DA',
  '--warn': '#B26B00',
  '--ctaInk': '#F7F5F0',
} as const;

const PILL = {
  minHeight: '40px',
  padding: '9px 15px',
  border: '1px solid #EAE5DB',
  borderRadius: '999px',
  background: 'transparent',
  color: '#6E6B63',
  cursor: 'pointer',
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: '10.5px',
  fontWeight: 500,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  transition: 'background .22s, color .22s, border-color .22s',
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
} as const;

const PILL_ON = { background: '#0E7C86', color: '#F7F5F0', borderColor: '#0E7C86' } as const;

const GROUP_LABEL = {
  fontFamily: "'Space Grotesk',sans-serif",
  fontSize: '10.5px',
  letterSpacing: '.16em',
  textTransform: 'uppercase',
  color: '#6E6B63',
  flex: '0 0 74px',
  paddingTop: '13px',
} as const;

export function LegalShell({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div
      id="qf-legal"
      style={{ ...DAYLIGHT, background: '#F7F5F0', color: '#23241F', minHeight: '100vh' }}
    >
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 4,
          background: 'rgba(247,245,240,.92)',
          backdropFilter: 'blur(18px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
          borderBottom: '1px solid #EAE5DB',
        }}
      >
        <div
          data-legalbar="1"
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            padding: '16px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <a
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none', color: '#23241F' }}
          >
            <img
              src="/brand/logo-mark-sm.png"
              alt=""
              width="132"
              height="80"
              loading="lazy"
              decoding="async"
              style={{ display: 'block', width: '52px', height: '32px', objectFit: 'contain' }}
            />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '18px', fontWeight: 600, letterSpacing: '-.01em' }}>
              Qafilaa
            </span>
          </a>
          <a
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              minHeight: '44px',
              padding: '0 18px',
              border: '1px solid #EAE5DB',
              borderRadius: '999px',
              background: 'transparent',
              color: '#23241F',
              font: "600 14px 'Hanken Grotesk'",
              textDecoration: 'none',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H6" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to the ride
          </a>
        </div>
        <nav
          data-legaltabs="1"
          aria-label="Policies and support"
          style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 40px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}
        >
          {LEGAL_GROUPS.map((g) => (
            <div key={g.label} style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <span style={GROUP_LABEL}>{g.label}</span>
              {g.items.map((t) => {
                const href = routePaths[t.route];
                const on = href === path;
                return (
                  <a key={href} href={href} aria-current={on ? 'page' : undefined} style={on ? { ...PILL, ...PILL_ON } : PILL}>
                    {t.label}
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div data-legalpages="1" style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 40px 130px' }}>
        {children}
        <LegalFoot />
      </div>
    </div>
  );
}

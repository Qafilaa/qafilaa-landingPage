// Chrome for the legal / support routes. Transcribed from the design's legal
// overlay (`Qafilaa Site v2.dc.html`, lines 813-835), with two changes: it is a
// real page rather than a fixed overlay, and the pills are links to the real
// prerendered URLs instead of hash targets.
import type { ReactNode } from 'react';

import { LegalFoot } from './LegalFoot';

/** The six legal / support routes, in the order the design lists them. */
export const LEGAL_TABS = [
  { path: '/privacy-policy', label: 'Privacy' },
  { path: '/terms-and-conditions', label: 'Terms' },
  { path: '/delete-account', label: 'Delete account' },
  { path: '/delete-data', label: 'Delete data' },
  { path: '/support', label: 'Support' },
  { path: '/security', label: 'Security' },
] as const;

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

const PILL_ON = {
  background: '#0E7C86',
  color: '#F7F5F0',
  borderColor: '#0E7C86',
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
        <div
          data-legaltabs="1"
          style={{ maxWidth: '1120px', margin: '0 auto', padding: '0 40px 14px', display: 'flex', flexWrap: 'wrap', gap: '7px' }}
        >
          {LEGAL_TABS.map((t) => {
            const on = t.path === path;
            return (
              <a key={t.path} href={t.path} aria-current={on ? 'page' : undefined} style={on ? { ...PILL, ...PILL_ON } : PILL}>
                {t.label}
              </a>
            );
          })}
        </div>
      </div>

      <div data-legalpages="1" style={{ maxWidth: '1120px', margin: '0 auto', padding: '56px 40px 130px' }}>
        {children}
        <LegalFoot />
      </div>
    </div>
  );
}

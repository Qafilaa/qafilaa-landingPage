// Chrome for the legal / support routes.
//
// The handoff renders these as an overlay with six pills in one row. There are
// fifteen documents now, and as four rows of pills they pushed the document
// 478px down the page while leaving half the width empty. So the index moved to
// a sticky column beside the prose — the ordinary shape for a set of documents,
// and one that still reads at fifteen.
//
// Nothing new is invented: the mark, the wordmark, the pill buttons, the type
// and the palette are all the handoff's. Daylight is pinned locally because the
// tone system does not run on these pages, and layout lives in the appendix of
// src/index.css (see gencss.py) because media queries cannot be inline.
import type { ReactNode } from 'react';

import { routePaths } from '../../routes';
import { LEGAL_GROUPS } from './groups';
import { LegalFoot } from './LegalFoot';

const SG = "'Space Grotesk',sans-serif";

/**
 * The tone system never runs here, so Daylight is pinned — the palette
 * `openLegal()` used to set (handoff lines 3149-3151). `--mut` is darker than
 * the light tone's `#6E6B63`: a deliberate choice for long prose.
 */
const DAYLIGHT = {
  '--bg': '#F7F5F0',
  '--ink': '#23241F',
  '--mut': '#4A4842',
  '--sur': '#6E6B63',
  '--line': '#DCD6C9',
  '--card': '#FFFFFF',
  '--acc': '#0A6068',
  '--acc2': '#0E7C86',
  '--ctr': '#E5E2DA',
  '--warn': '#B26B00',
  '--ctaInk': '#F7F5F0',
} as const;

const PILL = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  minHeight: '44px',
  padding: '0 18px',
  borderRadius: '999px',
  font: "600 14px 'Hanken Grotesk', system-ui, sans-serif",
  textDecoration: 'none',
  whiteSpace: 'nowrap',
} as const;

function currentLabel(path: string) {
  for (const g of LEGAL_GROUPS) {
    for (const i of g.items) if (routePaths[i.route] === path) return i.label;
  }
  return 'Policies';
}

/** The document list. Rendered twice — a sidebar and a phone disclosure — with
 *  CSS showing exactly one, so only one is ever in the accessibility tree. */
function LegalIndex({ path }: { path: string }) {
  return (
    <div data-legalindex="1">
      {LEGAL_GROUPS.map((g) => (
        <div key={g.label}>
          <div data-legalgroup="1">{g.label}</div>
          {g.items.map((t) => {
            const href = routePaths[t.route];
            const on = href === path;
            return (
              <a key={href} href={href} data-legallink="1" aria-current={on ? 'page' : undefined}>
                {t.label}
              </a>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function LegalShell({ path, children }: { path: string; children: ReactNode }) {
  return (
    <div id="qf-legal" style={{ ...DAYLIGHT, background: '#F7F5F0', color: '#23241F', minHeight: '100vh' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 4,
          background: 'rgba(247,245,240,.92)',
          backdropFilter: 'blur(18px) saturate(1.6)',
          WebkitBackdropFilter: 'blur(18px) saturate(1.6)',
          borderBottom: '1px solid #DCD6C9',
        }}
      >
        <div
          data-legalbar="1"
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '14px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: '11px', textDecoration: 'none', color: '#23241F' }}>
            <img
              src="/brand/logo-mark-sm.png"
              alt=""
              width="132"
              height="80"
              decoding="async"
              style={{ display: 'block', width: '52px', height: '32px', objectFit: 'contain' }}
            />
            <span style={{ fontFamily: SG, fontSize: '18px', fontWeight: 600, letterSpacing: '-.01em' }}>Qafilaa</span>
          </a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
            <a href="/#join" style={{ ...PILL, background: '#0E7C86', color: '#F7F5F0', border: '1px solid #0E7C86' }}>
              Get the app
            </a>
            {/* The label is dropped below 560px and the whole control below 400px —
                see the responsive layer. aria-label carries the meaning either way. */}
            <a
              href="/"
              data-legalback="1"
              aria-label="Back to the ride"
              style={{ ...PILL, background: 'transparent', color: '#23241F', border: '1px solid rgba(35,36,31,.22)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M19 12H6" />
                <path d="m12 19-7-7 7-7" />
              </svg>
              <span>Back to the ride</span>
            </a>
          </div>
        </div>
      </div>

      <div data-legalpages="1" style={{ maxWidth: '1080px', margin: '0 auto', padding: '48px 40px 120px' }}>
        <div data-legalwrap="1">
          <nav data-legalnav="1" aria-label="Policies and support">
            <LegalIndex path={path} />
          </nav>

          <div style={{ minWidth: 0 }}>
            {/* Phone: the same list behind a disclosure that names where you are. */}
            <details data-legalpicker="1">
              <summary>
                <span>Policies &amp; support</span>
                <span>{currentLabel(path)}</span>
              </summary>
              <LegalIndex path={path} />
            </details>

            {children}
            <LegalFoot />
          </div>
        </div>
      </div>
    </div>
  );
}

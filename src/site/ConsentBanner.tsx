// The analytics consent notice.
//
// Rendered as a sibling of the page, never inside it: the landing page's engine
// owns its own subtree and a re-render there would discard everything it has
// drawn. This component holds its own state, so accepting or declining
// re-renders only the banner.
//
// It does not use the tone CSS variables. Those are rewritten every frame as the
// landing page scrolls, and a fixed element that restyles itself mid-scroll is
// unreadable. Daylight is pinned here the same way LegalShell pins it.
import { useEffect, useState } from 'react';

import { clearAnalyticsCookies, readConsent, setConsent, type ConsentChoice } from '../consent';

const SG = "'Space Grotesk',sans-serif";

const BTN = {
  minHeight: '44px',
  padding: '0 20px',
  borderRadius: '12px',
  font: "600 15px 'Hanken Grotesk', system-ui, sans-serif",
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  whiteSpace: 'nowrap',
} as const;

export function ConsentBanner() {
  // Server-rendered HTML must not contain the banner, or hydration would
  // mismatch for anyone who has already chosen. Decide after mount.
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (readConsent() !== null) return;
    // No choice on record. Anything already in _ga was set before this gate
    // existed, so it has no consent behind it — clear it before asking.
    clearAnalyticsCookies();
    setShow(true);
  }, []);

  if (!show) return null;

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setShow(false);
  };

  return (
    <aside
      role="region"
      aria-label="Cookie choice"
      style={{
        position: 'fixed',
        left: '0',
        right: '0',
        bottom: '0',
        zIndex: 150,
        background: '#FFFFFF',
        borderTop: '1px solid #DCD6C9',
        boxShadow: '0 -10px 34px rgba(11,14,13,.12)',
        padding: '18px 20px calc(18px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1120px',
          margin: '0 auto',
          display: 'flex',
          gap: '22px',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 420px', minWidth: 0 }}>
          <div
            style={{
              fontFamily: SG,
              fontSize: '11px',
              letterSpacing: '.16em',
              textTransform: 'uppercase',
              color: '#6E6B63',
            }}
          >
            Cookies
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '15.5px', lineHeight: '1.6', color: '#4A4842', textWrap: 'pretty' }}>
            We would like to count page views, so we know which pages are working. That is the only thing we use
            cookies for: no advertising, and no tracking you across other sites. Nothing is loaded until you say
            yes, and the site works exactly the same either way.{' '}
            <a href="/cookies" style={{ color: '#0A6068', whiteSpace: 'nowrap' }}>
              What this stores
            </a>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flex: '0 0 auto' }}>
          <button
            type="button"
            onClick={() => choose('denied')}
            style={{
              ...BTN,
              background: 'transparent',
              color: '#23241F',
              border: '1px solid rgba(35,36,31,.22)',
            }}
          >
            No thanks
          </button>
          <button
            type="button"
            onClick={() => choose('granted')}
            style={{ ...BTN, background: '#0E7C86', color: '#F7F5F0', border: '1px solid #0E7C86' }}
          >
            Allow analytics
          </button>
        </div>
      </div>
    </aside>
  );
}

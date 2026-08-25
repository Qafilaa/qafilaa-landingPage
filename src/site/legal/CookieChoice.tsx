// The live consent control on /cookies.
//
// Withdrawing has to be as easy as giving, so this shows the current choice and
// lets it be changed in one click — and declining actually expires the cookies
// GA4 already wrote rather than just stopping new ones.
import { useEffect, useState } from 'react';

import { readConsent, setConsent, type ConsentChoice } from '../../consent';

const SG = "'Space Grotesk',sans-serif";

const BTN = {
  minHeight: '44px',
  padding: '0 18px',
  borderRadius: '12px',
  font: "600 15px 'Hanken Grotesk', system-ui, sans-serif",
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  border: '1px solid rgba(35,36,31,.22)',
  background: 'transparent',
  color: '#23241F',
} as const;

const ON = { background: '#0E7C86', color: '#F7F5F0', borderColor: '#0E7C86' } as const;

export function CookieChoice() {
  // `undefined` = not yet read (server render and first client render agree on
  // it, so hydration matches); `null` = read, and not chosen.
  const [choice, setChoice] = useState<ConsentChoice | null | undefined>(undefined);

  useEffect(() => setChoice(readConsent()), []);

  const pick = (c: ConsentChoice) => {
    setConsent(c);
    setChoice(c);
  };

  const status =
    choice === undefined
      ? 'Checking...'
      : choice === 'granted'
        ? 'Analytics is on. You allowed it, and we remembered.'
        : choice === 'denied'
          ? 'Analytics is off. Nothing is being loaded from Google.'
          : 'You have not chosen yet, so analytics is off.';

  return (
    <div
      style={{
        marginTop: '38px',
        maxWidth: '70ch',
        padding: '24px 28px',
        borderLeft: '2px solid #0E7C86',
        background: '#FFFFFF',
      }}
    >
      <div style={{ fontFamily: SG, fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E6B63' }}>
        Your choice
      </div>
      <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842' }}>{status}</p>
      <div style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => pick('granted')}
          aria-pressed={choice === 'granted'}
          style={choice === 'granted' ? { ...BTN, ...ON } : BTN}
        >
          Allow analytics
        </button>
        <button
          type="button"
          onClick={() => pick('denied')}
          aria-pressed={choice === 'denied'}
          style={choice === 'denied' ? { ...BTN, ...ON } : BTN}
        >
          Turn analytics off
        </button>
      </div>
      <p style={{ margin: '14px 0 0', fontSize: '15px', lineHeight: '1.6', color: '#6E6B63' }}>
        Turning it off also expires the cookies already set. The choice is kept in this browser's local storage, so
        it does not follow you to another device, and if storage is blocked, we treat that as no.
      </p>
    </div>
  );
}

// The 404. A statically prerendered site has no server to render one on demand,
// so it is built as dist/404.html and CloudFront is pointed at it (see README,
// Deployment). It is deliberately plain: no engine, no phone, no scroll rig —
// someone who landed here wants a way out, not a product tour.
import { routePaths } from '../routes';
import { LegalFoot } from './legal/LegalFoot';

const SG = "'Space Grotesk',sans-serif";

const WAYS: { href: string; label: string; note: string }[] = [
  { href: '/', label: 'The ride', note: 'Everything Qafilaa does, from setup to the recap' },
  { href: routePaths.support, label: 'Help centre', note: 'Answers, then a human' },
  { href: routePaths.contact, label: 'Contact', note: 'Business details and who to write to' },
  { href: routePaths.deleteData, label: 'Delete my data', note: 'Without closing your account' },
  { href: routePaths.deleteAccount, label: 'Delete your account', note: 'Everything, irreversibly' },
  { href: routePaths.privacy, label: 'Privacy Policy', note: 'What we collect and why' },
];

export function NotFound() {
  return (
    <div
      id="qf-404"
      style={{
        background: '#F7F5F0',
        color: '#23241F',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          flex: '1 1 auto',
          maxWidth: '820px',
          width: '100%',
          margin: '0 auto',
          padding: '96px 24px 72px',
          boxSizing: 'border-box',
        }}
      >
        <a
          href="/"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '11px', textDecoration: 'none', color: '#23241F' }}
        >
          <img
            src="/brand/logo-mark-sm.png"
            alt=""
            width="132"
            height="80"
            decoding="async"
            style={{ display: 'block', width: '56px', height: '34px', objectFit: 'contain' }}
          />
          <span style={{ fontFamily: SG, fontSize: '19px', fontWeight: 600, letterSpacing: '-.01em' }}>Qafilaa</span>
        </a>

        <div
          style={{
            fontFamily: SG,
            fontSize: '11px',
            letterSpacing: '.16em',
            textTransform: 'uppercase',
            color: '#6E6B63',
            marginTop: '56px',
          }}
        >
          Error 404 · Off the plotted route
        </div>
        <h1
          style={{
            fontFamily: SG,
            fontWeight: 600,
            fontSize: 'clamp(34px,6vw,58px)',
            lineHeight: '1.04',
            letterSpacing: '-.025em',
            margin: '10px 0 0',
          }}
        >
          This page is not on the map.
        </h1>
        <p
          style={{
            margin: '20px 0 0',
            maxWidth: '58ch',
            fontSize: '19px',
            lineHeight: '1.6',
            color: '#4A4842',
            textWrap: 'pretty',
          }}
        >
          Either the address has a typo in it, or we moved something and did not leave a marker. Both are our problem
          more than yours. Here is the way back.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginTop: '40px' }}>
          {WAYS.map((w) => (
            <a
              key={w.href}
              href={w.href}
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
                flexWrap: 'wrap',
                padding: '15px 0',
                borderBottom: '1px solid #DCD6C9',
                textDecoration: 'none',
                color: '#23241F',
                minHeight: '44px',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontFamily: SG, fontSize: '17px', fontWeight: 500, flex: '0 0 210px' }}>{w.label}</span>
              <span style={{ fontSize: '15.5px', color: '#4A4842', flex: '1 1 240px' }}>{w.note}</span>
            </a>
          ))}
        </div>

        <p style={{ margin: '32px 0 0', fontSize: '16px', lineHeight: '1.7', color: '#4A4842' }}>
          Followed a link from somewhere and it landed here? Tell us where it was — <a href="mailto:admin@qafilaa.in?subject=Broken%20link">admin@qafilaa.in</a> — and we will
          fix the marker.
        </p>

        <LegalFoot />
      </div>
    </div>
  );
}

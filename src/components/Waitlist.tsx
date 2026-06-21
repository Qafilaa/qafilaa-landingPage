import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import { site } from '../content';
import { Reveal } from './Reveal';
import { WaitlistForm } from './WaitlistForm';
import { useCountdown } from '../hooks/useCountdown';

interface WaitlistProps {
  submitted: boolean;
  onSubmit: () => void;
}

const cdBox: CSSProperties = {
  minWidth: 88,
  padding: '18px 14px',
  borderRadius: 16,
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
};

const cdNumber: CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 38,
  fontWeight: 600,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
};

const cdLabel: CSSProperties = {
  fontSize: 11,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: colors.textDim,
  marginTop: 8,
  fontWeight: 600,
};

export function Waitlist({ submitted, onSubmit }: WaitlistProps) {
  const cd = useCountdown(site.launchDate);
  const units = [
    { value: cd.days, label: 'Days', accent: false },
    { value: cd.hours, label: 'Hours', accent: false },
    { value: cd.mins, label: 'Mins', accent: false },
    { value: cd.secs, label: 'Secs', accent: true },
  ];

  return (
    <section
      id="waitlist"
      style={{ position: 'relative', maxWidth: layout.maxWidth, margin: '60px auto 0', padding: '0 28px', scrollMarginTop: 80 }}
    >
      <Reveal
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 28,
          border: '1px solid rgba(32,214,168,0.22)',
          background: 'radial-gradient(700px 380px at 50% -10%, rgba(32,214,168,0.14), #0A1210 55%)',
          padding: 'clamp(40px,6vw,72px) 28px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 14px 7px 10px',
            borderRadius: 999,
            background: 'rgba(32,214,168,0.10)',
            border: '1px solid rgba(32,214,168,0.28)',
            marginBottom: 24,
          }}
        >
          <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9 }}>
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: 999,
                background: colors.accent,
                animation: 'qf-ping 2.2s ease-out infinite',
              }}
            />
            <span style={{ position: 'relative', width: 9, height: 9, borderRadius: 999, background: colors.accent }} />
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.3px', color: colors.accent }}>
            {site.launchLabel}
          </span>
        </div>

        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(34px,5vw,60px)',
            lineHeight: 1.04,
            fontWeight: 600,
            letterSpacing: '-0.025em',
            margin: 0,
            textWrap: 'balance',
          }}
        >
          Coming soon.
          <br />
          Be first on the trail.
        </h2>
        <p
          style={{
            color: colors.textMuted,
            fontSize: 18,
            lineHeight: 1.6,
            margin: '20px auto 0',
            maxWidth: 540,
            textWrap: 'pretty',
          }}
        >
          We're opening the gate to a small first group of riding crews. Join the waitlist and we'll bring you in before
          the snow melts on the high passes.
        </p>

        {/* countdown */}
        <div
          data-countdown
          style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '38px 0 6px', flexWrap: 'wrap' }}
        >
          {units.map((u) => (
            <div key={u.label} style={cdBox}>
              <div style={{ ...cdNumber, ...(u.accent ? { color: colors.accent } : null) }}>{u.value}</div>
              <div style={cdLabel}>{u.label}</div>
            </div>
          ))}
        </div>

        <WaitlistForm
          submitted={submitted}
          onSubmit={onSubmit}
          source="cta"
          buttonLabel="Join the waitlist"
          successLabel="Spot reserved. See you at the trailhead."
          centerSuccess
          formStyle={{ maxWidth: 460, margin: '30px auto 0' }}
          successStyle={{ maxWidth: 460, margin: '30px auto 0' }}
        />

        <div style={{ fontSize: 13, color: colors.textDim, marginTop: 16 }}>
          No spam. One email when your crew's invite is ready.
        </div>
      </Reveal>
    </section>
  );
}

import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { useReveal } from '../hooks/useReveal';
import { useHover } from '../hooks/useHover';
import { useCountUp } from '../hooks/useCountUp';

const card: CSSProperties = {
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 18,
  padding: '28px 24px',
  transition: 'transform .14s ease-out, border-color .3s',
  willChange: 'transform',
};

/** A stat tile that tilts under the pointer (driven by the FX engine). */
function StatCard({ children }: { children: ReactNode }) {
  const hover = useHover({ borderColor: 'rgba(32,214,168,0.3)' });
  return (
    <div data-tilt data-tilt-max="7" data-stat {...hover.hoverProps} style={{ ...card, ...hover.style }}>
      {children}
    </div>
  );
}

const numberStyle: CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 42,
  fontWeight: 600,
  letterSpacing: '-0.02em',
  fontVariantNumeric: 'tabular-nums',
};

const labelStyle: CSSProperties = {
  color: colors.textMuted,
  fontSize: 14,
  marginTop: 6,
};

export function StatsBand() {
  const { ref, style, shown } = useReveal<HTMLDivElement>({});

  const highestPass = useCountUp(5602, shown);
  const offline = useCountUp(100, shown, '%');
  const leftBehind = useCountUp(0, shown);
  const passes = useCountUp(12, shown);

  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '72px 28px' }}>
      <div
        ref={ref}
        style={{
          ...style,
          transition: `opacity .9s ${EASE}, transform .9s ${EASE}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: 18,
        }}
      >
        <StatCard>
          <div style={numberStyle}>{highestPass}</div>
          <div style={labelStyle}>metres — highest pass tracked</div>
        </StatCard>
        <StatCard>
          <div style={numberStyle}>{offline}</div>
          <div style={labelStyle}>offline-ready — works past the last bar</div>
        </StatCard>
        <StatCard>
          <div style={{ ...numberStyle, color: colors.accent }}>{leftBehind}</div>
          <div style={labelStyle}>riders left behind — the whole point</div>
        </StatCard>
        <StatCard>
          <div style={numberStyle}>{passes}</div>
          <div style={labelStyle}>legendary passes mapped at launch</div>
        </StatCard>
      </div>
    </section>
  );
}

import type { CSSProperties } from 'react';
import { colors, fonts } from '../theme';
import { passes } from '../content';

const item: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 18,
  padding: '0 22px',
  fontFamily: fonts.display,
  fontSize: 17,
  fontWeight: 500,
  color: colors.textDim,
  whiteSpace: 'nowrap',
};

const fade = (side: 'left' | 'right'): CSSProperties => ({
  position: 'absolute',
  [side]: 0,
  top: 0,
  bottom: 0,
  width: 140,
  zIndex: 2,
  background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, #070D0B, transparent)`,
  pointerEvents: 'none',
});

function PassGroup({ ariaHidden = false }: { ariaHidden?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }} aria-hidden={ariaHidden || undefined}>
      {passes.map((pass) => (
        <span key={pass} style={item}>
          {pass}
          <span style={{ color: colors.accent }}>◆</span>
        </span>
      ))}
    </div>
  );
}

/** Infinitely scrolling band of legendary high-altitude passes. */
export function RouteMarquee() {
  return (
    <div
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: '22px 0',
        overflow: 'hidden',
        position: 'relative',
        background: '#070D0B',
      }}
    >
      <div style={fade('left')} />
      <div style={fade('right')} />
      <div style={{ display: 'flex', width: 'max-content', animation: 'qf-marquee 34s linear infinite' }}>
        <PassGroup />
        <PassGroup ariaHidden />
      </div>
    </div>
  );
}

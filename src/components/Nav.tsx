import type { CSSProperties } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { navLinks, site } from '../content';
import { Logo } from './icons';
import { HoverLink } from './HoverLink';
import { useHover } from '../hooks/useHover';

const navLinkStyle: CSSProperties = {
  color: colors.textMuted,
  textDecoration: 'none',
  fontSize: 14.5,
  fontWeight: 500,
  transition: 'color .2s',
};

const ctaStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  height: 40,
  padding: '0 18px',
  borderRadius: 999,
  background: colors.accent,
  color: '#06120E',
  fontSize: 14.5,
  fontWeight: 600,
  textDecoration: 'none',
  transition: `transform .16s ${EASE}, box-shadow .2s`,
  boxShadow: '0 0 0 0 rgba(32,214,168,0.0)',
};

export function Nav() {
  const cta = useHover({
    transform: 'translateY(-2px)',
    boxShadow: '0 10px 26px rgba(32,214,168,0.28)',
  });

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        background: 'rgba(7,13,11,0.72)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div
        style={{
          maxWidth: layout.maxWidth,
          margin: '0 auto',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: colors.surfaceInset,
              border: '1px solid rgba(32,214,168,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 4px rgba(32,214,168,0.06)',
            }}
          >
            <Logo size={22} />
          </div>
          <span
            style={{
              fontFamily: fonts.display,
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '-0.01em',
            }}
          >
            {site.brand}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          {navLinks.map((link) => (
            <HoverLink
              key={link.href}
              href={link.href}
              style={navLinkStyle}
              hoverStyle={{ color: colors.text }}
            >
              {link.label}
            </HoverLink>
          ))}
          <a href="#waitlist" style={{ ...ctaStyle, ...cta.style }} {...cta.hoverProps}>
            Join the waitlist
          </a>
        </div>
      </div>
    </nav>
  );
}

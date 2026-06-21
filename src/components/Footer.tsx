import type { CSSProperties } from 'react';
import { colors, fonts, layout } from '../theme';
import {
  Logo,
  InstagramIcon,
  WhatsappIcon,
  PhoneIcon,
  XIcon,
  FacebookIcon,
  LinkedinIcon,
} from './icons';
import { HoverLink } from './HoverLink';
import { useHover } from '../hooks/useHover';
import { socials } from '../content';
import type { LegalDoc } from './LegalModal';

const socialIcons = {
  instagram: InstagramIcon,
  whatsapp: WhatsappIcon,
  phone: PhoneIcon,
  x: XIcon,
  facebook: FacebookIcon,
  linkedin: LinkedinIcon,
} as const;

interface FooterProps {
  /** Opens the Privacy / Terms legal modal. */
  onOpenLegal: (doc: Exclude<LegalDoc, null>) => void;
}

const colTitle: CSSProperties = {
  fontSize: 12,
  letterSpacing: '1.5px',
  textTransform: 'uppercase',
  color: colors.textDim,
  fontWeight: 600,
  marginBottom: 2,
};

const linkStyle: CSSProperties = {
  color: colors.textMuted,
  textDecoration: 'none',
  fontSize: 14.5,
  transition: 'color .2s',
};

const columns = [
  {
    title: 'Product',
    links: [
      { href: '#features', label: 'Features' },
      { href: '#how', label: 'How it works' },
      { href: '#safety', label: 'Safety' },
    ],
  },
  {
    title: 'Company',
    links: [
      { href: '#faq', label: 'FAQ' },
      { href: '#waitlist', label: 'Waitlist' },
      { href: 'mailto:hello@qafilaa.in', label: 'Contact' },
    ],
  },
];

const legalLink: CSSProperties = {
  fontSize: 13,
  color: colors.textDim,
  textDecoration: 'none',
  transition: 'color .2s',
  cursor: 'pointer',
};

function SocialButton({ social }: { social: (typeof socials)[number] }) {
  const Icon = socialIcons[social.id];
  const { hovered, hoverProps } = useHover({});
  const external = social.href.startsWith('http');
  return (
    <a
      href={social.href}
      aria-label={social.live ? social.label : `${social.label} (coming soon)`}
      title={social.live ? social.label : `${social.label} — coming soon`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...(social.live ? {} : { onClick: (e) => e.preventDefault() })}
      {...hoverProps}
      style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.surfaceInset,
        border: `1px solid ${hovered ? 'rgba(32,214,168,0.5)' : 'rgba(255,255,255,0.08)'}`,
        color: hovered && social.live ? colors.accent : colors.textMuted,
        transition: 'color .2s, border-color .2s',
        cursor: social.live ? 'pointer' : 'default',
        opacity: social.live ? 1 : 0.55,
      }}
    >
      <Icon size={18} />
    </a>
  );
}

export function Footer({ onOpenLegal }: FooterProps) {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 60 }}>
      <div
        style={{
          maxWidth: layout.maxWidth,
          margin: '0 auto',
          padding: '48px 28px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 40,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: colors.surfaceInset,
                border: '1px solid rgba(32,214,168,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Logo size={20} />
            </div>
            <span style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 600 }}>Qafilaa</span>
          </div>
          <p style={{ color: colors.textDim, fontSize: 14, lineHeight: 1.55, margin: '16px 0 0' }}>
            Built by rider. For fellow riders.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
            {socials.map((social) => (
              <SocialButton key={social.id} social={social} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 64, flexWrap: 'wrap' }}>
          {columns.map((col) => (
            <div key={col.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={colTitle}>{col.title}</div>
              {col.links.map((link, i) => (
                <HoverLink
                  key={`${link.label}-${i}`}
                  href={link.href}
                  style={linkStyle}
                  hoverStyle={{ color: colors.text }}
                >
                  {link.label}
                </HoverLink>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div
          style={{
            maxWidth: layout.maxWidth,
            margin: '0 auto',
            padding: '22px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: 13, color: colors.textDim }}>© 2026 Qafilaa · Made for the mountains.</span>
          <div style={{ display: 'flex', gap: 18 }}>
            <HoverLink
              href="#"
              style={legalLink}
              hoverStyle={{ color: colors.text }}
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal('privacy');
              }}
            >
              Privacy
            </HoverLink>
            <HoverLink
              href="#"
              style={legalLink}
              hoverStyle={{ color: colors.text }}
              onClick={(e) => {
                e.preventDefault();
                onOpenLegal('terms');
              }}
            >
              Terms
            </HoverLink>
          </div>
        </div>
      </div>
    </footer>
  );
}

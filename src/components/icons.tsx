import { colors } from '../theme';

/** Qafilaa convoy mark, two nodes linked by an S-curve route. */
export function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 30 30"
      fill="none"
      stroke={colors.accent}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="9" cy="22" r="2.5" />
      <circle cx="21" cy="8" r="2.5" />
      <path d="M11 22h5a4 4 0 0 0 0-8h-2a4 4 0 0 1 0-8h5" />
    </svg>
  );
}

/** Success check used in form confirmations and the phone status card. */
export function CheckIcon({ size = 20, stroke = colors.success }: { size?: number; stroke?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={stroke}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12.5 10 17 19 7" />
    </svg>
  );
}

type SocialIconProps = { size?: number };

const svgBase = (size: number) =>
  ({
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  }) as const;

export function InstagramIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsappIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.6-4.5A8.4 8.4 0 1 1 20.5 11.6Z" />
      <path d="M9 8.5c-.3 0-.6.1-.8.4-.3.3-.9.9-.9 2.1s.9 2.5 1 2.6c.1.2 1.7 2.8 4.3 3.8 2.1.8 2.6.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2-.1-.1-.3-.2-.6-.3l-1.5-.7c-.2-.1-.4-.1-.6.1l-.6.8c-.1.2-.3.2-.5.1-.7-.3-1.4-.6-2.1-1.5-.5-.6-.5-.8-.4-1 .1-.1.2-.3.4-.5.1-.2.1-.3 0-.5l-.7-1.6c-.1-.4-.3-.4-.5-.4Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function PhoneIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <path d="M5 3.5h3l1.5 4-2 1.4a11 11 0 0 0 4.6 4.6l1.4-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A15.5 15.5 0 0 1 3.5 5.1 1.5 1.5 0 0 1 5 3.5Z" />
    </svg>
  );
}

export function XIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <path d="M4 4 20 20M20 4 4 20" />
    </svg>
  );
}

export function FacebookIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <path d="M14.5 8.5V6.8c0-.8.4-1.3 1.3-1.3h1.4V2.7h-2.4c-2.3 0-3.6 1.4-3.6 3.7v2.1H9v2.9h2.2V21h3.3v-9.6h2.3l.4-2.9Z" />
    </svg>
  );
}

export function LinkedinIcon({ size = 18 }: SocialIconProps) {
  return (
    <svg {...svgBase(size)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 10v7" />
    </svg>
  );
}

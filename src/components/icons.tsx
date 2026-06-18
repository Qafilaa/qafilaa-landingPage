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

/**
 * Design tokens for the Qafilaa landing page.
 * Lifted directly from the "Summit" palette of the source prototype so every
 * surface, accent and font matches the original.
 */

export const colors = {
  /** Page background, near-black forest green. */
  bg: '#070D0B',
  /** Primary teal accent. */
  accent: '#20D6A8',
  /** Headline / primary text. */
  text: '#F2F6F5',
  /** Muted body text. */
  textMuted: '#B8C2BE',
  /** Dim label / caption text. */
  textDim: '#6B7C78',
  /** Raised card surface. */
  surface: '#0C1311',
  /** Inset / input surface. */
  surfaceInset: '#0E1413',
  /** Token / avatar fill. */
  token: '#243430',
  /** Success green. */
  success: '#36D399',
  /** Warning amber. */
  warning: '#FFB020',
  /** Danger / SOS red. */
  danger: '#FF5247',
  /** Stale / last-known grey. */
  stale: '#5A6B67',
} as const;

export const fonts = {
  display: "'Space Grotesk', sans-serif",
  body: 'Inter, system-ui, sans-serif',
} as const;

/** Shared layout constants. */
export const layout = {
  maxWidth: 1180,
  gutter: 28,
} as const;

/** The easing curve the prototype uses for reveals and button lifts. */
export const EASE = 'cubic-bezier(.22,.61,.36,1)';

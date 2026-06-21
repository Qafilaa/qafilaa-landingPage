/**
 * Editable copy + configuration for the landing page.
 * Defaults mirror the values the original prototype renders (`renderVals`):
 * launch label, waitlist count (4,200+) and hero subhead.
 */

export const site = {
  brand: 'Qafilaa',
  launchLabel: 'Public beta · Monsoon 2026',
  /** Raw number; rendered as a locale string with a trailing "+". */
  waitlistCount: 50,
  heroSub:
    'Qafilaa keeps your whole group on one live map, gaps, rally points, last-known positions, and one-tap SOS. Built for rides where the road runs out of signal before it runs out of mountain.',
  /** Launch instant the countdown ticks toward. */
  launchDate: new Date('2026-07-20T09:00:00'),
} as const;

export const navLinks = [
  { href: '#features', label: 'Features' },
  { href: '#demo', label: 'Try a ride' },
  { href: '#how', label: 'How it works' },
  { href: '#safety', label: 'Safety' },
  { href: '#faq', label: 'FAQ' },
] as const;

/** Legendary passes scrolled in the route marquee. */
export const passes = [
  'Spiti Loop',
  'Khardung La',
  'Leh–Manali',
  'Zanskar',
  'Sach Pass',
  'Umling La',
  'Nubra Valley',
] as const;

/**
 * Editable copy + configuration for the landing page.
 * Defaults mirror the values the original prototype renders (`renderVals`):
 * launch label, waitlist count (4,200+) and hero subhead.
 */

export const site = {
  brand: 'Qafilaa',
  launchLabel: 'Public beta · Monsoon 2026',
  /** Display base for the social-proof line; real backend signups are added on top of this. */
  waitlistCount: 50,
  heroSub:
    'Qafilaa keeps your whole group on one live map, gaps, rally points, last-known positions, and one-tap SOS. Built for rides where the road runs out of signal before it runs out of mountain.',
  /** Launch instant the countdown ticks toward. */
  launchDate: new Date('2026-07-20T09:00:00'),
  /** Contact phone (also used for WhatsApp). Digits only for tel:/wa.me links. */
  phone: '918830997757',
} as const;

/**
 * Social / contact links shown in the footer.
 * `live: false` accounts are placeholders until the real profiles exist.
 */
export const socials = [
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/qafilaa.in', live: true },
  { id: 'whatsapp', label: 'WhatsApp', href: `https://wa.me/${site.phone}`, live: true },
  { id: 'phone', label: 'Call', href: `tel:+${site.phone}`, live: true },
  { id: 'x', label: 'X', href: 'https://x.com/Qafilaa', live: true },
  { id: 'facebook', label: 'Facebook', href: '#', live: false },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/company/qafilaa/', live: true },
] as const;

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

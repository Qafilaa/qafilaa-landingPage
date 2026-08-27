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
 * The store listings, and whether each one is actually reachable today.
 *
 * Both went live on 27/08/2026 — Play first, then App Store 1.0
 * (bundle in.qafilaa.app, confirmed against the iTunes catalog API rather than
 * the web page, which 404s for a few hours after release while Apple's CDN
 * catches up).
 *
 * `buildStores()` reads `live`: a live store renders as a real anchor, a
 * pending one stays the design's inert "Coming soon" chip. Keep the flag rather
 * than hard-coding two links — a listing can be pulled or a new platform
 * added, and the chip has to have somewhere honest to fall back to.
 *
 * These are NOT the only places a store URL appears. The JSON-LD `installUrl`
 * in index.html, `related_applications` in public/site.webmanifest and the
 * facts in public/llms.txt are hand-maintained and will not follow a change
 * here; public/join/index.html hard-codes both for the deep-link fallback.
 */
export const stores = [
  {
    id: 'appstore',
    label: 'App Store',
    icon: 'brand/icon-appstore.svg',
    url: 'https://apps.apple.com/app/qafilaa/id6798303654',
    live: true,
  },
  {
    id: 'play',
    label: 'Google Play',
    icon: 'brand/icon-googleplay.svg',
    url: 'https://play.google.com/store/apps/details?id=app.qafilaa',
    live: true,
  },
] as const;

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
  'Leh-Manali',
  'Zanskar',
  'Sach Pass',
  'Umling La',
  'Nubra Valley',
] as const;

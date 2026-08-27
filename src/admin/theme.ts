/**
 * Daylight, at admin density.
 *
 * The marketing site's palette is not re-invented here and must not be: `paint()` interpolates five
 * tones onto `:root` every frame while the scroll engine runs, but the engine does not run on this
 * route — so, exactly like `LegalShell`, the tones are pinned as literal custom properties on the
 * console's own wrapper.
 *
 * What DOES change from the site is density, and deliberately. The landing page is a 22-waypoint
 * scroll journey with 100svh sections; an operator console is the opposite kind of surface — it is
 * read in a glance, several figures at a time, usually while something is wrong. So the type steps
 * down, the rhythm tightens, and every number is set in tabular figures so a column of them lines
 * up. Same palette, same two typefaces, different job.
 */

/** The pinned Daylight tones. `--mut` is the legal pages' darker value: this is a reading surface. */
export const DAYLIGHT = {
  '--bg': '#F7F5F0',
  '--ink': '#23241F',
  '--mut': '#4A4842',
  '--sur': '#6E6B63',
  '--line': '#DCD6C9',
  '--card': '#FFFFFF',
  '--acc': '#0A6068',
  '--acc2': '#0E7C86',
  '--ctr': '#E5E2DA',
  '--ctaInk': '#F7F5F0',

  /* Status tones. Only three, because an operator surface that speaks in six colours is one where
     nobody can tell which of them means "stop". Warn is the site's own; danger is a desaturated
     brick chosen to sit in this palette rather than shout out of it. */
  '--ok': '#1F7A54',
  '--warn': '#B26B00',
  '--danger': '#A33A2A',
  '--okBg': '#E8F2ED',
  '--warnBg': '#F7EFE0',
  '--dangerBg': '#F6E9E6',
} as const;

export const HG = "'Hanken Grotesk', system-ui, -apple-system, sans-serif";
export const SG = "'Space Grotesk', 'Hanken Grotesk', system-ui, sans-serif";

/**
 * Every figure on this console is set in these. `tabular-nums` is not a nicety: without it a column
 * of counts jitters as digits change width, and a dashboard whose numbers move when they have not
 * changed is one you stop trusting at a glance.
 */
export const NUM: React.CSSProperties = {
  fontFamily: SG,
  fontVariantNumeric: 'tabular-nums',
  fontFeatureSettings: '"tnum" 1',
};

/** The all-caps micro-label the site uses for section eyebrows. */
export const EYEBROW: React.CSSProperties = {
  fontFamily: SG,
  fontSize: 11,
  letterSpacing: '.14em',
  textTransform: 'uppercase',
  color: 'var(--sur)',
};

/**
 * The one text-input skin. It lives here rather than beside the components because `ui.tsx` exports
 * components, and a non-component export there breaks React Fast Refresh (the lint rule that caught
 * it is right: a mixed module reloads its whole subtree instead of just the component).
 */
export const inputStyle: React.CSSProperties = {
  width: '100%', minHeight: 42, padding: '0 12px', borderRadius: 10,
  border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--ink)',
  font: `400 14px ${HG}`, outline: 'none',
};

export const CARD: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--line)',
  borderRadius: 14,
};

/** Focus ring used everywhere interactive. Keyboard operators exist; this route has no mouse-only path. */
export const FOCUS_RING = '0 0 0 3px rgba(14,124,134,.28)';

/** Formats an integer with thin grouping, or an em-dash when the value is genuinely unknown. */
export function num(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString('en-IN');
}

/**
 * A short, unambiguous timestamp. Deliberately absolute rather than "3 hours ago": an operator
 * comparing a signup against a deploy or a log line needs the actual clock, and a relative label
 * silently drifts while the tab sits open.
 */
export function when(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

/** Date only — for chart axes and day rows, where the time of day is noise. */
export function day(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
}

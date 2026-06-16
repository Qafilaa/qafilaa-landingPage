import { useEffect, useState } from 'react';

export interface BannerPhase {
  /** Foreground colour for dot + text. */
  c: string;
  /** Status text. */
  t: string;
  /** Banner background. */
  bg: string;
  /** Banner border colour. */
  bd: string;
}

/** The connectivity story the offline-spotlight banner cycles through. */
export const BANNER_PHASES: BannerPhase[] = [
  { c: '#36D399', t: 'All live · 5 of 5 accounted for', bg: 'rgba(54,211,153,0.10)', bd: 'rgba(54,211,153,0.28)' },
  { c: '#FFB020', t: 'Signal weak · holding last-known', bg: 'rgba(255,176,32,0.10)', bd: 'rgba(255,176,32,0.26)' },
  { c: '#FF5247', t: 'Signal lost · head to rally point 3', bg: 'rgba(255,82,71,0.10)', bd: 'rgba(255,82,71,0.26)' },
  { c: '#20D6A8', t: 'Back online · syncing positions…', bg: 'rgba(32,214,168,0.10)', bd: 'rgba(32,214,168,0.26)' },
];

/**
 * Advances through {@link BANNER_PHASES} every 2600ms, mirroring the
 * prototype's `_banner` interval.
 */
export function useCyclingBanner(intervalMs = 2600): BannerPhase {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % BANNER_PHASES.length),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [intervalMs]);

  return BANNER_PHASES[index];
}

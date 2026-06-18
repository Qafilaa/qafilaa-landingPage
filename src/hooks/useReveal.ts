import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { EASE } from '../theme';

interface RevealOptions {
  /** Delay in ms after the element enters view before it animates in. */
  delay?: number;
  /** Transition duration in seconds (the prototype uses .7 / .8 / .9 / 1). */
  duration?: number;
  /** Hidden-state transform (defaults to the prototype's `translateY(28px)`). */
  from?: string;
}

interface RevealResult<T extends HTMLElement> {
  ref: React.RefObject<T>;
  /** Spread onto the target element and merge with its own styles. */
  style: CSSProperties;
  /** True once the element has revealed (e.g. to trigger counters). */
  shown: boolean;
}

/**
 * Entrance animation that mirrors the prototype's `data-reveal` treatment:
 * elements start at `opacity:0; translateY(28px)` and ease to their resting
 * position shortly after load. The source design reveals everything on a timed
 * cascade (its `_reveals`) rather than on scroll, so we do the same here. This
 * also guarantees no section can ever be left stuck hidden if an async
 * IntersectionObserver callback never fires.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  delay = 0,
  duration = 0.9,
  from = 'translateY(28px)',
}: RevealOptions = {}): RevealResult<T> {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;
    const timer = window.setTimeout(() => setShown(true), 120 + delay);
    return () => window.clearTimeout(timer);
  }, [delay, shown]);

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : from,
    transition: `opacity ${duration}s ${EASE}, transform ${duration}s ${EASE}`,
  };

  return { ref, style, shown };
}

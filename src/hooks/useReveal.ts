import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { EASE } from '../theme';

interface RevealOptions {
  /** Delay in ms after the element enters view before it animates in. */
  delay?: number;
  /** Transition duration in seconds (the prototype uses .8 / .9 / 1). */
  duration?: number;
}

interface RevealResult<T extends HTMLElement> {
  ref: React.RefObject<T>;
  /** Spread onto the target element and merge with its own styles. */
  style: CSSProperties;
  /** True once the element has revealed (e.g. to trigger counters). */
  shown: boolean;
}

/**
 * Scroll-triggered entrance animation that mirrors the prototype's
 * `data-reveal` treatment: elements start at `opacity:0; translateY(28px)`
 * and ease to their resting position once they scroll into view.
 *
 * The original prototype drove this on a timer because its preview ran inside
 * a content-sized iframe where IntersectionObserver never fired. On a real
 * site the intended behaviour is scroll-tied reveals, so that is what we use.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  delay = 0,
  duration = 0.9,
}: RevealOptions = {}): RevealResult<T> {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    let timer: number | undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          timer = window.setTimeout(() => setShown(true), delay);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delay, shown]);

  const style: CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? 'none' : 'translateY(28px)',
    transition: `opacity ${duration}s ${EASE}, transform ${duration}s ${EASE}`,
  };

  return { ref, style, shown };
}

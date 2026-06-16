import type { CSSProperties, ReactNode } from 'react';
import { useReveal } from '../hooks/useReveal';

interface RevealProps {
  children: ReactNode;
  /** Own styles for the element; merged under the reveal transition. */
  style?: CSSProperties;
  /** Delay in ms (mirrors `data-reveal-delay`). */
  delay?: number;
  /** Transition duration in seconds. */
  duration?: number;
  className?: string;
  id?: string;
}

/**
 * Drop-in wrapper for the prototype's `data-reveal` divs: renders a `<div>`
 * that eases up into view on scroll, merging the caller's own layout styles
 * with the reveal transition.
 */
export function Reveal({ children, style, delay, duration, className, id }: RevealProps) {
  const { ref, style: revealStyle } = useReveal<HTMLDivElement>({ delay, duration });
  return (
    <div ref={ref} id={id} className={className} style={{ ...style, ...revealStyle }}>
      {children}
    </div>
  );
}

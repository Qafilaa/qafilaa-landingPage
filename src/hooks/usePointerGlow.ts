import { useCallback, useRef, useState } from 'react';

/**
 * Cursor-following radial glow for the hero. Returns the props to spread on the
 * tracked container and the live `background` value for the glow layer.
 *
 * Mirrors the prototype's `_glow`: a 420×420 teal radial gradient that follows
 * the pointer within the hero, resting at `70% 18%` until the mouse moves.
 */
export function usePointerGlow(rest = 'radial-gradient(420px 420px at 70% 18%, rgba(32,214,168,0.14), transparent 70%)') {
  const containerRef = useRef<HTMLElement>(null);
  const [background, setBackground] = useState(rest);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    setBackground(
      `radial-gradient(420px 420px at ${x}px ${y}px, rgba(32,214,168,0.16), transparent 70%)`,
    );
  }, []);

  return { containerRef, background, onMouseMove };
}

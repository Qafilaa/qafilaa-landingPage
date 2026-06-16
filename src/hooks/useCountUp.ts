import { useEffect, useState } from 'react';

/**
 * Animates a number from 0 to `target` with a cubic ease-out, matching the
 * prototype's `_count` routine (1500ms, `1 - (1 - t)^3`). Locale-formats the
 * result and appends an optional suffix (e.g. "%").
 *
 * @param target  Final value to count up to.
 * @param active  When true, the animation runs (once).
 * @param suffix  Optional string appended to every frame.
 */
export function useCountUp(target: number, active: boolean, suffix = ''): string {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    const duration = 1500;
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active]);

  return value.toLocaleString() + suffix;
}

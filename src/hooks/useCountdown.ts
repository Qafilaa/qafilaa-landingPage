import { useEffect, useState } from 'react';

export interface Countdown {
  days: string;
  hours: string;
  mins: string;
  secs: string;
}

const pad = (n: number) => String(n).padStart(2, '0');

function diffToParts(targetMs: number): Countdown {
  let diff = Math.max(0, targetMs - Date.now());
  const d = Math.floor(diff / 86_400_000);
  diff -= d * 86_400_000;
  const h = Math.floor(diff / 3_600_000);
  diff -= h * 3_600_000;
  const m = Math.floor(diff / 60_000);
  diff -= m * 60_000;
  const s = Math.floor(diff / 1000);
  return { days: pad(d), hours: pad(h), mins: pad(m), secs: pad(s) };
}

/**
 * Live countdown to a fixed launch instant. Ticks every second, matching the
 * prototype's `_countdown` (target `2026-08-01T09:00:00`).
 */
export function useCountdown(target: Date): Countdown {
  const targetMs = target.getTime();
  const [parts, setParts] = useState<Countdown>(() => diffToParts(targetMs));

  useEffect(() => {
    const tick = () => setParts(diffToParts(targetMs));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  return parts;
}

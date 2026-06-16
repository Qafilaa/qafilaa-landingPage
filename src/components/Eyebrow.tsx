import type { ReactNode } from 'react';
import { colors } from '../theme';

/** The small uppercase section kicker used above most headings. */
export function Eyebrow({ children, color = colors.accent }: { children: ReactNode; color?: string }) {
  return (
    <div
      style={{
        fontSize: 13,
        letterSpacing: '2px',
        textTransform: 'uppercase',
        color,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

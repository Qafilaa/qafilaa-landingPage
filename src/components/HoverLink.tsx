import type { CSSProperties, ReactNode } from 'react';
import { useHover } from '../hooks/useHover';

interface HoverLinkProps {
  href: string;
  children: ReactNode;
  style: CSSProperties;
  hoverStyle: CSSProperties;
}

/**
 * Anchor that swaps in `hoverStyle` while hovered — the inline-style equivalent
 * of the prototype's `style-hover` attribute.
 */
export function HoverLink({ href, children, style, hoverStyle }: HoverLinkProps) {
  const { hoverProps, style: hovered } = useHover(hoverStyle);
  return (
    <a href={href} style={{ ...style, ...hovered }} {...hoverProps}>
      {children}
    </a>
  );
}

import { useState, type CSSProperties } from 'react';

/**
 * Small helper that reproduces CSS `:hover` for elements styled with inline
 * style objects (the prototype used `style-hover`). Returns the event handlers
 * plus the style to merge while hovered.
 */
export function useHover(hoverStyle: CSSProperties) {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    hoverProps: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
    },
    style: hovered ? hoverStyle : null,
  };
}

/** Same idea for `:focus` (used by the e-mail inputs). */
export function useFocus(focusStyle: CSSProperties) {
  const [focused, setFocused] = useState(false);
  return {
    focused,
    focusProps: {
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    },
    style: focused ? focusStyle : null,
  };
}

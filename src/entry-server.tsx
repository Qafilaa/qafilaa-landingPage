import { renderToString } from 'react-dom/server';
import App from './App';

/**
 * Build-time entry used by `prerender.mjs` (not shipped to the browser).
 * Renders the app to a static HTML string so the markup is baked into
 * `dist/index.html`, crawlers get the full page on first byte, and the
 * client bundle hydrates it on load (see `main.tsx`).
 *
 * Safe because every browser API in the app lives inside `useEffect` /
 * event handlers, so nothing touches `window`/`document` during render.
 */
export function render(): string {
  return renderToString(<App />);
}

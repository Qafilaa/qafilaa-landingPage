import { renderToString } from 'react-dom/server';
import App from './App';
import type { Route } from './routes';

/**
 * Build-time entry used by `prerender.mjs` (not shipped to the browser).
 * Renders the app to a static HTML string for a given route so the markup is
 * baked into the per-route HTML file, crawlers get the full page on first
 * byte, and the client bundle hydrates it on load (see `main.tsx`).
 *
 * Safe because every browser API in the app lives inside `useEffect` /
 * event handlers, so nothing touches `window`/`document` during render.
 */
export function render(route: Route = 'home'): string {
  return renderToString(<App route={route} />);
}

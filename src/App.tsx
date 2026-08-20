import { Landing } from './Landing';
import { LegalRoute } from './site/legal/LegalRoute';
import { NotFound } from './site/NotFound';
import { pathToRoute, type Route } from './routes';

/**
 * Top-level router. The site is prerendered to one HTML file per route
 * (`prerender.mjs` calls `render(route)`), so on the server we render the
 * route we were asked for; on the client we derive it from the URL the browser
 * loaded. Both paths agree, so hydration matches.
 */
export default function App({ route }: { route?: Route }) {
  const active = route ?? (typeof window !== 'undefined' ? pathToRoute(window.location.pathname) : 'home');

  if (active === 'home') return <Landing />;
  if (active === 'notFound') return <NotFound />;
  return <LegalRoute doc={active} />;
}

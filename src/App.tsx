import { Landing } from './Landing';
import { LegalPage } from './components/LegalPage';
import { pathToRoute, type Route } from './routes';

/**
 * Top-level router. The site is prerendered to one HTML file per route
 * (`prerender.mjs` calls `render(route)`), so on the server we render the
 * route we were asked for; on the client we derive it from the URL the browser
 * loaded. Both paths agree, so hydration matches.
 */
export default function App({ route }: { route?: Route }) {
  const active = route ?? (typeof window !== 'undefined' ? pathToRoute(window.location.pathname) : 'home');

  if (active === 'privacy') return <LegalPage doc="privacy" />;
  if (active === 'terms') return <LegalPage doc="terms" />;
  return <Landing />;
}

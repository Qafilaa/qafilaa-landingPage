import { Landing } from './Landing';
import { ConsentBanner } from './site/ConsentBanner';
import { LegalRoute } from './site/legal/LegalRoute';
import { NotFound } from './site/NotFound';
import { pathToRoute, type Route } from './routes';

/**
 * Top-level router. The site is prerendered to one HTML file per route
 * (`prerender.mjs` calls `render(route)`), so on the server we render the
 * route we were asked for; on the client we derive it from the URL the browser
 * loaded. Both paths agree, so hydration matches.
 *
 * `App` itself holds no state on purpose. The consent banner is a sibling of
 * the page and owns its own state, so accepting or declining re-renders the
 * banner alone — never `Landing`, whose subtree belongs to the scroll engine.
 */
export default function App({ route }: { route?: Route }) {
  const active = route ?? (typeof window !== 'undefined' ? pathToRoute(window.location.pathname) : 'home');

  return (
    <>
      {page(active)}
      <ConsentBanner />
    </>
  );
}

function page(active: Route) {
  if (active === 'home') return <Landing />;
  if (active === 'notFound') return <NotFound />;
  return <LegalRoute doc={active} />;
}

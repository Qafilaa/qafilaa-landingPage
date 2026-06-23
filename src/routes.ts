/**
 * Tiny path-based router for the prerendered site.
 *
 * The site is statically prerendered to one HTML file per route
 * (see `prerender.mjs`), then the client bundle hydrates whichever page the
 * browser loaded. `pathToRoute` maps a URL pathname to a route so the server
 * and client agree on what to render (no hydration mismatch).
 */
export type Route = 'home' | 'privacy' | 'terms';

/** Public URL path for each non-home route. */
export const routePaths: Record<Exclude<Route, 'home'>, string> = {
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
};

export function pathToRoute(pathname: string): Route {
  // Ignore a trailing slash so `/privacy-policy` and `/privacy-policy/` match.
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === routePaths.privacy) return 'privacy';
  if (p === routePaths.terms) return 'terms';
  return 'home';
}

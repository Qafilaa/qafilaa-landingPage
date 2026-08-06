/**
 * Tiny path-based router for the prerendered site.
 *
 * The site is statically prerendered to one HTML file per route
 * (see `prerender.mjs`), then the client bundle hydrates whichever page the
 * browser loaded. `pathToRoute` maps a URL pathname to a route so the server
 * and client agree on what to render (no hydration mismatch).
 */
export type Route = 'home' | 'privacy' | 'terms' | 'deleteAccount' | 'deleteData' | 'support';

/** Public URL path for each non-home route. */
export const routePaths: Record<Exclude<Route, 'home'>, string> = {
  privacy: '/privacy-policy',
  terms: '/terms-and-conditions',
  // Google Play requires a publicly reachable account-deletion page — reachable
  // WITHOUT installing the app, so the in-app "Delete account" flow does not
  // satisfy it on its own. A missing URL is a store-listing rejection.
  deleteAccount: '/delete-account',
  // The SECOND deletion URL Play asks for, and a different question from the one
  // above: "can a user delete some of their data WITHOUT closing their account?".
  // Answering no there prints "Developer hasn't provided a way to request data
  // deletion" on the public Data safety card, which is both untrue of this app
  // and a poor look on a listing whose whole subject is trust.
  deleteData: '/delete-data',
  // The App Store requires a Support URL, and unlike Play it will not accept a marketing
  // homepage — it has to lead somewhere a user can actually get help. It is listed on the
  // App Store version metadata, so a 404 here is a metadata rejection.
  support: '/support',
};

export function pathToRoute(pathname: string): Route {
  // Ignore a trailing slash so `/privacy-policy` and `/privacy-policy/` match.
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === routePaths.privacy) return 'privacy';
  if (p === routePaths.terms) return 'terms';
  if (p === routePaths.deleteAccount) return 'deleteAccount';
  if (p === routePaths.deleteData) return 'deleteData';
  if (p === routePaths.support) return 'support';
  return 'home';
}

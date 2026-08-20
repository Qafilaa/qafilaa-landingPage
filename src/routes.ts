/**
 * Tiny path-based router for the prerendered site.
 *
 * The site is statically prerendered to one HTML file per route
 * (see `prerender.mjs`), then the client bundle hydrates whichever page the
 * browser loaded. `pathToRoute` maps a URL pathname to a route so the server
 * and client agree on what to render (no hydration mismatch).
 *
 * Every non-home route is a policy or support document. Most exist because a
 * store requires them — see the comments on `routePaths`. Adding one means
 * touching four files: this one, `src/App.tsx`, `prerender.mjs` PAGES, and
 * `public/sitemap.xml`.
 */
export type Route = 'home' | LegalRouteName;

export type LegalRouteName =
  | 'privacy'
  | 'terms'
  | 'cookies'
  | 'communityGuidelines'
  | 'childSafety'
  | 'report'
  | 'security'
  | 'dataSafety'
  | 'permissions'
  | 'subprocessors'
  | 'deleteAccount'
  | 'deleteData'
  | 'support'
  | 'contact'
  | 'accessibility';

/** Public URL path for each non-home route. */
export const routePaths: Record<LegalRouteName, string> = {
  // Mandatory in App Store Connect and in the Play Console App content section.
  privacy: '/privacy-policy',
  // Doubles as the end-user licence agreement Apple asks for.
  terms: '/terms-and-conditions',
  // Referenced by section 9 of the privacy policy; covers this site's analytics.
  cookies: '/cookies',
  // App Store Review Guideline 1.2 requires published standards for an app with
  // user-generated content; Play's UGC policy requires the same.
  communityGuidelines: '/community-guidelines',
  // The "published standards against CSAE" URL Play's Child Safety Standards
  // declaration asks for. Must stay globally reachable and name the app.
  childSafety: '/child-safety',
  // Guideline 1.2 again: a mechanism to report offensive content, reachable
  // from outside the app. Also the notice-and-action point under the EU DSA.
  report: '/report',
  security: '/security',
  // Human-readable mirror of the Play Data safety form and Apple's App Privacy
  // answers. Keep it in step with both, or do not publish it.
  dataSafety: '/data-safety',
  // Backs the prominent disclosure Play requires for background location, and
  // the purpose strings Apple shows at the permission prompt.
  permissions: '/permissions',
  // Guideline 5.1.1 requires naming third parties with access to user data and
  // confirming they give equal protection. That confirmation lives here.
  subprocessors: '/subprocessors',
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
  // Published contact information (Guideline 1.2), the EU DSA trader disclosure,
  // and the DPDP Act grievance officer.
  contact: '/contact',
  // Accessibility statement, required of services in the EU under the European
  // Accessibility Act since 28 June 2025.
  accessibility: '/accessibility',
};

const BY_PATH = new Map<string, Route>(
  (Object.entries(routePaths) as [LegalRouteName, string][]).map(([route, path]) => [path, route]),
);

export function pathToRoute(pathname: string): Route {
  // Ignore a trailing slash so `/privacy-policy` and `/privacy-policy/` match.
  const p = pathname.replace(/\/+$/, '') || '/';
  return BY_PATH.get(p) ?? 'home';
}

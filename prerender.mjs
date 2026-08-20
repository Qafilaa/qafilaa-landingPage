// Post-build step: render the app to static HTML, one file per route, and
// inject it into the matching dist HTML so crawlers receive the full page on
// first byte. Runs after `vite build` (client) and `vite build --ssr` (server
// bundle).
//
//   /                       -> dist/index.html
//   /privacy-policy         -> dist/privacy-policy/index.html
//   /terms-and-conditions   -> dist/terms-and-conditions/index.html
//   /security               -> dist/security/index.html
//   ...and one file per policy route listed in PAGES below.
//
// Each non-home route reuses the built index.html as a template but swaps in
// its own <title>, canonical, description and Open Graph / Twitter tags, and
// drops the home-only structured-data block.
import { readFileSync, writeFileSync, mkdirSync, cpSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const { render } = await import('./dist-ssr/entry-server.js');

const PLACEHOLDER = '<div id="root"></div>';

const template = readFileSync(resolve(root, 'dist/index.html'), 'utf-8');
if (!template.includes(PLACEHOLDER)) {
  throw new Error(`prerender: "${PLACEHOLDER}" not found in dist/index.html`);
}

/** Replace the first match of `re`, throwing if the template format drifted. */
function sub(html, re, replacement, label) {
  if (!re.test(html)) throw new Error(`prerender: could not find ${label} to rewrite`);
  return html.replace(re, () => replacement);
}

/** Rewrite the shared <head> of the template for a specific legal page. */
function headFor(html, page) {
  let out = html;
  out = sub(out, /<title>[\s\S]*?<\/title>/, `<title>${page.title}</title>`, 'title');
  out = sub(out, /<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${page.url}" />`, 'canonical');
  out = sub(
    out,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${page.description}" />`,
    'description',
  );
  out = sub(out, /<meta property="og:url"[^>]*>/, `<meta property="og:url" content="${page.url}" />`, 'og:url');
  out = sub(out, /<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${page.title}" />`, 'og:title');
  out = sub(
    out,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${page.description}" />`,
    'og:description',
  );
  out = sub(out, /<meta name="twitter:title"[^>]*>/, `<meta name="twitter:title" content="${page.title}" />`, 'twitter:title');
  out = sub(
    out,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${page.description}" />`,
    'twitter:description',
  );
  // The home page's graph (Organization, WebSite, MobileApplication, FAQ) is
  // specific to it. Rather than leave the policy pages with no structured data
  // at all, swap in a per-page WebPage + BreadcrumbList that points back at the
  // Organization and WebSite nodes the home page defines.
  out = out.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, ldFor(page));
  // The 404 is a real HTML file the CDN serves for every unknown path. It must
  // never be indexed, or every typo'd URL becomes a thin page in the index.
  if (page.noindex) {
    out = sub(out, /<meta name="robots"[^>]*>/, '<meta name="robots" content="noindex, follow" />', 'robots');
    out = sub(out, /<meta name="googlebot"[^>]*>/, '<meta name="googlebot" content="noindex, follow" />', 'googlebot');
    out = out.replace(/\s*<link rel="canonical"[^>]*>/, '');
  }
  return out;
}

/** Per-page structured data for a policy / support route. */
function ldFor(page) {
  const crumb = page.title.replace(/ \| Qafilaa$/, '');
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': page.schemaType ?? 'WebPage',
        '@id': `${page.url}#webpage`,
        url: page.url,
        name: page.title,
        description: page.description,
        inLanguage: 'en-IN',
        isPartOf: { '@id': 'https://qafilaa.in/#website' },
        about: { '@id': 'https://qafilaa.in/#app' },
        publisher: { '@id': 'https://qafilaa.in/#organization' },
        breadcrumb: { '@id': `${page.url}#breadcrumb` },
        primaryImageOfPage: { '@type': 'ImageObject', url: 'https://qafilaa.in/brand/og-cover.png' },
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${page.url}#breadcrumb`,
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Qafilaa', item: 'https://qafilaa.in/' },
          { '@type': 'ListItem', position: 2, name: crumb, item: page.url },
        ],
      },
    ],
  };
  const body = JSON.stringify(graph, null, 2)
    .split('\n')
    .map((l) => '    ' + l)
    .join('\n');
  return `\n    <script type="application/ld+json">\n${body}\n    </script>`;
}

const PAGES = [
  { route: 'home', out: 'dist/index.html', template },
  {
    schemaType: 'WebPage',
    route: 'privacy',
    out: 'dist/privacy-policy/index.html',
    url: 'https://qafilaa.in/privacy-policy',
    title: 'Privacy Policy | Qafilaa',
    description:
      'How Qafilaa collects, uses, shares and protects your personal data, including your rights under the Digital Personal Data Protection Act, 2023.',
  },
  {
    route: 'terms',
    out: 'dist/terms-and-conditions/index.html',
    url: 'https://qafilaa.in/terms-and-conditions',
    title: 'Terms of Service | Qafilaa',
    description:
      'The terms that govern your use of the Qafilaa website, waitlist and app, including the important safety notice, eligibility and limitations of liability.',
  },
  {
    // Google Play requires this URL to resolve for anyone, without installing the
    // app. It must stay in this list: the site is statically prerendered, so a
    // route that is not built here is a 404 to the reviewer checking the listing.
    route: 'deleteAccount',
    out: 'dist/delete-account/index.html',
    url: 'https://qafilaa.in/delete-account',
    title: 'Delete your account | Qafilaa',
    description:
      'How to permanently delete your Qafilaa account and what happens to your data, including your location history, medical card and ride records.',
  },
  {
    // The second URL the Data safety form asks for — deleting *some* data without
    // closing the account. Same prerender rule as above: a route missing from this
    // list is a 404 to the reviewer who clicks it on the listing.
    route: 'deleteData',
    out: 'dist/delete-data/index.html',
    url: 'https://qafilaa.in/delete-data',
    title: 'Delete your data | Qafilaa',
    description:
      'How to delete your Qafilaa data — location history, ride records, medical card, photos and documents — without closing your account.',
  },
  {
    // The App Store's required Support URL, and it is stricter than Play's: a marketing
    // homepage does not satisfy it, the link has to reach somewhere a user can get help.
    // Same prerender rule as the two above — a route missing from this list is a 404 to
    // the reviewer who clicks it, and that is a metadata rejection.
    route: 'support',
    out: 'dist/support/index.html',
    url: 'https://qafilaa.in/support',
    title: 'Support | Qafilaa',
    description:
      'Get help with Qafilaa — contact the team by email or phone, report content, manage your account and data, and fix a rider position that has stopped updating.',
  },
  {
    // Linked from the privacy policy and the site footer. Added with the Site v2
    // design; same prerender rule as the routes above — a route missing from this
    // list is a 404 on a static S3 site.
    route: 'security',
    out: 'dist/security/index.html',
    url: 'https://qafilaa.in/security',
    title: 'Security | Qafilaa',
    description:
      'How Qafilaa protects your data — encryption in transit and at rest, what never leaves your phone, who can see your position, retention and deletion, and how to report a vulnerability.',
  },
  {
    route: 'cookies',
    out: 'dist/cookies/index.html',
    url: 'https://qafilaa.in/cookies',
    title: 'Cookies | Qafilaa',
    description:
      'What qafilaa.in stores in your browser, why, and how to refuse it. The Qafilaa app itself carries no analytics or advertising software.',
  },
  {
    route: 'communityGuidelines',
    out: 'dist/community-guidelines/index.html',
    url: 'https://qafilaa.in/community-guidelines',
    title: 'Community guidelines | Qafilaa',
    description:
      'What belongs on Qafilaa and what does not, how to report content that crosses a line, and what we do within 24 hours of a report.',
  },
  {
    route: 'childSafety',
    out: 'dist/child-safety/index.html',
    url: 'https://qafilaa.in/child-safety',
    title: 'Child safety | Qafilaa',
    description:
      "Qafilaa's published standards against child sexual abuse and exploitation, how to report it, what we do when we know, and who to contact.",
  },
  {
    route: 'report',
    out: 'dist/report/index.html',
    url: 'https://qafilaa.in/report',
    title: 'Report content | Qafilaa',
    description:
      'How to report abusive or objectionable content and riders on Qafilaa, from inside the app or from anywhere else, and how quickly we act.',
  },
  {
    route: 'dataSafety',
    out: 'dist/data-safety/index.html',
    url: 'https://qafilaa.in/data-safety',
    title: 'Data safety | Qafilaa',
    description:
      "A readable version of Qafilaa's Google Play Data safety and Apple App Privacy answers: what we collect, what we share, and what we never touch.",
  },
  {
    route: 'permissions',
    out: 'dist/permissions/index.html',
    url: 'https://qafilaa.in/permissions',
    title: 'Permissions | Qafilaa',
    description:
      'Every permission Qafilaa asks for, the real reason for each, what breaks if you refuse it, and how to take it back.',
  },
  {
    route: 'subprocessors',
    out: 'dist/subprocessors/index.html',
    url: 'https://qafilaa.in/subprocessors',
    title: 'Subprocessors | Qafilaa',
    description:
      'The named third parties that can touch Qafilaa data, what each one does, and the protection standard every one of them is held to.',
  },
  {
    schemaType: 'ContactPage',
    route: 'contact',
    out: 'dist/contact/index.html',
    url: 'https://qafilaa.in/contact',
    title: 'Contact | Qafilaa',
    description:
      'How to reach Qafilaa: business and trader details, our Grievance Officer, child safety and security contacts, and how long each takes to answer.',
  },
  {
    route: 'accessibility',
    out: 'dist/accessibility/index.html',
    url: 'https://qafilaa.in/accessibility',
    title: 'Accessibility | Qafilaa',
    description:
      "How accessible Qafilaa's website and app are today, where they fall short, and how to tell us when something is not usable.",
  },
  {
    // Served by CloudFront for every unknown path (Error Pages -> 404 ->
    // /404.html, response code 404). Not in the sitemap, and noindex.
    route: 'notFound',
    out: 'dist/404.html',
    url: 'https://qafilaa.in/404',
    title: 'Page not found | Qafilaa',
    description: 'That page is not on the map. Here is the way back to Qafilaa.',
    noindex: true,
  },
];

for (const page of PAGES) {
  const base = page.template ?? headFor(template, page);
  const appHtml = render(page.route);
  const html = base.replace(PLACEHOLDER, `<div id="root">${appHtml}</div>`);
  const outPath = resolve(root, page.out);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html);
  console.log(`prerender: ${page.route} -> ${page.out} (${appHtml.length} bytes of markup)`);
}

// Safety net: ensure the app deep-link association files land in dist/ even if
// the bundler ever skips dot-directories under public/. These must be served at
// https://qafilaa.in/.well-known/{assetlinks.json,apple-app-site-association}.
const wellKnownSrc = resolve(root, 'public/.well-known');
const wellKnownDst = resolve(root, 'dist/.well-known');
if (existsSync(wellKnownSrc)) {
  cpSync(wellKnownSrc, wellKnownDst, { recursive: true });
  console.log('prerender: copied public/.well-known -> dist/.well-known');
}

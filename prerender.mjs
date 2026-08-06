// Post-build step: render the app to static HTML, one file per route, and
// inject it into the matching dist HTML so crawlers receive the full page on
// first byte. Runs after `vite build` (client) and `vite build --ssr` (server
// bundle).
//
//   /                       -> dist/index.html
//   /privacy-policy         -> dist/privacy-policy/index.html
//   /terms-and-conditions   -> dist/terms-and-conditions/index.html
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
  // The JSON-LD graph (Organization, WebSite, SoftwareApplication, FAQ) is
  // specific to the home page; drop it from the legal pages.
  out = out.replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/, '');
  return out;
}

const PAGES = [
  { route: 'home', out: 'dist/index.html', template },
  {
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

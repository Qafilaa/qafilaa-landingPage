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

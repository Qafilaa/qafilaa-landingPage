// Post-build step: render the app to static HTML and inject it into
// dist/index.html so crawlers receive the full page on first byte.
// Runs after `vite build` (client) and `vite build --ssr` (server bundle).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));

const { render } = await import('./dist-ssr/entry-server.js');
const appHtml = render();

const indexPath = resolve(root, 'dist/index.html');
const template = readFileSync(indexPath, 'utf-8');

const PLACEHOLDER = '<div id="root"></div>';
if (!template.includes(PLACEHOLDER)) {
  throw new Error(`prerender: "${PLACEHOLDER}" not found in dist/index.html`);
}

writeFileSync(indexPath, template.replace(PLACEHOLDER, `<div id="root">${appHtml}</div>`));
console.log(`prerender: injected ${appHtml.length} bytes of markup into dist/index.html`);

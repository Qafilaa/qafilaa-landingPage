#!/usr/bin/env node
/**
 * Serve `dist/` the way production does.
 *
 * `vite preview` answers every unknown path with index.html, which hides exactly
 * the bugs worth catching: a route that never got prerendered, a link to a page
 * that does not exist. This mirrors S3 + CloudFront instead — directory index
 * resolution, and 404.html with a real 404 for anything missing.
 *
 *   node tools/serve-dist.mjs [port]
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dist');
const PORT = Number(process.argv[2] || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/** Resolve a URL path to a file, following the same rules as the CDN. */
function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^(\.\.[/\\])+/, '');
  const target = join(ROOT, clean);
  if (!target.startsWith(ROOT)) return null; // no escaping dist/
  if (existsSync(target) && statSync(target).isFile()) return target;
  const indexed = join(target, 'index.html');
  if (existsSync(indexed)) return indexed;
  return null;
}

createServer((req, res) => {
  const file = resolveFile(req.url || '/');
  if (file) {
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    createReadStream(file).pipe(res);
    return;
  }
  // What CloudFront does once the custom error responses are configured.
  const notFound = join(ROOT, '404.html');
  if (existsSync(notFound)) {
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    createReadStream(notFound).pipe(res);
    return;
  }
  res.writeHead(404, { 'content-type': 'text/plain' });
  res.end('404');
}).listen(PORT, '127.0.0.1', () => {
  console.log(`serving ${ROOT} on http://127.0.0.1:${PORT} (directory index + 404.html)`);
});

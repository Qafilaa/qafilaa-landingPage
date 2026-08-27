import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // TWO entries. `index.html` is the marketing site, which is prerendered per route by
      // prerender.mjs and hydrated. `admin/index.html` is the ops console: a separate document,
      // client-rendered only, kept out of the router, the sitemap, the footer and the prerender
      // pipeline on purpose (CLAUDE.md section 7 — every router route must appear in all of those,
      // and none of them is right for an operator surface).
      //
      // Naming it `admin/index.html` rather than `admin.html` matters: it builds to
      // `dist/admin/index.html`, which S3 + CloudFront serve at `/admin/` with no rewrite rule.
      input: {
        main: 'index.html',
        admin: 'admin/index.html',
      },
    },
  },
});

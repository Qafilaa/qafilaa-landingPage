import { defineConfig, devices } from '@playwright/test';

/**
 * Smoke tests run against the real `dist/`, served the way production serves it.
 *
 * Not `vite preview`: it answers every unknown path with index.html, which hides
 * exactly the failures worth catching — a route that never got prerendered, a
 * link to a page that does not exist. `tools/serve-dist.mjs` does directory
 * index resolution and returns 404.html with a real 404, like the CDN.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node tools/serve-dist.mjs 4173',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

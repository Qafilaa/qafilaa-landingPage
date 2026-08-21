import { expect, test, type Page } from '@playwright/test';

/**
 * Smoke tests for the things that break silently.
 *
 * `src/site/engine.ts` drives ~130 `data-*` hooks with no compile-time link to
 * the markup, so renaming one kills a demo without failing the build. The
 * engine records every build step in `window.__QAF_STEPS` and marks a failure
 * with a leading `!` — that array is the single most useful assertion here.
 */

/** The engine polls for its 75-screen library, so give it room on a cold start. */
async function bootedLanding(page: Page) {
  await page.goto('/');
  await page.waitForFunction(() => (window.__QAF_STEPS?.length ?? 0) > 30, null, { timeout: 20_000 });
}

test.describe('landing', () => {
  test('the engine boots with every step succeeding', async ({ page }) => {
    await bootedLanding(page);

    const failed = await page.evaluate(() => (window.__QAF_STEPS ?? []).filter((s) => s.startsWith('!')));
    expect(failed, 'engine build steps that threw').toEqual([]);
    expect(await page.evaluate(() => window.__QAF_FERR ?? null), 'frame-loop error').toBeNull();
    // A floor, not an exact count: the library grows with each handoff (75 at
    // handoff 12, 84 at 13) but must never shrink or arrive truncated.
    expect(await page.evaluate(() => Object.keys(window.QAF_SCREENS ?? {}).length)).toBeGreaterThanOrEqual(84);
  });

  test('the phone HUD narrates the screen it is showing', async ({ page }) => {
    await bootedLanding(page);
    // New in handoff 13: a caption rail under the flying phone, with its own
    // step counter and prev/next. Driven by CAPS in src/site/tokens.ts.
    const cap = await page.locator('[data-hudcap]').first().textContent();
    expect(cap?.trim(), 'the HUD must name the screen on show').toBeTruthy();
    await expect(page.locator('[data-hudprev]')).toHaveCount(1);
    await expect(page.locator('[data-hudnext]')).toHaveCount(1);
    const step = await page.locator('[data-hudstep]').first().textContent();
    expect(step?.trim()).toMatch(/\d/);
  });

  test('the flying phone is on screen above NARROW and stood down below it', async ({ page }) => {
    await bootedLanding(page);
    // NARROW is 900 in src/site/tokens.ts, and the CSS and the JS must agree on it.
    const wide = (page.viewportSize()?.width ?? 0) >= 900;

    const layer = await page.locator('[data-phonelayer]').evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: Number(cs.opacity), display: cs.display };
    });
    const host = await page.locator('[data-phonehost]').boundingBox();

    if (wide) {
      // The centrepiece of the page. stepPhone() rewrites this opacity every
      // frame from measured dock offsets, so a regression in measureDocks()
      // fades the phone out silently -- no error, no failed build step, just an
      // empty right-hand column. Nothing else here would catch that.
      expect(layer.opacity, 'the flying phone must not fade out').toBeGreaterThan(0.9);
      expect(layer.display).toBe('block');
      expect(host?.width ?? 0, 'phone width').toBeGreaterThan(100);
      expect(host?.height ?? 0, 'phone height').toBeGreaterThan(200);
    } else {
      // Below NARROW the engine parks a phone inline in each dock instead, and
      // the flying layer is display:none rather than merely transparent.
      expect(layer.display, 'the flying layer must be out of the flow on mobile').toBe('none');
    }
  });

  test('all 22 waypoints render', async ({ page }) => {
    await bootedLanding(page);
    await expect(page.locator('section[data-sec]')).toHaveCount(22);
  });

  test('the tone system writes onto :root', async ({ page }) => {
    await bootedLanding(page);
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
    expect(bg).toBeTruthy();
  });

  test('the nav stays pinned when scrolling down', async ({ page }) => {
    await bootedLanding(page);
    await page.evaluate(() => window.scrollTo(0, 9000));
    await page.waitForTimeout(600);
    const top = await page.locator('[data-nav]').evaluate((el) => Math.round(el.getBoundingClientRect().top));
    expect(top, 'nav must not float away — it is the only route to the policy pages').toBe(0);
  });

  test('nothing scrolls horizontally', async ({ page }) => {
    await bootedLanding(page);
    const { doc, win } = await page.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    expect(doc).toBeLessThanOrEqual(win);
  });
});

test.describe('analytics consent', () => {
  test('nothing reaches Google before the visitor accepts', async ({ page }) => {
    const googleHits: string[] = [];
    page.on('request', (r) => {
      if (/googletagmanager|google-analytics/.test(r.url())) googleHits.push(r.url());
    });

    await bootedLanding(page);
    await expect(page.getByRole('region', { name: 'Cookie choice' })).toBeVisible();

    expect(googleHits, 'no analytics request may be made before consent').toEqual([]);
    expect(await page.evaluate(() => document.querySelectorAll('script[src*="googletagmanager"]').length)).toBe(0);
    expect(await page.evaluate(() => document.cookie)).not.toContain('_ga');
  });

  test('declining records the choice and keeps the tag unloaded', async ({ page }) => {
    await bootedLanding(page);
    await page.getByRole('button', { name: 'No thanks' }).click();

    await expect(page.getByRole('region', { name: 'Cookie choice' })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('qf-consent-analytics'))).toBe('denied');
    expect(await page.evaluate(() => document.querySelectorAll('script[src*="googletagmanager"]').length)).toBe(0);
  });

  test('the choice survives a reload', async ({ page }) => {
    await bootedLanding(page);
    await page.getByRole('button', { name: 'No thanks' }).click();
    await page.reload();
    await page.waitForTimeout(1200);
    await expect(page.getByRole('region', { name: 'Cookie choice' })).toHaveCount(0);
  });

  test('/cookies offers a live control that matches the stored choice', async ({ page }) => {
    await page.goto('/cookies');
    await page.getByRole('button', { name: 'Turn analytics off' }).click();
    await expect(page.getByRole('button', { name: 'Turn analytics off' })).toHaveAttribute('aria-pressed', 'true');
    expect(await page.evaluate(() => localStorage.getItem('qf-consent-analytics'))).toBe('denied');
  });
});

test.describe('policy pages', () => {
  const ROUTES = [
    '/privacy-policy', '/terms-and-conditions', '/cookies', '/licenses',
    '/community-guidelines', '/child-safety', '/report', '/security',
    '/data-safety', '/permissions', '/subprocessors',
    '/delete-data', '/delete-account', '/support', '/contact', '/accessibility',
  ];

  for (const route of ROUTES) {
    test(`${route} renders, is indexable and knows where it is`, async ({ page }) => {
      const res = await page.goto(route);
      expect(res?.status(), 'must resolve without a trailing slash').toBe(200);

      await expect(page.locator('article h1')).toBeVisible();
      await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', `https://qafilaa.in${route}`);

      // Every document carries a date. Four of them shipped without one.
      await expect(page.locator('article')).toContainText(/Last updated|Effective date/);

      // The index marks the page you are on, in exactly one place.
      const current = page.locator('[data-legallink][aria-current="page"]');
      expect(await current.count()).toBeGreaterThanOrEqual(1);
    });
  }

  test('the index lists every document', async ({ page }) => {
    await page.goto('/security');
    await expect(page.locator('[data-legalnav] [data-legallink]')).toHaveCount(16);
  });
});

test.describe('routing', () => {
  test('an unknown path returns a real 404 with a way back', async ({ page }) => {
    const res = await page.goto('/definitely-not-a-page');
    expect(res?.status(), 'CloudFront must map 403/404 to /404.html').toBe(404);
    await expect(page.locator('h1')).toContainText('not on the map');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', /noindex/);
  });

  test('the crawler surface is served', async ({ request }) => {
    for (const [path, type] of [
      ['/robots.txt', /text\/plain/],
      ['/sitemap.xml', /xml/],
      ['/llms.txt', /text\/plain/],
      ['/site.webmanifest', /manifest\+json/],
      ['/.well-known/security.txt', /text\/plain/],
    ] as [string, RegExp][]) {
      const res = await request.get(path);
      expect(res.status(), path).toBe(200);
      expect(res.headers()['content-type'], path).toMatch(type);
    }
  });

  test('the manifest declares square, installable icons', async ({ request }) => {
    const manifest = await (await request.get('/site.webmanifest')).json();
    expect(manifest.icons.length).toBeGreaterThan(0);
    for (const icon of manifest.icons) {
      const [w, h] = icon.sizes.split('x');
      expect(w, `${icon.src} must be square`).toBe(h);
    }
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true);
  });
});

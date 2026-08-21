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

  test('the flying phone has no floating HUD, but keeps its inline caption', async ({ page }) => {
    await bootedLanding(page);
    const narrow = (page.viewportSize()?.width ?? 0) < 900;

    // Handoff 13 hung a caption panel beside the flying phone; handoff 14 took
    // it out again. It is upstream now, not a divergence of ours.
    await expect(page.locator('[data-phonehud]')).toHaveCount(0);

    // The narrow-width caption strip survived that cut. It is built by
    // inlineDock(), so it exists only below NARROW where the docks go inline.
    if (narrow) expect(await page.locator('[data-icap]').count()).toBeGreaterThan(0);
    else await expect(page.locator('[data-icap]')).toHaveCount(0);
  });

  test('the arrow keys walk the flow', async ({ page }) => {
    await bootedLanding(page);
    test.skip((page.viewportSize()?.width ?? 0) < 900, 'the flying rig only exists above NARROW');
    await page.waitForTimeout(1200);

    const key = () => page.evaluate(() => (window.__QAF as { cur?: { key?: string } })?.cur?.key);
    const before = await key();
    expect(before, 'a dock must be current before the keys mean anything').toBeTruthy();

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(800);
    expect(await key(), 'ArrowRight is wired after buildHud()s removed early return').not.toBe(before);
  });

  test('the flying phone is the same size as the phone beside it', async ({ page }) => {
    await bootedLanding(page);
    test.skip((page.viewportSize()?.width ?? 0) < 900, 'below NARROW the docks go inline');

    // #crew authors its dock and its static at the same data-scale, so any gap
    // between them is fitDocks() shrinking the flying one. It used to shrink by
    // room/PH, which on a short viewport drew the same device 1.7x smaller than
    // its own neighbour in the same row. Re-checked short, since that is where
    // it bit — and where nobody was looking.
    const widths = () =>
      page.evaluate(() => {
        const sec = document.querySelector('#crew')!;
        const w = (sel: string) => Math.round(sec.querySelector(sel)!.getBoundingClientRect().width);
        return { dock: w('[data-dock]'), stat: w('[data-static]') };
      });

    const tall = await widths();
    expect(tall.dock, 'flying phone vs the static phone beside it').toBe(tall.stat);

    const vw = page.viewportSize()!.width;
    await page.setViewportSize({ width: vw, height: 600 });
    await page.waitForTimeout(900);
    const short = await widths();
    expect(short.dock, 'and still equal on a short viewport').toBe(short.stat);
  });

  test('the flying phone is on screen above NARROW and stood down below it', async ({ page }) => {
    await bootedLanding(page);
    // NARROW is 900 in src/site/tokens.ts, and the CSS and the JS must agree on it.
    const wide = (page.viewportSize()?.width ?? 0) >= 900;

    const opacity = () =>
      page.locator('[data-phonelayer]').evaluate((el) => Number(getComputedStyle(el).opacity));
    const display = () =>
      page.locator('[data-phonelayer]').evaluate((el) => getComputedStyle(el).display);

    if (wide) {
      // The centrepiece of the page. stepPhone() rewrites this opacity every
      // frame from measured dock offsets, so a regression in measureDocks()
      // fades the phone out silently -- no error, no failed build step, just an
      // empty right-hand column. Nothing else here would catch that.
      //
      // Polled, not sampled: the layer fades in over .3s and the engine boots
      // before that finishes, so a single read races the transition and lands
      // on whatever frame it caught.
      await expect
        .poll(opacity, { message: 'the flying phone must not fade out', timeout: 6000 })
        .toBeGreaterThan(0.9);
      expect(await display()).toBe('block');

      const host = await page.locator('[data-phonehost]').boundingBox();
      expect(host?.width ?? 0, 'phone width').toBeGreaterThan(100);
      expect(host?.height ?? 0, 'phone height').toBeGreaterThan(200);
    } else {
      // Below NARROW the engine parks a phone inline in each dock instead, and
      // the flying layer is display:none rather than merely transparent.
      expect(await display(), 'the flying layer must be out of the flow on mobile').toBe('none');
    }
  });

  test('all 22 waypoints render', async ({ page }) => {
    await bootedLanding(page);
    await expect(page.locator('section[data-sec]')).toHaveCount(22);
  });

  test('the waypoint paging is armed', async ({ page }) => {
    await bootedLanding(page);
    // New in handoff 14. applySnap() writes the flag onto <html> and the
    // stylesheet reads it, so the two have to agree or paging silently dies.
    await expect(page.locator('html')).toHaveAttribute('data-snap', 'on');

    const snapType = () =>
      page.evaluate(() => getComputedStyle(document.documentElement).scrollSnapType);
    // Browsers serialise `y proximity` back as plain `y` — proximity is the
    // initial strictness — so match the axis, not the authored shorthand.
    expect(await snapType(), 'the y axis must be armed').toMatch(/^y\b/);

    // Both directions, because the flag is the only thing joining applySnap()
    // to the stylesheet: if the off state stopped working, snapSections:false
    // would be silently ignored and there would be no way to turn paging off.
    await page.evaluate(() => { document.documentElement.dataset.snap = 'off'; });
    expect(await snapType(), 'data-snap="off" must disarm it').toBe('none');
  });

  test('every waypoint fills the viewport, and only the over-long ones are flagged', async ({ page }) => {
    await bootedLanding(page);
    await page.waitForTimeout(900);

    const rows = await page.evaluate(() => {
      const vh = window.innerHeight;
      return Array.from(document.querySelectorAll('section[data-sec]')).map((s) => ({
        id: s.id,
        h: Math.round(s.getBoundingClientRect().height),
        tall: s.hasAttribute('data-tall'),
        vh,
      }));
    });

    // min-height:100svh — a panel that comes up short of the fold breaks paging,
    // because the reader lands mid-way between two waypoints.
    expect(rows.filter((r) => r.h < r.vh - 2), 'panels shorter than the viewport').toEqual([]);

    // markTall() is what lets a fling pass through an over-long panel rather than
    // being pinned to its top edge, so the flag has to track the measured height.
    expect(
      rows.filter((r) => r.tall !== r.h > r.vh + 4),
      'data-tall disagrees with the measured height',
    ).toEqual([]);
  });

  test('one wheel gesture moves exactly one waypoint', async ({ page }) => {
    await bootedLanding(page);
    test.skip((page.viewportSize()?.width ?? 0) < 900, 'touch, not wheel, below NARROW');

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(900);
    const tops = await page.evaluate(() =>
      Array.from(document.querySelectorAll('section[data-sec]')).map((s) => (s as HTMLElement).offsetTop));

    await page.mouse.move(240, 400);
    await page.mouse.wheel(0, 240);
    await page.waitForTimeout(1500);

    const y = await page.evaluate(() => window.scrollY);
    expect(
      Math.abs(y - tops[1]),
      `one notch should land on waypoint 2 (${tops[1]}), landed at ${y}`,
    ).toBeLessThan(14);
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

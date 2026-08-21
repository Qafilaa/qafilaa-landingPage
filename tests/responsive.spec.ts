import { expect, test } from '@playwright/test';

/**
 * Mobile responsiveness, asserted rather than eyeballed.
 *
 * The landing page is a fixed-composition design driven by an imperative
 * engine, so responsive breakage is silent: nothing throws, the document never
 * scrolls sideways (something always has `overflow-x:hidden`), and content is
 * simply cut off out of sight. This is the only thing that catches that.
 *
 * Three measurement traps this has to work around, all found the hard way:
 *  - `[data-line]` reveals from `translateY(105%)`, so an un-triggered headline
 *    reports ~2x its own height and reads as clipped when it is not.
 *  - Over-wide graphics are pannable ON PURPOSE — a 900x430 map cannot be shown
 *    whole on a 360px screen with legible labels. Anything inside a horizontal
 *    scroller is out of scope here.
 *  - The app-screen renders are `inert` and `aria-hidden`, so the buttons drawn
 *    inside them are illustrations, not touch targets.
 */

test.setTimeout(300_000);

// Real iPhone widths, and a viewport height that matches what Safari
// actually leaves after its own chrome (~620px, not the nominal 844).
// Testing at 800 tall is what hid a hero that ran 2.5 screens deep.
const WIDTHS = [320, 375, 393, 430, 768];
const VH = 640;

/** Inline links inside a paragraph are exempt from WCAG 2.5.8 target size. */
const AUDIT = `() => {
  document.querySelectorAll('[data-line]').forEach((l) => l.classList.add('in'));
  const vw = window.innerWidth;
  const out = { overflowPx: document.documentElement.scrollWidth - vw, cut: [], tiny: [], tap: [] };

  const label = (el) => {
    const d = Array.from(el.attributes).filter((a) => a.name.startsWith('data-'))
      .map((a) => a.name).slice(0, 2).join(',');
    const sec = el.closest('section[data-sec]');
    return (sec ? sec.id + ' ' : '') + el.tagName.toLowerCase() + (d ? '[' + d + ']' : '');
  };
  const scrollsX = (el) => {
    let p = el.parentElement;
    while (p && p !== document.body) {
      const o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
      p = p.parentElement;
    }
    return false;
  };

  const SKIP = '[data-phonehost],[data-dock],[data-static],[data-screen],svg,[inert],[aria-hidden="true"],[data-skip]';
  const seen = new Set();
  const add = (bucket, tag, k) => { if (!seen.has(tag + k)) { seen.add(tag + k); bucket.push(k); } };

  for (const el of Array.from(document.querySelectorAll('body *'))) {
    if (el.closest(SKIP)) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (el.offsetParent === null && cs.position !== 'fixed') continue;

    const text = (el.textContent || '').trim();
    if ((r.right > vw + 1 || r.left < -1) && !scrollsX(el)) {
      // An element with no text cannot be showing cut-off *content*: these are
      // the decorative pieces -- magnet hit areas, ripples, the convoy dots
      // that animate in from off the left edge.
      if (text) add(out.cut, 'x', label(el) + ' @' + Math.round(r.left) + '..' + Math.round(r.right));
    }

    const fs = parseFloat(cs.fontSize);
    const ownText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent.trim().length > 8);
    if (ownText && fs < 12) add(out.tiny, 't', label(el) + ' ' + fs + 'px');

    const tag = el.tagName.toLowerCase();
    const inProse = !!el.closest('p,li');
    if ((tag === 'a' || tag === 'button') && !inProse && r.height > 0 && r.height < 40) {
      add(out.tap, 's', label(el) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
    }
  }
  return out;
}`;

async function audit(page: import('@playwright/test').Page, route: string) {
  await page.goto(route);
  if (route === '/') {
    await page.waitForFunction(() => (window.__QAF_STEPS?.length ?? 0) > 30, null, { timeout: 20_000 });
    // every reveal trigger has to fire before the measurements mean anything
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += 900) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(25);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1000);
  } else {
    await page.waitForTimeout(400);
  }
  // an IIFE, not a bare function literal: a string passed to evaluate() is an
  // expression, so `() => {...}` would hand back the function itself
  return page.evaluate(`(${AUDIT})()`) as Promise<{
    overflowPx: number; cut: string[]; tiny: string[]; tap: string[];
  }>;
}

for (const route of ['/', '/privacy-policy']) {
  test(`${route} is responsive from 320px up`, async ({ page }, testInfo) => {
    // every case sets its own viewport, so running both projects would
    // measure the same thing twice and double the CI wall-clock
    test.skip(testInfo.project.name !== 'desktop', 'viewport-driven');

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: VH });
      const r = await audit(page, route);

      expect(r.overflowPx, `${route} @${width}: the page must never scroll sideways`).toBeLessThanOrEqual(0);
      expect(r.cut, `${route} @${width}: content past the right edge with no way to reach it`).toEqual([]);
      expect(r.tiny, `${route} @${width}: text under 12px is not readable on a handset`).toEqual([]);
      expect(r.tap, `${route} @${width}: touch targets under 40px`).toEqual([]);
    }
  });
}

test('the inline phone caption is on screen, not parked beside it', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'viewport-driven');
  // [data-strip] is a horizontal scroller from 1240px down. Below NARROW the
  // engine appends the caption as a sibling of the phone, so the scroller used
  // to park it off to the right -- at 320px its first character sat at x=331.
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto('/');
  await page.waitForFunction(() => (window.__QAF_STEPS?.length ?? 0) > 30, null, { timeout: 20_000 });
  await page.waitForTimeout(1800);

  const caps = await page.evaluate(() =>
    Array.from(document.querySelectorAll('[data-icap]')).map((el) => {
      const r = el.getBoundingClientRect();
      return { left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width) };
    }));

  expect(caps.length, 'the inline captions must exist below NARROW').toBeGreaterThan(0);
  expect(caps.filter((c) => c.right > 376 || c.left < 0), 'captions off the side of the screen').toEqual([]);
});

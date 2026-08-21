# CLAUDE.md — Qafilaa Landing Page

> Read automatically by Claude Code at the start of every session. Operating manual for the Qafilaa marketing/waitlist site. Keep it accurate to the code.

---

## 1. What this is

The **public marketing + waitlist site** for Qafilaa (a group motorcycle-riding safety app) at **qafilaa.in**. It is a **standalone repo, separate** from the Flutter app and the .NET backend — it only talks to the backend through the public waitlist API.

Stack: **Vite 5 + React 18 + TypeScript 5**, statically **prerendered** (SSR-at-build) then hydrated. **No CSS framework.** Deploys as **static files to S3 + CloudFront**.

The site is a 1:1 implementation of the **"Qafilaa Site v2"** design handoff (`Qafilaa Site v2.dc.html`). See §3.

---

## 2. Build & SSR/prerender contract

```bash
npm ci           # reproducible install (not npm install)
npm run dev      # Vite dev server
npm run lint     # eslint --max-warnings 0  (run before committing)
npm run typecheck# tsc --noEmit
npm run build    # tsc --noEmit -> vite build (client) -> vite build --ssr -> node prerender.mjs
npm run preview
```

- `npm run build` chains: typecheck → client bundle → SSR bundle (`src/entry-server.tsx`, `renderToString`) → `prerender.mjs` bakes full markup into per-route HTML; `src/main.tsx` then **hydrates** (`hydrateRoot` when `#root` has children, else `createRoot`).
- **Never touch `window`/`document` during render** — confine all browser APIs to `useEffect`/event handlers, or hydration breaks.
- `prerender.mjs` **throws** if `index.html`'s `<head>` meta format drifts. It rewrites title/canonical/description/OG/Twitter per legal route and strips home-only JSON-LD, and copies `public/.well-known` → `dist/.well-known`. Two traps:
  - The three **description** tags (`description`, `og:description`, `twitter:description`) must stay **self-closing** (` />`) — the regexes match up to that.
  - **Never write a tag name in angle brackets inside an `index.html` comment.** The title regex is un-anchored, so a comment mentioning the title tag gets matched instead and the rewrite eats the whole head.
- `npm run preview` serves `/security` etc. from the SPA fallback, so its `<title>` looks wrong. That is a preview-server artifact — the built `dist/<route>/index.html` files are correct. To check them the way S3 does, serve `dist/` with any static server and request the route **with a trailing slash**.

## 3. The design handoff — this is the source of truth

The whole site is transcribed from **`Qafilaa Site v2.dc.html`** (**handoff 13**). It is a complete, working, standalone implementation, and the repo is a faithful port of it, not an interpretation.

| Repo | Handoff lines |
|---|---|
| `index.html` `<head>` | 9–140 (`<helmet>`) |
| `src/index.css` | 143–298 (`<style>`) |
| `src/site/chrome/Chrome.tsx` | 305–388 |
| `src/site/sections/*.tsx` (22 files) | 391–906 |
| `src/site/chrome/Shortcuts.tsx` | 1410 |
| `src/site/legal/*Body.tsx` (6 files) | 933–1401 |
| `src/site/legal/LegalFoot.tsx` | 1403–1406 |
| `src/site/tokens.ts` | 1415–1486 (now includes `CAPS`) |
| `src/site/data.ts` | 1488–1519 |
| `src/site/engine.ts` | 1521–3744 |

**Line numbers shift with every handoff.** They are constants in the generator scripts (§9); when a new
handoff lands, re-derive them rather than nudging them. `genengine.py` asserts every rewrite, so it will
tell you which string anchors moved.

Handoff 12 was a mobile pass (900/480/370 breakpoints, `NARROW`, `reflow`/`refitInline`/`wide`/`applyWide`,
a ResizeObserver). **Handoff 13 added the phone HUD**: a caption rail under the flying device with a flow
name, a step counter, a dot rail and prev/next — `[data-phonehud]` and eight sibling hooks, ten new runtime
methods (`buildHud`, `paintHud`, `goStep`, `drive`, `mode`, `echo`, `seedIdx`, `landFlight`, `inlineCap`,
`fillRange`), a `CAPS` caption table, nine new app screens, a `data-flowname` on every dock, and
Daylight-styled range inputs.

**Ten deliberate departures from the handoff** (numbering is stable across handoffs, so #7 stays struck through rather than closing the gap), each required by a rule below:
1. The waitlist submits through `src/api.ts` so the honeypot + email validation survive (§6), and the hero's social-proof line takes the live backend count.
2. Legal pages are **real prerendered routes**, not the handoff's hash overlay — so `buildLegal`/`openLegal`/`closeLegal` are not ported, `buildLegal` is absent from the `boot()` order array, and cross-links are real `/route` hrefs.
3. `fetchpriority` is emitted via a spread (`{...{ fetchpriority: 'high' }}`) — React 18 renders the camelCase spelling verbatim and warns, and its types reject the lowercase one.
4. **The site footer carries five link columns instead of three**, and the legal tab row is grouped instead of flat, because the six documents the handoff shipped became fifteen — see §8.
5. **Privacy policy §5 gained one paragraph** naming the subprocessors page and confirming third parties give the same or greater protection. App Store Review Guideline 5.1.1 requires that confirmation in the policy itself.
6. **A 404 page** (`src/site/NotFound.tsx` → `dist/404.html`). The handoff has no such screen; a statically prerendered site has no server to render one on demand.
7. ~~The top nav stays pinned.~~ **No longer a divergence** — handoff 13 pins it upstream (*"the bar stays put — it is the only way back to any waypoint"*). The patch was removed from `genengine.py`.
8. **The legal shell is a sticky index, not a pill row**, and the four handoff documents that shipped undated (`delete-account`, `delete-data`, `support`, `security`) gained a `Last updated` line. Fifteen documents as four rows of pills pushed the article 478px down the page and left half the width empty; an undated policy page is a defect in its own right. Both are applied by the generators, not by hand — see §9.
9. **The privacy policy names Firebase Analytics.** The shipped app carries it (`lib/core/analytics/`, wired in `main.dart`), on by default in release and gated by the diagnostics switch in Settings. The handoff's section 2 lists Crashlytics but not Analytics, which left the binding document understating what is collected — Apple 5.1.1 and Play's Data safety both require it named.

10. **The flying phone carries no HUD.** Handoff 13 hung a caption rail under the device — flow name, step counter, dot rail, prev/next — and a matching strip under each inline phone on mobile. Rejected on review: it crowds the section it floats over and reads as chrome rather than as the product. `tools/divergences.py` strips `[data-phonehud]` out of the chrome and `genengine.py` drops the inline strip, keeping the tap that walks the flow. The HUD's engine code stays in place and inert, so putting the block back is the whole of restoring it. **One trap:** `buildHud()`'s `if (!this.hud) return` had to go — the roll-out button and the arrow-key flow navigation are wired *after* it and would have died with the HUD.
11. **The flying phone is sized like the static phone beside it**, not fitted to the viewport. `buildStatics()` floors a static at `.52` and ignores viewport height; the handoff shrank the *flying* phone by `room / PH`, so on a short laptop viewport (~580px) it drew the same device up to **1.7x smaller than its own neighbour in the same row**. `fitDocks()` now mirrors `buildStatics()` above `NARROW`; below it the docks go inline and `inlineDock()` sizes them from their column, so that path is untouched. Checked settled on all 19 docks at 1280x700, 1366x768, 1440x900 and 1920x1080 — none clipped, none under the 92px nav.

Everything else must match the handoff exactly. `tools/verify.py` (see §9) folds these in and then demands a byte-level zero, so **when changing a section, change it to match the handoff** — and if you must diverge, add it to this list first.

## 4. Styling — a runtime tone system, not static tokens

- The page is a **22-waypoint scroll journey**, and each section declares a `data-tone` (`light` / `paper` / `clay` / `night` / `deep`). `engine.ts`'s `paint()` interpolates between the tones of adjacent sections and writes **`--bg --ink --mut --sur --line --card --acc --acc2 --ctr --ctaInk --navbg --navline` onto `document.documentElement`** every frame the tone signature changes.
- So **components reference CSS variables (`var(--ink)`), never imported colour constants.** The tone table lives in `src/site/tokens.ts` (`TONES`), which is the single source of truth for the palette. There is no `src/theme.ts`.
- Section markup is **inline-style objects transcribed literally from the handoff**, hex values included. Do not "tokenise" them — they are already the design's own values, and drift from the handoff is the only thing that can break fidelity.
- `src/index.css` holds the `:root` seed values, the reset, all `@keyframes`, the `[data-*]` behaviour rules and the media queries. Breakpoints: **1500 / 1240 / 1080 / 900 / 760 / 480 / 370**, plus `max-height: 760 / 620` for the readout instrument. Below **900** the engine also switches to its `narrow` path in JS — the phone rig goes inline and wide graphics scroll. That number is `NARROW` in `src/site/tokens.ts`; the CSS and the JS must agree.
- Fonts are **Hanken Grotesk** (body) + **Space Grotesk** (display), from Google Fonts.
- `prefers-reduced-motion` is honoured in `index.css` and again in the engine (`this.calm` disables flight arcs and the auto-demo).

## 5. The engine

`src/site/engine.ts` is a **1:1 port of the handoff's own `class Component extends DCLogic`** — ~1,950 lines, ~90 methods, mounted by `src/site/useSiteEngine.ts` from a `useEffect`.

- It drives the DOM **imperatively via `data-*` hooks** in `src/site/sections` and `src/site/chrome`. **There is no compile-time link between the markup and the engine** — renaming or dropping a `data-*` attribute silently kills a demo. The markup carries ~130 distinct hooks.
- `Landing.tsx` must stay **stateless**. The engine rewrites `innerHTML` on ~40 containers; a React re-render would discard everything it has drawn.
- `boot()` runs 38 build steps, each in its own try/catch, pushing to `window.__QAF_STEPS`. **A failed step appears as `!name`** — that is the first thing to check when something is missing. Frame-loop errors land in `window.__QAF_FERR`.
- It owns: the tone system, the contour field, the left spine, the flying phone (which docks into 19 `[data-dock]` slots and flies between them along a bézier arc), and ~20 built-in demos.
- The class carries an `[key: string]: any` index signature and a file-level `eslint-disable` for `no-explicit-any`. That is deliberate: it is ported untyped JS whose algorithms are load-bearing for the visual result. **Annotate, do not restructure.**
- Register cleanups for every listener/RAF/interval — `destroy()` already removes the four global listeners and hands `:root` back.

**`public/qafilaa-screens.js`** (815 KB raw / 79 KB gzipped) is the handoff's library of **84 pre-rendered real app screens** (75 at handoff 12) plus their CSS, exposed as `window.QAF_SCREENS` / `QAF_SCREEN_LABELS` / `QAF_SCREEN_CSS`. It **must stay in `public/`** so Vite does not bundle it, and it is loaded by a `<script defer>` in `index.html`. The engine's `wait()` polls for it for ~7 s before giving up.

## 6. Waitlist / API

The waitlist form (in `src/site/sections/TheEnd.tsx`) **POSTs to the live backend** via `src/api.ts`:
- `joinWaitlist()` → `POST /api/v1/waitlist`; `getWaitlistCount()` → `GET /api/v1/waitlist/count`.
- API base is `VITE_API_BASE_URL` (defaults to `https://api.qafilaa.in`, trailing slash normalized).
- Keep the honeypot (`[data-wlcompany]`, `name="company"`), client-side email validation (mirror the backend's FluentValidation), and the silent-fallback count behavior on `[data-waitline]`. **Do not reintroduce a "wire this up" TODO** — it's done.

### Analytics consent

**gtag.js is not loaded until the visitor accepts.** Consent Mode v2 defaults are declared denied in
`index.html`, and `window.qfStartAnalytics()` injects the tag only on acceptance — so a first visit makes
**no request to Google and sets no cookie**. Stricter than consent-mode-only on purpose: with
`analytics_storage` denied GA4 still sends cookieless pings, which still transmits an IP.

- `src/consent.ts` is the client half — read, write, and undo. `src/site/ConsentBanner.tsx` asks once;
  `src/site/legal/CookieChoice.tsx` on `/cookies` lets the answer change later, because withdrawal has to be
  as easy as consent.
- **Withdrawing expires the `_ga*` cookies**, and cookies left by a visit from before the gate are cleared on
  arrival. Stopping new cookies is not the same as removing the ones already there.
- The banner is a **sibling of the page in `App.tsx`, never a child of `Landing`** — the engine owns that
  subtree and a re-render would discard everything it has drawn. `App` holds no state; the banner holds its
  own.
- It renders `null` on the server and on first client render, then appears from `useEffect`. Rendering it
  during SSR would be a hydration mismatch for anyone who has already answered.
- It pins Daylight colours rather than using the tone variables, which are rewritten every frame as the
  landing scrolls — a fixed element that restyles itself mid-scroll is unreadable.
- **If you change what is loaded, change `/cookies` in the same commit.** That page makes specific factual
  claims about what is stored and when.

## 7. SEO / content sync rules

- Adding a route requires updating **all of:** `src/routes.ts`, `src/App.tsx`, `prerender.mjs` `PAGES`, and `public/sitemap.xml`. It must also appear in the site footer (`src/site/sections/TheEnd.tsx`) and in `src/site/legal/groups.ts` — `tools/audit.py` fails if a built route is not linked from the footer.
- Legal content is **prerendered routes** rendered by `src/site/legal/LegalRoute.tsx`, **not a modal**. A route missing from `prerender.mjs` is a hard 404 on a static site, and for most of these that is a store rejection. See §8 for what each one satisfies.
- Legal pages pin the Daylight palette locally in `LegalShell.tsx`. Note `--mut` is **`#4A4842`** there, darker than the light tone's `#6E6B63` — a deliberate long-prose readability choice from the handoff.
- Pages written by hand use the typographic primitives in `src/site/legal/prose.tsx`, whose values are lifted from the transcribed pages. Do not hand-roll a new heading style.
- FAQ copy is duplicated as JSON-LD in `index.html` **and** in `src/site/sections/SettingsAndSupport.tsx` — **edit both together**.
- `src/content.ts` holds the real localized launch values and intentionally differs from prototype placeholders — **do not overwrite on a design sync.**

### The crawler and install surface

Hand-maintained files in `public/`. None is generated, so each drifts silently if you forget it:

| File | Purpose | Watch out for |
|---|---|---|
| `robots.txt` | Allows everything, and names the answer-engine crawlers explicitly (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended…) | Nothing is disallowed on purpose — the policy pages are the ones people most need to find |
| `llms.txt` | The curated map answer engines read: what Qafilaa is, the hard facts, and every policy URL with a one-line summary | Update when a route or a headline fact changes |
| `sitemap.xml` | All 16 indexable routes | Hand-maintained. `/404` is **not** in it |
| `site.webmanifest` | PWA install metadata, store `related_applications`, shortcuts | Icons must be **square**; Android rejects non-square |
| `.well-known/security.txt` | RFC 9116 disclosure contact | `Expires` is a hard date — renew it before it lapses or the file is invalid |
| `.well-known/{assetlinks.json,apple-app-site-association}` | App Links / Universal Links | Must serve as `application/json`; the deploy re-tags them |
| `favicon.ico`, `brand/icon-*.png` | Favicon + PWA icon set | **Generated**, not hand-cut — see below |

**Icons are generated.** Every shipped brand asset is landscape (132×80, 180×109, 994×603), so there was no
square icon at all: the favicon was a squashed rectangle and the manifest declared two non-square icons,
which fails installability. The set is built from `brand/logo-mark.png` by a script that trims the
transparent margin and centres the mark on a white square — no recolour, no crop of the artwork. Maskable
variants pad to 60% so the mark survives Android's circular mask. Regenerate rather than editing a PNG.

**Structured data.** The home page carries the full `@graph` (Organization with address/contactPoint/sameAs,
WebSite, MobileApplication with `installUrl`, FAQPage). Every other route gets a per-page
`WebPage`/`ContactPage` + `BreadcrumbList` generated by `ldFor()` in `prerender.mjs`, pointing back at the
home page's `#organization` and `#website` nodes. Policy routes used to have their JSON-LD stripped entirely.

**Caching.** Only `/assets/*` is content-hashed, so only `/assets/*` may be `immutable`. Everything else in
`public/` keeps a stable URL — an immutable `robots.txt` or `qafilaa-screens.js` would pin a stale copy at
every edge for a year. The deploy splits the sync accordingly and re-tags the config files with real
content types.

## 8. Store requirements — what each route is for

Fifteen policy/support routes. Most exist because Apple or Google will reject the app without them, so
**do not delete or rename one without checking what it holds up.** Every one is linked from the site
footer and from the grouped tab row on the legal pages.

| Route | Required by | Why |
| --- | --- | --- |
| `/privacy-policy` | Apple 5.1.1 · Play App content | Mandatory field in both consoles. Must state what is collected, all uses, third parties **and that they give equal protection**, retention, and how to revoke consent or delete. |
| `/terms-and-conditions` | Apple 3.1.2 | Serves as the EULA. Apple wants a functional link if you do not use its standard licence. |
| `/cookies` | GDPR / ePrivacy | Referenced by privacy policy §9. Covers this site's analytics. **The app ships Firebase Analytics too** (`lib/core/analytics/`, on in release, gated by the diagnostics switch) — say so here, on `/data-safety`, and in both store forms, or they disagree. |
| `/community-guidelines` | **Apple 1.2** · Play UGC | An app with user-generated content must publish standards, filter, and act on reports. Commits us to a **24-hour** response. |
| `/child-safety` | **Play Child Safety Standards** | The "published standards against CSAE" URL the Play Console declaration asks for. Must stay globally reachable, name the app as listed, and name a point of contact. |
| `/report` | **Apple 1.2** · Play UGC · EU DSA | The reporting mechanism reachable from outside the app, and the notice-and-action contact point. |
| `/security` | — | Not required; supports the privacy policy's §7 claim. |
| `/data-safety` | Play Data safety · Apple App Privacy | Human-readable mirror of both store forms. **If either form changes, change this too** — a mismatch is worse than not publishing it. |
| `/permissions` | Play prominent disclosure | Backs the background-location declaration and Apple's purpose strings. Rows must match what the app actually requests. |
| `/subprocessors` | **Apple 5.1.1** | Names every third party with access and carries the equal-protection confirmation. |
| `/delete-account` | **Play account deletion** | Must let a user request deletion **without installing the app**. Enforced since April 2024. |
| `/delete-data` | **Play Data safety** | The second deletion URL: delete *some* data without closing the account. |
| `/support` | **Apple Support URL** | Apple will not accept a marketing homepage here. |
| `/contact` | Apple 1.2 · **EU DSA trader** · DPDP Act | Published contact info, trader identity, and the named Grievance Officer. **Must match what is filed in App Store Connect and Play Console.** |
| `/accessibility` | **European Accessibility Act** | In force since 28 June 2025 for services offered in the EU. Claims here must be checkable against the code. |

Plus `dist/404.html`, which is not a route: it is the CDN error document, `noindex`, has no canonical, and
is not in the sitemap. **CloudFront must be pointed at it** — Error Pages → 404 → `/404.html`, response
code 404. Without that the CDN returns its own bare XML error for every typo'd URL.

Two of these carry named-person commitments — the Grievance Officer and the child-safety point of contact.
If the person changes, change `/contact`, `/child-safety`, the privacy policy, and the Play Console
declaration together.

## 9. Verifying fidelity

**The whole pipeline lives in `tools/`** — see `tools/README.md`. It used to sit in a session scratchpad,
which meant the ability to absorb the next handoff would have died with the session.

```bash
npm run design:generate   # gen -> genengine -> anyfix -> gencss
npm run design:verify     # must print 8/8 identical
npm run dist:audit        # routes, heads, links, footer coverage
npm run test              # Playwright smoke suite
```

**Never hand-edit a generated file** — `src/index.css`, `src/site/engine.ts`, `src/site/sections/*`,
`src/site/legal/*Body.tsx` are all output. A change made there survives until the next handoff and then
vanishes; that has already happened twice. Fold it into the generator and add it to the list in §3.

- **`verify.py`** parses the handoff's markup and the prerendered output into trees and compares every tag,
  attribute, CSS declaration and text node, normalising attribute order, declaration order, entity spelling
  and whitespace. It folds in the departures from §3 and then demands zero differences. It is the only
  thing standing between "looks right" and "is right".
- **`gencss.py`** writes `src/index.css` = the handoff's `<style>` block **plus an appendix** holding the legal-shell
  layout (media queries cannot be inline styles). `index.css` is generated — **never hand-edit it**, or the next
  handoff discards the change. Add to the appendix in `gencss.py`.
- **`tools/audit.py`** walks `dist/` and checks every route has its own title and canonical, that no internal
  link 404s, and that every built route is reachable from the footer. `/join` and `404.html` are excluded —
  neither is a routable URL.
- **`tests/smoke.spec.ts`** (Playwright, desktop + mobile) is the only thing that catches a renamed `data-*`
  hook: it asserts `window.__QAF_STEPS` contains no failed step, that no request reaches Google before
  consent, that all 16 policy routes resolve **without a trailing slash** and carry a canonical and a date,
  and that an unknown path returns a real 404. It runs against `tools/serve-dist.mjs`, which mirrors S3 +
  CloudFront rather than `vite preview` — preview answers every unknown path with index.html and would hide
  exactly those failures.
- Both were also run at **375 / 320 / 768 px** against the handoff served side by side: all 22 section offsets
  match and no page scrolls horizontally at any width down to 320.

Run both after any change to a section, a policy page, the footer, or `prerender.mjs`.

## 10. Quality gates & known gaps

- Run `npm run lint` (`--max-warnings 0`) + `npm run typecheck` before committing; tsconfig is strict (`noUnusedLocals`/`noUnusedParameters`). Use `npm ci` for installs.
- **CI does not yet gate lint/typecheck** (`.github/workflows/deploy.yml` only builds + syncs to S3 on push to `main`). That is now the remaining P0 in `docs/PRODUCTION-READINESS.md`; the GA4 consent gate is done.
- **CloudFront error pages are configured out-of-band.** `npm run cloudfront:errors` (or the *CloudFront error pages* workflow, `workflow_dispatch`) points **403 and 404** at `/404.html` — 403 because the origin is REST/OAC and S3 answers a missing key with AccessDenied, not NotFound. It finds the distribution by the `qafilaa.in` alias, so no id is needed and it cannot touch another site in the account. Idempotent, `--dry-run` supported, and deliberately not in the deploy path: it needs `cloudfront:UpdateDistribution`, far broader than the deploy user's `CreateInvalidation`.
- Secrets/env files are gitignored except `.env.example`.
- `public/join/index.html` and `public/.well-known/*` are **standalone deep-link infrastructure**, independent of the React app. Leave them alone.

> This site is the public face of a safety product — keep it fast, accessible, and accurate to what the app actually does.

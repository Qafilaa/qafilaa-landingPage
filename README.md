# Qafilaa — Landing Page

> **Ride together. No one left behind.**

A pixel-faithful React implementation of the **Qafilaa Site v3** design — a light "Daylight" themed site
(`#F7F5F0` paper, `#0E7C86` teal, Hanken Grotesk + Space Grotesk) built as a **22-waypoint scroll journey**
down the Manali–Leh–Manali circuit, with a flying phone that docks section to section showing 75 real
screens from the app.

Qafilaa keeps a whole riding group on one live map — gaps, rally points, last-known positions and one-tap
SOS. Built for rides where the road runs out of signal before it runs out of mountain.

The page is a 1:1 transcription of `Qafilaa Site v3.dc.html`, a complete working prototype produced in
Claude Design. Every colour, dimension, animation curve and interaction is carried across from the source,
and the build is verified against it by an automated structural diff (see [Fidelity](#fidelity)).

🌐 Live site: **[qafilaa.in](https://qafilaa.in/)**

This repo is one of three:

| Repo | What it is |
|---|---|
| **this one** — [`qafilaa-landingPage`](https://github.com/Qafilaa/qafilaa-landingPage) | React + Vite marketing site · [qafilaa.in](https://qafilaa.in) · **also hosts the app's deep-link association files** |
| [`qafilaa-mobile-app`](https://github.com/Qafilaa/qafilaa-mobile-app) | Flutter app (Android + iOS), bundle `app.qafilaa` |
| [`qafilaa-backend-application`](https://github.com/Qafilaa/qafilaa-backend-application) | .NET 10 service, live at `https://api.qafilaa.in` — this site's waitlist API |

> **This site is load-bearing for the mobile app**, not just marketing. It serves the Android App Links and
> iOS Universal Links verification files plus the `/join` invite fallback page. Breaking those breaks invite
> links in the shipped app — see [Deep links & the /join page](#deep-links--the-join-page).

---

## Table of contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [How the build works](#how-the-build-works-ssr-prerender--hydration)
- [What's on the page](#whats-on-the-page)
- [Architecture](#architecture)
- [The engine](#the-engine)
- [Theming — the tone system](#theming--the-tone-system)
- [Routes](#routes)
- [Deep links & the /join page](#deep-links--the-join-page)
- [Fidelity](#fidelity)
- [SEO & analytics](#seo--analytics)
- [Deployment](#deployment)
- [Conventions](#conventions)
- [Documentation](#documentation)

---

## Tech stack

| | |
| --- | --- |
| **Framework** | React 18 + TypeScript 5 (strict) |
| **Bundler** | Vite 5 |
| **Rendering** | Static prerender at build time (`renderToString`), hydrated on load |
| **Styling** | Inline style objects transcribed from the design + CSS custom properties written at runtime. No CSS framework. |
| **Fonts** | Hanken Grotesk (body) + Space Grotesk (display), Google Fonts |
| **Motion** | One imperative runtime (`src/site/engine.ts`), ported from the design handoff |
| **Hosting** | S3 + CloudFront, deployed by GitHub Actions on push to `main` |

Runtime dependencies are **React and React DOM only** — no router, no animation library, no UI kit.

---

## Getting started

### Prerequisites

- **Node.js 18+** (Vite 5 requires Node 18 or 20+)
- npm

### Install & run

```bash
npm ci           # reproducible install — prefer this over `npm install`
npm run dev      # start the dev server (http://localhost:5173)
```

In dev, `#root` is empty so the app mounts a fresh React tree. In production it hydrates prerendered markup.

---

## Scripts

| Script              | What it does                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR.                                                                            |
| `npm run build`     | Type-check, build the client bundle, build the SSR bundle, then prerender static HTML for every route.         |
| `npm run preview`   | Serve the production `dist/` locally to verify the build.                                                      |
| `npm run lint`      | ESLint over `ts`/`tsx` with `--max-warnings 0`.                                                                |
| `npm run typecheck` | `tsc --noEmit` (type-check only, no output).                                                                   |
| `npm run test`      | Playwright smoke suite, desktop + mobile, against the real `dist/`.                                            |
| `npm run design:generate` | Regenerate `src/` from the design handoff in `tools/design/`.                                            |
| `npm run design:verify`   | Diff the build against the handoff. Must print 8/8 identical.                                            |
| `npm run dist:audit`      | Routes, heads, internal links, footer coverage.                                                          |

The full `build` pipeline is:

```bash
tsc --noEmit \
  && vite build \                              # client bundle  -> dist/
  && vite build --ssr src/entry-server.tsx \   # server bundle  -> dist-ssr/
       --outDir dist-ssr \
  && node prerender.mjs                        # bake static HTML for 16 routes + 404
```

---

## How the build works (SSR prerender + hydration)

This project is a **statically prerendered SPA** — there is no Node server at runtime, just static files.

1. **Client build** (`vite build`) emits the hydrating bundle to `dist/`.
2. **Server build** (`vite build --ssr src/entry-server.tsx`) emits a Node-loadable bundle to `dist-ssr/`. Its [entry-server.tsx](src/entry-server.tsx) exposes `render(route)`, returning the app as an HTML string via `renderToString`.
3. **Prerender step** ([prerender.mjs](prerender.mjs)) imports that `render()`, then replaces `<div id="root"></div>` with the rendered markup — once per route, rewriting the per-route `<head>` tags and swapping the home-only JSON-LD for per-page structured data. Crawlers and first byte now receive the full page.
4. **Hydration** ([src/main.tsx](src/main.tsx)) checks whether `#root` already has children — if so it `hydrateRoot`s the prerendered markup; otherwise (dev) it `createRoot`s a fresh tree.

> ⚠️ **SSR safety:** every browser API (`window` / `document`) must live inside `useEffect` or event handlers so nothing touches the DOM during `render()`. The engine already follows this rule.

> ⚠️ **`npm run preview` serves nested routes from the SPA fallback**, so `/security` shows the home page's
> `<title>`. That is a preview-server artifact, not a build defect — the files in `dist/<route>/index.html`
> are correct. To check them the way S3 does, serve `dist/` with any static server and request the route
> **with a trailing slash**.

---

## What's on the page

The landing page is **22 waypoints**, each a `<section>` with its own `data-tone`:

| # | Section | Tone | What it shows |
| --- | --- | --- | --- |
| 00 | Trailhead | light | Hero, route line, waitlist CTA, live convoy screen |
| 01 | The split | night | Why a group ride comes apart — animated road with a gap label |
| 02 | Set up once | light | Profile, bikes, medical card, documents |
| 03 | Permissions | paper | The three permissions and the real reason for each |
| 04 | The send-off | deep | The E20 fuel warning interstitial |
| 05 | Plan the trip | light | Trip creation, dates cascade, overlap guard |
| 06 | Bring the crew | paper | Join code (tap to copy), invites, crew fan |
| 07 | Day-wise plan | light | Leg map + elevation profile + day rail, rally points |
| 08 | Where you sleep | paper | Night-scoped stays |
| 09 | The money | light | Drag-to-split expense demo with a live settle graph |
| 10 | Papers & lists | paper | Checklists, geofenced reminders, permits |
| 11 | Notes | light | Day-tagged notes with a seen-by list |
| 12 | Along the way | paper | Discovery, POIs, smart nudges |
| 13 | The lobby | clay | Readiness board, roles, offline pack download |
| 14 | Roll out | deep | One person calls it; every phone knows |
| 15 | Live convoy | night | Convoy map with a 20-minute replay scrubber + muster board |
| 16 | Navigation | light | The four-rung offline navigation ladder |
| 17 | Safety | night | Runnable crash sequence with countdown and cancel |
| 18 | No signal | paper | Drag the signal down: live → last-known → offline |
| 19 | Settings & support | light | Safety toggles, help centre, FAQ |
| 20 | End of the ride | paper | Share card with a dark toggle, lifetime stats |
| 21 | The end | clay | Waitlist form, stores, footer |

Around them sits fixed chrome: a nav pill with a scroll rail, a left "spine" that tracks progress with a
convoy of dots, a right waypoint rail, a bottom-left altitude/km/stretch readout, a contour-field
background whose density follows the tone, and the flying phone itself.

---

## Architecture

```
src/
  main.tsx                  client entry — hydrate or mount
  entry-server.tsx          build-time renderToString entry
  App.tsx                   route switch (home vs one legal document)
  routes.ts                 pathname <-> route mapping
  api.ts                    waitlist POST + count GET
  content.ts                editable copy and links
  index.css                 :root seed, reset, @keyframes, [data-*] rules, media queries
  Landing.tsx               chrome + the 22 sections, stateless by contract
  site/
    tokens.ts               TONES table, PW/PH, colour helpers
    data.ts                 TRIP, DAYS, CREW — the itinerary every demo is built from
    engine.ts               the imperative runtime (~1,950 lines, ported 1:1)
    useSiteEngine.ts        mounts/destroys the engine from a useEffect
    chrome/                 Chrome.tsx, Shortcuts.tsx
    sections/               22 files, one per waypoint
    legal/                  LegalRoute, LegalShell, LegalFoot + 6 document bodies
public/
  qafilaa-screens.js        75 pre-rendered app screens (815 KB / 79 KB gz)
  brand/                    logo mark, lockup, touch icon, OG cover
  join/index.html           standalone deep-link bounce page
  .well-known/              App Links + Universal Links association files
```

`Landing.tsx` holds **no state**. The engine rewrites `innerHTML` on ~40 containers once it boots, so a React
re-render would discard everything it has drawn.

---

## The engine

[`src/site/engine.ts`](src/site/engine.ts) is a 1:1 port of the design handoff's own runtime class. It owns
everything the markup cannot express, and drives the DOM **imperatively through `data-*` hooks** — there is
**no compile-time link** between the markup and the engine, so renaming or dropping a hook silently kills a
demo. The markup carries ~130 distinct hooks.

`boot()` runs **38 build steps**, each in its own try/catch, pushing its name to `window.__QAF_STEPS`.

```js
// in the browser console on / — this is the first thing to check
window.__QAF_STEPS.filter(s => s[0] === '!')   // must be []  — a `!name` entry is a failed step
window.__QAF_FERR                              // must be undefined — frame-loop error
```

The phone is a single fixed element that flies between 19 `[data-dock]` slots along a bézier arc, drawing a
trail behind it, and swaps screens with push / sheet / tab / replace transitions. Tap it to take over from
the auto-demo; it returns to `Auto` after 9 s idle. Screens come from
[`public/qafilaa-screens.js`](public/qafilaa-screens.js), which **must stay in `public/`** so Vite does not
bundle it, and is loaded by a `<script defer>`.

Keyboard: `J` / `K` move between waypoints, `?` lists shortcuts, `Esc` closes.

---

## Theming — the tone system

There is no static palette. Each section declares a `data-tone` (`light` / `paper` / `clay` / `night` /
`deep`), and the engine's `paint()` **interpolates between the tones of adjacent sections**, writing
`--bg --ink --mut --sur --line --card --acc --acc2 --ctr --ctaInk --navbg --navline` onto the document
element every frame the tone changes. Scrolling from one section to the next fades the whole page — text,
cards, borders, nav glass — from one palette into the other.

So **components reference `var(--ink)`, never an imported colour constant.** The tone table lives in
[`src/site/tokens.ts`](src/site/tokens.ts) and is the single source of truth for the palette.

Breakpoints live in [src/index.css](src/index.css): **1500 / 1240 / 1080 / 900 / 760 / 480 / 370**, plus
`max-height: 760 / 620` for the readout instrument. Below **900 px** the engine also takes its `narrow` path —
the flying phone is retired, each dock renders its screen inline, and wide graphics (the leg map, the settle
graph) become horizontally scrollable strips rather than overflowing. That threshold is `NARROW` in
[src/site/tokens.ts](src/site/tokens.ts); the CSS and the JS must agree.

On a phone the nav pill sheds its waypoint counter, its burger label and — under 370 px — the wordmark, so a
mark, a menu and a call to action still fit inside 320 px. The margin readout hides, section rhythm tightens
to one number per breakpoint, and controls that leaned on a mouse grow to 44 px. Verified against the handoff
at 375 / 320 / 768 px: every section offset matches and **nothing scrolls horizontally down to 320 px**.

`prefers-reduced-motion` is honoured twice: in `index.css`, and again in the engine (`calm` mode drops the
flight arcs and the auto-demo).

---

## Routes

Sixteen prerendered routes, one static HTML file each. [src/routes.ts](src/routes.ts) maps a pathname to a
route so the server and client agree on what to render (no hydration mismatch). The landing page is
[src/Landing.tsx](src/Landing.tsx); every other route is a policy or support document rendered by
[site/legal/LegalRoute.tsx](src/site/legal/LegalRoute.tsx).

Almost all of them exist because a store or a regulator requires them. **Check what a route holds up before
deleting or renaming it.**

| Path | Required by | What it is |
| --- | --- | --- |
| `/` | — | The landing page |
| `/privacy-policy` | Apple 5.1.1 · Play App content | Mandatory in both consoles |
| `/terms-and-conditions` | Apple 3.1.2 | Also serves as the EULA |
| `/cookies` | GDPR / ePrivacy | This site's analytics; the app has none |
| `/community-guidelines` | **Apple 1.2** · Play UGC | Published standards for user-generated content |
| `/child-safety` | **Play Child Safety Standards** | The published CSAE standards URL the declaration asks for |
| `/report` | **Apple 1.2** · EU DSA | Reporting mechanism reachable from outside the app |
| `/security` | — | Supports the privacy policy's security claim |
| `/data-safety` | Play Data safety · Apple App Privacy | Readable mirror of both store forms |
| `/permissions` | Play prominent disclosure | Backs the background-location declaration |
| `/subprocessors` | **Apple 5.1.1** | Named third parties + the equal-protection confirmation |
| `/delete-account` | **Play account deletion** | Must work without installing the app |
| `/delete-data` | **Play Data safety** | Delete some data without closing the account |
| `/support` | **Apple Support URL** | A marketing homepage does not satisfy this |
| `/contact` | Apple 1.2 · **EU DSA trader** · DPDP Act | Trader identity and the Grievance Officer |
| `/accessibility` | **European Accessibility Act** | In force since 28 June 2025 |
| `/licenses` | most OSS licences | Attribution for the 283 packages the app resolves |
| `404.html` | — | The CDN error document. Not a route, `noindex`, not in the sitemap |

They are **real URLs, not a modal** — the design ships them as a hash overlay, and that was deliberately not
adopted, because a hash target is not a URL a store reviewer can open.

> **Adding a route touches six places:** [src/routes.ts](src/routes.ts), [src/App.tsx](src/App.tsx), the
> `PAGES` list in [prerender.mjs](prerender.mjs), [public/sitemap.xml](public/sitemap.xml), the footer in
> [TheEnd.tsx](src/site/sections/TheEnd.tsx), and [site/legal/groups.ts](src/site/legal/groups.ts). Miss one
> and the route either 404s on the CDN, never gets indexed, or cannot be found by the reviewer looking for it.

`/join` is deliberately **not** a React route — see below.

---

## Deep links & the /join page

This repo owns the web half of the mobile app's invite flow. It is the part most likely to be broken by
accident, because nothing on this site visibly depends on it.

```
Host shares an invite from the app  →  https://qafilaa.in/join?c=CODE
                                            │
        ┌───────────────────────────────────┴──────────────────────────────┐
        │  app installed                          app NOT installed        │
        ▼                                                  ▼               │
  OS opens Qafilaa directly                    this site's /join page      │
  (Android App Link / iOS Universal Link)      renders the invite card     │
  verified via /.well-known/                   + sends them to the store   │
```

| File | Role | Breaks what if wrong |
| --- | --- | --- |
| [public/.well-known/assetlinks.json](public/.well-known/assetlinks.json) | Android App Links — lists the app's signing-key SHA-256 fingerprints | Android stops opening invite links; they load the web page instead |
| [public/.well-known/apple-app-site-association](public/.well-known/apple-app-site-association) | iOS Universal Links — associates `app.qafilaa` with this domain | Same, on iOS |
| [public/join/index.html](public/join/index.html) | Standalone fallback page: shows the code, routes to Play/App Store | Invitees without the app hit a dead end |

**Three things to know:**

1. **`/join` is plain HTML on purpose** — no React, no hydration. It must render instantly for someone tapping
   a link on 2G, and it must work even if the main bundle fails.
2. **`assetlinks.json` must list the Play *app-signing* key**, not just the upload key. Google re-signs store
   installs with a different key, so App Links will not verify for Play installs until it is added.
3. **`prerender.mjs` copies `public/.well-known` → `dist/.well-known`** as part of the build, and the deploy
   sets the `application/json` content type. Both matter: served with the wrong type, iOS refuses the file.

More detail lives in [public/.well-known/README.md](public/.well-known/README.md) and, on the app side, in the
mobile repo's `docs/INVITE-DEEPLINKS.md`.

**Verify after any deploy that touches these:**

```bash
curl -s https://qafilaa.in/.well-known/assetlinks.json | head
curl -sI https://qafilaa.in/.well-known/apple-app-site-association | grep -i content-type
open  https://qafilaa.in/join?c=ABC123      # should show the invite card with code ABC123
```

---

## Fidelity

The site is checked against the design handoff structurally, not by eye. The check parses both the handoff's
authored markup and the prerendered output into trees and compares **every tag, attribute, CSS declaration
and text node**, normalising away attribute order, declaration order, entity spelling and whitespace.

Everything the handoff drew is expected to come out **identical**. Nine deviations are folded into the
reference, each required by a rule in [CLAUDE.md](CLAUDE.md):

1. legal cross-links point at real routes rather than hash targets;
2. the waitlist form carries the honeypot input the backend expects;
3. `fetchpriority` is emitted via a spread, because React 18 renders the camelCase spelling verbatim;
4. the footer carries five link columns instead of three, and the legal tab row is grouped, because the six
   documents the handoff shipped became fifteen — the store-required set in [Routes](#routes);
5. privacy policy §5 gained one paragraph naming the subprocessors page and confirming third parties give
   equal protection, which App Store Review Guideline 5.1.1 requires the policy itself to say;
6. a 404 page, which the handoff has no screen for;
7. the top nav stays pinned; the handoff floats it away on a fast scroll down;
8. the legal pages use a sticky index rather than the handoff's pill row, and the four documents that
   shipped undated gained a `Last updated` line;
9. the privacy policy names Firebase Analytics, which the app ships and the handoff's section 2 omitted.

A second script walks `dist/` and checks every route has its own title and canonical, that no internal link
404s, and that every built route is reachable from the footer. Both live in [tools/](tools/README.md) — as does
the handoff itself — and both run in CI.

On top of that, [tests/smoke.spec.ts](tests/smoke.spec.ts) drives the built site in a real browser. It is the
only thing that catches a renamed `data-*` hook, since the engine has no compile-time link to the markup.

If you change a section, change it **to match the handoff**. Divergence should be a decision, recorded here.

---

## SEO & analytics

**Per route.** Title, canonical, description, Open Graph and Twitter tags, all rewritten at prerender time.
Structured data too: the home page carries the full `@graph` (Organization with postal address, contact
points and `sameAs`; WebSite; MobileApplication with store `installUrl`s; FAQPage), and every other route
gets its own `WebPage`/`ContactPage` plus a `BreadcrumbList` pointing back at the home page's entity nodes.

**Geographic.** `html lang="en-IN"`, `hreflang` for `en-IN` / `en` / `x-default`, and geo meta pinned to
Leh, Ladakh — the circuit the whole product is built around. `areaServed` covers India, Nepal and Bhutan.

**Answer engines.** [public/robots.txt](public/robots.txt) names GPTBot, ClaudeBot, PerplexityBot,
Google-Extended, Applebot-Extended and the rest explicitly rather than leaving them to a wildcard, and
[public/llms.txt](public/llms.txt) gives them a curated map: what Qafilaa is, the load-bearing facts, and
every policy URL with a one-line summary. When someone asks an assistant "how do I delete my Qafilaa data",
we would rather it answered from our page than guessed.

**Install and identity.** [public/site.webmanifest](public/site.webmanifest) declares square icons at
96/192/512 plus maskable variants, app shortcuts, and `related_applications` for both stores.
[public/.well-known/security.txt](public/.well-known/security.txt) is RFC 9116 — note its `Expires` date is
hard and must be renewed.

**Icons are generated, not hand-cut.** Every shipped brand asset is landscape, so a square set has to be
built from `brand/logo-mark.png`: trim the transparent margin, centre on white, pad. Maskable variants pad
to 60% so the mark survives Android's circular mask. Before this the favicon was a squashed 132×80 and the
manifest declared two non-square icons, which fails PWA installability.

**Sitemap.** [public/sitemap.xml](public/sitemap.xml) lists all 16 indexable routes and is **hand-maintained**
— update it when routes change. `/404` and `/join` are deliberately absent.

**Analytics, behind a consent gate.** GA4 (`G-V4RB2XKEGK`) is declared in [index.html](index.html), but
**gtag.js is never loaded until the visitor accepts** — until then the site makes no request to Google and
sets no cookie. Consent Mode v2 defaults are declared denied first, so anything reaching the tag later starts
from the right state. [ConsentBanner](src/site/ConsentBanner.tsx) asks once;
[CookieChoice](src/site/legal/CookieChoice.tsx) on `/cookies` lets the answer be changed at any time, and
withdrawing **expires the `_ga*` cookies** rather than just stopping new ones. Cookies left by a visit from
before the gate existed are cleared on arrival.

This is deliberately stricter than consent-mode-only: with `analytics_storage` denied GA4 still sends
cookieless pings, which is arguable under ePrivacy but does transmit an IP. Not loading the script removes
the argument. The site still does not act on Do-Not-Track / GPC — `/cookies` says so rather than claiming
compliance it does not have.

> FAQ copy is duplicated in the [index.html](index.html) JSON-LD **and** in
> [SettingsAndSupport.tsx](src/site/sections/SettingsAndSupport.tsx). Edit both together.

---

## Deployment

**Push to `main` and it ships.** [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) builds and
publishes to **S3 + CloudFront** — there is no server runtime, just static files.

```
push to main
   │
   ├─ npm install  →  npm run build            (typecheck → client → SSR → prerender)
   │
   ├─ s3 sync dist/ --delete --exclude "*.html"
   │      max-age=31536000, immutable                    ← hashed assets
   │
   ├─ s3 cp  *.html
   │      no-cache, no-store, must-revalidate · text/html
   │
   ├─ s3 cp  .well-known/{assetlinks.json,apple-app-site-association}
   │      application/json · max-age=300                 ← re-tagged, because the
   │      bulk sync above marks them immutable/octet-stream and Universal Links
   │      then silently fail
   │
   └─ CloudFront invalidation  /*
```

AWS credentials, bucket, region, and distribution id come from repository secrets
(`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`,
`CLOUDFRONT_DISTRIBUTION_ID`). DNS for `qafilaa.in` is at Hostinger.

> ⚠️ **The deploy workflow does not gate on lint or typecheck** — it only builds and syncs. A type error that
> `vite build` tolerates can reach production. Run the gates yourself before pushing; adding them to CI is the
> P0 item in [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md).

Verify locally before shipping:

```bash
npm run lint && npm run typecheck && npm run build && npm run preview
```

> ⚠️ **One thing the workflow cannot set for you: the CloudFront error document.** The build emits
> `dist/404.html`, but CloudFront has to be told to use it — Distribution → Error Pages → Create custom error
> response → HTTP 404 → response page `/404.html`, response code **404**. Without that, every typo'd URL
> returns CloudFront's bare XML error instead of a page with a way back. Do the same for 403, which is what
> S3 returns for a missing key when the bucket is a REST origin.

> ⚠️ **Cache policy is deliberate.** Only `/assets/*` is content-hashed, so only `/assets/*` is `immutable`.
> Everything else in `public/` keeps a stable URL — an immutable `robots.txt`, `sitemap.xml` or
> `qafilaa-screens.js` would pin a stale copy at every CDN edge and in every browser for a year. The deploy
> splits the sync and re-tags the config files with real content types, because S3 guesses `octet-stream`
> for `.webmanifest` and for extensionless files like `security.txt`.

`dist/` is portable — it will run on Netlify, Vercel, Cloudflare Pages, or GitHub Pages unchanged if the host
ever moves. Only two things must be preserved: `/join` reachable as a path, and `application/json` on the
`.well-known` files.

---

## Conventions

- **Match the handoff.** Section markup is transcribed inline styles, hex values included — those *are* the
  design's values. Do not "tokenise" or tidy them; drift from the handoff is the only thing that breaks fidelity.
- **Colours come from CSS variables**, never imported constants, because the tone system rewrites them at runtime.
- **SSR-safe code** — never touch `window` / `document` during render; confine browser APIs to `useEffect` / handlers.
- **`Landing.tsx` stays stateless** — the engine owns that subtree once it boots.
- **The engine has no compile-time link to the markup.** If you add or rename a `data-*` hook, update
  [engine.ts](src/site/engine.ts) in the same change. Always register cleanups.
- **Lint is strict** — `npm run lint` runs with `--max-warnings 0`, and tsconfig is strict
  (`noUnusedLocals` / `noUnusedParameters`). Keep both clean. `engine.ts` carries a scoped `eslint-disable`
  for `no-explicit-any`; that is deliberate and should not spread to other files.
- `prerender.mjs` **throws** if `index.html`'s `<head>` meta shape drifts. That is intentional — it is the only
  guard that per-route SEO tags still get rewritten. Keep the tag shapes it edits intact, and **never write a
  tag name in angle brackets inside an `index.html` comment** (the title regex would match the comment).
- Honour `prefers-reduced-motion` (already wired in [src/index.css](src/index.css)).

---

## Documentation

| Doc | Purpose |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Operating manual — the rules above in enforceable form, read first |
| [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md) | Prioritised gap list (CI quality gate and GA4 consent are the P0s) |
| [public/.well-known/README.md](public/.well-known/README.md) | What each association file does and how to regenerate it |

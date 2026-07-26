# Qafilaa — Landing Page

> **Ride together. No one left behind.**

A pixel-faithful React implementation of the **Qafilaa** convoy-ride safety app landing page — a dark "Summit" themed coming-soon page with a single teal accent (`#20D6A8`), Space Grotesk + Inter typography, and rich ambient motion.

Qafilaa keeps a whole riding group on one live map — gaps, rally points, last-known positions and one-tap SOS. Built for rides where the road runs out of signal before it runs out of mountain.

The page is a from-scratch React port of an HTML/CSS/JS prototype produced in Claude Design. Every colour, dimension, and animation curve is transcribed 1:1 from the source so the visual output matches the original.

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
- [How the build works (SSR prerender + hydration)](#how-the-build-works-ssr-prerender--hydration)
- [What's on the page](#whats-on-the-page)
- [Architecture](#architecture)
- [Routes](#routes)
- [Deep links & the /join page](#deep-links--the-join-page)
- [Responsive layout](#responsive-layout)
- [Editing content](#editing-content)
- [Theming](#theming)
- [Motion / FX engine](#motion--fx-engine)
- [SEO & analytics](#seo--analytics)
- [Deployment](#deployment)
- [Conventions](#conventions)
- [Documentation](#documentation)

---

## Tech stack

| Concern         | Choice                                              |
| --------------- | --------------------------------------------------- |
| Framework       | React 18 (`react`, `react-dom`)                     |
| Language        | TypeScript 5                                        |
| Bundler / dev   | Vite 5 (`@vitejs/plugin-react`)                     |
| SSR / prerender | `react-dom/server` + a Node post-build step         |
| Styling         | Inline-style objects + design tokens (no CSS framework) |
| Linting         | ESLint 8 (`@typescript-eslint`, react-hooks rules)  |
| Fonts           | Inter + Space Grotesk (Google Fonts)                |

Zero runtime UI dependencies beyond `react` / `react-dom` — styling is done with transcribed inline-style objects plus a small global stylesheet ([src/index.css](src/index.css)) for keyframes, `::selection`, fonts and responsive breakpoints.

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

In dev, `#root` is empty so the app mounts a fresh React tree. In production it hydrates prerendered markup (see below).

---

## Scripts

| Script              | What it does                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR.                                                                            |
| `npm run build`     | Type-check, build the client bundle, build the SSR bundle, then prerender static HTML into `dist/index.html`. |
| `npm run preview`   | Serve the production `dist/` locally to verify the build.                                                      |
| `npm run lint`      | ESLint over `ts`/`tsx` with `--max-warnings 0`.                                                                |
| `npm run typecheck` | `tsc --noEmit` (type-check only, no output).                                                                   |

The full `build` pipeline is:

```bash
tsc --noEmit \
  && vite build \                              # client bundle  -> dist/
  && vite build --ssr src/entry-server.tsx \   # server bundle  -> dist-ssr/
       --outDir dist-ssr \
  && node prerender.mjs                        # inject static HTML into dist/index.html
```

---

## How the build works (SSR prerender + hydration)

This project is a **statically prerendered SPA** — there is no Node server at runtime, just static files.

1. **Client build** (`vite build`) emits the hydrating bundle to `dist/`.
2. **Server build** (`vite build --ssr src/entry-server.tsx`) emits a Node-loadable bundle to `dist-ssr/`. Its [entry-server.tsx](src/entry-server.tsx) exposes `render()`, returning the app as an HTML string via `renderToString`.
3. **Prerender step** ([prerender.mjs](prerender.mjs)) imports that `render()`, then replaces `<div id="root"></div>` in `dist/index.html` with the rendered markup. Crawlers and first byte now receive the full page.
4. **Hydration** ([src/main.tsx](src/main.tsx)) checks whether `#root` already has children — if so it `hydrateRoot`s the prerendered markup; otherwise (dev) it `createRoot`s a fresh tree.

> ⚠️ **SSR safety:** every browser API (`window` / `document`) must live inside `useEffect` or event handlers so nothing touches the DOM during `render()`. The motion engine already follows this rule.

---

## What's on the page

The page is composed top-to-bottom in [src/App.tsx](src/App.tsx) (plus a global cursor scout-light). Legal content (`/privacy-policy`, `/terms-and-conditions`) is rendered as prerendered **routes** via `components/LegalPage.tsx`, not a modal:

| Section | Highlights |
| --- | --- |
| **Nav** | Sticky, blurred bar with the convoy logo and a waitlist CTA |
| **Hero** | Floating phone running `RideScreen` (the live convoy view; `ConvoyMap.tsx` is a legacy/demo map component), drifting topographic terrain, traveling GPS dots, a cursor-following glow, floating telemetry chips, and the e-mail capture |
| **Route marquee** | Infinitely scrolling band of legendary high-altitude passes |
| **Stats band** | Count-up numbers that animate on scroll |
| **Problem** | The "lead can't see the sweep" narrative |
| **Features** | Six tools — live map, gap tracking, rally points, offline-first, sweep & roles, one-tap SOS — with hover lift and a live mini-demo |
| **Offline spotlight** | A user-toggled live vs last-known signal switch (wired imperatively by `useLandingFx`) and live/last-known rider rows |
| **How it works** | Three steps from gate to summit |
| **Safety** | The red one-tap SOS section with a pulsing button |
| **Device showcase** | In-signal vs. past-the-last-bar phones |
| **Waitlist** | Coming-soon CTA with a live countdown to launch and a working form success state |
| **FAQ + Footer** | Answers, footer, and links to the legal pages (`/privacy-policy`, `/terms-and-conditions`) |

---

## Architecture

```
.
├── index.html                  HTML shell: meta/OG/Twitter tags, JSON-LD, GA4, fonts
├── prerender.mjs               Post-build: inject static markup into dist/index.html
├── vite.config.ts              Vite + React plugin
├── tsconfig.json
├── public/
│   ├── robots.txt
│   ├── sitemap.xml
│   ├── qafilaa-icon.png        favicon / apple-touch-icon
│   ├── og-image.png / .svg     social share image
│   ├── join/index.html         invite fallback page (standalone HTML, NOT React)
│   └── .well-known/            App Links + Universal Links verification files
└── src/
    ├── main.tsx                Hydrate (prod) or mount (dev)
    ├── entry-server.tsx        Build-time SSR render() entry
    ├── App.tsx                 Page composition (section order)
    ├── routes.ts               Path → route mapping (home / privacy / terms)
    ├── api.ts                  Waitlist client for the live backend
    ├── theme.ts                Design tokens (colours, fonts, layout, easing)
    ├── content.ts              Editable copy (launch label, hero subhead, passes…)
    ├── index.css               Reset, fonts, every @keyframes, reduced-motion, breakpoints
    ├── hooks/
    │   ├── useLandingFx.ts     Imperative pointer-driven motion engine
    │   ├── useReveal.ts        Scroll-triggered entrance animation (IntersectionObserver)
    │   ├── useCountUp.ts       Eased count-up for the stat band
    │   ├── useCountdown.ts     Live countdown to the launch instant
    │   ├── usePointerGlow.ts   Cursor-following hero glow
    │   ├── useTerrain.ts       Drifting topographic terrain layer
    │   └── useHover.ts         Inline-style :hover / :focus helper
    └── components/             One file per section + shared primitives
        └── ConvoyMap.tsx       Reusable SVG phone map (live / stale / offline / solo)
```

---

## Routes

Three prerendered routes, one static HTML file each. [src/routes.ts](src/routes.ts) maps a pathname to a route
so the server and client agree on what to render (no hydration mismatch).

| Path | Route | Rendered by |
| --- | --- | --- |
| `/` | `home` | [src/Landing.tsx](src/Landing.tsx) |
| `/privacy-policy` | `privacy` | [components/LegalPage.tsx](src/components/LegalPage.tsx) |
| `/terms-and-conditions` | `terms` | [components/LegalPage.tsx](src/components/LegalPage.tsx) |

> **Adding a route touches four files, not one:** [src/routes.ts](src/routes.ts), [src/App.tsx](src/App.tsx),
> the `PAGES` list in [prerender.mjs](prerender.mjs), and [public/sitemap.xml](public/sitemap.xml). Miss one
> and the route either 404s on the CDN or never gets indexed.

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

## Responsive layout

The page is fully responsive across desktop, tablet and mobile. Breakpoints live in [src/index.css](src/index.css) and target `data-*` hooks on the relevant elements (they use `!important` to override the desktop inline styles):

- **≤1000px** — feature grid drops to 2 columns.
- **≤880px** — hero collapses to a single column, nav text links hide (the waitlist CTA stays), hero padding tightens.
- **≤640px** — section gutters shrink, feature grid goes single-column, the wide feature card restacks vertically, floating hero chips hide, and the SOS visual recenters below its copy.
- **≤430px** — the hero phone scales down and the countdown tiles compress.
- **≤360px** — tightest mobile pass; plus a landscape `max-height: 560` rule.

The stat band, offline spotlight and how-it-works grids use intrinsic `auto-fit` / `minmax` tracks, so they reflow without explicit breakpoints.

---

## Editing content

Most user-facing copy and configuration lives in [src/content.ts](src/content.ts):

- `site.brand`, `site.launchLabel`, `site.heroSub`
- `site.waitlistCount` — raw number, rendered as a localized string with a trailing `+`
- `site.launchDate` — the instant the countdown ticks toward
- `navLinks` — top-nav anchors
- `passes` — legendary passes scrolled in the route marquee

> **Note:** the values in `content.ts` are the real/localized launch values — they intentionally differ from prototype/design placeholders and should not be overwritten on a design sync.

Section-specific copy (FAQ answers, feature blurbs, etc.) lives inside each component under [src/components/](src/components/). The FAQ text is duplicated as JSON-LD in [index.html](index.html) — keep both in sync if you edit questions/answers.

### Waitlist form

[src/components/WaitlistForm.tsx](src/components/WaitlistForm.tsx) is shared by the hero and the closing CTA. Submitting either instance flips the whole page into its "you're on the list" success state (a shared `submitted` flag lifted to `App`). It includes a hidden honeypot field (`name="company"`) for bot filtering.

> The form already persists signups to the live backend via [src/api.ts](src/api.ts) (`joinWaitlist` → `POST /api/v1/waitlist`, `getWaitlistCount` → `GET /api/v1/waitlist/count`). API base is `VITE_API_BASE_URL` (defaults to `https://api.qafilaa.in`). It handles duplicates, client-side email validation (mirroring the backend), and a silent-fallback live count.

---

## Theming

Design tokens are centralized in [src/theme.ts](src/theme.ts) — the "Summit" palette:

- Colours: `bg` (near-black forest green), `accent` (teal `#20D6A8`), text tiers, surfaces, plus semantic `success` / `warning` / `danger` / `stale`.
- Fonts: `display` (Space Grotesk), `body` (Inter).
- `layout` (max width / gutter) and a shared `EASE` cubic-bezier used by reveals and button lifts.

Components import these tokens rather than hardcoding values, so palette changes propagate site-wide.

### A note on reveals

The original prototype animated its sections in on a timer because its preview ran inside a content-sized iframe where `IntersectionObserver` never fired. On a real site the intended behaviour is scroll-tied reveals, so this port uses an `IntersectionObserver`-based `useReveal` hook while keeping the exact same opacity/transform/easing values.

---

## Motion / FX engine

[src/hooks/useLandingFx.ts](src/hooks/useLandingFx.ts) is an imperative engine that runs once on mount and drives behaviour directly on the live DOM via `data-*` attributes under `#qf-landing`:

- `data-tilt` — 3D tilt + glare on cards/phones
- `data-magnetic` — magnetic buttons
- `data-cursor` — lagging cursor scout-light
- parallax diorama, GPS particles, and the hold-to-send SOS

Reveal cascades, counters, the connectivity banner and the countdown live in their own dedicated hooks; the FX engine only owns pointer-driven motion. All listeners register cleanups for unmount.

---

## SEO & analytics

Configured in [index.html](index.html):

- `<title>`, `<meta name="description">`, `theme-color`, `robots`, canonical URL
- Open Graph + Twitter card tags (share title / description / image)
- **JSON-LD** structured data: `Organization`, `WebSite`, `SoftwareApplication`, and a `FAQPage`
- **Google Analytics 4** (gtag) — verify the Measurement ID is the production property before relying on data
- [public/robots.txt](public/robots.txt) and [public/sitemap.xml](public/sitemap.xml)

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

`dist/` is portable — it will run on Netlify, Vercel, Cloudflare Pages, or GitHub Pages unchanged if the host
ever moves. Only two things must be preserved: `/join` reachable as a path, and `application/json` on the
`.well-known` files.

---

## Conventions

- **Inline styles + tokens**, not a CSS framework — match the surrounding component's style-object pattern when adding UI. No new CSS files, no hardcoded hex.
- **SSR-safe code** — never touch `window` / `document` during render; confine browser APIs to `useEffect` / handlers. Hydration breaks otherwise.
- **Lint is strict** — `npm run lint` runs with `--max-warnings 0`, and tsconfig is strict (`noUnusedLocals` / `noUnusedParameters`). Keep both clean.
- **The FX engine has no compile-time link to components.** `useLandingFx.ts` drives motion through `data-*` attributes; if you add or rename a `data-*` hook in a component, update the engine in the same change. Always register cleanups.
- Keep FAQ copy in [index.html](index.html) JSON-LD in sync with the [Faq](src/components/Faq.tsx) component.
- `prerender.mjs` **throws** if `index.html`'s `<head>` meta shape drifts. That is intentional — it is the only guard that per-route SEO tags still get rewritten. Keep the tag shapes it edits intact.
- Honour `prefers-reduced-motion` (already wired in [src/index.css](src/index.css)).

---

## Documentation

| Doc | Purpose |
| --- | --- |
| [CLAUDE.md](CLAUDE.md) | Operating manual — the rules above in enforceable form, read first |
| [docs/PRODUCTION-READINESS.md](docs/PRODUCTION-READINESS.md) | Prioritised gap list (CI quality gate and GA4 consent are the P0s) |
| [public/.well-known/README.md](public/.well-known/README.md) | What each association file does and how to regenerate it |

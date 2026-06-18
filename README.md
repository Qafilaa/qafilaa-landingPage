# Qafilaa — Landing Page

> **Ride together. No one left behind.**

A pixel-faithful React implementation of the **Qafilaa** convoy-ride safety app landing page — a dark "Summit" themed coming-soon page with a single teal accent (`#20D6A8`), Space Grotesk + Inter typography, and rich ambient motion.

Qafilaa keeps a whole riding group on one live map — gaps, rally points, last-known positions and one-tap SOS. Built for rides where the road runs out of signal before it runs out of mountain.

The page is a from-scratch React port of an HTML/CSS/JS prototype produced in Claude Design. Every colour, dimension, and animation curve is transcribed 1:1 from the source so the visual output matches the original.

🌐 Live site: **[qafilaa.in](https://qafilaa.in/)**

---

## Table of contents

- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [How the build works (SSR prerender + hydration)](#how-the-build-works-ssr-prerender--hydration)
- [What's on the page](#whats-on-the-page)
- [Architecture](#architecture)
- [Responsive layout](#responsive-layout)
- [Editing content](#editing-content)
- [Theming](#theming)
- [Motion / FX engine](#motion--fx-engine)
- [SEO & analytics](#seo--analytics)
- [Deployment](#deployment)
- [Conventions](#conventions)

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
npm install
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

The page is composed top-to-bottom in [src/App.tsx](src/App.tsx) (plus a global cursor scout-light and the `LegalModal`):

| Section | Highlights |
| --- | --- |
| **Nav** | Sticky, blurred bar with the convoy logo and a waitlist CTA |
| **Hero** | Floating phone running the live `ConvoyMap`, drifting topographic terrain, traveling GPS dots, a cursor-following glow, floating telemetry chips, and the e-mail capture |
| **Route marquee** | Infinitely scrolling band of legendary high-altitude passes |
| **Stats band** | Count-up numbers that animate on scroll |
| **Problem** | The "lead can't see the sweep" narrative |
| **Features** | Six tools — live map, gap tracking, rally points, offline-first, sweep & roles, one-tap SOS — with hover lift and a live mini-demo |
| **Offline spotlight** | A self-cycling connectivity banner (live → weak → lost → syncing) and live/last-known rider rows |
| **How it works** | Three steps from gate to summit |
| **Safety** | The red one-tap SOS section with a pulsing button |
| **Device showcase** | In-signal vs. past-the-last-bar phones |
| **Waitlist** | Coming-soon CTA with a live countdown to launch and a working form success state |
| **FAQ + Footer** | Answers, footer, and legal modal |

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
│   └── og-image.png / .svg     social share image
└── src/
    ├── main.tsx                Hydrate (prod) or mount (dev)
    ├── entry-server.tsx        Build-time SSR render() entry
    ├── App.tsx                 Page composition (section order)
    ├── theme.ts                Design tokens (colours, fonts, layout, easing)
    ├── content.ts              Editable copy (launch label, hero subhead, passes…)
    ├── index.css               Reset, fonts, every @keyframes, reduced-motion, breakpoints
    ├── hooks/
    │   ├── useLandingFx.ts     Imperative pointer-driven motion engine
    │   ├── useReveal.ts        Scroll-triggered entrance animation (IntersectionObserver)
    │   ├── useCountUp.ts       Eased count-up for the stat band
    │   ├── useCountdown.ts     Live countdown to the launch instant
    │   ├── useCyclingBanner.ts Connectivity-status state machine
    │   ├── usePointerGlow.ts   Cursor-following hero glow
    │   └── useHover.ts         Inline-style :hover / :focus helper
    └── components/             One file per section + shared primitives
        └── ConvoyMap.tsx       Reusable SVG phone map (live / stale / offline / solo)
```

---

## Responsive layout

The page is fully responsive across desktop, tablet and mobile. Breakpoints live in [src/index.css](src/index.css) and target `data-*` hooks on the relevant elements (they use `!important` to override the desktop inline styles):

- **≤1000px** — feature grid drops to 2 columns.
- **≤860px** — hero collapses to a single column, nav text links hide (the waitlist CTA stays), hero padding tightens.
- **≤640px** — section gutters shrink to 18px, feature grid goes single-column, the wide feature card restacks vertically, floating hero chips hide, and the SOS visual recenters below its copy.
- **≤420px** — the hero phone scales down and the countdown tiles compress.

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

> The form currently captures and toggles UI state on submit; wire `onSubmit` to your backend / email provider to actually persist signups.

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

`npm run build` produces a fully static `dist/` (HTML with prerendered markup + hashed assets). Deploy `dist/` to any static host (Netlify, Vercel, Cloudflare Pages, S3 + CDN, GitHub Pages, etc.). No server runtime is required.

Verify locally before shipping:

```bash
npm run build
npm run preview
```

---

## Conventions

- **Inline styles + tokens**, not a CSS framework — match the surrounding component's style-object pattern when adding UI.
- **SSR-safe code** — never touch `window` / `document` during render; confine browser APIs to `useEffect` / handlers.
- **Lint is strict** — `npm run lint` runs with `--max-warnings 0`; keep it clean.
- Keep FAQ copy in [index.html](index.html) JSON-LD in sync with the [Faq](src/components/Faq.tsx) component.

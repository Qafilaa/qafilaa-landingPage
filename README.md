# Qafilaa — Landing Page

> Ride together. No one left behind.

A pixel-faithful React implementation of the **Qafilaa** convoy-ride safety app
landing page — a dark "Summit" themed coming-soon page with a single teal accent
(`#20D6A8`), Space Grotesk + Inter typography, and rich ambient motion.

The page is a from-scratch React port of an HTML/CSS/JS prototype produced in
Claude Design. Every colour, dimension, and animation curve is transcribed 1:1
from the source so the visual output matches the original.

## Tech stack

- **Vite** + **React 18** + **TypeScript**
- Zero runtime UI dependencies — styling is done with transcribed inline-style
  objects plus a small global stylesheet for keyframes, `::selection` and fonts.

## Getting started

```bash
npm install
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check + production build into dist/
npm run preview  # preview the production build
npm run lint     # lint
```

## What's on the page

| Section | Highlights |
| --- | --- |
| **Nav** | Sticky, blurred bar with the convoy logo and a waitlist CTA |
| **Hero** | Floating phone running the live `ConvoyMap`, drifting topographic terrain, traveling GPS dots, a cursor-following glow, floating telemetry chips, and the e-mail capture |
| **Route marquee** | Infinitely scrolling band of legendary high-altitude passes |
| **Stats band** | Count-up numbers (5,602 m / 100% / 0 / 12) that animate on scroll |
| **Problem** | The "lead can't see the sweep" narrative |
| **Features** | Six tools — live map, gap tracking, rally points, offline-first, sweep & roles, one-tap SOS — with hover lift and a live mini-demo |
| **Offline spotlight** | A self-cycling connectivity banner (live → weak → lost → syncing) and live/last-known rider rows |
| **How it works** | Three steps from gate to summit |
| **Safety** | The red one-tap SOS section with a pulsing button |
| **Device showcase** | In-signal vs. past-the-last-bar phones |
| **Waitlist** | Coming-soon CTA with a live countdown to launch and a working form success state |
| **FAQ + Footer** | Five answers and a footer |

## Architecture

```
src/
  theme.ts                 Design tokens (colours, fonts, layout, easing)
  content.ts               Editable copy (launch label, hero subhead, passes…)
  index.css                Reset, fonts, every @keyframes, reduced-motion
  hooks/
    useReveal.ts           Scroll-triggered entrance animation (IntersectionObserver)
    useCountUp.ts          Eased count-up for the stat band
    useCountdown.ts        Live countdown to the launch instant
    useCyclingBanner.ts    Connectivity-status state machine
    usePointerGlow.ts      Cursor-following hero glow
    useHover.ts            Inline-style :hover / :focus helper
  components/              One file per section + shared primitives
    ConvoyMap.tsx          Reusable SVG phone map (live / stale / offline / solo)
```

### Responsive layout

The page is fully responsive across desktop, tablet and mobile. Breakpoints
live in `src/index.css` and target `data-*` hooks on the relevant elements
(they use `!important` to override the desktop inline styles):

- **≤1000px** — feature grid drops to 2 columns.
- **≤860px** — hero collapses to a single column, nav text links hide (the
  waitlist CTA stays), hero padding tightens.
- **≤640px** — section gutters shrink to 18px, feature grid goes single-column,
  the wide feature card restacks vertically, floating hero chips hide, and the
  SOS visual recenters below its copy.
- **≤420px** — the hero phone scales down and the countdown tiles compress.

The stat band, offline spotlight and how-it-works grids use intrinsic
`auto-fit` / `minmax` tracks, so they reflow without explicit breakpoints.

### A note on reveals

The original prototype animated its sections in on a timer because its preview
ran inside a content-sized iframe where `IntersectionObserver` never fired. On a
real site the intended behaviour is scroll-tied reveals, so this port uses an
`IntersectionObserver`-based `useReveal` hook while keeping the exact same
opacity/transform/easing values.

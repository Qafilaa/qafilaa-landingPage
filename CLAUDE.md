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

The whole site is transcribed from **`Qafilaa Site v2.dc.html`** (handoff 11). It is a complete, working, standalone implementation, and the repo is a faithful port of it, not an interpretation.

| Repo | Handoff lines |
|---|---|
| `index.html` `<head>` | 9–141 (`<helmet>`) |
| `src/index.css` | 143–221 (`<style>`) |
| `src/site/chrome/Chrome.tsx` | 228–292 |
| `src/site/sections/*.tsx` (22 files) | 295–810 |
| `src/site/chrome/Shortcuts.tsx` | 1314 |
| `src/site/legal/*Body.tsx` (6 files) | 837–1305 |
| `src/site/legal/LegalFoot.tsx` | 1307–1310 |
| `src/site/tokens.ts` | 1319–1338 |
| `src/site/data.ts` | 1340–1371 |
| `src/site/engine.ts` | 1373–3262 |

**Five deliberate departures from the handoff**, each required by a rule below:
1. The waitlist submits through `src/api.ts` so the honeypot + email validation survive (§6), and the hero's social-proof line takes the live backend count.
2. Legal pages are **real prerendered routes**, not the handoff's hash overlay — so `buildLegal`/`openLegal`/`closeLegal` are not ported, `buildLegal` is absent from the `boot()` order array, and cross-links are real `/route` hrefs.
3. `fetchpriority` is emitted via a spread (`{...{ fetchpriority: 'high' }}`) — React 18 renders the camelCase spelling verbatim and warns, and its types reject the lowercase one.
4. **The site footer carries five link columns instead of three**, and the legal tab row is grouped instead of flat, because the six documents the handoff shipped became fifteen — see §8.
5. **Privacy policy §5 gained one paragraph** naming the subprocessors page and confirming third parties give the same or greater protection. App Store Review Guideline 5.1.1 requires that confirmation in the policy itself.

Everything else must match the handoff exactly. `scratchpad/verify.py` (see §9) folds these five in and then demands a byte-level zero, so **when changing a section, change it to match the handoff** — and if you must diverge, add it to this list first.

## 4. Styling — a runtime tone system, not static tokens

- The page is a **22-waypoint scroll journey**, and each section declares a `data-tone` (`light` / `paper` / `clay` / `night` / `deep`). `engine.ts`'s `paint()` interpolates between the tones of adjacent sections and writes **`--bg --ink --mut --sur --line --card --acc --acc2 --ctr --ctaInk --navbg --navline` onto `document.documentElement`** every frame the tone signature changes.
- So **components reference CSS variables (`var(--ink)`), never imported colour constants.** The tone table lives in `src/site/tokens.ts` (`TONES`), which is the single source of truth for the palette. There is no `src/theme.ts`.
- Section markup is **inline-style objects transcribed literally from the handoff**, hex values included. Do not "tokenise" them — they are already the design's own values, and drift from the handoff is the only thing that can break fidelity.
- `src/index.css` holds the `:root` seed values, the reset, all `@keyframes`, the `[data-*]` behaviour rules and the media queries. Breakpoints: **1500 / 1240 / 1080 / 760**, plus `max-height: 760 / 620` for the readout instrument.
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

**`public/qafilaa-screens.js`** (815 KB raw / 79 KB gzipped) is the handoff's library of **75 pre-rendered real app screens** plus their CSS, exposed as `window.QAF_SCREENS` / `QAF_SCREEN_LABELS` / `QAF_SCREEN_CSS`. It **must stay in `public/`** so Vite does not bundle it, and it is loaded by a `<script defer>` in `index.html`. The engine's `wait()` polls for it for ~7 s before giving up.

## 6. Waitlist / API

The waitlist form (in `src/site/sections/TheEnd.tsx`) **POSTs to the live backend** via `src/api.ts`:
- `joinWaitlist()` → `POST /api/v1/waitlist`; `getWaitlistCount()` → `GET /api/v1/waitlist/count`.
- API base is `VITE_API_BASE_URL` (defaults to `https://api.qafilaa.in`, trailing slash normalized).
- Keep the honeypot (`[data-wlcompany]`, `name="company"`), client-side email validation (mirror the backend's FluentValidation), and the silent-fallback count behavior on `[data-waitline]`. **Do not reintroduce a "wire this up" TODO** — it's done.

## 7. SEO / content sync rules

- Adding a route requires updating **all of:** `src/routes.ts`, `src/App.tsx`, `prerender.mjs` `PAGES`, and `public/sitemap.xml`. It must also appear in the site footer (`src/site/sections/TheEnd.tsx`) and in `src/site/legal/groups.ts` — `scratchpad/audit.py` fails if a built route is not linked from the footer.
- Legal content is **prerendered routes** rendered by `src/site/legal/LegalRoute.tsx`, **not a modal**. A route missing from `prerender.mjs` is a hard 404 on a static site, and for most of these that is a store rejection. See §8 for what each one satisfies.
- Legal pages pin the Daylight palette locally in `LegalShell.tsx`. Note `--mut` is **`#4A4842`** there, darker than the light tone's `#6E6B63` — a deliberate long-prose readability choice from the handoff.
- Pages written by hand use the typographic primitives in `src/site/legal/prose.tsx`, whose values are lifted from the transcribed pages. Do not hand-roll a new heading style.
- FAQ copy is duplicated as JSON-LD in `index.html` **and** in `src/site/sections/SettingsAndSupport.tsx` — **edit both together**.
- `src/content.ts` holds the real localized launch values and intentionally differs from prototype placeholders — **do not overwrite on a design sync.**

## 8. Store requirements — what each route is for

Fifteen policy/support routes. Most exist because Apple or Google will reject the app without them, so
**do not delete or rename one without checking what it holds up.** Every one is linked from the site
footer and from the grouped tab row on the legal pages.

| Route | Required by | Why |
| --- | --- | --- |
| `/privacy-policy` | Apple 5.1.1 · Play App content | Mandatory field in both consoles. Must state what is collected, all uses, third parties **and that they give equal protection**, retention, and how to revoke consent or delete. |
| `/terms-and-conditions` | Apple 3.1.2 | Serves as the EULA. Apple wants a functional link if you do not use its standard licence. |
| `/cookies` | GDPR / ePrivacy | Referenced by privacy policy §9. Covers this site's analytics only — the app has no analytics SDK. |
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

Two of these carry named-person commitments — the Grievance Officer and the child-safety point of contact.
If the person changes, change `/contact`, `/child-safety`, the privacy policy, and the Play Console
declaration together.

## 9. Verifying fidelity

Two scripts, kept in the session scratchpad rather than the repo (rebuild them if they are gone — the
approach matters more than the file):

- **`verify.py`** parses the handoff's markup and the prerendered output into trees and compares every tag,
  attribute, CSS declaration and text node, normalising attribute order, declaration order, entity spelling
  and whitespace. It folds in the five departures from §3 and then demands zero differences. It is the only
  thing standing between "looks right" and "is right".
- **`audit.py`** walks `dist/` and checks every route has its own title and canonical, that JSON-LD appears
  on the home page only, that no internal link 404s, and that every built route is reachable from the footer.

Run both after any change to a section, a policy page, the footer, or `prerender.mjs`.

## 10. Quality gates & known gaps

- Run `npm run lint` (`--max-warnings 0`) + `npm run typecheck` before committing; tsconfig is strict (`noUnusedLocals`/`noUnusedParameters`). Use `npm ci` for installs.
- **CI does not yet gate lint/typecheck** (`.github/workflows/deploy.yml` only builds + syncs to S3 on push to `main`). See `docs/PRODUCTION-READINESS.md` — adding a lint/typecheck gate and a GA4 consent gate are the P0 items.
- Secrets/env files are gitignored except `.env.example`.
- `public/join/index.html` and `public/.well-known/*` are **standalone deep-link infrastructure**, independent of the React app. Leave them alone.

> This site is the public face of a safety product — keep it fast, accessible, and accurate to what the app actually does.

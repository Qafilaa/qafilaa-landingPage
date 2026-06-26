# CLAUDE.md — Qafilaa Landing Page

> Read automatically by Claude Code at the start of every session. Operating manual for the Qafilaa marketing/waitlist site. Keep it accurate to the code.

---

## 1. What this is

The **public marketing + waitlist site** for Qafilaa (a group motorcycle-riding safety app) at **qafilaa.in**. It is a **standalone repo, separate** from the Flutter app and the .NET backend — it only talks to the backend through the public waitlist API.

Stack: **Vite 5 + React 18 + TypeScript 5**, statically **prerendered** (SSR-at-build) then hydrated. **No CSS framework** — UI is inline-style objects + design tokens in `src/theme.ts`, with responsive/keyframe overrides in `src/index.css`. Deploys as **static files to S3 + CloudFront**.

---

## 2. Build & SSR/prerender contract

```bash
npm ci          # reproducible install (not npm install)
npm run dev      # Vite dev server
npm run lint     # eslint --max-warnings 0  (run before committing)
npm run typecheck# tsc --noEmit
npm run build    # tsc --noEmit -> vite build (client) -> vite build --ssr (server) -> node prerender.mjs
npm run preview
```

- `npm run build` chains: typecheck → client bundle → SSR bundle (`src/entry-server.tsx`, `renderToString`) → `prerender.mjs` bakes full markup into per-route HTML; `src/main.tsx` then **hydrates** (`hydrateRoot` when `#root` has children, else `createRoot`).
- **Never touch `window`/`document` during render** — confine all browser APIs to `useEffect`/event handlers, or hydration breaks.
- `prerender.mjs` **throws** if `index.html`'s `<head>` meta format drifts (missing placeholders/meta) — keep the meta tag shapes it rewrites intact. It also rewrites title/canonical/description/OG/Twitter per legal route and strips home-only JSON-LD; and copies `public/.well-known` → `dist/.well-known`.

## 3. Styling conventions

- Use inline-style objects + tokens from `src/theme.ts` (colors/fonts/layout/`EASE`). **No new CSS files; no hardcoded hex.**
- Responsive overrides live in `src/index.css`, keyed on `data-*` attributes with `!important`. Breakpoints: **1000 / 880 / 640 / 430 / 360** px, plus a landscape `max-height: 560` rule. All `@keyframes` live in `index.css`.
- Honor `prefers-reduced-motion` (already wired in `index.css`).

## 4. Motion engine

`src/hooks/useLandingFx.ts` is an **imperative engine** that drives motion directly on the DOM via `data-*` attributes under `#qf-landing` (`data-tilt`, `data-magnetic`, `data-cursor`, `data-sig-*`, `data-sos-*`, `data-progress*`). **There is no compile-time link between components and this engine** — when you add/rename a `data-*` hook in a component, update `useLandingFx.ts` too. Always register cleanups for every listener/RAF/interval.

## 5. Waitlist / API

The waitlist form **already POSTs to the live backend** via `src/api.ts`:
- `joinWaitlist()` → `POST /api/v1/waitlist`; `getWaitlistCount()` → `GET /api/v1/waitlist/count`.
- API base is `VITE_API_BASE_URL` (defaults to `https://api.qafilaa.in`, trailing slash normalized).
- Keep the honeypot (`name="company"`), client-side email validation (mirror the backend's FluentValidation), and the silent-fallback count behavior. **Do not reintroduce a "wire this up" TODO** — it's done.

## 6. SEO / content sync rules

- FAQ copy is duplicated as JSON-LD in `index.html` **and** in `src/components/Faq.tsx` — **edit both together**.
- Adding a route requires updating **all of:** `src/routes.ts`, `src/App.tsx`, `prerender.mjs` `PAGES`, and `public/sitemap.xml`.
- `src/content.ts` holds the real localized launch values and intentionally differs from prototype placeholders — **do not overwrite on a design sync.**
- Legal content is **prerendered routes** (`/privacy-policy`, `/terms-and-conditions` via `components/LegalPage.tsx`), not a modal.

## 7. Quality gates & known gaps

- Run `npm run lint` (`--max-warnings 0`) + `npm run typecheck` before committing; tsconfig is strict (`noUnusedLocals`/`noUnusedParameters`). Use `npm ci` for installs.
- **CI does not yet gate lint/typecheck** (`.github/workflows/deploy.yml` only builds + syncs to S3 on push to `main`). See `docs/PRODUCTION-READINESS.md` — adding a lint/typecheck gate and a GA4 consent gate are the P0 items.
- Secrets/env files are gitignored except `.env.example`.

> This site is the public face of a safety product — keep it fast, accessible, and accurate to what the app actually does.

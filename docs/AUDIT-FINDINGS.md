# Qafilaa Landing — Audit Findings & Notes (2026-06-26)

> Detailed evidence behind the roadmap. Actionable checklist: [`PRODUCTION-READINESS.md`](PRODUCTION-READINESS.md).
> Standards: repo-root `CLAUDE.md`. Severity = risk; Effort = S/M/L.

---

## 0. Headline

A well-engineered, statically-prerendered React 18 + TS 5 + Vite 5 SPA — **more production-ready than a typical
landing page**. The gaps are polish/hardening on a solid base; the two that matter are **no CI quality gate** and
**GA4 firing with no consent** (DPDP).

## 1. Strengths to PRESERVE

- **Custom SSR-prerender + hydration** (`prerender.mjs` + `entry-server.tsx`), build drift guarded (it throws if the `<head>` meta format changes). `main.tsx` hydrates when `#root` has children, else mounts.
- **Strong SEO**: canonical, theme-color, robots, full OG/Twitter, JSON-LD `@graph` (Organization/WebSite/SoftwareApplication/FAQPage), per-legal-route meta rewrites, 1200×630 og-image, robots.txt + sitemap.xml.
- **Real waitlist integration** (`src/api.ts`): `POST /api/v1/waitlist` + count, client email validation mirroring backend FluentValidation, honeypot, duplicate handling, silent-fallback count.
- **Accessibility baseline**: `prefers-reduced-motion`, honeypot `aria-hidden`, `role="alert"` errors, signal toggle `aria-checked`/`aria-label`.
- **Smart CD** (`deploy.yml`): per-asset cache headers (hashed assets immutable 1yr, HTML no-cache, `.well-known` JSON fixed) + CloudFront invalidation.
- **Strict TS + lint** (`strict`, `noUnusedLocals/Parameters`, `--max-warnings 0`). Deep-link bounce page (`public/join`) handles Android intent + iOS scheme fallback, code sanitization, noindex.

## 2. Findings (gaps)

- **HIGH — No CI quality gate before deploy.** `deploy.yml` runs `npm install` → `npm run build` → S3 sync on every push; `npm run lint`/`typecheck` are never enforced as gates (tsc runs inside build, but lint with `--max-warnings 0` doesn't). Add a `pull_request` CI job (`npm ci`, lint, typecheck) and gate deploy on it. Switch `npm install` → `npm ci`. *(S)*
- **HIGH — GA4 with no consent gate.** `index.html` calls `gtag('config', …)` on every load — no Consent Mode, no banner, no DNT — while the site ships a DPDP-2023 privacy policy. Add GA4 Consent Mode v2 (default `analytics_storage='denied'`) + a consent banner (or region-gate / `anonymize_ip`), and make the policy match what runs. *(M)*
- **MEDIUM** — no `.env.example` (gitignore whitelists it but it's missing); document `VITE_API_BASE_URL`. *(S)* · **702 KB favicon/touch-icon** (`public/qafilaa-icon.png` used for both) — generate a small set (<30 KB). *(S)* · GA4 ID hardcoded, no env separation (dev/preview pollute prod). *(S)*
- **LOW** — no `site.webmanifest`; no skip-link / `:focus-visible`; no automated tests (a Playwright smoke + Lighthouse budget would catch hydration/`data-*` breaks); two waitlist forms share one `submitted` flag; **stale README claims** (now fixed: `useCyclingBanner` removed, hero is `RideScreen` not ConvoyMap, legal *pages* not modal, breakpoints 1000/880/640/430/360, waitlist already wired).

## 3. Note

This repo previously had **no CLAUDE.md** — one was added this pass (SSR/hydration contract, motion-engine `data-*` rule, styling tokens, waitlist API, SEO-sync rules, quality gates).

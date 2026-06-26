# Qafilaa Landing — Production-Readiness Roadmap

> Living checklist of gaps. Source: deep audit (2026-06-26). The site is already solid (SSR/prerender, strong SEO,
> real waitlist API, S3+CF deploy); these are polish/hardening items. Severity = risk; Effort = S/M/L.

---

## P0 — high

- [ ] **No CI quality gate before deploy** — `.github/workflows/deploy.yml` runs `npm install` → `npm run build` → S3 sync on every push to `main`; `npm run lint` (`--max-warnings 0`) and `npm run typecheck` are never enforced as separate gates, and there is no PR check workflow. Add a CI job running `npm ci`, `npm run lint`, `npm run typecheck` on `pull_request` and before deploy; gate deploy on them. Switch `npm install` → `npm ci`. *(ci-cd, S)*
- [ ] **GA4 loads with no consent gate** — `index.html` calls `gtag('config', ...)` on every load: no Consent Mode, no banner, no Do-Not-Track, while the site ships a DPDP-2023 Privacy Policy. Implement GA4 Consent Mode v2 (default `analytics_storage='denied'`) + a lightweight consent banner (or at minimum region-gate / `anonymize_ip` / respect `navigator.doNotTrack`), and make the privacy policy match what actually runs. *(security/privacy, M)*

## P1 — medium

- [ ] **No `.env.example`** — `src/api.ts` reads `VITE_API_BASE_URL`; `.gitignore` whitelists `.env.example` but none exists. Add it (document `VITE_API_BASE_URL`, note the prod default) and reference it in the README. *(docs, S)*
- [ ] **702 KB favicon/touch-icon** — `public/qafilaa-icon.png` (702 KB) is used as both `rel=icon` and `rel=apple-touch-icon`. Generate a small set (32×32 + 180×180, <30 KB total, plus .ico/SVG); keep the large PNG only where genuinely needed. *(performance, S)*
- [ ] **GA4 ID not environment-separated** — `G-V4RB2XKEGK` hardcoded; dev/preview builds pollute prod analytics. Gate init to the prod hostname or inject the ID via build-time env. *(observability, S)*

## P2 — low

- [ ] **No web app manifest** — add a minimal `site.webmanifest` (name/short_name/icons/theme/background/display) for installability + richer mobile metadata. *(ux, S)*
- [ ] **No skip-link / visible focus ring** — add a visually-hidden skip-to-content link and a `:focus-visible` outline on nav links / CTA / form controls; verify anchor targets receive focus. *(accessibility, S)*
- [ ] **No automated tests** — add a Playwright smoke test (page loads, form submits to a mocked API, no console errors, prerender doesn't throw, key `data-*` hooks exist) + an optional Lighthouse CI budget. The imperative `useLandingFx.ts` DOM engine + SSR/hydration contract can break silently. *(testing, M)*
- [ ] **Shared waitlist success flag** — `Landing.tsx` lifts one `submitted` boolean to both the Hero form and the closing CTA form; submitting one flips the other. Consider per-form state (or document the intentional shared behavior). *(ux, S)*
- [ ] **Stale README claims** — remove `src/hooks/useCyclingBanner.ts` (doesn't exist), fix "hero runs ConvoyMap" (it's `RideScreen`), replace "LegalModal" with the legal *routes*, correct breakpoints to 1000/880/640/430/360, and drop the obsolete waitlist "wire it up" TODO. *(docs, S)*

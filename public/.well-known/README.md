# `/.well-known/` — app deep-link association files

These two files let the Qafilaa mobile app claim `https://qafilaa.in/join…`
links so an invite opens the app directly (instead of the browser):

| File | Platform | Served at |
| --- | --- | --- |
| `assetlinks.json` | Android App Links | `https://qafilaa.in/.well-known/assetlinks.json` |
| `apple-app-site-association` | iOS Universal Links | `https://qafilaa.in/.well-known/apple-app-site-association` |

They are plain static files copied verbatim into `dist/` at build time (Vite
copies `public/`, and `prerender.mjs` re-copies `.well-known/` as a safety net).

## Requirements (don't break these)

- Must be reachable over **HTTPS with no redirect** and return **200**.
- `apple-app-site-association` has **no file extension** and must be served as
  **`application/json`** (the deploy workflow sets this header — see
  `.github/workflows/deploy.yml`).
- Keep both on a **short cache** so fingerprints/app IDs can be updated.

## Android: which fingerprints are in here, and why

`assetlinks.json` lists **two** SHA-256 fingerprints, and both are load-bearing:

1. **`36:6D:A7:CD:…:28:4C` — the Play app-signing key.** Play re-signs every
   store install (including the internal track) with its own key, so **this is
   the only entry that makes App Links verify for anything a rider installs.**
2. **`B1:BA:3D:57:…:A2:74` — the upload key** (`upload.jks`). Covers release
   APKs built locally and side-loaded, which are still signed with the upload
   key because Play never sees them.

Both come from **Play Console → Protected with Play → App signing**. Prefer the
**Digital Asset Links JSON** snippet at the bottom of that page over
hand-copying the fingerprint buttons — Google generates it with every key it
will actually sign with, which matters after an app-signing key change.

> **A wrong fingerprint fails exactly like a missing one — silently.** Until
> 2026-08-02 this file carried a single `4A:AC:E0:…:A1:7F` entry, documented
> here as "the upload key". It was neither key, nor the debug keystore
> (`41:B8:87:5D:…`); it predated `upload.jks` and matched nothing that has ever
> signed this app, so App Links had never verified for any build. Verify a
> fingerprint against the console before trusting a comment that names it.

Debug builds (`flutter run`) are signed with each developer's own
`~/.android/debug.keystore` and are deliberately **not** listed — a personal
debug key in the production association file lets that key claim these links on
any device. Add yours locally only if you need to test the flow off-Play.

## iOS: enable Associated Domains

`5SG6FX2G2W.app.qafilaa` = `<TeamID>.<bundleId>`. The App ID must have the
**Associated Domains** capability enabled in the Apple Developer portal, and the
app ships `applinks:qafilaa.in` in `Runner.entitlements`.

## Verify after deploy

- Android: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://qafilaa.in&relation=delegate_permission/common.handle_all_urls`
- iOS: `curl -I https://qafilaa.in/.well-known/apple-app-site-association` →
  expect `200` and `content-type: application/json`. Apple's CDN cache:
  `https://app-site-association.cdn-apple.com/a/v1/qafilaa.in`

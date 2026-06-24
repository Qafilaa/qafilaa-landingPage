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

## ⚠️ Android: add the Play **app-signing** key fingerprint before launch

`assetlinks.json` currently lists only the **upload key** SHA-256
(`4A:AC:…:A1:7F`). Apps installed from the **Play Store** are re-signed by
Google with a different **app-signing key**, so App Links will NOT verify for
Play installs until that key's SHA-256 is added.

Get it from **Play Console → (app) → Test and release → App integrity → App
signing key certificate → SHA-256 certificate fingerprint**, then append it to
the `sha256_cert_fingerprints` array (keep the upload key too, for
internal-testing / direct-APK builds):

```json
"sha256_cert_fingerprints": [
  "4A:AC:E0:E6:FB:06:C8:72:91:52:8E:5C:C6:72:8A:B8:07:1F:8F:3F:B2:E6:13:24:8B:5F:AE:72:80:E4:A1:7F",
  "<PLAY_APP_SIGNING_KEY_SHA256>"
]
```

## iOS: enable Associated Domains

`5SG6FX2G2W.app.qafilaa` = `<TeamID>.<bundleId>`. The App ID must have the
**Associated Domains** capability enabled in the Apple Developer portal, and the
app ships `applinks:qafilaa.in` in `Runner.entitlements`.

## Verify after deploy

- Android: `https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://qafilaa.in&relation=delegate_permission/common.handle_all_urls`
- iOS: `curl -I https://qafilaa.in/.well-known/apple-app-site-association` →
  expect `200` and `content-type: application/json`. Apple's CDN cache:
  `https://app-site-association.cdn-apple.com/a/v1/qafilaa.in`

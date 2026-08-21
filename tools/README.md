# tools/ — the design pipeline

The site is a 1:1 port of a Claude Design handoff, and **most of `src/` is generated from it**. These
scripts are that generator. They used to live in a session scratchpad, which meant the ability to absorb
the next handoff would have died with the session.

Everything here needs **Python 3**. Nothing here runs at build time — you run it when a new handoff lands.

## The source of truth

`design/Qafilaa Site v2.dc.html` — handoff 13. A complete, working, standalone implementation of the site:
markup, styles, and a ~1,950-line vanilla-JS runtime. **This file is the design.** When a new handoff
arrives, replace it and re-run the pipeline.

## Running it

```bash
npm run design:generate    # gen -> genengine -> anyfix -> gencss
npm run typecheck && npm run lint && npm run build
npm run design:verify      # must print 8/8 identical
npm run dist:audit         # routes, heads, links, footer coverage
```

| Script | Writes | What it does |
| --- | --- | --- |
| `gen.py` | `src/site/{sections,chrome,legal}/` | Slices the handoff by line range and converts HTML to JSX through `h2jsx.py`. Also applies the declared divergences: the footer's store-required columns, the waitlist honeypot, the Apple 5.1.1 equal-protection clause, the analytics disclosure, and the date lines four documents ship without. |
| `divergences.py` | — | Markup-level departures shared by `gen.py` and `verify.py`, so the shipped component and the reference it is diffed against can never drift apart. Currently `strip_hud()` (divergence #10). |
| `genengine.py` | `src/site/{tokens,data,engine}.ts` | Extracts the runtime class. Every rewrite is asserted, so a drift in the handoff fails loudly instead of emitting a half-ported engine. Also carries the two engine-side divergences: the phone sizing (#11) and dropping the inline caption plus `buildHud()`'s early return (#10). |
| `anyfix.py` | `src/site/engine.ts` | Annotates the ported JS for `strict`, driven by tsc's own diagnostics. **Run it after `genengine.py`** or the build fails on implicit anys. |
| `gencss.py` | `src/index.css` | The handoff's `<style>` block **plus an appendix** for the legal shell (media queries cannot be inline styles). |
| `verify.py` + `domdiff.py` | — | Diffs every tag, attribute, CSS declaration and text node of the prerendered output against the handoff. Folds in the declared divergences (via `divergences.py`), then demands zero. |
| `audit.py` | — | Walks `dist/`: every route has its own title and canonical, no internal link 404s, every route reachable from the footer. |
| `mkicons.py` | `public/brand/` | Builds the square favicon/PWA set from `brand/logo-mark.png`. Needs Pillow. Every shipped brand asset is landscape, so the square set has to be generated. |
| `genlicenses.py` | `src/site/legal/LicensesBody.tsx` | Reads the **Flutter app's** `pubspec.yaml`/`.lock`. Set `QAFILAA_APP_DIR` if the app repo is not a sibling. Not run in CI. |

## When a new handoff lands

1. Drop the new `.dc.html` into `design/`.
2. **Re-derive the line ranges** in `gen.py` (`SECTIONS`, `LEGAL`, chrome, shortcuts, footer) and
   `genengine.py` (tokens, data, engine) and `gencss.py` (`STYLE_FROM`/`STYLE_TO`) — they shift every time.
   Do not nudge them; find the boundaries.
3. Run the pipeline. `genengine.py`'s asserts will tell you which string anchors moved.
4. `npm run design:verify` must come out 8/8.

## The rule

**Do not hand-edit a generated file.** `src/index.css`, `src/site/engine.ts`, `src/site/sections/*`,
`src/site/legal/*Body.tsx` are all output. A change made there survives until the next handoff and then
vanishes — which has already happened twice, to the footer and to the privacy clause. Fold it into the
generator instead, and add it to the divergence list in `CLAUDE.md` §3.

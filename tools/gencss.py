# -*- coding: utf-8 -*-
"""Write src/index.css = the handoff's <style> block + our own appendix.

The appendix exists because index.css is generated. Anything hand-added to it
is lost on the next handoff, so the legal-shell rules live here instead.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import io
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(TOOLS, 'design', 'Qafilaa Site v3.dc.html')
OUT = _os.path.join(REPO, 'src', 'index.css')
STYLE_FROM, STYLE_TO = 143, 324          # inside <style> ... </style>

HEADER = """/*
 * Qafilaa Site v3 - global stylesheet.
 *
 * Everything above the APPENDIX marker is transcribed 1:1 from the design
 * handoff's <style> block (`Qafilaa Site v3.dc.html`, handoff 14, lines
 * %d-%d). This file is GENERATED - do not hand-edit it, or the next handoff
 * will quietly discard your change. Add to the appendix in gencss.py instead.
 *
 * The `:root` values here are only the seed. Once `src/site/engine.ts` boots,
 * `paint()` overwrites --bg/--ink/--mut/--sur/--line/--card/--acc/--acc2/--ctr/
 * --ctaInk/--navbg/--navline on the document element every time the scroll
 * position crosses into a new tone, interpolating between adjacent sections.
 *
 * Breakpoints: 1500 / 1240 / 1080 / 900 / 760 / 480 / 370, plus max-height
 * 760 / 620 for the readout instrument. Below 900px the engine also switches
 * to its `narrow` path in JS (NARROW in src/site/tokens.ts) - keep the two
 * numbers in step.
 */
""" % (STYLE_FROM, STYLE_TO)

APPENDIX = """

/* ═══════════════ APPENDIX - not from the handoff ═══════════════════════════
 *
 * The legal / policy shell. The handoff ships six documents in a single pill
 * row; there are fifteen now, and four ragged rows of pills pushed the document
 * 478px down the page while leaving half the width empty. This is a sticky
 * index beside the prose instead - the ordinary shape for a set of documents,
 * and it scales past fifteen.
 *
 * It borrows nothing new: the type, the tracking and the palette are the
 * handoff's own, pinned rather than taken from the tone variables, because the
 * tone system does not run on these pages.
 * ========================================================================== */

[data-legalwrap] {
  display: grid;
  grid-template-columns: 236px minmax(0, 1fr);
  gap: 56px;
  align-items: start;
}

/* The index tracks the reader down the page and scrolls on its own if the list
   ever outgrows the viewport. */
[data-legalnav] {
  position: sticky;
  top: 104px;
  max-height: calc(100vh - 136px);
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 8px;
}
[data-legalnav] > :first-child { margin-top: 0; }

[data-legalgroup] {
  font-family: 'Space Grotesk', sans-serif;
  font-size: var(--qf-fs-11);
  letter-spacing: .16em;
  text-transform: uppercase;
  color: #6E6B63;
  margin: 22px 0 4px;
}

[data-legallink] {
  display: flex;
  align-items: center;
  /* border-box, or `min-height` becomes a floor the padding adds to and every
     row lands at 56px — tall enough that fifteen of them need their own
     scrollbar on a 720px screen. */
  box-sizing: border-box;
  min-height: 40px;
  padding: 6px 12px 6px 15px;
  border-left: 2px solid transparent;
  border-radius: 0 9px 9px 0;
  font-size: 15px;
  line-height: 1.35;
  color: #4A4842;
  text-decoration: none;
  transition: background .18s ease, color .18s ease, border-color .18s ease;
}
[data-legallink]:hover {
  background: rgba(35, 36, 31, .045);
  color: #23241F;
  text-decoration: none;
}
[data-legallink][aria-current='page'] {
  border-left-color: #0E7C86;
  background: rgba(14, 124, 134, .07);
  color: #0A6068;
  font-weight: 600;
}

/* One list, two presentations. The disclosure is the phone's, and is display:none
   on desktop, so only one of the two is ever in the accessibility tree. */
[data-legalpicker] { display: none; }

@media (max-width: 900px) {
  [data-legalwrap] { grid-template-columns: minmax(0, 1fr); gap: 0; }
  [data-legalnav] { display: none; }

  [data-legalpicker] {
    display: block;
    margin: 0 0 32px;
    border: 1px solid #DCD6C9;
    border-radius: 14px;
    background: #FFFFFF;
  }
  [data-legalpicker] > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 52px;
    padding: 0 16px;
    cursor: pointer;
    list-style: none;
    font-family: 'Space Grotesk', sans-serif;
    font-size: var(--qf-fs-11);
    letter-spacing: .16em;
    text-transform: uppercase;
    color: #6E6B63;
  }
  [data-legalpicker] > summary::-webkit-details-marker { display: none; }
  [data-legalpicker] > summary > span:last-child { color: #23241F; }
  [data-legalpicker][open] > summary { border-bottom: 1px solid #DCD6C9; }
  [data-legalpicker] [data-legalindex] { padding: 8px 14px 14px; }
  [data-legalpicker] [data-legalgroup] { margin-top: 16px; }
}
"""


RESPONSIVE = """

/* ═══════════════ RESPONSIVE LAYER - ours, not the handoff's ════════════════
 *
 * The handoff ships a mobile pass, but it stops once the phone rig goes inline.
 * Measured across 320-899px it left behind: 56 labels under 12px, 14 touch
 * targets under 40px, the inline caption strip laid out off-screen to the
 * right, and the policy header hanging 66px past the edge below 480px.
 *
 * Every rule here closes a measured defect and says which one. Desktop is
 * untouched -- all of it sits inside a max-width query, except the :root
 * defaults, which restate the handoff's own values to the pixel.
 */

/* Micro-type floor. divergences.py rewrites the handoff's hard-coded 9-11.5px
   *inline* sizes to these properties, which is the only way a media query can
   reach an inline style at all. */
:root{
  --qf-fs-9:9px; --qf-fs-10:10px; --qf-fs-105:10.5px; --qf-fs-11:11px; --qf-fs-115:11.5px;
  --qf-fs-17:17px; --qf-fs-18:18px; --qf-fs-19:19px; --qf-fs-20:20px;
  --qf-fs-21:21px; --qf-fs-22:22px; --qf-fs-24:24px;
}

@media (max-width:899px){
  /* 11px uppercase at .14em tracking is a considered choice on a 27" display
     and unreadable on a handset. Raised modestly: a bigger jump would put the
     tracked labels back over the edge, which is what this is fixing. */
  :root{
    /* the floor goes up: micro-labels are unreadable at 10-11px on a handset */
    --qf-fs-9:12px; --qf-fs-10:12px; --qf-fs-105:12px; --qf-fs-11:12px; --qf-fs-115:12px;
    /* and the ceiling comes down: the handoff scales its headlines for mobile
       but never its body copy, so a phone got 19px paragraphs and the page read
       zoomed in. 17px only loses a point -- it carries the legal prose. */
    --qf-fs-17:16px; --qf-fs-18:16.5px; --qf-fs-19:17px; --qf-fs-20:18px;
    --qf-fs-21:18.5px; --qf-fs-22:19px; --qf-fs-24:20px;
  }

  /* Headlines and the call to action came with the desktop scale too: a 37px
     headline over 56px-tall buttons is most of a phone screen before a word of
     copy. */
  [data-h1]{ font-size:clamp(28px,7.4vw,34px) !important; }
  section h2[data-lines]{ font-size:clamp(23px,5.9vw,28px) !important; }
  /* Both selectors scoped: a bare [data-btn] also matches the burger in the
     nav, and 20px of padding inside its 44px box squeezed the icon to a dot. */
  #top [data-magnet],
  #top [data-btn]{ padding:13px 20px !important; font-size:15px !important; }

  /* The corner coordinate readout is absolutely positioned at top:96px right:56px
     and lands straight on top of the waypoint label once the column narrows --
     two lines of tracked uppercase printed over each other. It is decoration;
     on a handset it costs a headline. */
  [data-corner]{ display:none !important; }

  /* The route line is 12.5px at .17em tracking, which breaks mid-unit on a
     phone ("5,359 / M · 10 DAYS"). Tighten the tracking so it holds together. */
  #top [data-plot]{ letter-spacing:.1em !important; text-wrap:balance; }

  /* The inline phone is 393x852, so at full width on a 393px screen it is 765px
     tall -- taller than the whole viewport (622px on an iPhone once Safari's
     chrome is out). It began below the fold and took another screen and a half
     to scroll past. Scaling it to fit would render its 11px UI text at 6px, so
     crop instead: full scale, the top of the screen, with a fade that says
     there is more. The caption underneath names what you are looking at. */
  [data-dock]{
    aspect-ratio:auto !important;
    height:min(58svh, 470px) !important;
    -webkit-mask-image:linear-gradient(180deg,#000 0,#000 calc(100% - 54px),transparent 100%);
    mask-image:linear-gradient(180deg,#000 0,#000 calc(100% - 54px),transparent 100%);
  }

  /* The inline phone and its caption stack.
     [data-strip] is a horizontal scroller from 1240px down, which is right
     while it carries a phone AND its companion screen. Below NARROW the engine
     appends the caption as a sibling, so the scroller parked it off to the
     right -- at 320px the caption's first character sat at x=331, past the
     edge of the screen. Nobody has ever seen these captions on a phone. */
  [data-strip]{
    flex-direction:column !important;
    align-items:center !important;
    overflow-x:visible !important;
    scroll-snap-type:none !important;
    gap:0 !important;
    padding-bottom:0 !important;
  }
  [data-strip] > *{ max-width:100% !important; }

  /* Thumb-sized targets: 44px is the smallest comfortable one. Policy pages
     were the worst offenders, with 18-22px index links. */
  [data-social] a,
  [data-stores] > *,
  [data-legalnav] a,
  [data-legalfoot] a,
  [data-legalbar] a,
  [data-legalbody] a[href^="mailto:"],
  [data-legalbody] a[href^="tel:"],
  #join footer a{
    min-height:44px !important;
    display:inline-flex !important;
    align-items:center !important;
  }
  /* the columns already space themselves once every row is 44px tall */
  #join footer a{ padding-block:0 !important; }

  /* the wordmark doubles as the route home, and was a 28px target */
  [data-navpill] > a[data-tap]{ min-height:44px !important; }

  /* the demo controls inside the panels, which the first pass did not reach */
  [data-nudgebtn],
  [data-seg] button,
  [data-cltoggle] button,
  [data-cardtabs] button,
  #permissions button,
  #papers button,
  #settings button,
  #recap button,
  #discovery button{
    min-height:44px !important;
  }

  /* Over-wide graphics stay pannable, and that is the right call: a 900x430
     map cannot be shown whole on a 360px screen with legible labels. What was
     missing is the affordance -- with a hard edge it reads as broken rather
     than as "there is more this way". */
  [data-widebox]{
    -webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 40px),transparent 100%);
    mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 40px),transparent 100%);
    scroll-snap-type:x proximity;
  }
  [data-widebox] > *{ scroll-snap-align:start; }

  /* The readiness board is a five-column grid, so its chips ran 39px past the
     edge at 320px and no amount of wrapping helps -- a grid does not wrap. It
     is a table, so let it behave like one: keep the shape, pan it, and use the
     same fade affordance as the wide graphics. */
  [data-readiness]{
    overflow-x:auto !important;
    -webkit-overflow-scrolling:touch;
    overscroll-behavior-x:contain;
    -webkit-mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 32px),transparent 100%);
    mask-image:linear-gradient(90deg,#000 0,#000 calc(100% - 32px),transparent 100%);
  }
  [data-readiness] > *{ min-width:430px !important; }

  /* The geofence drawing is authored 350px wide -- wider than a 320px screen
     minus its gutters. It carries a viewBox, so it scales cleanly. */
  [data-geofence]{ width:100% !important; max-width:100% !important; }

  /* The "Copied" stamp is scaled 2.4x and rotated, which threw it 30px past
     the edge on the narrowest screens. */
  [data-stamp]{
    transform:translateY(-50%) scale(1.7) rotate(-13deg) !important;
    right:14px !important;
  }
}

/* The policy header put a logo and two pills on one row: 282px of content in a
   295px box at 375px, so "Back to the ride" hung 66px off the screen. Drop the
   label first, then the whole control -- "Get the app" is the one that earns
   its place, and the logo already goes home. */
@media (max-width:560px){
  [data-legalbar] a[data-legalback] span{ display:none !important; }
  [data-legalbar] a[data-legalback]{ padding:0 13px !important; }
}
@media (max-width:400px){
  /* Weighted to match the 44px target rule above -- as a bare [data-legalback]
     this lost on specificity, not on order, and the pill came back at 320px. */
  [data-legalbar] a[data-legalback]{ display:none !important; }
}

/* The nav tagline sits beside the wordmark. Below 1080px the pill carries only
   the mark, the menu and the call to action, so it steps out of the way. */
@media (max-width:1080px){
  [data-navtag]{ display:none !important; }
}

/* Gutters. The left inset carries the spine: 46px is right on a tablet and far
   too much of a 360px screen, where it costs an eighth of the usable width. */
/* The "Copied" stamp is scaled and rotated, so it reached past the edge on
   anything narrower than a small tablet. */
@media (max-width:520px){
  [data-stamp]{ transform:translateY(-50%) scale(1.35) rotate(-13deg) !important; right:10px !important; }
}
@media (max-width:430px){
  [data-pad]{ padding-left:26px !important; padding-right:14px !important; }
}
@media (max-width:370px){
  [data-pad]{ padding-left:18px !important; padding-right:12px !important; }
}
"""


lines = io.open(SRC, encoding='utf-8').read().split('\n')
css = '\n'.join(l[2:] if l.startswith('  ') else l for l in lines[STYLE_FROM - 1:STYLE_TO])
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(HEADER + css + APPENDIX + RESPONSIVE)
print('index.css written: %d bytes (handoff block + appendix + responsive layer)'
      % os.path.getsize(OUT))

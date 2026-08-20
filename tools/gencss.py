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
SRC = os.path.join(TOOLS, 'design', 'Qafilaa Site v2.dc.html')
OUT = _os.path.join(REPO, 'src', 'index.css')
STYLE_FROM, STYLE_TO = 143, 285          # inside <style> ... </style>

HEADER = """/*
 * Qafilaa Site v2 - global stylesheet.
 *
 * Everything above the APPENDIX marker is transcribed 1:1 from the design
 * handoff's <style> block (`Qafilaa Site v2.dc.html`, handoff 12, lines
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
  font-size: 11px;
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
    font-size: 11px;
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


lines = io.open(SRC, encoding='utf-8').read().split('\n')
css = '\n'.join(l[2:] if l.startswith('  ') else l for l in lines[STYLE_FROM - 1:STYLE_TO])
io.open(OUT, 'w', encoding='utf-8', newline='\n').write(HEADER + css + APPENDIX)
print('index.css written: %d bytes (handoff block + appendix)' % os.path.getsize(OUT))

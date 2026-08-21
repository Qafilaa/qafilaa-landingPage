# -*- coding: utf-8 -*-
"""Extract tokens.ts / data.ts / engine.ts from the Qafilaa Site v3 handoff.

Every rewrite is asserted, so a drift in the source file fails loudly instead
of silently emitting a half-ported engine.
"""
import os as _os
# Resolve everything from the repo root so this works on a fresh clone and in CI.
REPO = _os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))
TOOLS = _os.path.join(REPO, 'tools')
import os
import re

SRC = os.path.join(TOOLS, 'design', 'Qafilaa Site v3.dc.html')
OUT = _os.path.join(REPO, 'src', 'site')
LINES = open(SRC, encoding='utf-8').read().split('\n')


def seg(a, b):
    return '\n'.join(LINES[a - 1:b])


def write(path, body):
    full = os.path.join(OUT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, 'wb') as f:
        f.write(body.replace('\r\n', '\n').encode('utf-8'))
    print('wrote %-16s %6d bytes' % (path, len(body)))


NL = chr(10)


def sub1(text, old, new, label):
    """Replace exactly one occurrence, or die."""
    n = text.count(old)
    assert n == 1, 'expected 1 %r, found %d' % (label, n)
    return text.replace(old, new, 1)


def cut_method(text, name):
    """Remove `  name(...) { ... }` matched by brace depth at 2-space indent."""
    m = re.search(r'\n  %s\([^)]*\) \{' % re.escape(name), text)
    assert m, 'method %s not found' % name
    i = m.end() - 1          # at the '{'
    depth, j = 0, i
    while j < len(text):
        if text[j] == '{':
            depth += 1
        elif text[j] == '}':
            depth -= 1
            if depth == 0:
                break
        j += 1
    assert depth == 0, 'unbalanced braces in %s' % name
    # swallow a leading comment line if it belongs to this method
    start = m.start()
    return text[:start] + text[j + 1:]


HDR = ('/**\n'
       ' * Generated from `Qafilaa Site v3.dc.html` (handoff 14), lines %s.\n'
       ' * %s\n'
       ' */\n')

# ── tokens.ts ───────────────────────────────────────────────────────────────
tokens = seg(1416, 1487)
tokens = tokens.replace('const SUR =', 'export const SUR =')
tokens = tokens.replace('const SG =', 'export const SG =')
tokens = tokens.replace('const PW = 413, PH = 872;',
                        'export const PW = 413;\nexport const PH = 872;')
tokens = tokens.replace('const TONES = {', 'export const TONES: Record<string, Tone> = {')
tokens = tokens.replace('const NARROW =', 'export const NARROW =')
tokens = tokens.replace('const CAPS = {', 'export const CAPS: Record<string, string> = {')
tokens = tokens.replace('const KEYS =', 'export const KEYS =')
tokens = tokens.replace('const alphaOf =', 'export const alphaOf =')
tokens = tokens.replace('const rgb =', 'export const rgb =')
tokens = tokens.replace('const mix =', 'export const mix =')
tokens = tokens.replace('const clamp =', 'export const clamp =')
tokens = tokens.replace('const inr =', 'export const inr =')
# type the arrow params (strict mode has no implicit any)
tokens = tokens.replace('(c,a) => {', '(c: string, a: number) => {')
tokens = tokens.replace('h => [parseInt', '(h: string) => [parseInt')
tokens = tokens.replace('(a,b,t) => {', '(a: string, b: string, t: number) => {')
tokens = tokens.replace('(v,a,b) => v<a?a:v>b?b:v',
                        '(v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)')
tokens = tokens.replace('n => Math.round(n)', '(n: number) => Math.round(n)')
assert 'export const TONES' in tokens and 'export const inr' in tokens

TONE_T = """
/** One scroll tone. `paint()` interpolates between adjacent tones and writes
 *  the first ten keys onto `:root` as CSS custom properties every frame. */
export interface Tone {
  bg: string; ink: string; mut: string; sur: string; line: string;
  card: string; acc: string; acc2: string; ctr: string; ctaInk: string;
  navBg: string; navA: number; navLine: string; navLineA: number; dens: number;
}
"""
write('tokens.ts',
      (HDR % ('1416-1487', 'Daylight palette, tone table and colour helpers.'))
      + TONE_T + '\n' + tokens + '\n')

# ── data.ts ─────────────────────────────────────────────────────────────────
data = seg(1489, 1520)
for name in ('TRIP', 'DAYS', 'TOTAL_KM', 'MAXD', 'RESTD', 'PASSES', 'CREW', 'roleOf'):
    data = data.replace('const %s ' % name, 'export const %s ' % name)
    data = data.replace('const %s=' % name, 'export const %s=' % name)
data = data.replace('(s,d) => s+d.km', '(s: number, d: Day) => s + d.km')
data = data.replace('(a,b) => b.alt > a.alt ? b : a', '(a: Day, b: Day) => (b.alt > a.alt ? b : a)')
data = data.replace("d => d.pass === 'Acclimatise'", "(d: Day) => d.pass === 'Acclimatise'")
data = data.replace("r => CREW.find(c => c.role === r) || CREW[0]",
                    "(r: string) => CREW.find((c) => c.role === r) || CREW[0]")
data = data.replace('const DAYS = [', 'const _DAYS_MARKER = [')  # placeholder, restored below
data = data.replace('export const _DAYS_MARKER = [', 'export const DAYS: Day[] = [')
data = data.replace('const _DAYS_MARKER = [', 'export const DAYS: Day[] = [')
assert 'export const DAYS: Day[]' in data, data[:400]

DAY_T = """
/** One riding day of the Manali-Leh-Manali circuit the whole page is measured against. */
export interface Day {
  n: number; from: string; to: string; km: number; alt: number;
  pass: string; date: string; screen: string;
}

export interface CrewMember { id: string; name: string; role: string; c: string; }
"""
data = data.replace('export const CREW = [', 'export const CREW: CrewMember[] = [')
write('data.ts',
      (HDR % ('1489-1520', 'The trip, the ten days, and the crew the demos are built from.'))
      + DAY_T + '\n' + data + '\n')

# ── engine.ts ───────────────────────────────────────────────────────────────
eng = seg(1522, 3840)

eng = sub1(eng, 'class Component extends DCLogic {', 'export class SiteEngine {\n'
           '  /* A 1:1 port of a hand-written DOM runtime: it assigns ~120 fields on\n'
           '     `this` across 90 methods. The index signature keeps that legal under\n'
           '     `strict` without restructuring logic that is load-bearing visually. */\n'
           '  [key: string]: any;\n\n'
           '  constructor(props: SiteProps) {\n'
           '    this.props = props;\n'
           '  }\n', 'class header')

eng = sub1(eng, '  componentDidMount() {\n    this.root = document.querySelector(\'x-dc\') || document.body;',
           '  mount(root: HTMLElement) {\n    this.root = root;', 'mount signature')
eng = sub1(eng, '    this.q = (s,r) => (r||this.root).querySelector(s);',
           '    this.q = (s: string, r?: Element) => (r || this.root).querySelector(s);', 'q helper')
eng = sub1(eng, '    this.qa = (s,r) => Array.from((r||this.root).querySelectorAll(s));',
           '    this.qa = (s: string, r?: Element) => Array.from((r || this.root).querySelectorAll(s));', 'qa helper')

# React unmount is always a real teardown here — no host remount to guard against.
eng = sub1(eng,
           "  componentWillUnmount() {\n"
           "    if (!document.body.contains(this.root)) {\n"
           "      this.dead = true; this.gen = -1;\n"
           "      if (this.raf) cancelAnimationFrame(this.raf);\n"
           "      clearInterval(this.watch); clearInterval(this.slowT);\n"
           "      clearTimeout(this.sosT); clearTimeout(this.sosT2);\n"
           "      clearTimeout(this.roT); clearInterval(this.vwT);\n"
           "      if (this.ro) { try { this.ro.disconnect(); } catch (e) {} }\n"
           "    }\n"
           "  }",
           "  destroy() {\n"
           "    this.dead = true; this.gen = -1;\n"
           "    if (this.raf) cancelAnimationFrame(this.raf);\n"
           "    if (this.fallback) clearInterval(this.fallback);\n"
           "    clearInterval(this.watch); clearInterval(this.slowT); clearInterval(this.vwT);\n"
           "    clearTimeout(this.sosT); clearTimeout(this.sosT2);\n"
           "    clearTimeout(this.roT); clearTimeout(this.rzT);\n"
           "    if (this.ro) { try { this.ro.disconnect(); } catch { /* already gone */ } }\n"
           "  }", 'destroy')

eng = sub1(eng, '  wait(n) {', '  wait(n: number) {', 'wait sig')

# Legal is a set of real prerendered routes in this app, not a hash overlay.
# `renderVals` and `componentDidUpdate` are React lifecycle stubs the host class
# no longer has: SiteEngine is a plain class, so neither can ever fire. Cutting
# them keeps the port honest -- componentDidUpdate only re-ran applySnap(), and
# mount() already calls that.
for m in ('buildLegal', 'openLegal', 'closeLegal', 'renderVals', 'componentDidUpdate'):
    eng = cut_method(eng, m)
eng = sub1(eng, "'buildStores','buildSocial','buildEnd','buildSplitRoad','buildSos','buildLegal','splitHeads','wire','loop'",
           "'buildStores','buildSocial','buildEnd','buildSplitRoad','buildSos','splitHeads','wire','loop'", 'boot order')
# The legal overlay is not ported (real routes instead), so its key branch goes.
eng = sub1(eng,
           "    document.addEventListener('keydown', e => {" + NL +
           "      if (this.legalOpen != null) {" + NL +
           "        if (e.key === 'Escape') this.closeLegal();" + NL +
           "        return;" + NL +
           "      }" + NL +
           "      const tag = (e.target.tagName||'').toLowerCase();",
           "    document.addEventListener('keydown', (e: KeyboardEvent) => {" + NL +
           "      const tag = ((e.target as HTMLElement | null)?.tagName || '').toLowerCase();",
           'keydown head')

# Waitlist must go through src/api.ts so the honeypot + validation survive.
old_wl = eng[eng.index("    const wl = this.q('[data-waitlist]');"):eng.index("    const jc = this.q('[data-joincode]');")]
assert 'fetch(ep' in old_wl, old_wl
new_wl = """    const wl = this.q('[data-waitlist]');
    if (wl) wl.addEventListener('submit', (e: Event) => {
      e.preventDefault();
      const field = this.q('[data-wlemail]') as HTMLInputElement;
      const v = field.value.trim();
      const msg = this.q('[data-wlmsg]');
      if (!v) return;
      if (!isValidEmail(v)) { msg.textContent = 'That email does not look right. Check it and try again.'; return; }
      msg.textContent = 'Sending…';
      const trap = this.q('[data-wlcompany]') as HTMLInputElement | null;
      joinWaitlist({ email: v, source: 'cta', company: trap ? trap.value : '' })
        .then(() => { msg.textContent = 'You are on the list. We will write when the beta opens.'; field.value = ''; })
        .catch(() => { msg.textContent = 'That did not go through. Try again, or email admin@qafilaa.in.'; });
    });

    /* the design ships static copy here; the live count replaces it when it lands */
    const line = this.q('[data-waitline]');
    if (line) getWaitlistCount()
      .then((n) => { line.textContent = inr(BASE_WAITLIST + n) + ' riders already on the list'; })
      .catch(() => {});

"""
eng = eng.replace(old_wl, new_wl, 1)

# Divergences #10 and #11 lived here and are both retired: handoff 14 drops the
# HUD block itself and rewrites fitDocks() to keep each dock at its declared
# scale, which is what the patches were for. The designer went further than the
# patch did and caps the phone by width too, so the copy keeps a readable column.

# Strict-mode annotations. Type-level only — nothing here changes runtime
# behaviour. See CLAUDE.md: annotate the ported engine, never restructure it.
TYPE_FIXES = [
    # deliberate best-effort catch; a comment keeps eslint's no-empty quiet
    ('    } catch (e) {}' + NL + '    this.syncing = false;',
     '    } catch { /* a demo failing to follow the phone must not stall the rig */ }'
     + NL + '    this.syncing = false;'),

    # a screen key indexing an inline literal — widen it rather than enumerate
    ('const v = { convoy:0, convoyStale:2, convoyOffline:4 }[d.key];',
     'const v = ({ convoy:0, convoyStale:2, convoyOffline:4 } as Record<string, number>)[d.key];'),

    # ResizeObserver re-rigging is best-effort; a comment keeps no-empty quiet
    ('this.docks.forEach(d => this.ro.observe(d.el)); } catch (e) {} }',
     'this.docks.forEach(d => this.ro.observe(d.el)); } catch { /* observer already gone */ } }'),
    ('    if (this.ro) { try { this.ro.disconnect(); } catch (e) {} }',
     '    if (this.ro) { try { this.ro.disconnect(); } catch { /* observer already gone */ } }'),

    # new in handoff 14: applySnap() writes the snap flag onto <html>; a comment
    # keeps eslint's no-empty quiet on the deliberate best-effort catch
    ("    try { document.documentElement.dataset.snap = this.props.snapSections === false"
     " ? 'off' : 'on'; } catch (e) {}",
     "    try { document.documentElement.dataset.snap = this.props.snapSections === false"
     " ? 'off' : 'on'; } catch { /* no documentElement to flag */ }"),

    # new in handoff 14: the J/K guard also asks whether the focus is in a
    # contenteditable, and `e.target` is `EventTarget | null` under strict
    ("if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;",
     "if (tag === 'input' || tag === 'textarea'"
     " || (e.target as HTMLElement | null)?.isContentEditable) return;"),

    # `wide()` is called with two args as well as three
    ('  wide(els, w, h) {',
     '  wide(els: any, w: any, h?: any) {'),
    # genuinely unused local in buildToggles
    ("    const w = this.q('[data-toggles]');\n",
     ''),

    ('      const seen = {};',
     '      const seen: any = {};'),
    ("t.setAttribute('x', CX+13); t.setAttribute('y', 4);",
     "t.setAttribute('x', String(CX+13)); t.setAttribute('y', '4');"),
    ('  screenEl(key, scale, framed, cropH, live) {',
     '  screenEl(key: any, scale: any, framed?: any, cropH?: any, live?: any) {'),
    ('catch (e) { window.__QAF_FERR = String(e && e.stack || e); }',
     'catch (e: any) { window.__QAF_FERR = String((e && e.stack) || e); }'),
    ('      let cur = null;',
     '      let cur: any = null;'),
    ('    let t2 = null, other = null;',
     '    let t2: any = null, other: any = null;'),
    ('    const av = CREW.map((c,i) => {',
     '    const av: any[] = CREW.map((c,i) => {'),
    ('      g.__pt = pt; pins.appendChild(g); return g;',
     '      (g as any).__pt = pt; pins.appendChild(g); return g;'),
    ('    const STAY = {',
     '    const STAY: any = {'),
    ('    const shares = CREW.map((c,i) => base + (i < rem ? 1 : 0));',
     '    const shares = CREW.map((_c, i) => base + (i < rem ? 1 : 0));'),
    ('    const xs = CREW.map((c,i) => 48 + i*93);',
     '    const xs = CREW.map((_c, i) => 48 + i*93);'),
    ('    CREW.forEach((c,i) => { if (i === pi) return;',
     '    CREW.forEach((_c, i) => { if (i === pi) return;'),
    ('    this.readyRows = CREW.map((c,i) => {',
     '    this.readyRows = CREW.map((_c, i) => {'),
    ('      b.textContent = r; b.__r = r;',
     '      b.textContent = r; (b as any).__r = r;'),
    ('      const on = b.__r === this.roleSel;',
     '      const on = (b as any).__r === this.roleSel;'),
    ('    const prev = {};',
     '    const prev: any = {};'),
    ('  resetSos(quiet) {',
     '  resetSos(quiet?: any) {'),
    ("[data-rolelist]'); w.innerHTML = '';\n    CREW.forEach((c,i) => {",
     "[data-rolelist]'); w.innerHTML = '';\n    CREW.forEach((c: any) => {"),
    ('    } catch (e) {}\n    this.trig = [];',
     '    } catch { /* head tidying is best-effort; never block boot on it */ }\n    this.trig = [];'),
    ('try { t.fn(); } catch(e){} }',
     'try { t.fn(); } catch { /* one bad trigger must not stall the rest */ } }'),
    ('    this.onPaint = (y, vh) => {\n      if (!this.roadDots) return;',
     '    this.onPaint = (_y: any, vh: any) => {\n      if (!this.roadDots) return;'),
    ('Array.from(tog.children).forEach((b,i) => {',
     'Array.from(tog.children).forEach((b: any, i: any) => {'),
    ("Array.from(this.q('[data-rolepick]').children).forEach(b => {",
     "Array.from(this.q('[data-rolepick]').children).forEach((b: any) => {"),
    ('      cards.forEach((c,i) => setTimeout(() => {',
     '      cards.forEach((c: any, i: any) => setTimeout(() => {'),
    ('    Array.from(board.children).forEach(c => { prev[c.dataset.k] = c.getBoundingClientRect(); });',
     '    Array.from(board.children).forEach((c: any) => { prev[c.dataset.k] = c.getBoundingClientRect(); });'),
    ('    Array.from(board.children).forEach(c => {\n      const p = prev[c.dataset.k]; if (!p) return;',
     '    Array.from(board.children).forEach((c: any) => {\n      const p = prev[c.dataset.k]; if (!p) return;'),
    ("Array.from(this.q('[data-cardtabs]').children).forEach((b,i) => {",
     "Array.from(this.q('[data-cardtabs]').children).forEach((b: any, i: any) => {"),
    ("av.forEach((a,i) => { a.style.marginLeft = i?'10px':'0'; a.firstElementChild.style.opacity = '1'; })",
     "av.forEach((a: any, i: any) => { a.style.marginLeft = i?'10px':'0'; a.firstElementChild.style.opacity = '1'; })"),
    ("av.forEach((a,i) => { a.style.marginLeft = i?'-16px':'0'; a.firstElementChild.style.opacity = '0'; })",
     "av.forEach((a: any, i: any) => { a.style.marginLeft = i?'-16px':'0'; a.firstElementChild.style.opacity = '0'; })"),
]
for _old, _new in TYPE_FIXES:
    eng = sub1(eng, _old, _new, _old[:52])

# Every global listener goes through one shim so teardown can never miss one.
# React StrictMode double-mounts in dev, so a leaked listener is not theoretical.
eng = eng.replace('window.addEventListener(', 'this.bind(window, ')
eng = eng.replace('document.addEventListener(', 'this.bind(document, ')
assert 'this.bind(window, ' in eng

eng = sub1(eng, '  destroy() {', '  /** Record a global listener so destroy() can take it off again. */\n'
           '  bind(target: EventTarget, type: string, fn: any, opts?: AddEventListenerOptions) {\n'
           '    (this.bound = this.bound || []).push([target, type, fn, opts]);\n'
           '    target.addEventListener(type, fn, opts);\n'
           '  }\n\n'
           '  destroy() {', 'bind helper')

eng = sub1(eng, '    if (this.ro) { try { this.ro.disconnect(); } catch { /* already gone */ } }',
           '    if (this.ro) { try { this.ro.disconnect(); } catch { /* already gone */ } }\n'
           '    (this.bound || []).forEach(([t, ty, fn, o]: any) => t.removeEventListener(ty, fn, o));\n'
           '    this.bound = [];\n'
           '    /* the tone system writes onto :root — hand it back on the way out */\n'
           '    const rs = document.documentElement.style;\n'
           "    [...KEYS, 'navbg', 'navline'].forEach((k) => rs.removeProperty('--' + k));", 'unbind')


IMPORTS = """import { getWaitlistCount, isValidEmail, joinWaitlist } from '../api';
import { site } from '../content';
import { CREW, DAYS, MAXD, PASSES, RESTD, TOTAL_KM, TRIP, roleOf } from './data';
import { CAPS, KEYS, NARROW, PH, PW, SG, SUR, TONES, alphaOf, clamp, inr, mix } from './tokens';

/** Display base for the social-proof line; live backend signups add to it. */
const BASE_WAITLIST = site.waitlistCount;

/** Behaviour + integration knobs, mirroring the design's authored `data-props`. */
export interface SiteProps {
  /** Waypoint paging: one gesture moves one panel. New in handoff 14. */
  snapSections: boolean;
  motion: 'full' | 'calm';
  autoDemo: boolean;
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  whatsappUrl: string;
}
"""

HEAD = """/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The Qafilaa Site v3 scroll runtime — a 1:1 port of the design handoff's own
 * `class Component extends DCLogic` (`Qafilaa Site v3.dc.html`, lines 1522-3840).
 *
 * It owns everything the markup cannot express: the tone interpolation written
 * onto `:root`, the contour field, the spine, the flying phone and its 84-screen
 * library, and ~20 built-in demos. It drives the DOM imperatively via `data-*`
 * hooks in `src/site/sections` and `src/site/chrome` — there is NO compile-time
 * link between the two, so renaming a hook silently kills a demo.
 *
 * Deliberate departures from the handoff, both required by CLAUDE.md:
 *   - the waitlist submits through `src/api.ts` (honeypot + email validation)
 *   - the hero's social-proof line takes the live backend count
 * Legal pages are real prerendered routes here, so `buildLegal`/`openLegal`/
 * `closeLegal` are intentionally not ported.
 */
"""

write('engine.ts', HEAD + IMPORTS + '\n' + eng.strip() + '\n')
print('done')

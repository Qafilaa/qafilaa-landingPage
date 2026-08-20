/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * The Qafilaa Site v2 scroll runtime — a 1:1 port of the design handoff's own
 * `class Component extends DCLogic` (`Qafilaa Site v2.dc.html`, lines 1442-3444).
 *
 * It owns everything the markup cannot express: the tone interpolation written
 * onto `:root`, the contour field, the spine, the flying phone and its 75-screen
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
import { getWaitlistCount, isValidEmail, joinWaitlist } from '../api';
import { site } from '../content';
import { CREW, DAYS, MAXD, PASSES, RESTD, TOTAL_KM, TRIP, roleOf } from './data';
import { KEYS, NARROW, PH, PW, SG, SUR, TONES, alphaOf, clamp, inr, mix } from './tokens';

/** Display base for the social-proof line; live backend signups add to it. */
const BASE_WAITLIST = site.waitlistCount;

/** Behaviour + integration knobs, mirroring the design's authored `data-props`. */
export interface SiteProps {
  motion: 'full' | 'calm';
  autoDemo: boolean;
  instagramUrl: string;
  linkedinUrl: string;
  xUrl: string;
  whatsappUrl: string;
}

export class SiteEngine {
  /* A 1:1 port of a hand-written DOM runtime: it assigns ~120 fields on
     `this` across 90 methods. The index signature keeps that legal under
     `strict` without restructuring logic that is load-bearing visually. */
  [key: string]: any;

  constructor(props: SiteProps) {
    this.props = props;
  }

  mount(root: HTMLElement) {
    this.root = root;
    this.q = (s: string, r?: Element) => (r || this.root).querySelector(s);
    this.qa = (s: string, r?: Element) => Array.from((r || this.root).querySelectorAll(s));
    this.rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.calm = this.rm || this.props.motion === 'calm';
    this.touch = window.matchMedia('(hover: none)').matches;
    this.dead = false;
    if (this.booted) { this.measure(); this.measureDocks(); this.loop(); return; }
    this.wait(0);
  }
  /** Record a global listener so destroy() can take it off again. */
  bind(target: EventTarget, type: string, fn: any, opts?: AddEventListenerOptions) {
    (this.bound = this.bound || []).push([target, type, fn, opts]);
    target.addEventListener(type, fn, opts);
  }

  destroy() {
    this.dead = true; this.gen = -1;
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.fallback) clearInterval(this.fallback);
    clearInterval(this.watch); clearInterval(this.slowT); clearInterval(this.vwT);
    clearTimeout(this.sosT); clearTimeout(this.sosT2);
    clearTimeout(this.roT); clearTimeout(this.rzT);
    if (this.ro) { try { this.ro.disconnect(); } catch { /* already gone */ } }
    (this.bound || []).forEach(([t, ty, fn, o]: any) => t.removeEventListener(ty, fn, o));
    this.bound = [];
    /* the tone system writes onto :root — hand it back on the way out */
    const rs = document.documentElement.style;
    [...KEYS, 'navbg', 'navline'].forEach((k) => rs.removeProperty('--' + k));
  }

  wait(n: number) {
    if (window.QAF_SCREENS) return this.boot();
    if (n > 90 || this.dead) return;
    setTimeout(() => this.wait(n+1), 80);
  }

  boot() {
    if (this.booted) return; this.booted = true;
    this.S = window.QAF_SCREENS;
    this.LB = window.QAF_SCREEN_LABELS || {};
    if (window.QAF_SCREEN_CSS && !document.getElementById('qaf-screen-css')) {
      const st = document.createElement('style'); st.id = 'qaf-screen-css';
      st.textContent = window.QAF_SCREEN_CSS; document.head.appendChild(st);
    }
    this.narrow = window.innerWidth < NARROW;
    try {
      const de = document.documentElement;
      if (de.lang !== 'en-IN') de.lang = 'en-IN';
      const nv = this.q('[data-nav]'); if (nv) nv.setAttribute('role', 'banner');
      /* the host can mount <helmet> more than once — keep one of each head tag */
      const seen: any = {};
      Array.from(document.head.querySelectorAll('meta[name],meta[property],link[rel=canonical],link[rel=manifest],script[type="application/ld+json"]')).forEach(el => {
        const k = el.tagName + '|' + (el.getAttribute('name') || el.getAttribute('property') || el.getAttribute('rel') || 'ld');
        if (seen[k]) el.remove(); else seen[k] = 1;
      });
      [['en-IN','https://qafilaa.in/'],['en','https://qafilaa.in/'],['x-default','https://qafilaa.in/']].forEach(([hl, href]) => {
        if (document.head.querySelector('link[hreflang="' + hl + '"]')) return;
        const l = document.createElement('link');
        l.rel = 'alternate'; l.hreflang = hl; l.href = href;
        document.head.appendChild(l);
      });
      this.qa('section[data-sec]').forEach((s: any) => {
        if (!s.getAttribute('aria-label')) s.setAttribute('aria-label', s.getAttribute('data-sec'));
      });
    } catch { /* head tidying is best-effort; never block boot on it */ }
    this.trig = [];
    const order = ['prepSections','buildRail','buildDrawer','buildContours','buildDocks','buildStatics','capGrids','buildSpine',
      'buildStepper','buildPerms','buildTripCard','buildCrewFan','buildLegMap','buildNights','buildSplit','buildChecklist',
      'buildPermitRows','buildGeofence','buildNoteDemo','buildNudgeDemo','buildReadiness','buildRoles','buildPack',
      'buildConvoyMap','buildMuster','buildLadder','buildSigChips','buildToggles','buildHelp','buildShareCard',
      'buildStores','buildSocial','buildEnd','buildSplitRoad','buildSos','splitHeads','wire','loop'];
    window.__QAF_STEPS = [];
    for (const s of order) {
      if (typeof this[s] !== 'function') continue;
      try { this[s](); window.__QAF_STEPS.push(s); }
      catch (e) { console.error('[qafilaa] ' + s, e); window.__QAF_STEPS.push('!' + s); }
    }
  }

  /* ═════ screens ═════ */
  screenEl(key: any, scale: any, framed?: any, cropH?: any, live?: any) {
    const html = this.S[key];
    const w = Math.round(393*scale), h = Math.round((cropH||852)*scale), r = Math.round(44*scale);
    if (!html) {
      const m = document.createElement('div');
      m.style.cssText = 'width:'+w+'px; height:'+h+'px; border-radius:'+r+'px; background:#FBEDEC; border:1px dashed #E5392E; color:#E5392E; display:flex; align-items:center; justify-content:center; text-align:center; padding:10px; box-sizing:border-box; font:600 11px/1.4 \'Space Grotesk\',sans-serif; letter-spacing:.1em; text-transform:uppercase;';
      m.textContent = 'Missing screen · ' + key;
      return m;
    }
    const inner = document.createElement('div');
    inner.style.cssText = 'width:393px; height:852px; transform:scale('+scale+'); transform-origin:top left;';
    inner.innerHTML = html;
    const clip = document.createElement('div');
    clip.style.cssText = 'position:relative; width:'+w+'px; height:'+h+'px; overflow:hidden; border-radius:'+r+'px; background:#F1EFE9;';
    clip.appendChild(inner);
    clip.setAttribute('aria-hidden','true');
    /* several hundred dead tab stops otherwise — the phones are pictures, not UI */
    if (!live) clip.setAttribute('inert','');
    this.qa('a,button,input,select,textarea,[tabindex]', clip).forEach((e: any) => e.setAttribute('tabindex','-1'));
    if (!framed) return clip;
    const bez = document.createElement('div');
    bez.style.cssText = 'width:max-content; padding:'+Math.max(4,Math.round(10*scale))+'px; background:#0B0E0D; border-radius:'+Math.round(54*scale)+'px; box-shadow:0 32px 66px -22px rgba(35,36,31,.34), 0 0 0 1px rgba(35,36,31,.06);';
    bez.appendChild(clip);
    return bez;
  }

  skel(w: any,h: any,r: any) {
    const s = document.createElement('div');
    s.style.cssText = 'width:'+w+'px; height:'+h+'px; border-radius:'+r+'px; background:linear-gradient(90deg, var(--line) 0%, var(--card) 42%, var(--line) 84%); background-size:220px 100%; animation:qf-shimmer 1.5s linear infinite;';
    return s;
  }

  /* ═════ triggers ═════ */
  addTrig(el: any, margin: any, fn: any) { this.trig.push({ el, m:margin, fn, done:false, top:null }); }
  runTrig(y: any, vh: any) {
    let fired = false;
    for (const t of this.trig) {
      if (t.done) continue;
      if (t.top === null) t.top = t.el.getBoundingClientRect().top + y;
      if (t.top < y + vh - t.m) { t.done = true; fired = true; try { t.fn(); } catch { /* one bad trigger must not stall the rest */ } }
    }
    if (fired) this.dirty = true;
  }

  /* Text columns are `1fr`, so on wide screens they swallow the free space and
     push the phone to the far edge. Cap the content column instead, so the copy
     and the device stay one composed block however wide the window gets. */
  capGrids() {
    const vw = window.innerWidth;
    const secs = this.qa('section[data-sec]');
    if (vw <= 1080) {
      secs.forEach((s: any) => { s.style.paddingLeft = ''; s.style.paddingRight = ''; });
      this.qa('[data-cols]').forEach((g: any) => {
        if (g.dataset.gtc) g.style.gridTemplateColumns = g.dataset.gtc;
        g.style.justifyContent = ''; g.style.maxWidth = ''; g.style.width = '';
      });
      this.qa('[data-musterboard],[data-permcards],[data-strip]').forEach((el: any) => { el.style.maxWidth = ''; });
      return;
    }
    /* Measure what the copy ACTUALLY occupies (it is capped in ch, not by the
       track), then size the track to that. Sizing to the leftover leaves a void
       the copy can never fill. */
    const plan: any[] = [];
    this.qa('[data-cols]').forEach((g: any) => {
      const tpl = g.dataset.gtc || g.style.gridTemplateColumns || '';
      if (tpl.indexOf('minmax') < 0) return;
      g.dataset.gtc = tpl;
      const phoneFirst = tpl.trim().indexOf('auto') === 0;
      const gap = parseInt(getComputedStyle(g).columnGap, 10) || 56;
      const aside = g.querySelector('[data-strip]') || g.querySelector('[data-dock]');
      const asideW = aside ? Math.round(aside.getBoundingClientRect().width) : 250;
      const prev = g.style.gridTemplateColumns;
      g.style.gridTemplateColumns = phoneFirst ? 'auto max-content' : 'max-content auto';
      const col = phoneFirst ? g.children[g.children.length - 1] : g.children[0];
      const textW = Math.round(col.getBoundingClientRect().width);
      g.style.gridTemplateColumns = prev;
      plan.push({ g, phoneFirst, gap, asideW, textW: clamp(textW, 380, 980) });
    });

    /* one page measure so every section shares a left edge */
    let nat = 1000;
    plan.forEach(p => { nat = Math.max(nat, p.textW + p.gap + p.asideW); });
    const M = clamp(nat, 1000, 1360);
    const side = Math.round((vw - M) / 2);
    const padL = Math.max(132, side), padR = Math.max(56, side);
    secs.forEach((s: any) => { s.style.paddingLeft = padL + 'px'; s.style.paddingRight = padR + 'px'; });
    const box = vw - padL - padR;

    plan.forEach(p => {
      /* the track IS the copy's real width — never the leftover, or the gap returns */
      const cap = Math.min(p.textW, Math.max(380, box - p.gap - p.asideW));
      p.g.style.gridTemplateColumns = p.phoneFirst
        ? 'auto minmax(0,' + cap + 'px)'
        : 'minmax(0,' + cap + 'px) auto';
      p.g.style.justifyContent = 'start';
      p.g.style.maxWidth = 'none';
      p.g.style.width = '100%';
    });
    this.qa('[data-musterboard],[data-permcards],[data-strip]').forEach((el: any) => { el.style.maxWidth = box + 'px'; });
    if (this.docks) this.measureDocks();
    if (this.sections) this.measure();
  }

  prepSections() {
    this.sections = this.qa('section[data-sec]');
    this.sections.forEach((s: any) => { s.style.background = 'transparent'; });
    this.tones = this.sections.map((s: any) => TONES[s.getAttribute('data-tone')] || TONES.light);
    this.measure();
  }

  measure() {
    const y = window.scrollY;
    this.secTops = this.sections.map((s: any) => s.getBoundingClientRect().top + y);
    this.docH = Math.max(1, this.root.scrollHeight - window.innerHeight);
    if (this.trig) this.trig.forEach((t: any) => { if (!t.done) t.top = null; });
  }

  buildRail() {
    const rail = this.q('[data-rail]'); rail.innerHTML = '';
    this.railItems = this.sections.map((sec: any) => {
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      a.style.cssText = 'display:flex; align-items:center; gap:9px; justify-content:flex-end; padding:3px 0; text-decoration:none;';
      const l = document.createElement('span');
      l.textContent = sec.getAttribute('data-sec');
      l.style.cssText = SUR + ' font-size:10px; opacity:0; transition:opacity .2s; white-space:nowrap;';
      const b = document.createElement('span');
      b.style.cssText = 'width:16px; height:2px; border-radius:2px; background:var(--line); transition:width .22s, background .22s;';
      a.appendChild(l); a.appendChild(b);
      a.addEventListener('mouseenter', () => { l.style.opacity = '1'; });
      a.addEventListener('mouseleave', () => { l.style.opacity = '0'; });
      rail.appendChild(a);
      return { bar:b };
    });
  }

  buildDrawer() {
    const p = this.q('[data-drawerpanel]'); p.innerHTML = '';
    this.sections.forEach((sec: any, i: any) => {
      const a = document.createElement('a');
      a.href = '#' + sec.id;
      a.style.cssText = 'display:flex; gap:12px; align-items:baseline; padding:13px 12px; border-radius:10px; text-decoration:none; color:var(--ink); font-size:16px; min-height:44px; box-sizing:border-box;';
      a.innerHTML = '<span style="' + SUR + ' font-size:10px; min-width:22px;">' + String(i).padStart(2,'0') + '</span><span>' + sec.getAttribute('data-sec') + '</span>';
      a.addEventListener('click', () => this.drawer(false));
      p.appendChild(a);
    });
  }
  drawer(open: any) {
    this.q('[data-drawer]').style.display = open ? 'block' : 'none';
    this.q('[data-burger]').setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { const f = this.q('[data-drawerpanel] a'); if (f) f.focus(); }
  }

  /* ═════ spine + convoy dots ═════ */
  buildSpine() {
    const sp = this.q('[data-spine]');
    const NS = 'http://www.w3.org/2000/svg';
    const H = this.root.scrollHeight, VH = window.innerHeight, SEG = 620;
    const W = window.innerWidth < 480 ? 30 : (window.innerWidth < 760 ? 40 : 132), CX = W/2;
    this.SEG = SEG; this.spineH = H; this.spineVH = VH;
    sp.style.width = W + 'px';
    sp.setAttribute('viewBox', '0 0 ' + W + ' ' + VH);
    const mk = (t: any,a: any) => { const e = document.createElementNS(NS,t); for (const k in a) e.setAttribute(k, a[k]); return e; };
    sp.innerHTML = '';
    const shift = mk('g',{}), gB = mk('g',{}), gL = mk('g',{});
    const amp = Math.min(40, W*0.3);
    this.segs = [];
    for (let i = 0, n = Math.ceil(H/SEG); i < n; i++) {
      const y = i*SEG, dir = i%2 === 0 ? 1 : -1;
      const d = 'M '+CX+' '+y+' C '+(CX+amp*dir)+' '+(y+200)+', '+(CX-amp*dir)+' '+(y+420)+', '+CX+' '+(y+SEG);
      const b1 = mk('path',{ d, fill:'none', stroke:'var(--line)', 'stroke-width':'2' });
      const b2 = mk('path',{ d, fill:'none', stroke:'var(--line)', 'stroke-width':'1', opacity:'.55', transform:'translate('+(W<60?6:15)+',0)', 'stroke-dasharray':'3 5' });
      gB.appendChild(b1); gB.appendChild(b2);
      const lv = mk('path',{ d, fill:'none', stroke:'var(--acc2)', 'stroke-width':'2.5', 'stroke-linecap':'round' });
      gL.appendChild(lv);
      const len = lv.getTotalLength();
      lv.style.strokeDasharray = len; lv.style.strokeDashoffset = len;
      this.segs.push({ el:lv, base:[b1,b2], len, top:y, state:-1, vis:true });
    }
    shift.appendChild(gB); shift.appendChild(gL);
    const ticks = mk('g',{});
    this.secTops.forEach((top: any,i: any) => {
      if (i === 0) return;
      const g = mk('g',{ transform:'translate(0,'+top+')' });
      g.innerHTML = '<line x1="'+(CX-7)+'" y1="0" x2="'+(CX+7)+'" y2="0" stroke="var(--line)" stroke-width="1.5"></line>';
      if (W > 60) {
        const km = Math.round((top / Math.max(1,this.root.scrollHeight)) * TOTAL_KM);
        const t = document.createElementNS(NS,'text');
        t.setAttribute('x', String(CX+13)); t.setAttribute('y', '4');
        t.setAttribute('fill','var(--sur)'); t.setAttribute('font-size','9');
        t.setAttribute('font-family',"'Space Grotesk',sans-serif"); t.setAttribute('letter-spacing','1');
        t.setAttribute('opacity','.75');
        t.textContent = km + ' km';
        g.appendChild(t);
      }
      ticks.appendChild(g);
    });
    shift.appendChild(ticks);
    this.ring = mk('circle',{ r:11, fill:'none', stroke:'var(--acc2)', 'stroke-width':'1.4', opacity:'.32', cx:CX, cy:0 });
    shift.appendChild(this.ring);
    this.dots = [];
    for (let i = 0; i < 5; i++) {
      const c = mk('circle',{ r: i===0?6:4.5, fill: i===0?'var(--acc2)':'var(--acc)', opacity: i===0?'1':String(0.8-i*0.11), cx:CX, cy:0 });
      shift.appendChild(c);
      this.dots.push({ el:c, y:0, v:0, k:0.16 - i*0.026 });
    }
    sp.appendChild(shift);
    this.shift = shift;
  }

  spinePoint(y: any) {
    let i = Math.floor(y / this.SEG);
    i = clamp(i, 0, this.segs.length-1);
    const s = this.segs[i];
    return s.el.getPointAtLength(clamp((y - s.top)/this.SEG, 0, 1) * s.len);
  }

  buildContours() {
    const sv = this.q('[data-contours]');
    const NS = 'http://www.w3.org/2000/svg';
    sv.setAttribute('viewBox','0 0 1440 900');
    sv.innerHTML = '';
    this.bands = [];
    for (let i = 0; i < 13; i++) {
      const p = document.createElementNS(NS,'path');
      p.setAttribute('fill','none'); p.setAttribute('stroke','var(--ctr)');
      p.setAttribute('stroke-width', i%3===0 ? '1.5' : '1');
      sv.appendChild(p);
      this.bands.push({ el:p, amp: 22 + (i%4)*13, rate: 0.07 + (i%5)*0.021 });
    }
    this.px = 720; this.py = 450;
  }

  drawContours(y: any, dens: any) {
    const n = this.bands.length, spread = 980/n;
    for (let i = 0; i < n; i++) {
      const b = this.bands[i];
      let base = (i*spread - y*b.rate) % (spread*n);
      if (base < -spread) base += spread*n;
      const a = b.amp * (0.3 + dens*1.05);
      const dx = clamp((this.px-720)/720,-1,1) * 6 * (i%2?1:-1);
      const dy = clamp((this.py-450)/450,-1,1) * 6 * (i%3?1:-1);
      const yy = base + dy;
      b.el.setAttribute('d','M-40 '+yy.toFixed(1)+' C '+(300+dx)+' '+(yy-a).toFixed(1)+', '+(620+dx)+' '+(yy+a*1.15).toFixed(1)+', 900 '+(yy-a*0.3).toFixed(1)+' S '+(1240-dx)+' '+(yy+a*0.8).toFixed(1)+', 1480 '+(yy-a*0.2).toFixed(1));
      b.el.style.opacity = String(0.3 + dens*0.55);
    }
  }

  /* ═════ persistent phone ═════ */
  buildDocks() {
    this.docks = this.qa('[data-dock]').map((el: any) => {
      const sc = parseFloat(el.getAttribute('data-scale')||'0.56');
      if (el.__css0 == null) el.__css0 = el.getAttribute('style') || '';
      el.style.width = Math.round(PW*sc)+'px';
      el.style.height = Math.round(PH*sc)+'px';
      el.style.flex = 'none';
      return { el, sc, key: el.getAttribute('data-screen'),
        kind: el.getAttribute('data-kind')||'replace',
        flow: (el.getAttribute('data-flow')||'').split(',').filter(Boolean) };
    });
    this.layer = this.q('[data-phonelayer]');
    this.pos = this.q('[data-phonepos]');
    this.tiltEl = this.q('[data-phonetilt]');
    this.host = this.q('[data-phonehost]');
    this.pv = { x:0, y:0, s:0.56, rx:0, ry:0, rz:0 };
    this.layer.style.display = this.narrow ? 'none' : '';
    if (this.narrow) {
      this.docks.forEach((d: any) => this.inlineDock(d));
      /* the column can change width without a resize event (panels, split views) */
      if (window.ResizeObserver && !this.ro) {
        this.ro = new ResizeObserver(() => { clearTimeout(this.roT); this.roT = setTimeout(() => this.refitInline(), 200); });
      }
      if (this.ro) { try { this.ro.disconnect(); this.docks.forEach((d: any) => this.ro.observe(d.el)); } catch { /* observer already gone */ } }
      return;
    }
    if (this.ro) { try { this.ro.disconnect(); } catch { /* observer already gone */ } }
    /* already rigged once — a breakpoint crossing only needs the docks re-measured */
    if (this.trailPath) { this.measureDocks(); this.beginFlight(this.docks[0]); return; }
    const NS = 'http://www.w3.org/2000/svg';
    const tr = document.createElementNS(NS,'svg');
    tr.setAttribute('aria-hidden','true');
    tr.style.cssText = 'position:fixed; inset:0; width:100vw; height:100vh; pointer-events:none; overflow:visible;';
    this.trailPath = document.createElementNS(NS,'path');
    this.trailPath.setAttribute('fill','none');
    this.trailPath.setAttribute('stroke','var(--acc2)');
    this.trailPath.setAttribute('stroke-width','2');
    this.trailPath.setAttribute('stroke-linecap','round');
    this.trailPath.style.opacity = '0';
    tr.appendChild(this.trailPath);
    this.layer.insertBefore(tr, this.layer.firstChild);
    this.measureDocks();
    this.host.addEventListener('click', (e: any) => this.phoneTap(e));
    this.beginFlight(this.docks[0]);
  }

  measureDocks() {
    if (!this.docks || this.narrow) return;
    this.fitDocks();
    const y = window.scrollY;
    this.docks.forEach((d: any) => { d.dy = d.el.getBoundingClientRect().top + y; });
  }

  /* the phone must clear the floating header and still fit a short viewport */
  fitDocks() {
    const room = window.innerHeight - 150;
    const f = clamp(room / PH, 0.34, 1);
    if (f === this.fitF) return;
    this.fitF = f;
    this.docks.forEach((d: any) => {
      if (d.sc0 == null) d.sc0 = d.sc;
      d.sc = Math.max(0.34, Math.min(d.sc0, f));
      d.el.style.width = Math.round(PW * d.sc) + 'px';
      d.el.style.height = Math.round(PH * d.sc) + 'px';
    });
  }

  livePos(d: any) { const r = d.el.getBoundingClientRect(); return { x:r.left, y:r.top, s:d.sc }; }

  /* On a phone the flying rig makes no sense. Each dock becomes a plain screen,
     sized from the column it actually sits in rather than from the viewport, so it
     can never be wider than the box that clips it. */
  inlineDock(d: any) {
    const el = d.el;
    el.style.width = '100%';
    el.style.maxWidth = '393px';
    el.style.height = 'auto';
    el.style.margin = '0 auto';
    el.style.border = '0';
    el.style.overflow = 'hidden';
    const box = Math.round(el.getBoundingClientRect().width) || Math.min(393, window.innerWidth - 36);
    const w = Math.max(220, Math.min(393, box)), sc = w/393;
    const h = Math.round(852*sc), r = Math.round(30*sc);
    el.style.height = '';
    el.style.aspectRatio = '393 / 852';
    el.style.borderRadius = r+'px';
    el.style.boxShadow = '0 0 0 1px var(--line), 0 18px 42px -28px rgba(35,36,31,.5)';
    d.iw = w;
    el.appendChild(this.skel(w, h, r));
    this.addTrig(el, -700, () => {
      const w2 = Math.max(220, Math.min(393, Math.round(el.getBoundingClientRect().width))), s2 = w2/393;
      d.iw = w2;
      el.style.borderRadius = Math.round(30*s2)+'px';
      el.innerHTML = '';
      el.appendChild(this.screenEl(d.key, s2, false));
    });
  }

  /* A breakpoint crossing rebuilds the pixel-measured pieces: the phone rig, the
     flanking screens and the graphics that scroll instead of shrinking. */
  reflow() {
    if (!this.docks) return;
    this.trig = (this.trig||[]).filter((t: any) => !(t.el.hasAttribute('data-dock') || t.el.hasAttribute('data-static')));
    this.qa('[data-dock],[data-static]').forEach((el: any) => { el.innerHTML = ''; el.setAttribute('style', el.__css0 || ''); });
    this.cur = null; this.fl = null; this.fitF = null;
    (this.wides||[]).forEach((g: any) => this.applyWide(g));
    this.buildDocks();
    this.buildStatics();
    this.dirty = true;
  }

  refitInline() {
    if (!this.docks || !this.narrow) return;
    this.docks.forEach((d: any) => {
      const el = d.el;
      const w2 = Math.max(220, Math.min(393, Math.round(el.getBoundingClientRect().width)));
      if (!w2 || Math.abs((d.iw || 0) - w2) < 5) return;
      d.iw = w2;
      const s2 = w2/393;
      el.style.borderRadius = Math.round(30*s2)+'px';
      if (el.firstElementChild) { el.innerHTML = ''; el.appendChild(this.screenEl(d.key, s2, false)); }
    });
    this.dirty = true;
  }

  /* A pixel-drawn map does not survive being squeezed into 320px: it either crops
     its route away or shrinks its labels past reading. On phones the frame scrolls. */
  wide(els: any, w: any, h?: any) {
    els = (els||[]).filter(Boolean);
    if (!els.length || !els[0].parentElement) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:relative; overscroll-behavior-x:contain; -webkit-overflow-scrolling:touch;';
    els[0].parentElement.insertBefore(box, els[0]);
    const g = { box, els, w, h, h0: els.map((e: any) => e.style.height || '') };
    els.forEach((e: any) => box.appendChild(e));
    (this.wides = this.wides || []).push(g);
    this.applyWide(g);
  }

  applyWide(g: any) {
    const on = !!this.narrow;
    g.box.style.overflowX = on ? 'auto' : 'visible';
    g.els.forEach((e: any,i: any) => {
      e.style.width = on ? g.w+'px' : '';
      e.style.minWidth = on ? g.w+'px' : '';
      if (g.h) e.style.height = on ? g.h : (g.h0[i] || '');
    });
  }

  buildStatics() {
    this.qa('[data-static]').forEach((el: any) => {
      if (el.__css0 == null) el.__css0 = el.getAttribute('style') || '';
      let sc = Math.max(0.52, parseFloat(el.getAttribute('data-scale')||'0.54'));
      if (this.narrow) sc = Math.max(0.42, Math.min(0.52, (window.innerWidth-70)/PW));
      const w = Math.round(PW*sc), h = Math.round(PH*sc);
      el.style.width = w+'px'; el.style.height = h+'px'; el.style.flex = 'none';
      el.appendChild(this.skel(w, h, Math.round(54*sc)));
      this.addTrig(el, -800, () => { el.innerHTML = ''; el.appendChild(this.screenEl(el.getAttribute('data-static'), sc, true)); });
    });
  }

  beginFlight(next: any) {
    if (!next || this.cur === next) return;
    const prev = this.cur;
    this.cur = next; this.flowIdx = 0;
    if (!prev || this.rm) {
      this.fl = null;
      const r = this.livePos(next);
      this.pv.x = r.x; this.pv.y = r.y; this.pv.s = r.s;
      this.swap(next.key, prev ? next.kind : 'none');
      return;
    }
    const a = { x:this.pv.x, y:this.pv.y, s:this.pv.s };
    const pr = this.livePos(prev), b = this.livePos(next);
    this.nextIdle = 0;
    this.fl = {
      from: prev, to: next, t0: performance.now(),
      dur: this.calm ? 480 : 860, swapped: false, as: a.s,
      offX: a.x - pr.x, offY: a.y - pr.y,
      dir: ((a.x + b.x) / 2) > window.innerWidth / 2 ? 1 : -1
    };
    if (!this.calm) this.drawTrail(a, b, this.fl.dir);
  }

  arcPoint(a: any, b: any, dir: any, e: any) {
    const bow = Math.min(Math.abs(b.y - a.y) * 0.24 + Math.abs(b.x - a.x) * 0.12, 210) * dir;
    const cx = (a.x + b.x) / 2 + bow, cy = (a.y + b.y) / 2;
    const u = 1 - e;
    return { x: u*u*a.x + 2*u*e*cx + e*e*b.x, y: u*u*a.y + 2*u*e*cy + e*e*b.y };
  }

  drawTrail(a: any, b: any, dir: any) {
    const p = this.trailPath; if (!p) return;
    const hw = PW * a.s / 2, hh = PH * a.s / 2;
    const bow = Math.min(Math.abs(b.y-a.y)*0.24 + Math.abs(b.x-a.x)*0.12, 210) * dir;
    p.setAttribute('d','M '+(a.x+hw)+' '+(a.y+hh)+' Q '+((a.x+b.x)/2+bow+hw)+' '+((a.y+b.y)/2+hh)+' '+(b.x+PW*b.s/2)+' '+(b.y+PH*b.s/2));
    const L = p.getTotalLength();
    p.style.transition = 'none';
    p.style.strokeDasharray = L; p.style.strokeDashoffset = L; p.style.opacity = '.5';
    requestAnimationFrame(() => {
      p.style.transition = 'stroke-dashoffset .78s cubic-bezier(.5,0,.2,1), opacity .5s .5s';
      p.style.strokeDashoffset = '0'; p.style.opacity = '0';
    });
  }

  swap(key: any, kind: any) {
    if (this.hostKey === key) return;
    this.hostKey = key;
    const el = this.screenEl(key, 1, false, 0, true);
    el.style.cssText += 'position:absolute; inset:0; width:393px; height:852px; border-radius:44px;';
    const old = this.host.firstElementChild;
    if (this.rm || kind === 'none' || !old) { this.host.innerHTML = ''; this.host.appendChild(el); return; }
    if (kind === 'push') {
      el.style.animation = 'qf-push-in .42s cubic-bezier(.22,.9,.3,1)';
      old.style.animation = 'qf-push-out .42s cubic-bezier(.22,.9,.3,1) forwards';
    } else if (kind === 'sheet') {
      const sc = document.createElement('div');
      sc.style.cssText = 'position:absolute; inset:0; border-radius:44px; background:rgba(11,14,13,.42); animation:qf-scrim-in .3s ease forwards;';
      this.host.appendChild(sc); setTimeout(() => sc.remove(), 500);
      el.style.animation = 'qf-sheet-up .46s cubic-bezier(.22,.9,.3,1)';
    } else if (kind === 'tab') {
      el.style.animation = 'qf-scrim-in .28s ease';
      old.style.transition = 'opacity .28s'; old.style.opacity = '0';
    } else {
      el.style.animation = 'qf-screen-in .32s cubic-bezier(.22,.61,.36,1)';
    }
    this.host.appendChild(el);
    setTimeout(() => { if (old.parentNode === this.host) old.remove(); }, 500);
  }

  phoneTap(e: any) {
    this.userDriving = true; this.lastTouch = performance.now();
    const t = this.q('[data-autotxt]'), d = this.q('[data-autodot]');
    if (t) t.textContent = 'You'; if (d) d.style.background = 'var(--warn)';
    if (!this.rm) {
      const r = this.host.getBoundingClientRect();
      this.ripple((e.clientX-r.left)/ (r.width/393), (e.clientY-r.top)/(r.height/852), .45);
    }
    this.advance();
  }

  ripple(x: any, y: any, o: any) {
    const s = document.createElement('span');
    s.style.cssText = 'position:absolute; left:'+x+'px; top:'+y+'px; width:70px; height:70px; border-radius:50%; background:rgba(14,124,134,'+o+'); pointer-events:none; z-index:9; animation:qf-ripple .62s ease-out forwards;';
    this.host.appendChild(s); setTimeout(() => s.remove(), 640);
  }

  advance() {
    if (this.fl) return;
    const d = this.cur; if (!d || !d.flow.length) return;
    this.flowIdx = (this.flowIdx + 1) % d.flow.length;
    this.swap(d.flow[this.flowIdx], d.kind);
  }

  idle(now: any) {
    if (this.narrow || this.calm || this.props.autoDemo === false) return;
    if (this.userDriving) {
      if (now - this.lastTouch > 9000) {
        this.userDriving = false;
        const t = this.q('[data-autotxt]'), d = this.q('[data-autodot]');
        if (t) t.textContent = 'Auto'; if (d) d.style.background = 'var(--acc2)';
      }
      return;
    }
    if (this.fl) { this.nextIdle = 0; return; }
    if (!this.cur || !this.cur.flow.length || this.layer.style.opacity !== '1') return;
    if (!this.nextIdle) this.nextIdle = now + 4000;
    if (now < this.nextIdle) return;
    this.nextIdle = now + 4000;
    this.ripple(120 + Math.random()*150, 430 + Math.random()*250, .3);
    setTimeout(() => this.advance(), 180);
  }

  /* ═════ headline + survey type ═════ */
  splitHeads() {
    this.qa('[data-lines]').forEach((h: any) => {
      const parts = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = '';
      const rows: any[] = [];
      parts.forEach((p: any) => {
        const line = document.createElement('span');
        line.setAttribute('data-line','1');
        const inn = document.createElement('span');
        inn.innerHTML = p.trim();
        line.appendChild(inn); h.appendChild(line); rows.push(line);
      });
      if (this.rm) { rows.forEach(r => r.classList.add('in')); return; }
      this.addTrig(h, -60, () => rows.forEach((r,i) => setTimeout(() => r.classList.add('in'), i*90)));
    });
    this.qa('[data-plot]').forEach((el: any) => {
      const full = el.textContent;
      if (this.rm || full.length > 60) return;
      el.textContent = '';
      el.style.minHeight = '1em';
      this.addTrig(el, -40, () => {
        let i = 0;
        const t = setInterval(() => { el.textContent = full.slice(0, ++i); if (i >= full.length) clearInterval(t); }, 16);
      });
    });
    this.qa('[data-rv]').forEach((el: any) => this.addTrig(el, -80, () => el.classList.add('in')));
    this.qa('[data-count]').forEach((el: any) => this.addTrig(el, -100, () => {
      const to = parseInt(el.getAttribute('data-count'),10);
      if (this.rm) { el.textContent = inr(to); return; }
      const t0 = performance.now();
      const tick = (now: any) => { const p = Math.min(1,(now-t0)/1100), e = 1-Math.pow(1-p,3); el.textContent = inr(to*e); if (p<1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }));
  }

  /* ═════ wiring ═════ */
  wire() {
    this.q('[data-burger]').addEventListener('click', () => this.drawer(true));
    this.q('[data-drawerscrim]').addEventListener('click', () => this.drawer(false));

    this.qa('a[href^="#"]').forEach((a: any) => a.addEventListener('click', (e: any) => {
      const t = this.q(a.getAttribute('href'));
      if (!t) return;
      e.preventDefault();
      window.scrollTo({ top: t.offsetTop - 26, behavior: this.rm ? 'auto' : 'smooth' });
    }));

    if (!this.touch) {
      this.bind(window, 'pointermove', (e: any) => {
        this.px = e.clientX; this.py = e.clientY;
        this.dirty = true; this.ptrMoved = true;
        this.qa('[data-magnet]').forEach((b: any) => {
          const r = b.getBoundingClientRect();
          const dx = e.clientX - (r.left+r.width/2), dy = e.clientY - (r.top+r.height/2);
          const d = Math.hypot(dx,dy);
          if (d < 90) b.style.transform = 'translate(' + (dx*0.09).toFixed(1) + 'px,' + (dy*0.09).toFixed(1) + 'px)';
          else if (b.style.transform) b.style.transform = '';
        });
      }, { passive:true });
    }

    this.bind(document, 'keydown', (e: KeyboardEvent) => {
      const tag = ((e.target as HTMLElement | null)?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const k = e.key.toLowerCase();
      if (k === 'j') this.step(1);
      if (k === 'k') this.step(-1);
      if (e.key === '?') this.shortcuts();
      if (e.key === 'Escape') { this.q('[data-shortcuts]').style.display = 'none'; this.drawer(false); }
    });

    clearInterval(this.vwT);
    this.vwT = setInterval(() => {
      if (this.dead) return;
      const n = window.innerWidth < NARROW;
      if (n !== this.narrow) {
        this.narrow = n; this.reflow();
        this.capGrids(); this.measure(); this.measureDocks(); this.buildSpine(); this.dirty = true;
      } else if (n) this.refitInline();
    }, 1200);

    this.bind(window, 'scroll', () => { this.dirty = true; }, { passive:true });
    this.bind(window, 'resize', () => {
      clearTimeout(this.rzT);
      this.rzT = setTimeout(() => {
        const n = window.innerWidth < NARROW;
        if (n !== this.narrow) { this.narrow = n; this.reflow(); }
        else if (n) this.refitInline();
        this.capGrids(); this.measure(); this.measureDocks(); this.buildSpine(); this.dirty = true;
      }, 150);
    }, { passive:true });
    this.bind(window, 'orientationchange', () => {
      clearTimeout(this.rzT);
      this.rzT = setTimeout(() => {
        const n = window.innerWidth < NARROW;
        if (n !== this.narrow) { this.narrow = n; this.reflow(); }
        else if (n) this.refitInline();
        this.capGrids(); this.measure(); this.measureDocks(); this.buildSpine(); this.dirty = true;
      }, 260);
    }, { passive:true });

    const wl = this.q('[data-waitlist]');
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

    const jc = this.q('[data-joincode]');
    if (jc) jc.addEventListener('click', () => {
      const v = this.q('[data-codeval]').textContent;
      if (navigator.clipboard) navigator.clipboard.writeText(v).catch(()=>{});
      const st = this.q('[data-stamp]');
      st.style.transition = 'none'; st.style.opacity = '0';
      st.style.transform = 'translateY(-50%) scale(2.4) rotate(-13deg)';
      requestAnimationFrame(() => {
        st.style.transition = 'opacity .18s, transform .3s cubic-bezier(.34,1.56,.64,1)';
        st.style.opacity = '1'; st.style.transform = 'translateY(-50%) scale(1) rotate(-13deg)';
        setTimeout(() => { st.style.opacity = '0'; }, 1150);
      });
    });
  }

  step(dir: any) {
    const y = window.scrollY + 90;
    let i = 0;
    this.secTops.forEach((t: any,k: any) => { if (t <= y) i = k; });
    const t = this.sections[clamp(i+dir, 0, this.sections.length-1)];
    window.scrollTo({ top: t.offsetTop-26, behavior:'smooth' });
  }

  shortcuts() {
    const el = this.q('[data-shortcuts]');
    if (el.style.display === 'flex') { el.style.display = 'none'; return; }
    el.innerHTML = '<div style="background:var(--bg); border-radius:20px; padding:30px 34px; max-width:420px;"><div style="'+SUR+'">Keyboard</div>' +
      ['J / K — next and previous waypoint','Esc — close','? — this list']
        .map(t => '<div style="font-size:16px; color:var(--ink); margin-top:13px;">'+t+'</div>').join('') + '</div>';
    el.style.display = 'flex';
    el.onclick = () => { el.style.display = 'none'; };
  }

  /* ═════ frame loop ═════ */
  loop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.dead = false;
    this.dirty = true;
    this.lastY = window.scrollY;
    this.lastT = performance.now();
    const gen = (this.gen = (this.gen || 0) + 1);
    const tick = (now: any) => {
      if (gen !== this.gen) return;
      this.raf = requestAnimationFrame(tick);
      this.rafBeat = (this.rafBeat || 0) + 1;
      this.frame(now);
    };
    this.raf = requestAnimationFrame(tick);
    /* rAF is suspended outright in some embedded contexts. Keep a timer driver on
       standby so the page can never freeze, and stand it down when rAF is healthy. */
    clearInterval(this.watch);
    this.watch = setInterval(() => {
      if (gen !== this.gen) return;
      const rafAlive = this.rafBeat !== this.lastRafBeat;
      this.lastRafBeat = this.rafBeat;
      if (!rafAlive) {
        if (!this.fallback) this.fallback = setInterval(() => { if (gen === this.gen) this.frame(performance.now()); }, 32);
        if (this.raf) cancelAnimationFrame(this.raf);
        this.raf = requestAnimationFrame(tick);
      } else if (this.fallback) { clearInterval(this.fallback); this.fallback = null; }
    }, 800);
  }

  frame(now: any) {
    window.__QAF = this;
    this.beat = (this.beat || 0) + 1;
    try { this.frameBody(now); } catch (e: any) { window.__QAF_FERR = String((e && e.stack) || e); }
  }

  frameBody(now: any) {
    const dt = Math.min(50, now - this.lastT) || 16.7; this.lastT = now;
    const y = window.scrollY, vh = window.innerHeight;
    const dy = y - this.lastY; this.lastY = y;
    if (Math.abs(dy) > 0.4) this.dirty = true;
    this.scrollV = (this.scrollV || 0) * 0.86 + dy * 0.14;
    this.runTrig(y, vh);
    const H = this.root.scrollHeight;
    if (Math.abs(H - (this.lastH || 0)) > 30) {
      this.lastH = H;
      clearTimeout(this.reT);
      this.reT = setTimeout(() => { this.measure(); this.measureDocks(); this.buildSpine(); this.dirty = true; }, 140);
    }
    this.idle(now);
    let mp = false, md = false;
    try { mp = this.stepPhone(y, vh, dt, now); } catch (e) { console.error('[qafilaa] stepPhone', e); }
    try { md = this.stepDots(y, dt); } catch (e) { console.error('[qafilaa] stepDots', e); }
    if (this.dirty || mp || md || Math.abs(this.scrollV) > 0.3) { this.paint(y, vh); this.dirty = false; }
  }

  stepPhone(y: any, vh: any, dt: any, now: any) {
    if (!this.docks || this.narrow || !this.docks.length) return false;
    /* selection is pure arithmetic off cached document offsets — no layout reads */
    const focus = y + vh * 0.5;
    let best = null, bd = 1e9;
    for (const d of this.docks) {
      const dist = Math.abs((d.dy + PH * d.sc / 2) - focus);
      if (dist < bd) { bd = dist; best = d; }
    }
    const op = bd < vh * 0.92 ? '1' : '0';
    if (this.layer.style.opacity !== op) this.layer.style.opacity = op;
    if (best !== this.cur) this.beginFlight(best);

    const p = this.pv;
    let bank = 0, lift = 1, flying = false;

    if (this.fl) {
      const f = this.fl;
      const bNow = this.livePos(f.to);
      /* origin rides the page too, so the flight never fights the scroll */
      const aNow = this.livePos(f.from);
      const a = { x: aNow.x + f.offX, y: aNow.y + f.offY, s: f.as };
      let t = (now - f.t0) / f.dur;
      if (t > 1) t = 1;
      const e = t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2;
      if (this.calm) {
        p.x = a.x + (bNow.x - a.x) * e;
        p.y = a.y + (bNow.y - a.y) * e;
      } else {
        const pt = this.arcPoint(a, bNow, f.dir, e);
        p.x = pt.x; p.y = pt.y;
        const arc = Math.sin(e * Math.PI);
        bank = arc * 9 * -f.dir;
        lift = 1 - arc * 0.065;
      }
      p.s = a.s + (bNow.s - a.s) * e;
      if (!f.swapped && e > 0.38) { f.swapped = true; this.flowIdx = 0; this.swap(f.to.key, f.to.kind); }
      if (t >= 1) { this.fl = null; if (this.dots) this.pulseLead(); }
      flying = true;
    } else if (this.cur) {
      const r = this.livePos(this.cur);
      p.x = r.x; p.y = r.y; p.s = r.s;
      if (!this.calm) p.y += Math.sin(now / 2700) * 2.2;
    }

    this.pos.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0) scale(' + (p.s * lift).toFixed(4) + ')';

    if (!this.calm && !this.touch) {
      const k = Math.min(1, dt / 16.67);
      const cx = p.x + PW*p.s/2, cy = p.y + PH*p.s/2;
      const nx = clamp((this.px - cx) / 520, -1, 1), ny = clamp((this.py - cy) / 520, -1, 1);
      const lean = clamp(-(this.scrollV||0) * 0.09, -4, 4) + bank;
      p.rx += (-ny*6.5 - p.rx) * 0.085 * k;
      p.ry += (nx*6.5 - p.ry) * 0.085 * k;
      p.rz += (lean - p.rz) * (flying ? 0.30 : 0.11) * k;
      this.tiltEl.style.transform = 'perspective(1500px) rotateX(' + p.rx.toFixed(2) + 'deg) rotateY(' + p.ry.toFixed(2) + 'deg) rotate(' + p.rz.toFixed(2) + 'deg)';
      const ang = Math.round(108 + nx*46 + p.rz*2);
      if (ang !== this.sheenAng) {
        this.sheenAng = ang;
        const sh = this.q('[data-sheen]');
        if (sh) sh.style.backgroundImage = 'linear-gradient(' + ang + 'deg, rgba(255,255,255,0) 36%, rgba(255,255,255,.55) 50%, rgba(255,255,255,0) 64%)';
      }
    }
    return flying || (!this.calm && op === '1');
  }

  paintNavDot(act: any) {
    if (!this.navMap) {
      const ids = ['plan','ride','safety','offline'];
      this.navMap = {};
      this.qa('[data-navlinks] a').forEach((a: any) => {
        const id = (a.getAttribute('href') || '').slice(1);
        if (ids.indexOf(id) >= 0) this.navMap[id] = a;
      });
      this.navOwner = {};
      const secIds = this.sections.map((s: any) => s.id);
      let cur: any = null;
      secIds.forEach((sid: any, i: any) => { if (ids.indexOf(sid) >= 0) cur = sid; this.navOwner[i] = cur; });
      this.navDot = this.q('[data-navind]');
      this.qa('[data-navlink]').forEach((a: any) => {
        a.addEventListener('mouseenter', () => this.moveInd(a));
        a.addEventListener('mouseleave', () => this.moveInd(this.navActiveEl));
      });
    }
    const own = this.navOwner[act];
    if (own === this.navOwn) return;
    this.navOwn = own;
    const a = own && this.navMap[own];
    this.qa('[data-navlink]').forEach((l: any) => { l.style.color = 'var(--mut)'; });
    this.navActiveEl = a || null;
    if (a) a.style.color = 'var(--acc)';
    this.moveInd(this.navActiveEl);
  }

  moveInd(a: any) {
    const d = this.navDot; if (!d) return;
    if (!a || !a.offsetWidth) { d.style.opacity = '0'; return; }
    d.style.opacity = '1';
    d.style.width = a.offsetWidth + 'px';
    d.style.transform = 'translateX(' + a.offsetLeft + 'px)';
  }

  pulseLead() {
    const el = this.dots[0].el;
    el.setAttribute('r','9');
    setTimeout(() => el.setAttribute('r','6'), 220);
  }

  stepDots(y: any, dt: any) {
    if (!this.dots) return false;
    const head = clamp(y / this.docH, 0, 1) * this.spineH;
    const k = Math.min(2.4, dt / 16.67);
    let moving = false;
    for (let i = 0; i < this.dots.length; i++) {
      const d = this.dots[i];
      const target = i === 0 ? head : this.dots[i-1].y - 26;
      if (this.rm) { d.y = target; continue; }
      d.v = (d.v + (target - d.y) * d.k * k) * Math.pow(0.80, k);
      d.y += d.v;
      if (Math.abs(d.v) > 0.25) moving = true;
    }
    return moving;
  }

  paint(y: any, vh: any) {
    const p = clamp(y / this.docH, 0, 1);
    /* tone interpolation */
    let i = 0;
    const focus = y + vh*0.5;
    this.secTops.forEach((t: any,k: any) => { if (t <= focus) i = k; });
    const cur = this.tones[i];
    let t2: any = null, other: any = null;
    const nb = this.secTops[i+1];
    if (nb != null && focus > nb - 120) { other = this.tones[i+1]; t2 = clamp((focus - (nb-120))/240, 0, 1); }
    else if (i > 0 && focus < this.secTops[i] + 120) { other = this.tones[i-1]; t2 = clamp(1 - (focus - (this.secTops[i]-120))/240, 0, 1); }
    const sig = i + '|' + (other ? Math.round(t2 * 44) : -1);
    if (sig !== this.toneSig) {
      this.toneSig = sig;
      const rs = document.documentElement.style;
      for (const k of KEYS) rs.setProperty('--' + k, other ? mix(cur[k], other[k], t2) : cur[k]);
      const dp = this.q('[data-drawerpanel]');
      if (dp) dp.style.background = other ? mix(cur.bg, other.bg, t2) : cur.bg;
    }
    const nvB = other ? mix(cur.navBg, other.navBg, t2) : cur.navBg;
    const nvA = other ? cur.navA + (other.navA - cur.navA) * t2 : cur.navA;
    const nvL = other ? mix(cur.navLine, other.navLine, t2) : cur.navLine;
    const nvLA = other ? cur.navLineA + (other.navLineA - cur.navLineA) * t2 : cur.navLineA;
    const navBg = alphaOf(nvB, nvA), navLine = alphaOf(nvL, nvLA);
    if (navBg !== this.navBgSig) {
      this.navBgSig = navBg;
      const rs2 = document.documentElement.style;
      rs2.setProperty('--navbg', navBg);
      rs2.setProperty('--navline', navLine);
    }
    const dens = other ? cur.dens + (other.dens - cur.dens) * t2 : cur.dens;
    if (!this.bgSet) { this.bgSet = true; this.q('[data-bglayer]').style.background = 'var(--bg)'; }
    if (this.bands && (Math.abs(y - (this.ctrY == null ? -1e5 : this.ctrY)) > 2 || this.ptrMoved)) {
      this.ctrY = y; this.ptrMoved = false;
      this.drawContours(y, dens);
    }

    /* spine */
    if (this.segs) {
      const headY = p * this.spineH, hi = Math.floor(headY/this.SEG);
      const lo = Math.floor((y - this.SEG)/this.SEG), hv = Math.ceil((y + vh + this.SEG)/this.SEG);
      for (let k = 0; k < this.segs.length; k++) {
        const s = this.segs[k];
        const vis = k >= lo && k <= hv;
        if (vis !== s.vis) { s.vis = vis; const dsp = vis?'':'none'; s.el.style.display = dsp; s.base[0].style.display = dsp; s.base[1].style.display = dsp; }
        if (!vis) continue;
        if (k === hi) { s.el.style.strokeDashoffset = s.len * (1 - (headY - s.top)/this.SEG); s.state = 2; }
        else { const w = k < hi ? 1 : 0; if (s.state !== w) { s.el.style.strokeDashoffset = w ? 0 : s.len; s.state = w; } }
      }
      this.shift.setAttribute('transform','translate(0,' + (-y) + ')');
      for (let k = 0; k < this.dots.length; k++) {
        const pt = this.spinePoint(clamp(this.dots[k].y, 0, this.spineH));
        this.dots[k].el.setAttribute('cx', pt.x.toFixed(1));
        this.dots[k].el.setAttribute('cy', pt.y.toFixed(1));
        if (k === 0) { this.ring.setAttribute('cx', pt.x.toFixed(1)); this.ring.setAttribute('cy', pt.y.toFixed(1)); }
      }
    }

    /* readout from real itinerary */
    const km = p * TOTAL_KM;
    let acc = 0, alt = DAYS[0].alt;
    for (let k = 0; k < DAYS.length; k++) {
      const seg = DAYS[k].km || 40;
      if (km <= acc + seg) {
        const f = (km - acc)/seg;
        const a0 = k ? DAYS[k-1].alt : DAYS[0].alt;
        alt = a0 + (DAYS[k].alt - a0) * f;
        break;
      }
      acc += seg; alt = DAYS[k].alt;
    }
    const ro = 'ALT ' + inr(alt) + ' M|KM ' + inr(km) + ' / ' + inr(TOTAL_KM);
    if (ro !== this.roSig) {
      this.roSig = ro; const parts = ro.split('|');
      this.q('[data-ro-alt]').textContent = parts[0];
      this.q('[data-ro-km]').textContent = parts[1];
    }
    if (this.dots) {
      const sp = (Math.abs(this.dots[0].y - this.dots[this.dots.length-1].y) / this.spineH * TOTAL_KM).toFixed(1);
      if (sp !== this.stSig) { this.stSig = sp; this.q('[data-ro-st]').textContent = 'STRETCH ' + sp + ' KM'; }
    }

    /* nav + rail */
    const pill = this.q('[data-navpill]');
    const deep = y > 40;
    if (deep !== this.navDeep) {
      this.navDeep = deep;
      pill.style.boxShadow = deep
        ? '0 2px 4px rgba(35,36,31,.07), 0 16px 44px rgba(35,36,31,.16)'
        : '0 1px 2px rgba(35,36,31,.05), 0 10px 34px rgba(35,36,31,.10)';
    }
    const pct = (p * 100).toFixed(2) + '%';
    if (pct !== this.railPct) {
      this.railPct = pct;
      const fl = this.q('[data-navrailfill]'), hd = this.q('[data-navrailhead]');
      if (fl) fl.style.width = pct;
      if (hd) hd.style.left = pct;
    }
    if (this.navMark === undefined) this.navMark = this.q('[data-navmark]');
    if (this.navMark && !this.calm) {
      const lean = clamp(-(this.scrollV || 0) * 0.5, -7, 7);
      this.navMark.style.transform = 'rotate(' + lean.toFixed(2) + 'deg)';
    }
    /* The handoff floats the nav away on a fast scroll down and returns it when
       you look back up. Kept pinned instead: it carries the only route to the
       policy pages and the Get-the-app CTA, and on a phone the waypoint drawer
       behind the burger is the only navigation there is. The pill is already
       position:fixed in the markup, so dropping the transform is all it takes.
       Declared divergence - CLAUDE.md section 3. */

    let act = 0;
    this.secTops.forEach((t: any,k: any) => { if (t - 180 <= y) act = k; });
    this.paintNavDot(act);
    const wp = String(act).padStart(2,'0') + ' / ' + String(this.sections.length-1).padStart(2,'0');
    if (wp !== this.wpSig) { this.wpSig = wp; const el = this.q('[data-wpnum]'); if (el) el.textContent = wp; }
    if (this.railItems) this.railItems.forEach((r: any,k: any) => {
      r.bar.style.width = k === act ? '30px' : '16px';
      r.bar.style.background = k === act ? 'var(--acc2)' : 'var(--line)';
    });
    if (this.onPaint) this.onPaint(y, vh, p);
  }

  /* ═════ builders A ═════ */
  buildStepper() {
    const wrap = this.q('[data-stepper]');
    const S = [['B1','Profile','profile','Name, phone, photo. Two minutes, once.'],
      ['B2','Your bikes','bikes','Make, model, registration, service due.'],
      ['B3','Medical card','medical','Blood group, allergies, conditions.'],
      ['B4','Documents','docsB5','Licence, RC, insurance, PUC, permits.']];
    this.stepList = S; this.stepIdx = 2;
    wrap.innerHTML = '';
    this.stepEls = S.map((s,i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-tap','1');
      b.style.cssText = 'display:flex; gap:16px; align-items:flex-start; text-align:left; width:100%; padding:15px 18px; border:none; border-left:2px solid var(--line); background:transparent; cursor:pointer; transition:background .22s, border-color .22s; min-height:44px;';
      b.innerHTML = '<span style="'+SUR+' padding-top:3px;">'+s[0]+'</span><span><span style="display:block; '+SG+' font-size:18px; font-weight:500; color:var(--ink);">'+s[1]+'</span><span style="display:block; font-size:15px; color:var(--mut); margin-top:3px;">'+s[3]+'</span></span>';
      const go = () => { this.stepIdx = i; this.paintStep(); this.userDriving = true; this.lastTouch = performance.now(); };
      b.addEventListener('click', go); b.addEventListener('mouseenter', go);
      wrap.appendChild(b); return b;
    });
    this.paintStep();
  }
  paintStep() {
    this.stepEls.forEach((b: any,j: any) => {
      b.style.borderLeftColor = j === this.stepIdx ? 'var(--acc2)' : 'var(--line)';
      b.style.background = j === this.stepIdx ? 'var(--card)' : 'transparent';
    });
    const d = this.docks && this.docks.find((x: any) => x.el.closest('#setup'));
    if (d) { d.key = this.stepList[this.stepIdx][2]; if (this.cur === d) this.swap(d.key, 'tab'); }
  }

  buildPerms() {
    const wrap = this.q('[data-permcards]');
    const C = [['C2','Background location','Your phone stops sharing the moment the screen goes off. Always-on is the only setting that keeps the convoy honest.','permLoc'],
      ['C3','Motion and fitness','Crash detection reads the accelerometer. Without it, a fall is just a phone that stopped moving.','permMotion'],
      ['C4','Notifications','An SOS has to reach you on the lock screen, in a mount, at 80 kmph.','permNotif']];
    wrap.innerHTML = '';
    C.forEach(c => {
      const el = document.createElement('div');
      el.setAttribute('data-rv','1');
      el.style.cssText = 'background:var(--card); border:1px solid var(--line); border-radius:18px; padding:24px; display:flex; flex-direction:column; gap:11px; transition:transform .24s cubic-bezier(.22,.61,.36,1), box-shadow .24s;';
      el.innerHTML = '<span style="'+SUR+'">'+c[0]+'</span><span style="'+SG+' font-size:22px; font-weight:500;">'+c[1]+'</span><span style="font-size:15px; line-height:1.6; color:var(--mut);">'+c[2]+'</span>';
      const shot = document.createElement('div');
      shot.style.cssText = 'position:relative; margin-top:4px; border-radius:14px; overflow:hidden; display:flex; justify-content:center;';
      shot.appendChild(this.screenEl(c[3], 0.52, false, 380));
      const fade = document.createElement('span');
      fade.style.cssText = 'position:absolute; left:0; right:0; bottom:0; height:64px; background:linear-gradient(180deg, rgba(255,255,255,0), var(--card) 92%); pointer-events:none;';
      shot.appendChild(fade); el.appendChild(shot);
      el.addEventListener('mouseenter', () => { el.style.transform = 'translateY(-6px)'; el.style.boxShadow = '0 18px 40px rgba(35,36,31,.10)'; });
      el.addEventListener('mouseleave', () => { el.style.transform = ''; el.style.boxShadow = 'none'; });
      wrap.appendChild(el);
    });
  }

  buildTripCard() {
    const el = this.q('[data-tripcard]');
    const riding = DAYS.filter(d => d.pass !== 'Acclimatise').length;
    const rows = [['Trip', TRIP.route],['Dates', TRIP.dates],['Distance', inr(TOTAL_KM)+' km'],['Days', riding+' riding · 1 rest'],['Max altitude', inr(MAXD.alt)+' m · '+MAXD.pass],['Crew', CREW.length + ' riders']];
    el.innerHTML = '<div style="'+SUR+' margin-bottom:12px;">Assembling</div>';
    rows.forEach((r,i) => {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex; justify-content:space-between; gap:16px; padding:11px 0; border-bottom:1px solid var(--line); opacity:0; animation:qf-stagger .5s cubic-bezier(.22,.61,.36,1) forwards; animation-delay:'+(i*0.12+0.15)+'s;';
      d.innerHTML = '<span style="font-size:15px; color:var(--mut);">'+r[0]+'</span><span style="'+SG+' font-size:16px; font-weight:500;">'+r[1]+'</span>';
      el.appendChild(d);
    });
  }

  buildCrewFan() {
    const w = this.q('[data-crewfan]'); w.innerHTML = '';
    const av: any[] = CREW.map((c,i) => {
      const a = document.createElement('div');
      a.style.cssText = 'position:relative; width:52px; height:52px; border-radius:50%; background:'+c.c+'; color:#F7F5F0; display:flex; align-items:center; justify-content:center; '+SG+' font-weight:600; font-size:16px; border:3px solid var(--bg); margin-left:'+(i?'-16px':'0')+'; transition:margin .3s cubic-bezier(.34,1.56,.64,1);';
      a.innerHTML = c.id + '<span style="position:absolute; top:-24px; left:50%; transform:translateX(-50%); '+SUR+' font-size:10px; opacity:0; transition:opacity .2s; white-space:nowrap;">'+c.role+'</span>';
      w.appendChild(a); return a;
    });
    w.addEventListener('mouseenter', () => av.forEach((a: any, i: any) => { a.style.marginLeft = i?'10px':'0'; a.firstElementChild.style.opacity = '1'; }));
    w.addEventListener('mouseleave', () => av.forEach((a: any, i: any) => { a.style.marginLeft = i?'-16px':'0'; a.firstElementChild.style.opacity = '0'; }));
  }

  buildLegMap() {
    const map = this.q('[data-legmap]');
    map.innerHTML = '<svg viewBox="0 0 760 340" preserveAspectRatio="xMidYMid slice" style="position:absolute; inset:0; width:100%; height:100%;" aria-hidden="true">' +
      '<g data-legpan="1"><g fill="none" stroke="var(--line)" stroke-width="1.2">' +
      '<path d="M-10 56C120 36 260 86 400 58 540 30 660 74 780 48"></path><path d="M-10 124C120 104 260 154 400 126 540 98 660 142 780 116"></path>' +
      '<path d="M-10 192C120 172 260 222 400 194 540 166 660 210 780 184"></path><path d="M-10 260C120 240 260 290 400 262 540 234 660 278 780 252"></path>' +
      '<path d="M-10 318C120 298 260 344 400 318 540 290 660 332 780 308"></path></g>' +
      '<path data-legpath="1" d="M66 288 C 146 268 166 200 246 190 C 326 180 346 122 426 120 C 496 118 536 72 606 68 C 656 65 686 90 702 104" fill="none" stroke="var(--acc2)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></path>' +
      '<g data-legpins="1"></g></g></svg>' +
      '<div data-legchip="1" style="position:absolute; left:18px; top:16px; '+SUR+' background:var(--card); border:1px solid var(--line); border-radius:999px; padding:7px 12px;">Day 1</div>';
    const p = this.q('[data-legpath]');
    this.legPath = p; this.legLen = p.getTotalLength();
    p.style.strokeDasharray = this.legLen; p.style.strokeDashoffset = this.legLen;
    p.style.transition = 'stroke-dashoffset .7s cubic-bezier(.22,.9,.3,1)';
    const pins = this.q('[data-legpins]');
    this.legPins = DAYS.map((d,i) => {
      const pt = p.getPointAtLength((i/(DAYS.length-1))*this.legLen);
      const g = document.createElementNS('http://www.w3.org/2000/svg','g');
      g.setAttribute('transform','translate('+pt.x+','+pt.y+') scale(0)');
      g.style.transition = 'transform .5s cubic-bezier(.34,1.56,.64,1)';
      const named = PASSES.indexOf(d.pass) >= 0;
      const above = pt.y > 170;
      const anchor = i === 0 ? 'start' : (i === DAYS.length-1 ? 'end' : 'middle');
      const dx = i === 0 ? -6 : (i === DAYS.length-1 ? 6 : 0);
      g.innerHTML = '<circle r="7" fill="var(--card)" stroke="var(--acc2)" stroke-width="2.5"></circle><circle r="3" fill="var(--acc2)"></circle>' +
        (named ? '<text x="'+dx+'" y="'+(above ? -16 : 23)+'" text-anchor="'+anchor+'" fill="var(--sur)" font-size="10" font-family="Space Grotesk, sans-serif" stroke="var(--card)" stroke-width="3.5" style="paint-order:stroke;">'+d.pass+'</text>' : '');
      (g as any).__pt = pt; pins.appendChild(g); return g;
    });

    const el = this.q('[data-elev]');
    const EH = 176, X0 = 46, X1 = 714;
    const pts = DAYS.map((d,i) => [X0 + i*((X1-X0)/(DAYS.length-1)), 128 - ((d.alt-3000)/2500)*96]);
    const line = 'M ' + pts.map(a => a[0].toFixed(1)+' '+a[1].toFixed(1)).join(' L ');
    const mxi = DAYS.indexOf(MAXD), mx = pts[mxi], dip = pts[RESTD];
    el.innerHTML = '<svg viewBox="0 0 760 '+EH+'" preserveAspectRatio="none" style="position:absolute; inset:0; width:100%; height:100%;" aria-hidden="true">' +
      '<path d="'+line+' L '+X1+' '+EH+' L '+X0+' '+EH+' Z" fill="rgba(14,124,134,.10)"></path>' +
      '<path data-elevline="1" d="'+line+'" fill="none" stroke="var(--acc2)" stroke-width="2" stroke-linejoin="round"></path>' +
      '<line x1="'+dip[0]+'" y1="'+(dip[1]+6)+'" x2="'+dip[0]+'" y2="'+(EH-46)+'" stroke="var(--warn)" stroke-width="1" stroke-dasharray="3 4" opacity=".8"></line>' +
      '<circle cx="'+dip[0]+'" cy="'+dip[1]+'" r="4" fill="var(--warn)"></circle>' +
      '<circle cx="'+mx[0]+'" cy="'+mx[1]+'" r="5" fill="none" stroke="var(--acc2)" stroke-width="2"></circle>' +
      '<circle data-elevday="1" r="5" fill="var(--acc2)" cx="'+pts[0][0]+'" cy="'+pts[0][1]+'" style="transition:cx .4s cubic-bezier(.22,.9,.3,1), cy .4s cubic-bezier(.22,.9,.3,1);"></circle></svg>' +
      '<div style="position:absolute; left:'+(mx[0]/760*100)+'%; top:6px; transform:translateX(-50%); '+SUR+' white-space:nowrap; color:var(--acc);">Trip max ' + inr(MAXD.alt) + ' m · ' + MAXD.pass + '</div>' +
      '<div style="position:absolute; left:'+(dip[0]/760*100)+'%; bottom:7px; transform:translateX(-50%); width:200px; text-align:center; '+SG+' font-size:11.5px; line-height:1.35; color:var(--warn);">Rest day. Altitude is not something you power through.</div>' +
      '<div data-elevlabel="1" style="position:absolute; right:14px; top:6px; '+SUR+'">Day 1 · 3,200 m</div>';
    this.elevPts = pts;
    const ln = this.q('[data-elevline]');
    const L = ln.getTotalLength();
    if (!this.rm) {
      ln.style.strokeDasharray = L; ln.style.strokeDashoffset = L;
      this.addTrig(el, -60, () => { ln.style.animation = 'qf-draw 1.3s cubic-bezier(.22,.9,.3,1) forwards'; });
    }

    this.wide([map, el], 760);
    const rail = this.q('[data-dayrail]'); rail.innerHTML = '';
    this.dayBtns = DAYS.map((d,i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-tap','1');
      b.style.cssText = 'flex:none; min-height:44px; padding:10px 16px; border:1px solid var(--line); border-radius:999px; background:var(--bg); cursor:pointer; '+SUR+' transition:background .2s, color .2s, border-color .2s;';
      b.textContent = 'Day ' + d.n + ' · ' + d.pass;
      b.addEventListener('click', () => this.setDay(i));
      rail.appendChild(b); return b;
    });
    this.setDay(0);
  }

  setDay(i: any) {
    const d = DAYS[i]; this.dayIdx = i;
    this.dayBtns.forEach((b: any,j: any) => {
      b.style.background = j===i ? 'var(--acc2)' : 'var(--bg)';
      b.style.color = j===i ? '#F7F5F0' : 'var(--sur)';
      b.style.borderColor = j===i ? 'var(--acc2)' : 'var(--line)';
    });
    this.q('[data-legchip]').textContent = d.pass === 'Acclimatise'
      ? 'Day '+d.n+' · '+d.from+' · rest day · '+d.km+' km local'
      : 'Day '+d.n+' · '+d.from+' → '+d.to+' · '+d.km+' km · '+d.pass;
    this.legPins.forEach((g: any,j: any) => {
      const on = j <= i;
      setTimeout(() => { g.setAttribute('transform','translate('+g.__pt.x+','+g.__pt.y+') scale('+(on?1:0)+')'); }, on ? j*70 : 0);
    });
    this.legPath.style.strokeDashoffset = this.legLen * (1 - (i+1)/DAYS.length);
    const pan = this.q('[data-legpan]');
    if (pan) { pan.style.transition = 'transform .6s cubic-bezier(.22,.9,.3,1)'; pan.style.transform = 'translate(' + (-i*11) + 'px,' + (i*5) + 'px)'; }
    const dd = this.q('[data-elevday]');
    if (dd) { dd.setAttribute('cx', this.elevPts[i][0]); dd.setAttribute('cy', this.elevPts[i][1]); }
    this.q('[data-elevlabel]').textContent = 'Day '+d.n+' · '+inr(d.alt)+' m';
    const dock = this.docks && this.docks.find((x: any) => x.el.closest('#itinerary'));
    if (dock) { dock.key = d.screen; if (this.cur === dock) this.swap(d.screen, 'push'); }
  }

  buildNights() {
    const w = this.q('[data-nights]'); w.innerHTML = '';
    const STAY: any = { Jispa:['Hotel Ibex',2400], Sarchu:['Sarchu Camp',3000], Leh:['Ladakh Sarai',2100], Nubra:['Nubra Sarai',3200], Pangong:['Lakeview Camp',3800] };
    const nights: any[] = [];
    DAYS.slice(0, DAYS.length-1).forEach((d,i) => {
      const last = nights[nights.length-1];
      if (last && last.place === d.to) { last.to = i+1; return; }
      nights.push({ place:d.to, from:i+1, to:i+1 });
    });
    nights.map((n,i) => {
      const s = STAY[n.place] || ['Camp', 2400], multi = n.to > n.from;
      return [multi ? 'N'+n.from+'–N'+n.to : 'N'+n.from, n.place, s[0],
        '₹'+inr(s[1]) + (multi ? ' / night' : ''), CREW[i % CREW.length].name];
    }).forEach((n,i) => {
      const d = document.createElement('div');
      d.setAttribute('data-rv','1');
      d.style.cssText = 'flex:1 1 210px; background:var(--card); border:1px solid var(--line); border-radius:14px; padding:16px; transition-delay:'+(i*0.07)+'s;';
      d.innerHTML = '<div style="'+SUR+' color:var(--acc);">'+n[0]+'</div><div style="'+SG+' font-size:18px; font-weight:500; margin-top:8px;">'+n[1]+'</div><div style="font-size:14px; color:var(--mut); margin-top:4px;">'+n[2]+'</div><div style="font-size:14px; color:var(--mut); margin-top:10px;">'+n[3]+' · paid by '+n[4]+'</div>';
      w.appendChild(d);
    });
  }

  buildSplit() {
    const CATS = [['Fuel', roleOf('Sweep').name],['Stay', roleOf('Coordinator').name],['Food', CREW[3].name],['Tolls', CREW[4].name],['Permits', roleOf('Coordinator').name],['Repairs', roleOf('Lead').name]];
    this.cats = CATS; this.cat = 0;
    const cw = this.q('[data-splitcats]'); cw.innerHTML = '';
    this.catBtns = CATS.map((c,i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-tap','1');
      b.style.cssText = 'min-height:44px; padding:10px 15px; border:1px solid var(--line); border-radius:999px; background:var(--bg); cursor:pointer; '+SUR;
      b.textContent = c[0];
      b.addEventListener('click', () => { this.cat = i; this.renderSplit(); });
      cw.appendChild(b); return b;
    });
    this.q('[data-splitslider]').addEventListener('input', () => this.renderSplit());
    this.renderSplit();
    this.wide([this.q('[data-splitviz]')], 560);
  }

  renderSplit() {
    const sl = this.q('[data-splitslider]');
    const amt = parseInt(sl.value,10);
    const payer = this.cats[this.cat][1];
    sl.setAttribute('aria-valuetext', '₹' + inr(amt) + ' paid by ' + payer);
    this.catBtns.forEach((b: any,i: any) => {
      b.style.background = i===this.cat ? 'var(--acc2)' : 'var(--bg)';
      b.style.color = i===this.cat ? '#F7F5F0' : 'var(--sur)';
      b.style.borderColor = i===this.cat ? 'var(--acc2)' : 'var(--line)';
    });
    this.q('[data-splitamt]').textContent = '₹' + inr(amt);
    this.q('[data-splitpayer]').textContent = 'paid by ' + payer;
    const pi = CREW.findIndex(c => c.name === payer);
    const n = CREW.length, base = Math.floor(amt/n), rem = amt - base*n;
    const shares = CREW.map((_c, i) => base + (i < rem ? 1 : 0));
    const viz = this.q('[data-splitviz]');
    const xs = CREW.map((_c, i) => 48 + i*93);
    let s = '<svg viewBox="0 0 560 200" preserveAspectRatio="xMidYMid meet" style="position:absolute; inset:0; width:100%; height:100%;" aria-hidden="true"><defs><marker id="qfa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="var(--acc2)"></path></marker></defs>';
    CREW.forEach((_c, i) => { if (i === pi) return;
      s += '<path d="M '+xs[i]+' 58 C '+((xs[i]+xs[pi])/2)+' 14, '+((xs[i]+xs[pi])/2)+' 14, '+xs[pi]+' 58" fill="none" stroke="var(--acc2)" stroke-width="1.4" opacity=".45" marker-end="url(#qfa)"></path>';
    });
    s += '</svg><div style="position:absolute; left:0; right:0; top:52px; display:flex; justify-content:space-between;">';
    CREW.forEach((c,i) => {
      const owes = i === pi ? amt - shares[i] : -shares[i];
      s += '<div style="display:flex; flex-direction:column; align-items:center; gap:7px; width:88px;">' +
        '<span style="width:42px; height:42px; border-radius:50%; background:'+c.c+'; color:#F7F5F0; display:flex; align-items:center; justify-content:center; '+SG+' font-weight:600; font-size:14px;">'+c.id+'</span>' +
        '<span style="font-size:13px; color:var(--mut);">'+c.name+'</span>' +
        '<span style="'+SG+' font-weight:600; font-size:14px; font-variant-numeric:tabular-nums; color:'+(owes>=0?'var(--acc)':'var(--warn)')+';">'+(owes>=0?'+':'−')+'₹'+inr(Math.abs(owes))+'</span></div>';
    });
    viz.innerHTML = s + '</div>';
  }

  buildChecklist() {
    this.clItems = ['Tool roll and tyre plug kit','Spare clutch and brake levers','Rain gear','Inner line permits, printed','Power bank and cable','First aid kit'];
    this.clPriv = ['Contact lenses and spares','Altitude tablets','Cash for Nubra'];
    this.clState = [true,true,false,false,false,false];
    this.clPrivState = [false,false,false];
    this.clMode = 0;
    const tog = this.q('[data-cltoggle]'); tog.innerHTML = '';
    ['Whole group','Just me'].forEach((t,i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'min-height:36px; padding:8px 13px; border:none; border-radius:999px; cursor:pointer; '+SUR+' font-size:10px;';
      b.textContent = t;
      b.addEventListener('click', () => { this.clMode = i; this.renderCl(); });
      tog.appendChild(b);
    });
    this.renderCl();
  }

  renderCl() {
    const tog = this.q('[data-cltoggle]');
    Array.from(tog.children).forEach((b: any, i: any) => {
      b.style.background = i===this.clMode ? 'var(--card)' : 'transparent';
      b.style.boxShadow = i===this.clMode ? '0 0 0 1px var(--line)' : 'none';
      b.style.color = i===this.clMode ? 'var(--ink)' : 'var(--mut)';
    });
    const list = this.clMode ? this.clPriv : this.clItems;
    const st = this.clMode ? this.clPrivState : this.clState;
    const w = this.q('[data-checklist]'); w.innerHTML = '';
    list.forEach((t: any,i: any) => {
      const r = document.createElement('button');
      r.type = 'button'; r.setAttribute('data-tap','1');
      r.setAttribute('aria-pressed', st[i] ? 'true' : 'false');
      r.style.cssText = 'display:flex; align-items:center; gap:12px; width:100%; text-align:left; min-height:44px; padding:11px 12px; border:none; border-radius:10px; background:'+(i%2?'color-mix(in srgb, var(--ink) 4%, transparent)':'transparent')+'; cursor:pointer;';
      r.innerHTML = '<span style="flex:none; width:20px; height:20px; border-radius:6px; border:1.5px solid '+(st[i]?'var(--acc2)':'var(--line)')+'; background:'+(st[i]?'var(--acc2)':'transparent')+'; display:flex; align-items:center; justify-content:center;">'+(st[i]?'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"></path></svg>':'')+'</span><span style="font-size:15px; color:'+(st[i]?'var(--mut)':'var(--ink)')+'; text-decoration:'+(st[i]?'line-through':'none')+';">'+t+'</span>';
      r.addEventListener('click', () => { st[i] = !st[i]; this.renderCl(); });
      w.appendChild(r);
    });
    const done = st.filter(Boolean).length;
    this.q('[data-clcount]').textContent = done+' of '+list.length+(this.clMode?' done':' packed');
    this.q('[data-clring]').setAttribute('stroke-dashoffset', String(88*(1-done/list.length)));
    this.q('[data-clstamp]').style.opacity = done === list.length ? '1' : '0';
  }

  buildPermitRows() {
    const w = this.q('[data-permitrows]'); w.innerHTML = '';
    const N = CREW.length;
    [['Inner Line · Nubra',N,N],['Inner Line · Pangong',N-1,N],['Wildlife fee · Pangong',N,N]].forEach(p => {
      const ok = p[1] === p[2];
      const d = document.createElement('div');
      d.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; padding:11px 13px; border-radius:10px; background:color-mix(in srgb, var(--ink) 4%, transparent);';
      d.innerHTML = '<span style="font-size:14px;">'+p[0]+'</span><span style="'+SUR+' color:'+(ok?'var(--acc)':'var(--warn)')+';">'+(ok?'✓ ':'! ')+p[1]+'/'+p[2]+'</span>';
      w.appendChild(d);
    });
  }

  buildGeofence() {
    this.q('[data-geofence]').innerHTML = '<svg viewBox="0 0 320 190" preserveAspectRatio="xMidYMid slice" style="position:absolute; inset:0; width:100%; height:100%;" aria-hidden="true">' +
      '<g fill="none" stroke="var(--line)" stroke-width="1"><path d="M-10 44C60 32 140 62 220 44 280 30 320 50 340 40"></path><path d="M-10 96C60 84 140 114 220 96 280 82 320 102 340 92"></path><path d="M-10 148C60 136 140 166 220 148 280 134 320 154 340 144"></path></g>' +
      '<path d="M20 168 C 90 148 120 106 180 98 C 230 91 270 64 306 48" fill="none" stroke="var(--acc2)" stroke-width="2.4" stroke-linecap="round"></path>' +
      '<circle cx="205" cy="92" r="46" fill="rgba(14,124,134,.08)" stroke="var(--acc2)" stroke-width="1.4" stroke-dasharray="5 5"></circle>' +
      '<circle cx="205" cy="92" r="5" fill="var(--acc2)"></circle><circle cx="60" cy="156" r="5" fill="var(--warn)"></circle></svg>' +
      '<div style="position:absolute; left:12px; bottom:9px; '+SUR+'">Geofence · 10 km · Sarchu</div>';
  }

  buildNoteDemo() {
    const w = this.q('[data-notedemo]');
    w.innerHTML = '<div style="background:var(--card); border:1px solid var(--line); border-radius:16px; padding:20px;">' +
      '<div style="display:flex; align-items:center; justify-content:space-between; gap:12px;"><span style="'+SUR+'">Day 3 · pinned</span><span style="'+SUR+' color:var(--acc);">'+roleOf('Lead').name+'</span></div>' +
      '<div style="'+SG+' font-size:19px; font-weight:500; margin-top:10px;">Tanglang La is icing over after 2 pm.</div>' +
      '<p style="margin:8px 0 0; font-size:15px; line-height:1.55; color:var(--mut);">Leaving Sarchu at 6 instead of 8. Fuel at Pang, nothing after that until Upshi.</p>' +
      '<div data-seenby="1" style="display:flex; align-items:center; gap:10px; margin-top:16px; padding-top:14px; border-top:1px solid var(--line);"></div></div>';
    const sb = this.q('[data-seenby]');
    sb.innerHTML = '<span style="'+SUR+'">Seen by</span>';
    const holder = document.createElement('span');
    holder.style.cssText = 'display:flex;';
    sb.appendChild(holder);
    const count = document.createElement('span');
    count.style.cssText = SUR + ' color:var(--acc);';
    sb.appendChild(count);
    this.addTrig(w, -80, () => {
      CREW.slice(1).forEach((c,i) => setTimeout(() => {
        const a = document.createElement('span');
        a.style.cssText = 'width:26px; height:26px; border-radius:50%; background:'+c.c+'; color:#F7F5F0; display:flex; align-items:center; justify-content:center; '+SG+' font-size:10px; font-weight:600; border:2px solid var(--card); margin-left:'+(i?'-8px':'0')+'; opacity:0; transform:scale(.4); transition:opacity .3s, transform .4s cubic-bezier(.34,1.56,.64,1);';
        a.textContent = c.id;
        holder.appendChild(a);
        requestAnimationFrame(() => { a.style.opacity = '1'; a.style.transform = 'none'; });
        count.textContent = (i+1) + ' of ' + (CREW.length-1);
      }, 400 + i*420));
    });
  }

  buildNudgeDemo() {
    const w = this.q('[data-nudgedemo]');
    w.innerHTML = '<div style="background:var(--card); border:1px solid var(--line); border-radius:16px; padding:20px;">' +
      '<div style="display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">' +
      '<div><div style="'+SG+' font-size:18px; font-weight:500;">Nudges</div><div data-nudgestate="1" style="font-size:14px; color:var(--mut); margin-top:3px;">Fuel, food and viewpoints on the corridor</div></div>' +
      '<button data-nudgebtn="1" type="button" role="switch" aria-checked="false" style="flex:none; width:58px; height:34px; border-radius:999px; border:none; background:var(--acc2); cursor:pointer; position:relative; transition:background .25s;">' +
      '<span data-knob="1" style="position:absolute; top:4px; left:28px; width:26px; height:26px; border-radius:50%; background:#fff; transition:left .25s cubic-bezier(.34,1.56,.64,1);"></span></button></div>' +
      '<div data-nudgelist="1" style="margin-top:14px; display:flex; flex-direction:column; gap:8px;"></div></div>';
    this.nudgeOn = true;
    this.q('[data-nudgebtn]').addEventListener('click', () => { this.nudgeOn = !this.nudgeOn; this.renderNudge(); });
    this.renderNudge();
  }

  renderNudge() {
    const on = this.nudgeOn;
    const b = this.q('[data-nudgebtn]');
    b.setAttribute('aria-checked', on ? 'false' : 'true');
    b.style.background = on ? 'var(--acc2)' : 'color-mix(in srgb, var(--ink) 18%, transparent)';
    this.q('[data-knob]').style.left = on ? '28px' : '4px';
    this.q('[data-nudgestate]').textContent = on ? 'Fuel, food and viewpoints on the corridor' : 'Essentials only for the rest of the trip';
    const list = on
      ? [['Fuel','Tandi · last pump for 365 km','var(--warn)'],['Food','Chacha Chachi Dhaba · 12 km','var(--acc)'],['Viewpoint','Gata Loops · 21 hairpins','var(--acc)']]
      : [['Fuel','Tandi · last pump for 365 km','var(--warn)']];
    const w = this.q('[data-nudgelist)'.replace(')',']'));
    w.innerHTML = '';
    list.forEach(n => {
      const d = document.createElement('div');
      d.style.cssText = 'display:flex; align-items:baseline; gap:12px; padding:11px 13px; border-radius:10px; background:color-mix(in srgb, var(--ink) 4%, transparent); animation:qf-stagger .35s ease;';
      d.innerHTML = '<span style="'+SUR+' color:'+n[2]+'; min-width:74px;">'+n[0]+'</span><span style="font-size:14px; color:var(--mut);">'+n[1]+'</span>';
      w.appendChild(d);
    });
  }

  /* ═════ builders B ═════ */
  buildReadiness() {
    const w = this.q('[data-readiness]');
    this.ready = [[1,1,1,1],[1,1,1,1],[1,0,0,1],[1,1,1,1],[1,1,1,1]];
    const cols = ['Medical','Offline map','Fuel','Permits'];
    w.innerHTML = '<div style="display:grid; grid-template-columns:1.5fr repeat(4,1fr); gap:8px; padding:14px 18px; border-bottom:1px solid var(--line); '+SUR+'"><span>Rider</span>'+cols.map(c=>'<span>'+c+'</span>').join('')+'</div>';
    this.readyRows = CREW.map((_c, i) => {
      const row = document.createElement('div');
      row.setAttribute('data-rv','1');
      row.style.cssText = 'display:grid; grid-template-columns:1.5fr repeat(4,1fr); gap:8px; align-items:center; padding:13px 18px; background:'+(i%2?'color-mix(in srgb, var(--ink) 3%, transparent)':'transparent')+'; transition-delay:'+(i*0.08)+'s;';
      w.appendChild(row); return row;
    });
    this.paintReady();
  }

  paintReady() {
    CREW.forEach((c,i) => {
      const st = this.ready[i], ok = st.every(Boolean);
      this.readyRows[i].innerHTML =
        '<span style="display:flex; align-items:center; gap:9px; flex-wrap:wrap;"><span style="width:8px; height:8px; border-radius:'+(ok?'50%':'2px')+'; background:'+(ok?'var(--acc2)':'var(--warn)')+';"></span>' +
        '<span style="font-size:15px; font-weight:'+(ok?'400':'600')+';">'+c.name+'</span>' +
        '<span data-rolechip="'+i+'" style="'+SUR+' font-size:10px; border:1px solid var(--line); border-radius:999px; padding:3px 8px;">'+c.role+'</span></span>' +
        st.map((v: any) => '<span style="font-size:14px; display:flex; align-items:center; gap:5px; color:'+(v?'var(--acc)':'var(--warn)')+';">'+(v?'✓':'✕')+'<span style="'+SUR+' font-size:9px; color:inherit;">'+(v?'Done':'Open')+'</span></span>').join('');
    });
  }

  buildRoles() {
    const w = this.q('[data-roles]');
    w.innerHTML = '<div style="'+SUR+'">F3 · Roles</div><div style="'+SG+' font-size:20px; font-weight:500; margin-top:10px;">Assign lead, sweep, coordinator.</div>' +
      '<p style="margin:8px 0 14px; font-size:14px; color:var(--mut); line-height:1.5;">Pick a role, then pick the rider. The lobby and the convoy map update together.</p>' +
      '<div data-rolepick="1" style="display:flex; gap:8px; flex-wrap:wrap;"></div><div data-rolelist="1" style="display:flex; flex-direction:column; gap:6px; margin-top:12px;"></div>';
    this.roleSel = 'Lead';
    const rp = this.q('[data-rolepick]');
    ['Lead','Sweep','Coordinator'].forEach(r => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-tap','1');
      b.style.cssText = 'min-height:44px; padding:10px 15px; border:1px solid var(--line); border-radius:999px; background:var(--bg); cursor:pointer; '+SUR;
      b.textContent = r; (b as any).__r = r;
      b.addEventListener('click', () => { this.roleSel = r; this.paintRoles(); });
      rp.appendChild(b);
    });
    this.paintRoles();
  }

  paintRoles() {
    Array.from(this.q('[data-rolepick]').children).forEach((b: any) => {
      const on = (b as any).__r === this.roleSel;
      b.style.background = on ? 'var(--acc2)' : 'var(--bg)';
      b.style.color = on ? '#F7F5F0' : 'var(--sur)';
      b.style.borderColor = on ? 'var(--acc2)' : 'var(--line)';
    });
    const w = this.q('[data-rolelist]'); w.innerHTML = '';
    CREW.forEach((c: any) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('data-tap','1');
      const has = c.role === this.roleSel;
      b.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:44px; padding:10px 13px; border:1px solid '+(has?'var(--acc2)':'var(--line)')+'; border-radius:10px; background:'+(has?'color-mix(in srgb, var(--acc2) 10%, transparent)':'transparent')+'; cursor:pointer; text-align:left;';
      b.innerHTML = '<span style="display:flex; align-items:center; gap:9px;"><span style="width:26px; height:26px; border-radius:50%; background:'+c.c+'; color:#F7F5F0; display:flex; align-items:center; justify-content:center; '+SG+' font-size:10px; font-weight:600;">'+c.id+'</span><span style="font-size:15px;">'+c.name+'</span></span><span style="'+SUR+' color:'+(has?'var(--acc)':'var(--sur)')+';">'+c.role+'</span>';
      b.addEventListener('click', () => {
        CREW.forEach(o => { if (o.role === this.roleSel) o.role = 'Rider'; });
        c.role = this.roleSel;
        this.paintRoles(); this.paintReady();
        const d = this.docks && this.docks.find((x: any) => x.el.closest('#lobby'));
        if (d && this.cur === d) this.swap('roles','tab');
      });
      w.appendChild(b);
    });
  }

  buildPack() {
    const p = this.q('[data-offlinepack]');
    p.innerHTML = '<div style="'+SUR+'">F4 · Offline map</div><div style="'+SG+' font-size:20px; font-weight:500; margin-top:10px;">Route corridor, downloaded</div>' +
      '<div data-tiles="1" style="display:grid; grid-template-columns:repeat(14,1fr); gap:3px; margin-top:14px;"></div>' +
      '<div style="display:flex; align-items:center; gap:9px; margin-top:13px;"><span data-packspin="1" style="width:13px; height:13px; border-radius:50%; border:2px solid var(--line); border-top-color:var(--acc2); animation:qf-spin .8s linear infinite;"></span><span data-packstat="1" style="'+SUR+' color:var(--acc);">0 MB</span></div>';
    const tw = this.q('[data-tiles]');
    this.tiles = [];
    for (let i = 0; i < 56; i++) {
      const t = document.createElement('span');
      t.style.cssText = 'aspect-ratio:1; border-radius:2px; background:var(--line); transition:background .3s;';
      tw.appendChild(t); this.tiles.push(t);
    }
    this.addTrig(p, -100, () => this.runPack());
  }

  runPack() {
    if (this.packed) return; this.packed = true;
    const stat = this.q('[data-packstat]'), spin = this.q('[data-packspin]');
    if (this.rm) { this.tiles.forEach((t: any) => t.style.background = 'var(--acc2)'); spin.style.display='none'; stat.textContent = 'Ready offline · 428 MB · covers all ' + TRIP.days + ' days'; return; }
    let i = 0;
    const step = () => {
      if (this.dead) return;
      if (i >= this.tiles.length) { spin.style.display = 'none'; stat.textContent = 'Ready offline · 428 MB · covers all ' + TRIP.days + ' days'; return; }
      this.tiles[i].style.background = 'var(--acc2)';
      stat.textContent = Math.round((i/this.tiles.length)*428) + ' MB';
      i++; setTimeout(step, 26);
    };
    step();
  }

  buildConvoyMap() {
    const el = this.q('[data-convoymap]');
    el.innerHTML = '<svg viewBox="0 0 900 430" preserveAspectRatio="xMidYMid slice" style="position:absolute; inset:0; width:100%; height:100%;" aria-hidden="true">' +
      '<rect width="900" height="430" fill="var(--card)"></rect>' +
      '<g fill="none" stroke="var(--line)" stroke-width="1.2" opacity=".9">' +
      '<path d="M-10 66C140 46 300 96 460 68 620 40 760 88 910 62"></path><path d="M-10 146C140 126 300 176 460 148 620 120 760 168 910 142"></path>' +
      '<path d="M-10 226C140 206 300 256 460 228 620 200 760 248 910 222"></path><path d="M-10 306C140 286 300 336 460 308 620 280 760 328 910 302"></path>' +
      '<path d="M-10 386C140 366 300 416 460 388 620 360 760 408 910 382"></path></g>' +
      '<path data-cpath="1" d="M60 372 C 180 342 220 254 330 244 C 440 234 470 156 590 148 C 690 141 760 106 850 88" fill="none" stroke="#0E7C86" stroke-width="3" stroke-linecap="round" opacity=".5"></path>' +
      '<g data-criders="1"></g></svg>' +
      '<div data-cinfo="1" style="position:absolute; left:16px; top:14px; display:flex; flex-direction:column; gap:6px;"></div>';
    this.cpath = this.q('[data-cpath]');
    this.cLen = this.cpath.getTotalLength();
    this.conv = CREW.map((c,i) => ({ c, off: i*0.075, stale: c.name === 'Tanvi' }));
    const g = this.q('[data-criders]');
    this.cNodes = this.conv.map((r: any) => {
      const n = document.createElementNS('http://www.w3.org/2000/svg','g');
      const col = r.stale ? '#B26B00' : (r.c.role === 'Lead' ? '#0A6068' : '#0E7C86');
      n.innerHTML = '<circle r="14" fill="'+col+'" opacity=".18"></circle><circle r="7" fill="'+col+'"></circle><text y="-19" text-anchor="middle" fill="var(--sur)" font-size="12" font-family="Space Grotesk, sans-serif">'+r.c.name+'</text>';
      g.appendChild(n); return n;
    });
    this.q('[data-cinfo]').innerHTML = ['Lead · '+roleOf('Lead').name,'Sweep · '+roleOf('Sweep').name,'Convoy stretch 4.8 km']
      .map(t => '<span style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:var(--sur); background:var(--card); border:1px solid var(--line); border-radius:999px; padding:6px 11px; width:max-content;">'+t+'</span>').join('');
    const sc = this.q('[data-scrub]');
    sc.addEventListener('input', () => { this.scrubUser = true; this.renderConvoy(parseInt(sc.value,10)/100); });
    this.convT = 1; this.convPhase = 0;
    this.renderConvoy(1);
    this.wide([el], 900, '360px');
  }

  renderConvoy(t: any) {
    const stretch = 0.15 + 0.3*(1-t);
    const drift = this.rm ? 0 : (this.convPhase||0);
    this.conv.forEach((r: any,i: any) => {
      const pos = clamp(0.14 + t*0.78 - (r.off/0.375)*stretch + Math.sin(drift + i)*0.006, 0.01, 0.99);
      const pt = this.cpath.getPointAtLength(pos*this.cLen);
      this.cNodes[i].setAttribute('transform','translate('+pt.x.toFixed(1)+','+pt.y.toFixed(1)+')');
    });
    const mins = Math.round(20*(1-t));
    const st = this.q('[data-scrubtime]');
    if (st) st.textContent = mins === 0 ? 'Live' : 'T−' + mins + ':00';
    const sc = this.q('[data-scrub]');
    if (sc) sc.setAttribute('aria-valuetext', mins === 0 ? 'Live' : mins + ' minutes ago');
    const info = this.q('[data-cinfo]');
    if (info && info.children[2]) info.children[2].textContent = 'Convoy stretch ' + (stretch*30).toFixed(1) + ' km';
    this.convT = t;
  }

  buildMuster() {
    this.muster = CREW.map((c,i) => ({ c, state: i===3 ? 'Stopped' : (i===4 ? 'Resting' : 'Rolling'), age: i===3 ? 120 : (i===4 ? 360 : 8 + i*2) }));
    this.renderMuster();
    this.q('[data-ping]').addEventListener('click', () => {
      const cards = Array.from(this.q('[data-musterboard]').children);
      cards.forEach((c: any, i: any) => setTimeout(() => {
        if (this.rm) return;
        c.style.transition = 'box-shadow .3s, transform .3s';
        c.style.boxShadow = '0 0 0 2px var(--acc2)'; c.style.transform = 'translateY(-4px)';
        setTimeout(() => { c.style.boxShadow = 'none'; c.style.transform = ''; }, 340);
      }, i*70));
      this.muster.forEach((m: any) => { m.age = 2; });
      setTimeout(() => { this.q('[data-musterlive]').textContent = 'Pinged · all ' + CREW.length + ' riders acknowledged'; this.renderMuster(); }, 600);
    });
    this.slowT = setInterval(() => {
      if (this.dead) return;
      this.muster.forEach((m: any) => { m.age += 4; });
      if (Math.random() < 0.35) {
        const m = this.muster[Math.floor(Math.random()*this.muster.length)];
        m.state = m.state === 'Rolling' ? (Math.random() < 0.5 ? 'Stopped' : 'Resting') : 'Rolling';
        m.age = m.state === 'Rolling' ? 8 : 90;
      }
      this.renderMuster();
      if (!this.scrubUser && !this.rm) { this.convPhase = (this.convPhase||0) + 0.5; this.renderConvoy(this.convT); }
    }, 4000);
  }

  renderMuster() {
    const board = this.q('[data-musterboard]');
    const prev: any = {};
    Array.from(board.children).forEach((c: any) => { prev[c.dataset.k] = c.getBoundingClientRect(); });
    const order = this.muster.slice().sort((a: any,b: any) => (a.state === 'Rolling' ? 0 : 1) - (b.state === 'Rolling' ? 0 : 1));
    board.innerHTML = '';
    order.forEach((m: any) => {
      const col = m.state === 'Rolling' ? '#0E7C86' : '#B26B00';
      const stale = m.age > 60;
      const c = document.createElement('div');
      c.dataset.k = m.c.id;
      c.style.cssText = 'border:1px solid var(--line); border-radius:14px; padding:17px; background:var(--card); display:flex; flex-direction:column; gap:9px;';
      const ago = m.age < 60 ? Math.round(m.age)+' s ago' : Math.round(m.age/60)+' min ago';
      c.innerHTML = '<span style="display:flex; align-items:center; gap:9px;"><span style="width:8px; height:8px; border-radius:'+(m.state==='Rolling'?'50%':'2px')+'; background:'+col+';"></span><span style="'+SG+' font-size:18px; font-weight:500;">'+m.c.name+'</span></span>' +
        '<span style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:'+col+';">'+m.state+'</span>' +
        '<span style="font-size:13px; color:'+(stale?'#B26B00':'var(--mut)')+';">Last position '+ago+'</span>';
      board.appendChild(c);
    });
    if (this.rm) return;
    Array.from(board.children).forEach((c: any) => {
      const p = prev[c.dataset.k]; if (!p) return;
      const n = c.getBoundingClientRect();
      const dx = p.left-n.left, dy = p.top-n.top;
      if (!dx && !dy) return;
      c.style.transition = 'none'; c.style.transform = 'translate('+dx+'px,'+dy+'px)';
      requestAnimationFrame(() => { c.style.transition = 'transform .5s cubic-bezier(.22,.9,.3,1)'; c.style.transform = ''; });
    });
  }

  buildLadder() {
    const w = this.q('[data-ladder]'); w.innerHTML = '';
    this.rungs = [['Live route','Full turn-by-turn, traffic aware, crew positions live.'],
      ['Cached route','The route you downloaded this morning, still turn by turn.'],
      ['Stored geometry','The line on the map, with distance and heading to the next point.'],
      ['Straight-line bearing','An arrow and a distance. Enough to reach the rally point.']].map((r,i) => {
      const el = document.createElement('div');
      el.style.cssText = 'display:flex; gap:16px; align-items:flex-start; padding:16px 18px; border:1px solid var(--line); border-radius:14px; background:var(--card); transition:border-color .3s, background .3s, transform .3s;';
      el.innerHTML = '<span style="'+SUR+' padding-top:3px;">0'+(i+1)+'</span><span><span style="display:block; '+SG+' font-size:18px; font-weight:500;">'+r[0]+'</span><span style="display:block; font-size:15px; color:var(--mut); margin-top:3px;">'+r[1]+'</span></span>';
      el.style.cursor = 'pointer';
      const go = () => {
        this.rungIdx = i;
        this.rungs.forEach((x: any,j: any) => { x.style.borderColor = j===i ? 'var(--acc2)' : 'var(--line)'; x.style.transform = j===i ? 'translateX(6px)' : ''; });
        const d = this.docks && this.docks.find((x: any) => x.el.closest('#nav'));
        if (d) { d.key = i < 2 ? 'rallyLive' : 'offlineNav'; if (this.cur === d) this.swap(d.key,'tab'); }
        this.userDriving = true; this.lastTouch = performance.now();
      };
      el.addEventListener('click', go); el.addEventListener('mouseenter', go);
      w.appendChild(el); return el;
    });
  }

  buildSigChips() {
    const w = this.q('[data-sigchips]'); w.innerHTML = '';
    this.sigChips = ['Reads from disk','Writes queued · 0','Map from offline pack','Positions last known'].map(t => {
      const s = document.createElement('span');
      s.style.cssText = 'padding:8px 14px; border:1px solid var(--line); border-radius:999px; background:var(--card); '+SUR+' transition:color .3s, border-color .3s;';
      s.textContent = t; w.appendChild(s); return s;
    });
    this.q('[data-sig]').addEventListener('input', (e: any) => this.setSig(parseInt(e.target.value,10)));
    this.setSig(0);
  }

  setSig(v: any) {
    const names = ['5G','4G','3G','EDGE','No service'];
    const lab = this.q('[data-siglabel]');
    lab.textContent = names[v];
    lab.style.color = v >= 3 ? 'var(--warn)' : 'var(--acc)';
    this.q('[data-sig]').setAttribute('aria-valuetext', names[v]);
    this.sigChips[1].textContent = 'Writes queued · ' + [0,0,2,5,9][v];
    this.sigChips.forEach((c: any,i: any) => {
      const on = v >= [4,2,3,3][i];
      c.style.color = on ? (i===1 ? 'var(--warn)' : 'var(--acc)') : 'var(--sur)';
      c.style.borderColor = on ? (i===1 ? 'var(--warn)' : 'var(--acc)') : 'var(--line)';
    });
    if (this.rungs) this.rungs.forEach((r: any,i: any) => {
      const on = i === clamp(v-1, 0, 3);
      r.style.borderColor = on ? 'var(--acc2)' : 'var(--line)';
      r.style.transform = on ? 'translateX(6px)' : '';
    });
    const d = this.docks && this.docks.find((x: any) => x.el.hasAttribute('data-sigdock'));
    if (d) { d.key = ['convoy','convoy','convoyStale','convoyStale','convoyOffline'][v]; if (this.cur === d) this.swap(d.key,'tab'); }
    /* the three states sit side by side — light the one the slider is on */
    const stage = v >= 4 ? 3 : (v >= 2 ? 2 : 1);
    [2,3].forEach(n => {
      const s = this.q('[data-sigslot="'+n+'"]');
      if (s) { s.style.transition = 'opacity .35s ease'; s.style.opacity = stage === n ? '1' : '.4'; }
    });
    const ss = this.q('[data-sigstate]');
    if (ss) { ss.textContent = ['Live','Last-known','Offline'][stage-1]; ss.style.color = stage === 3 ? 'var(--warn)' : 'var(--acc)'; }
  }

  buildToggles() {
    this.tg = [['Crash detection','On by default. Reads motion to spot a fall.',true],
      ['Share location with the crew','Scoped to the trip. Ends when the trip does.',true],
      ['Background location','Keeps the convoy honest when the screen is off.',true],
      ['Milestone pushes','Passes cleared, day complete, arrival.',false]];
    this.paintToggles();
  }

  paintToggles() {
    const w = this.q('[data-toggles]'); w.innerHTML = '';
    this.tg.forEach((t: any,i: any) => {
      const row = document.createElement('div');
      row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:16px; padding:16px 20px; border-bottom:'+(i<this.tg.length-1?'1px solid var(--line)':'none')+';';
      row.innerHTML = '<span style="flex:1;"><span style="display:block; font-size:16px; font-weight:500;">'+t[0]+'</span><span style="display:block; font-size:14px; color:var(--mut); margin-top:3px;">'+t[1]+'</span></span>';
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('role','switch'); b.setAttribute('aria-checked', t[2]?'true':'false');
      b.setAttribute('aria-label', t[0]);
      b.style.cssText = 'flex:none; width:58px; height:34px; border-radius:999px; border:none; cursor:pointer; position:relative; transition:background .25s; background:'+(t[2]?'var(--acc2)':'color-mix(in srgb, var(--ink) 18%, transparent)')+';';
      b.innerHTML = '<span style="position:absolute; top:4px; left:'+(t[2]?'28px':'4px')+'; width:26px; height:26px; border-radius:50%; background:#fff; transition:left .25s cubic-bezier(.34,1.56,.64,1);"></span>';
      b.addEventListener('click', () => { t[2] = !t[2]; this.paintToggles(); });
      row.appendChild(b); w.appendChild(row);
    });
  }

  buildHelp() {
    const w = this.q('[data-help]');
    if (!w) return;
    w.innerHTML = '<div style="'+SUR+'">U1 · Help centre</div><div style="'+SG+' font-size:20px; font-weight:500; margin-top:10px;">Answers, then a human.</div>' +
      '<div data-faq="1" style="margin-top:14px; display:flex; flex-direction:column; gap:2px;"></div>' +
      '<div style="display:flex; gap:10px; margin-top:16px; flex-wrap:wrap;"><a href="https://qafilaa.in/support" data-btn="1" style="display:flex; align-items:center; min-height:44px; padding:0 16px; border:1px solid var(--line); border-radius:12px; font-size:14px; color:var(--ink);">Help centre</a><a href="mailto:admin@qafilaa.in" data-btn="1" style="display:flex; align-items:center; min-height:44px; padding:0 16px; border:1px solid var(--line); border-radius:12px; font-size:14px; color:var(--ink);">Contact us</a></div>' +
      '<p style="margin:12px 0 0; font-size:14px; color:var(--mut);">Every query gets a ticket and a timeline you can follow inside the app.</p>';
    const f = this.q('[data-faq]');
    [['Does it work with no signal?','Yes. Every screen reads from disk, and writes queue until a bar comes back.'],
     ['Does it drain the battery?','Battery mode drops position frequency on long straight legs and restores it near passes and rally points.'],
     ['Can I ride without sharing location?','You can, but the convoy map will show you as last known only, and crash alerts will carry no position.']].forEach(qa => {
      const d = document.createElement('details');
      d.className = 'qf-rcpt';
      d.style.cssText = 'border-bottom:1px solid var(--line); padding:11px 0;';
      d.innerHTML = '<summary style="cursor:pointer; font-size:15px; font-weight:500; min-height:24px;">'+qa[0]+'</summary><p style="margin:8px 0 0; font-size:14px; line-height:1.55; color:var(--mut);">'+qa[1]+'</p>';
      f.appendChild(d);
    });
  }

  buildShareCard() {
    const tabs = this.q('[data-cardtabs]'); tabs.innerHTML = '';
    this.cardMode = 0; this.cardDark = false;
    ['Day card','Trip recap'].forEach((t,i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'min-height:38px; padding:9px 16px; border:none; border-radius:999px; cursor:pointer; '+SUR+' font-size:10px;';
      b.textContent = t;
      b.addEventListener('click', () => { this.cardMode = i; this.renderCard(); });
      tabs.appendChild(b);
    });
    const dk = this.q('[data-carddark]');
    dk.addEventListener('click', () => { this.cardDark = !this.cardDark; dk.setAttribute('aria-pressed', this.cardDark?'true':'false'); this.renderCard(); });
    this.renderCard();
  }

  renderCard() {
    Array.from(this.q('[data-cardtabs]').children).forEach((b: any, i: any) => {
      b.style.background = i===this.cardMode ? 'var(--card)' : 'transparent';
      b.style.boxShadow = i===this.cardMode ? '0 0 0 1px var(--line)' : 'none';
      b.style.color = i===this.cardMode ? 'var(--ink)' : 'var(--mut)';
    });
    const dk = this.q('[data-carddark]');
    dk.style.background = this.cardDark ? 'var(--ink)' : 'transparent';
    dk.style.color = this.cardDark ? 'var(--bg)' : 'var(--mut)';
    const dark = this.cardDark, trip = this.cardMode === 1;
    const bg = dark ? '#0B0E0D' : 'var(--card)', fg = dark ? '#F7F5F0' : 'var(--ink)', mu = dark ? '#A8A49C' : 'var(--sur)';
    const D = DAYS[MAXD ? DAYS.indexOf(MAXD) : 0];
    const stats = trip
      ? [[inr(TOTAL_KM),'km'],[String(TRIP.days),'days'],[inr(MAXD.alt),'m max'],[String(CREW.length),'riders']]
      : [[String(D.km),'km'],['6h 14m','moving'],[inr(D.alt),'m max'],[String(CREW.length),'riders']];
    const passLine = trip ? PASSES.join('  ·  ') : D.pass + '  ·  ' + inr(D.alt) + ' m';
    this.q('[data-sharecard]').innerHTML = '<div style="background:'+bg+'; border:1px solid '+(dark?'#23241F':'var(--line)')+'; border-radius:20px; padding:24px;">' +
      '<div style="display:flex; justify-content:space-between; align-items:baseline;"><span style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:'+mu+';">'+(trip?'Trip recap':'Day '+D.n+' · '+D.date+' 2026')+'</span><span style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:'+mu+';">Qafilaa</span></div>' +
      '<div style="'+SG+' font-size:27px; font-weight:600; color:'+fg+'; margin-top:9px; letter-spacing:-.01em;">'+(trip?TRIP.route:D.from+' → '+D.to)+'</div>' +
      '<div style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:'+mu+'; margin-top:7px;">'+passLine+'</div>' +
      '<svg viewBox="0 0 460 140" style="width:100%; height:140px; margin-top:12px;" aria-hidden="true"><path d="M20 120 C 90 104 120 56 190 50 C 260 44 300 90 360 72 C 400 60 420 36 442 24" fill="none" stroke="#0E7C86" stroke-width="3" stroke-linecap="round"></path><circle cx="20" cy="120" r="6" fill="'+bg+'" stroke="#0E7C86" stroke-width="2.5"></circle><circle cx="442" cy="24" r="6" fill="#0E7C86"></circle></svg>' +
      '<div style="display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-top:12px;">' +
      stats.map(s => '<div><div style="'+SG+' font-size:21px; font-weight:600; color:'+fg+'; font-variant-numeric:tabular-nums;">'+s[0]+'</div><div style="'+SG+' font-size:11px; letter-spacing:.14em; text-transform:uppercase; color:'+mu+';">'+s[1]+'</div></div>').join('') + '</div></div>';
  }

  /* ═════ SOS ═════ */
  buildSos() {
    this.sosDock = this.docks && this.docks.find((x: any) => x.el.hasAttribute('data-sosdock'));
    this.q('[data-sosrun]').addEventListener('click', () => this.runSos());
    this.q('[data-soscancel]').addEventListener('click', () => this.cancelSos());
    this.q('[data-sosreset]').addEventListener('click', () => this.resetSos());
    this.addTrig(this.q('#safety'), -180, () => { this.q('[data-sosstatus]').textContent = 'Armed · press to run'; });
  }

  sosScreen(k: any, kind: any) {
    if (this.sosDock) { this.sosDock.key = k; if (this.cur === this.sosDock) this.swap(k, kind || 'sheet'); }
  }

  runSos() {
    this.resetSos(true);
    const st = this.q('[data-sosstatus)'.replace(')',']'));
    const ring = this.q('[data-sosring]'), num = this.q('[data-sosnum]'), dial = this.q('[data-sosdial]');
    st.textContent = 'Crash detected · countdown running';
    this.sosStage = 1;
    if (!this.rm) dial.style.animation = 'qf-heartbeat 1s ease-out infinite';
    const DUR = this.rm ? 600 : 5000, t0 = performance.now();
    const tick = (now: any) => {
      if (this.sosStage !== 1) return;
      const p = clamp((now-t0)/DUR, 0, 1);
      ring.setAttribute('stroke-dashoffset', String(214*p));
      num.textContent = Math.max(0, Math.ceil((DUR-(now-t0))/1000));
      if (p < 1) requestAnimationFrame(tick); else this.fireSos();
    };
    ring.setAttribute('stroke-dashoffset','0');
    requestAnimationFrame(tick);
  }

  fireSos() {
    this.sosStage = 2;
    const st = this.q('[data-sosstatus]'), dial = this.q('[data-sosdial]'), num = this.q('[data-sosnum]');
    dial.style.animation = ''; num.textContent = '0';
    st.textContent = 'SOS sent to the convoy';
    this.sosScreen('sosSent','sheet');
    if (!this.rm) {
      const wrap = this.q('[data-soswrap]');
      const w = document.createElement('span');
      w.style.cssText = 'position:absolute; left:50%; top:52%; width:620px; height:620px; margin:-310px 0 0 -310px; border-radius:50%; background:radial-gradient(circle, rgba(229,57,46,.5) 0%, rgba(229,57,46,.22) 45%, rgba(229,57,46,0) 70%); animation:qf-sos 2.4s cubic-bezier(.2,.6,.3,1) forwards;';
      wrap.appendChild(w); setTimeout(() => w.remove(), 2500);
    }
    setTimeout(() => { this.q('[data-sosflank="left"]').style.opacity = '1'; this.flankSos(1,'sosReceived'); }, 520);
    setTimeout(() => { this.q('[data-sosflank="right"]').style.opacity = '1'; this.flankSos(2,'medicalScene'); this.q('[data-sosstatus]').textContent = 'Two riders responding · medical card open'; }, 1000);
    this.sosT2 = setTimeout(() => {
      if (this.sosStage !== 2) return;
      this.sosStage = 3;
      this.sosScreen('sosResolved','tab');
      this.q('[data-sosstatus]').textContent = 'Resolved · everyone back on the route';
    }, 5200);
  }

  flankSos(slot: any, key: any) {
    const el = this.q('[data-sosslot="'+slot+'"]');
    if (!el) return;
    const sc = Math.max(0.44, parseFloat(el.getAttribute('data-scale')||'0.44'));
    el.innerHTML = ''; el.appendChild(this.screenEl(key, sc, true));
    if (!this.rm) el.firstElementChild.style.animation = 'qf-screen-in .34s cubic-bezier(.22,.61,.36,1)';
  }

  cancelSos() {
    if (this.sosStage === 1) {
      this.sosStage = 0;
      this.q('[data-sosdial]').style.animation = '';
      this.q('[data-sosnum]').textContent = '—';
      this.q('[data-sosring]').setAttribute('stroke-dashoffset','214');
      this.q('[data-sosstatus]').textContent = 'Cancelled · glad you are OK';
      this.sosScreen('convoy','tab');
    } else {
      this.q('[data-sosstatus]').textContent = 'Nothing running · press to run';
    }
  }

  resetSos(quiet?: any) {
    clearTimeout(this.sosT2);
    this.sosStage = 0;
    this.q('[data-sosdial]').style.animation = '';
    this.q('[data-sosnum]').textContent = '—';
    this.q('[data-sosring]').setAttribute('stroke-dashoffset','214');
    this.sosScreen('crash','tab');
    this.flankSos(1,'sendSos'); this.flankSos(2,'convoy');
    this.q('[data-sosflank="left"]').style.opacity = '.3';
    this.q('[data-sosflank="right"]').style.opacity = '.3';
    if (!quiet) this.q('[data-sosstatus]').textContent = 'Armed · press to run';
  }

  /* ═════ legal routes ═════ */



  /* ═════ close ═════ */
  buildStores() {
    const w = this.q('[data-stores]'); w.innerHTML = '';
    [['App Store','In review'],['Google Play','Rolling out']].forEach(s => {
      const d = document.createElement('span');
      d.style.cssText = 'display:flex; align-items:center; gap:10px; min-height:44px; padding:0 20px; border:1px solid var(--line); border-radius:12px; background:var(--card); font-size:14px; color:var(--mut);';
      d.innerHTML = '<span style="font-weight:600; color:var(--ink);">'+s[0]+'</span><span style="'+SUR+'">'+s[1]+'</span>';
      w.appendChild(d);
    });
  }

  buildSocial() {
    const w = this.q('[data-social]'); w.innerHTML = '';
    const P = this.props;
    [['Instagram', P.instagramUrl || 'https://instagram.com/qafilaa.in'],
     ['LinkedIn',  P.linkedinUrl  || 'https://www.linkedin.com/company/qafilaa/'],
     ['X',         P.xUrl         || 'https://x.com/Qafilaa'],
     ['WhatsApp',  P.whatsappUrl  || 'https://wa.me/918830997757']].forEach(s => {
      if (!s[1]) return;
      const a = document.createElement('a');
      a.href = s[1]; a.target = '_blank'; a.rel = 'noopener';
      a.style.cssText = 'display:flex; align-items:center; min-height:38px; padding:0 14px; border:1px solid var(--line); border-radius:999px; font-size:13px; color:var(--ink);';
      a.textContent = s[0];
      w.appendChild(a);
    });
    if (!w.children.length) {
      const s = document.createElement('span');
      s.style.cssText = SUR;
      s.textContent = 'admin@qafilaa.in';
      w.appendChild(s);
    }
  }

  buildEnd() {
    const w = this.q('[data-endconvoy]'); w.innerHTML = '';
    const dots: any[] = [];
    for (let i = 0; i < 5; i++) {
      const d = document.createElement('span');
      d.style.cssText = 'width:'+(i===0?14:11)+'px; height:'+(i===0?14:11)+'px; border-radius:50%; background:'+(i===0?'var(--acc2)':'var(--acc)')+'; opacity:0; transform:translateX(-46px); transition:opacity .5s cubic-bezier(.22,.61,.36,1), transform .62s cubic-bezier(.34,1.56,.64,1); transition-delay:'+(i*0.1)+'s;';
      w.appendChild(d); dots.push(d);
    }
    const n = document.createElement('span');
    n.style.cssText = SUR + ' margin-left:12px; opacity:0; transition:opacity .5s .7s;';
    n.textContent = 'They made it.';
    w.appendChild(n);
    this.addTrig(w, -80, () => {
      dots.forEach(d => { d.style.opacity = '1'; d.style.transform = 'none'; });
      n.style.opacity = '1';
    });
  }

  buildSplitRoad() {
    const wrap = this.q('[data-splitdots]');
    this.roadPath = this.q('[data-roadpath]');
    this.roadSvg = this.q('[data-splitroad]');
    this.roadLen = this.roadPath.getTotalLength();
    wrap.innerHTML = '';
    this.roadDots = [];
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('span');
      d.style.cssText = 'position:absolute; left:0; top:0; width:12px; height:12px; border-radius:50%; background:'+(i===4?'#B26B00':'#0E7C86')+'; will-change:transform;';
      wrap.appendChild(d); this.roadDots.push(d);
    }
    this.onPaint = (_y: any, vh: any) => {
      if (!this.roadDots) return;
      const r = this.roadSvg.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const t = clamp((vh - r.top) / (vh + r.height), 0, 1);
      const spread = Math.sin(t*Math.PI);
      const sx = r.width/1200, sy = r.height/230;
      this.roadDots.forEach((d: any,i: any) => {
        const pos = clamp(0.92 - i*(0.085 + 0.105*spread), 0.01, 1);
        const pt = this.roadPath.getPointAtLength(pos*this.roadLen);
        d.style.transform = 'translate('+(pt.x*sx-6).toFixed(1)+'px,'+(pt.y*sy-6).toFixed(1)+'px)';
      });
      this.q('[data-gaplabel]').textContent = spread > 0.86 ? 'Gap — —' : 'Gap ' + (2.1 + 7.2*spread).toFixed(1) + ' km';
    };
  }

}

import { useEffect } from 'react';
import { colors } from '../theme';

/**
 * Imperative motion engine for the landing page, a faithful port of the
 * prototype's `_tilts`, `_sos` and `_scene` routines. It runs once on mount and
 * drives behaviour directly on the live DOM (by `data-*` attributes under
 * `#qf-landing`), exactly as the source design did, so the parallax diorama,
 * card tilt/glare, magnetic buttons, cursor scout-light, GPS particles and the
 * hold-to-send SOS all match pixel-for-pixel.
 *
 * Reveal cascades, counters, the connectivity banner and the countdown stay in
 * their dedicated React hooks; this engine only owns the pointer-driven motion.
 */
export function useLandingFx() {
  useEffect(() => {
    const root = document.getElementById('qf-landing');
    if (!root) return;

    const accent = colors.accent;
    const k = 1; // motionIntensity
    const cleanups: Array<() => void> = [];
    let raf = 0;

    /* ---- 3D tilt + glare on cards/phones ---- */
    root.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
      const max = parseFloat(el.getAttribute('data-tilt-max') || '') || 9;
      const glare = el.querySelector<HTMLElement>('[data-glare]');
      const baseGlareOp = glare ? parseFloat(getComputedStyle(glare).opacity) || 0 : 0;
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * 2 * max;
        const rx = (0.5 - py) * 2 * max;
        el.style.transform =
          'perspective(1000px) rotateX(' +
          rx.toFixed(2) +
          'deg) rotateY(' +
          ry.toFixed(2) +
          'deg) translateZ(0) scale(1.015)';
        if (glare) {
          glare.style.opacity = '1';
          glare.style.background =
            'radial-gradient(220px 220px at ' +
            px * 100 +
            '% ' +
            py * 100 +
            '%, rgba(255,255,255,0.16), transparent 60%)';
        }
      };
      const onLeave = () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) scale(1)';
        if (glare) glare.style.opacity = String(baseGlareOp);
      };
      el.addEventListener('mousemove', onMove);
      el.addEventListener('mouseleave', onLeave);
      cleanups.push(() => {
        el.removeEventListener('mousemove', onMove);
        el.removeEventListener('mouseleave', onLeave);
      });
    });

    /* ---- press & hold SOS ---- */
    const sosTimers: number[] = [];
    (() => {
      const btn = root.querySelector<HTMLElement>('[data-sos-btn]');
      if (!btn) return;
      const ring = btn.querySelector<HTMLElement>('[data-sos-ring]');
      const core = btn.querySelector<HTMLElement>('[data-sos-core]');
      const coreText = btn.querySelector<HTMLElement>('[data-sos-core-text]');
      const coreSub = btn.querySelector<HTMLElement>('[data-sos-core-sub]');
      const status = root.querySelector<HTMLElement>('[data-sos-status]');
      const HOLD = 2000;
      let sraf: number | null = null;
      let start = 0;
      let sent = false;
      const setRing = (pct: number) => {
        if (ring) ring.style.background = 'conic-gradient(' + accent + ' ' + pct + '%, rgba(255,255,255,0.12) 0)';
      };
      const reset = () => {
        if (sraf) cancelAnimationFrame(sraf);
        sraf = null;
        if (sent) return;
        setRing(0);
        if (core) core.style.transform = 'scale(1)';
        if (status) {
          status.textContent = 'Press & hold for 2s';
          status.style.color = '#B8C2BE';
        }
        if (coreSub) coreSub.textContent = 'Hold';
      };
      const fire = () => {
        sent = true;
        setRing(100);
        if (core) {
          core.style.background = accent;
          core.style.transform = 'scale(1)';
        }
        if (coreText) coreText.textContent = 'SENT';
        if (coreSub) coreSub.textContent = 'Ride alerted';
        if (status) {
          status.textContent = '✓ Alert broadcast · 4 riders responding';
          status.style.color = accent;
        }
        const rip = document.createElement('span');
        rip.style.cssText =
          'position:absolute; left:50%; top:50%; width:140px; height:140px; margin:-70px 0 0 -70px; border-radius:999px; border:2px solid ' +
          accent +
          '; pointer-events:none; animation:qf-ping 1.1s ease-out forwards;';
        btn.appendChild(rip);
        window.setTimeout(() => rip.remove(), 1200);
        const t = window.setTimeout(() => {
          sent = false;
          setRing(0);
          if (core) core.style.background = '#FF5247';
          if (coreText) coreText.textContent = 'SOS';
          if (coreSub) coreSub.textContent = 'Hold';
          if (status) {
            status.textContent = 'Press & hold for two seconds';
            status.style.color = '#9FB0AC';
          }
        }, 2600);
        sosTimers.push(t);
      };
      const down = (e: Event) => {
        e.preventDefault();
        if (sent) return;
        start = performance.now();
        if (core) core.style.transform = 'scale(0.94)';
        if (status) {
          status.textContent = 'Hold…';
          status.style.color = '#FF5247';
        }
        if (coreSub) coreSub.textContent = 'Keep holding';
        const step = (now: number) => {
          const p = Math.min(1, (now - start) / HOLD);
          setRing(p * 100);
          if (p >= 1) {
            fire();
            return;
          }
          sraf = requestAnimationFrame(step);
        };
        sraf = requestAnimationFrame(step);
      };
      const keydown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') down(e);
      };
      btn.addEventListener('mousedown', down);
      btn.addEventListener('touchstart', down, { passive: false });
      btn.addEventListener('mouseup', reset);
      btn.addEventListener('mouseleave', reset);
      btn.addEventListener('touchend', reset);
      btn.addEventListener('keydown', keydown);
      btn.addEventListener('keyup', reset);
      cleanups.push(() => {
        if (sraf) cancelAnimationFrame(sraf);
        btn.removeEventListener('mousedown', down);
        btn.removeEventListener('touchstart', down);
        btn.removeEventListener('mouseup', reset);
        btn.removeEventListener('mouseleave', reset);
        btn.removeEventListener('touchend', reset);
        btn.removeEventListener('keydown', keydown);
        btn.removeEventListener('keyup', reset);
      });
    })();

    /* ---- scroll = your position on the route ---- */
    (() => {
      const bar = root.querySelector<HTMLElement>('[data-progress]');
      if (!bar) return;
      const chip = root.querySelector<HTMLElement>('[data-progress-chip]');
      const km = root.querySelector<HTMLElement>('[data-progress-km]');
      const next = root.querySelector<HTMLElement>('[data-progress-next]');
      const TOTAL = 128;
      const rallies = [
        { at: 0.28, name: 'Rally 1 ahead' },
        { at: 0.55, name: 'Rally 2 ahead' },
        { at: 0.82, name: 'Rally 3 ahead' },
        { at: 1.01, name: 'Summit ahead' },
      ];
      const update = () => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - window.innerHeight || 1;
        const p = Math.max(0, Math.min(1, (window.scrollY || doc.scrollTop || 0) / max));
        bar.style.width = (p * 100).toFixed(2) + '%';
        if (km) km.textContent = (p * TOTAL).toFixed(1) + ' km';
        const r = rallies.find((x) => x.at > p) || rallies[rallies.length - 1];
        if (next) next.textContent = r.name;
        if (chip) {
          const show = p > 0.04 && p < 0.985;
          chip.style.opacity = show ? '1' : '0';
          chip.style.transform = show ? 'translateY(0)' : 'translateY(12px)';
        }
      };
      update();
      window.addEventListener('scroll', update, { passive: true });
      const iv = window.setInterval(update, 250);
      cleanups.push(() => {
        window.removeEventListener('scroll', update);
        window.clearInterval(iv);
      });
    })();

    /* ---- interactive live vs last-known signal toggle ---- */
    (() => {
      const wrap = root.querySelector<HTMLElement>('[data-sig]');
      if (!wrap) return;
      const btn = wrap.querySelector<HTMLElement>('[data-sig-toggle]');
      const knob = wrap.querySelector<HTMLElement>('[data-sig-knob]');
      const onL = wrap.querySelector<HTMLElement>('[data-sig-on]');
      const offL = wrap.querySelector<HTMLElement>('[data-sig-off]');
      const sigTitle = wrap.querySelector<HTMLElement>('[data-sig-title]');
      const hint = wrap.querySelector<HTMLElement>('[data-sig-hint]');
      const banner = wrap.querySelector<HTMLElement>('[data-sig-banner]');
      const bDot = wrap.querySelector<HTMLElement>('[data-sig-banner-dot]');
      const bTxt = wrap.querySelector<HTMLElement>('[data-sig-banner-text]');
      const rows = [...wrap.querySelectorAll<HTMLElement>('[data-sig-row]')];
      const grey = '#5A6B67';
      const amber = '#FFB020';
      const green = '#36D399';
      let live = true;

      const apply = () => {
        if (knob) {
          knob.style.transform = live ? 'translateX(0)' : 'translateX(64px)';
          knob.style.background = live ? accent : grey;
        }
        if (btn) {
          btn.style.background = live ? 'rgba(32,214,168,0.12)' : 'rgba(90,107,103,0.16)';
          btn.style.borderColor = live ? 'rgba(32,214,168,0.45)' : 'rgba(90,107,103,0.5)';
          btn.setAttribute('aria-checked', String(live));
        }
        if (onL) onL.style.opacity = live ? '1' : '0';
        if (offL) offL.style.opacity = live ? '0' : '1';
        if (sigTitle) {
          sigTitle.textContent = live ? 'Signal: all live' : 'Signal lost · last-known';
          sigTitle.style.color = live ? '#F2F6F5' : amber;
        }
        if (hint)
          hint.textContent = live
            ? 'Flip it — drop the signal behind the ridge.'
            : 'Pins hold their last spot, timestamped — nothing vanishes.';
        if (banner) {
          banner.style.background = live ? 'rgba(54,211,153,0.10)' : 'rgba(255,176,32,0.10)';
          banner.style.borderColor = live ? 'rgba(54,211,153,0.28)' : 'rgba(255,176,32,0.28)';
        }
        if (bDot) bDot.style.background = live ? green : amber;
        if (bTxt) {
          bTxt.textContent = live ? 'All live · 5 of 5 accounted for' : '3 of 5 live · 2 holding last-known';
          bTxt.style.color = live ? green : amber;
        }
        rows.forEach((r) => {
          const lostTxt = r.getAttribute('data-sig-lost');
          const liveTxt = r.getAttribute('data-sig-live');
          if (!lostTxt) return; // lead stays live
          const st = r.querySelector<HTMLElement>('[data-sig-status]');
          const dot = r.querySelector<HTMLElement>('[data-sig-dot]');
          r.style.opacity = live ? '1' : '0.6';
          if (st) {
            st.textContent = live ? liveTxt || '' : lostTxt;
            st.style.color = live ? accent : '#6B7C78';
          }
          if (dot) dot.style.background = live ? green : grey;
        });
        wrap.style.filter = live ? 'none' : 'saturate(0.35)';
      };
      apply();
      const flip = () => {
        live = !live;
        apply();
      };
      if (btn) {
        btn.addEventListener('click', flip);
        cleanups.push(() => btn.removeEventListener('click', flip));
      }
    })();

    /* ---- unified scene engine: parallax + cursor + magnetic + particles ---- */
    const hero = root.querySelector<HTMLElement>('[data-hero]');
    const sceneInner = root.querySelector<HTMLElement>('[data-scene-inner]');
    const layers = [...root.querySelectorAll<HTMLElement>('[data-depth]')];
    const cursor = root.querySelector<HTMLElement>('[data-cursor]');
    const magnets = [...root.querySelectorAll<HTMLElement>('[data-magnetic]')];
    const canvas = root.querySelector<HTMLCanvasElement>('[data-particles]');

    let mx = 0;
    let my = 0;
    let active = false;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      active = true;
      if (cursor) cursor.style.opacity = '1';
    };
    const onLeave = () => {
      active = false;
      if (cursor) cursor.style.opacity = '0';
    };
    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches && e.touches[0];
      if (!t) return;
      mx = t.clientX;
      my = t.clientY;
      active = true;
    };
    const onTouchEnd = () => {
      active = false;
    };
    root.addEventListener('touchstart', onTouch, { passive: true });
    root.addEventListener('touchmove', onTouch, { passive: true });
    root.addEventListener('touchend', onTouchEnd, { passive: true });

    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    let goX = 0;
    let goY = 0;
    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      goX = Math.max(-1, Math.min(1, e.gamma / 30));
      goY = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
    };
    if (isTouch && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', onOrient);
      cleanups.push(() => window.removeEventListener('deviceorientation', onOrient));
    }
    cleanups.push(() => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('touchstart', onTouch);
      root.removeEventListener('touchmove', onTouch);
      root.removeEventListener('touchend', onTouchEnd);
    });

    // particles
    let ctx: CanvasRenderingContext2D | null = null;
    let parts: Array<{ x: number; y: number; r: number; vy: number; vx: number; a: number; tw: number }> = [];
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let cw = 0;
    let ch = 0;
    const sizeCanvas = () => {
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      cw = r.width;
      ch = r.height;
      canvas.width = Math.max(1, Math.floor(cw * dpr));
      canvas.height = Math.max(1, Math.floor(ch * dpr));
      ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(46, Math.max(18, cw / 26)) * k);
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * cw,
        y: Math.random() * ch,
        r: Math.random() * 1.6 + 0.6,
        vy: -(Math.random() * 0.25 + 0.06),
        vx: (Math.random() - 0.5) * 0.12,
        a: Math.random() * 0.5 + 0.2,
        tw: Math.random() * Math.PI * 2,
      }));
    };
    sizeCanvas();
    if (typeof ResizeObserver !== 'undefined' && canvas) {
      const ro = new ResizeObserver(() => sizeCanvas());
      ro.observe(canvas);
      cleanups.push(() => ro.disconnect());
    }

    let cx = 0;
    let cy = 0;
    let curX = 0;
    let curY = 0;
    const started = performance.now();
    const loop = (now: number) => {
      const t = now - started;
      let tx = 0;
      let ty = 0;
      if (hero) {
        const r = hero.getBoundingClientRect();
        if (active) {
          tx = Math.max(-1, Math.min(1, (mx - (r.left + r.width / 2)) / (r.width / 2)));
          ty = Math.max(-1, Math.min(1, (my - (r.top + r.height / 2)) / (r.height / 2)));
        } else if (isTouch) {
          tx = goX;
          ty = goY;
        }
      }
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const amp = isTouch ? 0.85 : 0.5;
      const ix = Math.sin(t * 0.00035) * amp;
      const iy = Math.cos(t * 0.0003) * (amp * 0.8);
      const ox = (cx + ix) * k;
      const oy = (cy + iy) * k;
      layers.forEach((l) => {
        const d = (parseFloat(l.getAttribute('data-depth') || '') || 0) / 100;
        l.style.transform =
          'translate3d(' + (ox * d * 60).toFixed(1) + 'px,' + (oy * d * 38).toFixed(1) + 'px,0)';
      });
      if (sceneInner)
        sceneInner.style.transform =
          'rotateX(' + (-oy * 2.4).toFixed(2) + 'deg) rotateY(' + (ox * 3.2).toFixed(2) + 'deg)';
      if (cursor) {
        const rr = root.getBoundingClientRect();
        const gx = mx - rr.left;
        const gy = my - rr.top;
        curX += (gx - curX) * 0.14;
        curY += (gy - curY) * 0.14;
        cursor.style.transform = 'translate3d(' + (curX - 210).toFixed(1) + 'px,' + (curY - 210).toFixed(1) + 'px,0)';
      }
      magnets.forEach((btn) => {
        const r = btn.getBoundingClientRect();
        const bx = r.left + r.width / 2;
        const by = r.top + r.height / 2;
        const dx = mx - bx;
        const dy = my - by;
        const dist = Math.hypot(dx, dy);
        const radius = 110;
        if (active && dist < radius) {
          const pull = 1 - dist / radius;
          btn.style.transform = 'translate(' + (dx * pull * 0.32).toFixed(1) + 'px,' + (dy * pull * 0.32).toFixed(1) + 'px)';
        } else {
          const cur = btn.style.transform;
          if (cur && cur !== 'translate(0px, 0px)') btn.style.transform = 'translate(0px,0px)';
        }
      });
      if (ctx) {
        ctx.clearRect(0, 0, cw, ch);
        for (const p of parts) {
          p.y += p.vy;
          p.x += p.vx;
          p.tw += 0.03;
          if (p.y < -6) {
            p.y = ch + 6;
            p.x = Math.random() * cw;
          }
          if (p.x < -6) p.x = cw + 6;
          if (p.x > cw + 6) p.x = -6;
          const tw = 0.55 + Math.sin(p.tw) * 0.45;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = accent;
          ctx.globalAlpha = p.a * tw * 0.9;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      sosTimers.forEach((t) => clearTimeout(t));
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch {
          /* noop */
        }
      });
    };
  }, []);
}

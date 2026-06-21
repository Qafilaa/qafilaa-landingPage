/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react';
import { colors } from '../theme';

/**
 * Real 3D terrain flythrough behind the hero, a faithful port of the v2
 * design's `_terrain` routine. Three.js is lazy-loaded from a CDN and the
 * low-poly SVG (`[data-terrain-svg]`) stays as the fallback: if WebGL is
 * unavailable or the script fails to load, the canvas never fades in and the
 * SVG keeps rendering unchanged. All work happens client-side inside the
 * effect, so SSR/prerender is untouched.
 */
export function useTerrain() {
  useEffect(() => {
    const root = document.getElementById('qf-landing');
    if (!root) return;
    const canvas = root.querySelector<HTMLCanvasElement>('[data-terrain]');
    if (!canvas) return;
    const svg = root.querySelector<SVGElement>('[data-terrain-svg]');
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // bail to the SVG fallback if WebGL is unavailable
    try {
      const test = document.createElement('canvas');
      if (!(test.getContext('webgl') || test.getContext('experimental-webgl'))) return;
    } catch {
      return;
    }

    const win = window as any;
    const cleanups: Array<() => void> = [];
    let terrainRaf = 0;
    let renderer: any = null;
    let disposed = false;

    const loadThree = (): Promise<any> => {
      if (win.THREE) return Promise.resolve(win.THREE);
      if (win.__qfThree) return win.__qfThree;
      win.__qfThree = new Promise((res, rej) => {
        const sc = document.createElement('script');
        sc.src = 'https://unpkg.com/three@0.128.0/build/three.min.js';
        sc.onload = () => res(win.THREE);
        sc.onerror = rej;
        document.head.appendChild(sc);
      });
      return win.__qfThree;
    };

    const accentHex = colors.accent;
    const k = 1;

    loadThree()
      .then((THREE: any) => {
        if (!THREE || disposed) return;
        const host = canvas.parentElement as HTMLElement;
        let W = host.clientWidth || canvas.clientWidth || 1200;
        let H = host.clientHeight || canvas.clientHeight || 700;

        renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.setSize(W, H, false);
        renderer.setClearColor(0x070d0b, 0);

        const scene = new THREE.Scene();
        scene.fog = new THREE.Fog(0x070d0b, 26, 96);

        const camera = new THREE.PerspectiveCamera(62, W / H, 0.1, 220);
        camera.position.set(0, 6.2, 19);
        camera.lookAt(0, 1.2, -26);

        const accent = new THREE.Color(accentHex);

        // ----- terrain -----
        const SEG_X = 72;
        const SEG_Z = 120;
        const WIDTH = 70;
        const DEPTH = 150;
        const geo = new THREE.PlaneGeometry(WIDTH, DEPTH, SEG_X, SEG_Z);
        geo.rotateX(-Math.PI / 2);
        const pos = geo.attributes.position;
        const base = new Float32Array(pos.count * 2);
        for (let i = 0; i < pos.count; i++) {
          base[i * 2] = pos.getX(i);
          base[i * 2 + 1] = pos.getZ(i);
        }

        const noise = (x: number, z: number) =>
          Math.sin(x * 0.18 + z * 0.12) * 2.2 +
          Math.sin(x * 0.07 - z * 0.23) * 3.4 +
          Math.sin((x + z) * 0.05) * 2.0 +
          Math.cos(x * 0.33 + z * 0.31) * 0.9;
        const ridge = (x: number, z: number) => {
          const gully = Math.min(1, Math.abs(x) / 9);
          const far = Math.min(1, Math.max(0, -z / 80));
          return noise(x, z) * (0.35 + far * 1.5) * gully + far * 4.5 * gully;
        };

        const dark = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0x0a1512, transparent: true, opacity: 0.92, fog: true }));
        scene.add(dark);
        const wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.22, fog: true }));
        scene.add(wire);

        // ----- glowing route line down the gully -----
        const routePts = [];
        for (let z = 20; z >= -130; z -= 2) routePts.push(new THREE.Vector3(0, 0.4, z));
        const routeGeo = new THREE.BufferGeometry().setFromPoints(routePts);
        const route = new THREE.Line(routeGeo, new THREE.LineBasicMaterial({ color: accent, transparent: true, opacity: 0.9, fog: true }));
        scene.add(route);

        // ----- convoy markers gliding along the route -----
        const convoy: any[] = [];
        const dotGeo = new THREE.SphereGeometry(0.42, 12, 12);
        const dotMat = new THREE.MeshBasicMaterial({ color: accent, fog: true });
        const haloMat = new THREE.MeshBasicMaterial({ color: accent, transparent: true, opacity: 0.18, fog: true });
        for (let i = 0; i < 5; i++) {
          const g = new THREE.Group();
          const dot = new THREE.Mesh(dotGeo, dotMat);
          const halo = new THREE.Mesh(new THREE.SphereGeometry(1.0, 12, 12), haloMat);
          g.add(dot);
          g.add(halo);
          g.position.set(0, 0.7, -10 - i * 18);
          scene.add(g);
          convoy.push(g);
        }

        let yoff = 0;
        const speed = 7.0 * k;
        const sample = (i: number, off: number) => ridge(base[i * 2], base[i * 2 + 1] - off);

        const refit = () => {
          W = host.clientWidth || W;
          H = host.clientHeight || H;
          renderer.setSize(W, H, false);
          camera.aspect = W / H;
          camera.updateProjectionMatrix();
        };
        if (typeof ResizeObserver !== 'undefined') {
          const ro = new ResizeObserver(refit);
          ro.observe(host);
          cleanups.push(() => ro.disconnect());
        }

        const updateTerrain = (off: number) => {
          for (let i = 0; i < pos.count; i++) pos.setY(i, sample(i, off));
          pos.needsUpdate = true;
        };

        // pointer drift
        let px = 0;
        let py = 0;
        const onMove = (e: MouseEvent) => {
          const r = host.getBoundingClientRect();
          px = (e.clientX - r.left) / r.width - 0.5;
          py = (e.clientY - r.top) / r.height - 0.5;
        };
        root.addEventListener('mousemove', onMove);
        cleanups.push(() => root.removeEventListener('mousemove', onMove));

        canvas.style.opacity = '1';
        if (svg) svg.style.opacity = '0.12';

        if (reduce) {
          updateTerrain(0);
          renderer.render(scene, camera);
          return;
        }

        let t0 = performance.now();
        let camX = 0;
        let camY = 0;
        const loop = (now: number) => {
          const dt = Math.min(0.05, (now - t0) / 1000);
          t0 = now;
          yoff += speed * dt;
          updateTerrain(yoff);
          for (const g of convoy) {
            g.position.z += speed * dt;
            if (g.position.z > 20) g.position.z -= 110;
            const fade = Math.max(0, Math.min(1, (40 + g.position.z) / 40));
            g.children[0].material.opacity = fade;
            g.children[0].material.transparent = true;
          }
          camX += (px * 4.2 - camX) * 0.04;
          camY += (-py * 2.0 - camY) * 0.04;
          camera.position.x = camX;
          camera.position.y = 6.2 + camY + Math.sin(now * 0.0006) * 0.5;
          camera.lookAt(camX * 0.4, 1.2, -26);
          renderer.render(scene, camera);
          terrainRaf = requestAnimationFrame(loop);
        };
        terrainRaf = requestAnimationFrame(loop);
      })
      .catch(() => {
        /* keep SVG fallback */
      });

    return () => {
      disposed = true;
      if (terrainRaf) cancelAnimationFrame(terrainRaf);
      if (renderer) {
        try {
          renderer.dispose();
        } catch {
          /* noop */
        }
      }
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

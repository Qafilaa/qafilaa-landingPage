import { useEffect, useRef } from 'react';

import { socials } from '../content';
import { SiteEngine, type SiteProps } from './engine';

const href = (id: string) => socials.find((s) => s.id === id && s.live)?.href ?? '';

/**
 * The design's authored `data-props` defaults, with the real links taken from
 * `content.ts` so there is one place to change them.
 */
const PROPS: SiteProps = {
  snapSections: true,
  motion: 'full',
  autoDemo: true,
  instagramUrl: href('instagram'),
  linkedinUrl: href('linkedin'),
  xUrl: href('x'),
  whatsappUrl: href('whatsapp'),
};

/**
 * Mounts the imperative scroll runtime over the already-rendered markup.
 *
 * The engine owns the DOM under `ref` from here on — it rewrites `innerHTML` on
 * ~40 containers — so the tree it decorates must never re-render. Keep the host
 * component stateless.
 */
export function useSiteEngine() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const engine = new SiteEngine(PROPS);
    engine.mount(root);
    return () => engine.destroy();
  }, []);

  return ref;
}

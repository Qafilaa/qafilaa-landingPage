import { useState } from 'react';
import { colors } from './theme';
import { useLandingFx } from './hooks/useLandingFx';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { RouteMarquee } from './components/RouteMarquee';
import { StatsBand } from './components/StatsBand';
import { Problem } from './components/Problem';
import { Features } from './components/Features';
import { OfflineSpotlight } from './components/OfflineSpotlight';
import { HowItWorks } from './components/HowItWorks';
import { Safety } from './components/Safety';
import { DeviceShowcase } from './components/DeviceShowcase';
import { Waitlist } from './components/Waitlist';
import { Faq } from './components/Faq';
import { Footer } from './components/Footer';
import { LegalModal, type LegalDoc } from './components/LegalModal';

export default function App() {
  // Submitting either waitlist form flips the whole page into its success
  // state, mirrors the prototype's shared data-form / data-form-ok toggle.
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => setSubmitted(true);

  // Which legal document the footer modal is showing (null = closed).
  const [legal, setLegal] = useState<LegalDoc>(null);

  // Pointer-driven motion engine: parallax diorama, card tilt/glare, magnetic
  // buttons, cursor scout-light, GPS particles and the hold-to-send SOS.
  useLandingFx();

  return (
    <div
      id="qf-landing"
      style={{
        position: 'relative',
        isolation: 'isolate',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        // `clip` (not `hidden`) avoids the spec rule that coerces overflow-y to
        // `auto`, which would turn this into a nested scroll container and
        // produce a second vertical scrollbar.
        overflowX: 'clip',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* lagging cursor scout-light */}
      <div
        data-cursor
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 420,
          height: 420,
          borderRadius: 999,
          pointerEvents: 'none',
          zIndex: 1,
          mixBlendMode: 'screen',
          opacity: 0,
          transition: 'opacity .5s',
          background: 'radial-gradient(circle, rgba(32,214,168,0.16), rgba(32,214,168,0.05) 38%, transparent 66%)',
          willChange: 'transform',
        }}
      />

      <Nav />
      <Hero submitted={submitted} onSubmit={handleSubmit} />
      <RouteMarquee />
      <StatsBand />
      <Problem />
      <Features />
      <OfflineSpotlight />
      <HowItWorks />
      <Safety />
      <DeviceShowcase />
      <Waitlist submitted={submitted} onSubmit={handleSubmit} />
      <Faq />
      <Footer onOpenLegal={setLegal} />
      <LegalModal legal={legal} onClose={() => setLegal(null)} />
    </div>
  );
}

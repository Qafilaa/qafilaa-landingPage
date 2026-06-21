import { useState } from 'react';
import { colors } from './theme';
import { useLandingFx } from './hooks/useLandingFx';
import { useTerrain } from './hooks/useTerrain';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { RouteMarquee } from './components/RouteMarquee';
import { StatsBand } from './components/StatsBand';
import { Problem } from './components/Problem';
import { Features } from './components/Features';
import { ExpeditionToolkit } from './components/ExpeditionToolkit';
import { TryARide } from './components/TryARide';
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

  // Lazy 3D terrain flythrough behind the hero (falls back to the SVG range).
  useTerrain();

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
      {/* ride-progress: the scroll IS your position on the route (wired by useLandingFx) */}
      <div
        data-progress
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          height: 3,
          width: '0%',
          zIndex: 60,
          background: 'linear-gradient(90deg, rgba(32,214,168,0.35), var(--accent,#20D6A8))',
          boxShadow: '0 0 12px rgba(32,214,168,0.5)',
        }}
      />
      <div
        data-progress-chip
        aria-hidden="true"
        style={{
          position: 'fixed',
          left: 18,
          bottom: 18,
          zIndex: 60,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '9px 14px',
          borderRadius: 999,
          background: 'rgba(7,13,11,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(32,214,168,0.25)',
          opacity: 0,
          transform: 'translateY(12px)',
          transition: 'opacity .4s, transform .4s',
          pointerEvents: 'none',
        }}
      >
        <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 999, background: colors.accent, animation: 'qf-ping 2.2s ease-out infinite' }} />
          <span style={{ position: 'relative', width: 8, height: 8, borderRadius: 999, background: colors.accent }} />
        </span>
        <span style={{ fontSize: 12, color: colors.textMuted }}>
          You're <span data-progress-km style={{ color: colors.text, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>0.0 km</span> in ·{' '}
          <span data-progress-next style={{ color: colors.accent, fontWeight: 600 }}>Rally 1 ahead</span>
        </span>
      </div>

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
      <ExpeditionToolkit />
      <TryARide />
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

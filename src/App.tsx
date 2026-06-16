import { useState } from 'react';
import { colors } from './theme';
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

export default function App() {
  // Submitting either waitlist form flips the whole page into its success
  // state — mirrors the prototype's shared data-form / data-form-ok toggle.
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = () => setSubmitted(true);

  return (
    <div
      id="qf-landing"
      style={{
        background: colors.bg,
        color: colors.text,
        fontFamily: 'Inter, system-ui, sans-serif',
        overflowX: 'hidden',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
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
      <Footer />
    </div>
  );
}

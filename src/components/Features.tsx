import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';
import { useReveal } from '../hooks/useReveal';
import { useHover } from '../hooks/useHover';

const cardBase: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 20,
  padding: 30,
  willChange: 'transform',
};

const DEFAULT_GLARE = 'radial-gradient(260px 260px at 50% 0%, rgba(32,214,168,0.1), transparent 60%)';

const glareLayer = (background: string): CSSProperties => ({
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  background,
  opacity: 0,
});

const iconBox: CSSProperties = {
  width: 46,
  height: 46,
  borderRadius: 13,
  background: 'rgba(32,214,168,0.12)',
  border: '1px solid rgba(32,214,168,0.28)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 18,
};

const title: CSSProperties = { fontFamily: fonts.display, fontSize: 23, fontWeight: 600, margin: 0 };
const body: CSSProperties = { color: colors.textMuted, fontSize: 15.5, lineHeight: 1.55, margin: '10px 0 0' };

interface CardProps {
  children: ReactNode;
  delay?: number;
  /** Extra base styles (e.g. span-2 layout, SOS gradient). */
  style?: CSSProperties;
  hoverBorderColor?: string;
  /** Marks the wide span-2 card so it can restack on mobile. */
  wide?: boolean;
  /** 3D-tilt magnitude (the wide card tilts a touch less). */
  tiltMax?: number;
  /** The glare layer's resting gradient (the SOS card glows red). */
  glare?: string;
}

function FeatureCard({
  children,
  delay,
  style,
  hoverBorderColor = 'rgba(32,214,168,0.35)',
  wide,
  tiltMax = 9,
  glare = DEFAULT_GLARE,
}: CardProps) {
  const reveal = useReveal<HTMLDivElement>({ delay, duration: 0.8 });
  // Transform is owned by the imperative tilt engine; React only swaps the
  // border colour on hover (the source's `style-hover`).
  const hover = useHover({ borderColor: hoverBorderColor });
  return (
    <div
      ref={reveal.ref}
      data-tilt
      data-tilt-max={tiltMax}
      data-glare-card=""
      {...(wide ? { 'data-feature-wide': '' } : {})}
      {...hover.hoverProps}
      style={{
        ...cardBase,
        ...style,
        ...reveal.style,
        ...hover.style,
        transition: `opacity .8s ${EASE}, transform .14s ease-out`,
      }}
    >
      {children}
      <div data-glare style={glareLayer(glare)} />
    </div>
  );
}

/* ---- feature icons (24×24, 2px stroke unless noted) ---- */
const stroke = {
  fill: 'none' as const,
  stroke: colors.accent,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const MapIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" {...stroke}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" />
    <path d="M9 4v14" />
    <path d="M15 6v14" />
  </svg>
);
const GapIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" {...stroke}>
    <path d="M3 12h18" />
    <path d="M6 9v6" />
    <path d="M12 7v10" />
    <path d="M18 9v6" />
  </svg>
);
const RallyIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" {...stroke}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const WifiOffIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" {...stroke}>
    <path d="M17.5 19a4.5 4.5 0 0 0 .9-8.9 6 6 0 0 0-11.6-1.4A4 4 0 0 0 6.5 19Z" />
    <path d="m2 2 20 20" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" {...stroke}>
    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const SosIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 8v5" />
    <circle cx="12" cy="16.5" r="0.4" />
    <path d="M10.3 3.9 2.4 18a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
  </svg>
);
const CrashIcon = () => (
  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={colors.danger} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 17 8 8h8l3 9" />
    <circle cx="7.5" cy="17.5" r="2" />
    <circle cx="16.5" cy="17.5" r="2" />
    <path d="M11 8V5" />
  </svg>
);

/** Red-gradient danger card (shared by Crash detection and One-tap SOS). */
const dangerCardStyle: CSSProperties = {
  background: 'linear-gradient(180deg, rgba(255,82,71,0.08), #0C1311)',
  border: '1px solid rgba(255,82,71,0.22)',
};
const dangerIconBox: CSSProperties = {
  ...iconBox,
  background: 'rgba(255,82,71,0.14)',
  border: '1px solid rgba(255,82,71,0.32)',
  position: 'relative',
};
const dangerGlare = 'radial-gradient(260px 260px at 50% 0%, rgba(255,82,71,0.12), transparent 60%)';
const PingRing = () => (
  <span
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: 13,
      border: '1px solid rgba(255,82,71,0.5)',
      animation: 'qf-ping 2.4s ease-out infinite',
    }}
  />
);

function MapDemo() {
  return (
    <div
      data-feature-demo
      style={{
        width: 150,
        height: 150,
        flexShrink: 0,
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        background: '#0F1714',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <svg viewBox="0 0 150 150" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <path
          d="M 24 130 C 50 110 40 80 70 70 C 100 60 96 40 120 22"
          fill="none"
          stroke={colors.accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6 8"
          style={{ animation: 'qf-dash 3s linear infinite' }}
        />
        <circle cx="24" cy="130" r="6" fill={colors.token} stroke={colors.accent} strokeWidth="2" />
        <circle cx="70" cy="70" r="7" fill={colors.accent} />
        <circle cx="70" cy="70" r="7" fill="none" stroke={colors.accent} strokeWidth="2" opacity="0.5">
          <animate attributeName="r" values="7;16" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="22" r="6" fill={colors.token} stroke={colors.success} strokeWidth="2" />
      </svg>
    </div>
  );
}

export function Features() {
  return (
    <section
      id="features"
      style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '56px 28px 40px', scrollMarginTop: 80 }}
    >
      <Reveal style={{ marginBottom: 40 }}>
        <Eyebrow>Everything in the kit</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(30px,4vw,46px)',
            lineHeight: 1.1,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '16px 0 0',
          }}
        >
          Everything for the road.
        </h2>
      </Reveal>

      <div data-features-grid style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
        {/* f1, live ride map (wide) */}
        <FeatureCard
          wide
          tiltMax={8}
          glare="radial-gradient(300px 300px at 50% 0%, rgba(32,214,168,0.10), transparent 60%)"
          style={{ gridColumn: 'span 2', display: 'flex', gap: 28, alignItems: 'center' }}
        >
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <div style={iconBox}>
              <MapIcon />
            </div>
            <h3 style={title}>Live ride map</h3>
            <p style={{ ...body, maxWidth: 340 }}>
              Every rider on one dark, battery-light map. Lead, sweep, and everyone between, moving in real time along
              the route you set.
            </p>
          </div>
          <MapDemo />
        </FeatureCard>

        {/* f2, gap tracking */}
        <FeatureCard delay={80}>
          <div style={iconBox}>
            <GapIcon />
          </div>
          <h3 style={title}>Gap tracking</h3>
          <p style={body}>
            Know exactly how far back each rider is. Distances update the second they move, so you stop guessing and
            start waiting in the right place.
          </p>
        </FeatureCard>

        {/* f3, rally points */}
        <FeatureCard>
          <div style={iconBox}>
            <RallyIcon />
          </div>
          <h3 style={title}>Rally points</h3>
          <p style={body}>
            Drop a regroup point and the whole ride gets the same pin, distance and ETA. The next stop is never a
            debate.
          </p>
        </FeatureCard>

        {/* f4, offline-first */}
        <FeatureCard delay={80}>
          <div style={iconBox}>
            <WifiOffIcon />
          </div>
          <h3 style={title}>Offline-first</h3>
          <p style={body}>
            No signal? Qafilaa holds the last-known position of everyone and syncs the moment bars return. The map never
            goes blank.
          </p>
        </FeatureCard>

        {/* f5, sweep & roles */}
        <FeatureCard delay={160}>
          <div style={iconBox}>
            <ShieldCheckIcon />
          </div>
          <h3 style={title}>Sweep &amp; roles</h3>
          <p style={body}>
            Assign a lead and a sweep before you roll. The ride isn't marked done until the sweep is in, by design.
          </p>
        </FeatureCard>

        {/* f6, crash detection */}
        <FeatureCard
          style={dangerCardStyle}
          hoverBorderColor="rgba(255,82,71,0.45)"
          glare={dangerGlare}
        >
          <div style={dangerIconBox}>
            <PingRing />
            <CrashIcon />
          </div>
          <h3 style={title}>Crash detection</h3>
          <p style={body}>
            Automatic. A hard impact starts a countdown and, if you can't cancel it, alerts the crew and your emergency
            contacts with your exact location and altitude.
          </p>
        </FeatureCard>

        {/* f7, one-tap SOS */}
        <FeatureCard
          style={dangerCardStyle}
          hoverBorderColor="rgba(255,82,71,0.45)"
          glare={dangerGlare}
        >
          <div style={dangerIconBox}>
            <PingRing />
            <SosIcon />
          </div>
          <h3 style={title}>One-tap SOS</h3>
          <p style={body}>
            Hold for two seconds to alert the whole ride with your live location and altitude. Help heads straight to
            you, no shouting into a dead radio.
          </p>
        </FeatureCard>
      </div>
    </section>
  );
}

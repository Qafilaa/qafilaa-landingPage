import type { CSSProperties } from 'react';
import { colors } from '../theme';

export type ConvoyState = 'live' | 'stale' | 'offline' | 'solo';

interface StateVals {
  route: string;
  dash: string;
  ring: string;
  others: 'flex' | 'none';
  gaps: 'flex' | 'none';
  dim: number;
  pulse: number;
}

const STATE_MAP: Record<ConvoyState, StateVals> = {
  live: { route: colors.accent, dash: 'none', ring: colors.accent, others: 'flex', gaps: 'flex', dim: 0, pulse: 0.85 },
  stale: { route: colors.stale, dash: 'none', ring: colors.stale, others: 'flex', gaps: 'flex', dim: 0.16, pulse: 0 },
  offline: { route: colors.stale, dash: '2 10', ring: colors.stale, others: 'flex', gaps: 'flex', dim: 0.28, pulse: 0 },
  solo: { route: colors.accent, dash: 'none', ring: colors.accent, others: 'none', gaps: 'none', dim: 0, pulse: 0.85 },
};

const ROUTE_D =
  'M 102 545 C 120 500 110 460 132 432 C 160 398 250 380 236 332 C 226 296 188 250 206 214 C 222 182 250 140 267 96';

const pinWrap = (left: string, top: string): CSSProperties => ({
  position: 'absolute',
  left,
  top,
  transform: 'translate(-50%,-100%)',
});

const pin: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: '50% 50% 50% 0',
  transform: 'rotate(-45deg)',
  background: colors.accent,
  boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const pinLabel: CSSProperties = {
  transform: 'rotate(45deg)',
  color: colors.surfaceInset,
  fontSize: 13,
  fontWeight: 600,
};

const gapLabel = (left: string, top: string, display: string): CSSProperties => ({
  display,
  position: 'absolute',
  left,
  top,
  transform: 'translate(-50%,-50%)',
  padding: '3px 8px',
  borderRadius: 999,
  background: 'rgba(14,20,19,0.82)',
  border: '1px solid rgba(255,255,255,0.10)',
  color: colors.textMuted,
  fontSize: 11,
  fontWeight: 500,
  whiteSpace: 'nowrap',
});

interface RiderTokenProps {
  left: string;
  top: string;
  size: number;
  initials: string;
  ringColor: string;
  statusColor: string;
  /** Filled = the "You" token (solid teal with sonar ping). */
  you?: boolean;
  pulse?: number;
  label?: { text: string; bg: string; color: string };
  display?: string;
}

function RiderToken({
  left,
  top,
  size,
  initials,
  ringColor,
  statusColor,
  you = false,
  pulse = 0,
  label,
  display = 'flex',
}: RiderTokenProps) {
  return (
    <div
      style={{
        display,
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%,-50%)',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        {you && (
          <div
            style={{
              position: 'absolute',
              inset: -7,
              borderRadius: 999,
              background: ringColor,
              opacity: pulse,
              animation: 'qf-pulse 2.4s ease-out infinite',
            }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 999,
            border: you ? `3px solid ${colors.accent}` : `2.5px solid ${ringColor}`,
            background: you ? colors.accent : colors.token,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: you ? colors.surfaceInset : colors.text,
            fontSize: you ? 15 : 14,
            fontWeight: you ? 600 : 500,
          }}
        >
          {initials}
        </div>
        {!you && (
          <div
            style={{
              position: 'absolute',
              right: -2,
              bottom: -2,
              width: size >= 42 ? 13 : 12,
              height: size >= 42 ? 13 : 12,
              borderRadius: 999,
              background: statusColor,
              border: '2px solid #0F1714',
            }}
          />
        )}
      </div>
      {label && (
        <span
          style={{
            padding: '2px 7px',
            borderRadius: 999,
            background: label.bg,
            color: label.color,
            fontSize: 10,
            fontWeight: 500,
          }}
        >
          {label.text}
        </span>
      )}
    </div>
  );
}

interface ConvoyMapProps {
  state?: ConvoyState;
}

/**
 * The reusable convoy map shown inside the phone frames. A topographic SVG with
 * a glowing route, rally pins, a hazard marker, gap labels and rider tokens.
 * Switches between live / stale / offline / solo presentations.
 */
export function ConvoyMap({ state = 'live' }: ConvoyMapProps) {
  const v = STATE_MAP[state];

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 620,
        overflow: 'hidden',
        background: '#0F1714',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <svg
        viewBox="0 0 393 620"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <radialGradient id="qf-vig" cx="50%" cy="38%" r="75%">
            <stop offset="0%" stopColor="#13201C" />
            <stop offset="100%" stopColor="#0C1311" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="393" height="620" fill="url(#qf-vig)" />
        <g fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.2">
          <path d="M -20 110 C 90 80 150 150 250 120 C 330 96 380 140 420 120" />
          <path d="M -20 180 C 80 150 170 210 260 180 C 340 154 390 190 420 175" />
          <path d="M -20 270 C 70 250 140 300 240 270 C 330 244 380 280 420 268" />
          <path d="M -20 360 C 90 340 160 392 250 360 C 340 332 385 362 420 352" />
          <path d="M -20 452 C 80 430 150 478 250 452 C 340 430 388 458 420 448" />
          <path d="M -20 540 C 90 520 150 566 255 540 C 345 520 388 548 420 540" />
        </g>
        <g fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1">
          <path d="M 70 -20 C 60 160 120 320 90 520 C 76 590 84 620 88 640" />
          <path d="M 200 -20 C 215 170 175 330 210 520 C 224 590 210 620 206 640" />
          <path d="M 320 -20 C 305 160 350 320 318 520 C 304 590 318 620 322 640" />
        </g>
        <path
          d="M 36 596 L 60 600 L 120 470 L 96 360 L 210 250 L 360 150"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        <path d={ROUTE_D} fill="none" stroke={v.route} strokeWidth="11" strokeLinecap="round" opacity="0.18" />
        <path d={ROUTE_D} fill="none" stroke={v.route} strokeWidth="4" strokeLinecap="round" strokeDasharray={v.dash} />
      </svg>

      {/* dim overlay for stale / offline */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: '#0A100E',
          opacity: v.dim,
          pointerEvents: 'none',
        }}
      />

      {/* rally pins */}
      <div style={pinWrap('44%', '45%')}>
        <div style={pin}>
          <span style={pinLabel}>2</span>
        </div>
      </div>
      <div style={pinWrap('72%', '19%')}>
        <div style={pin}>
          <span style={pinLabel}>3</span>
        </div>
      </div>

      {/* hazard marker */}
      <div
        style={{
          position: 'absolute',
          left: '39%',
          top: '57%',
          transform: 'translate(-50%,-50%)',
          width: 24,
          height: 24,
          borderRadius: 7,
          transformOrigin: 'center',
          background: colors.warning,
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: colors.surfaceInset, fontSize: 14, fontWeight: 600, lineHeight: 1 }}>!</span>
      </div>

      {/* gap labels */}
      <div style={gapLabel('29%', '75%', v.gaps)}>1.4 km</div>
      <div style={gapLabel('46%', '59%', v.gaps)}>2.1 km</div>
      <div style={gapLabel('55%', '41%', v.gaps)}>0.9 km</div>
      <div style={gapLabel('59%', '23%', v.gaps)}>3.0 km</div>

      {/* rider tokens */}
      <RiderToken
        left="66%"
        top="13%"
        size={42}
        initials="AK"
        ringColor={v.ring}
        statusColor={colors.success}
        label={{ text: 'Lead', bg: 'rgba(32,214,168,0.14)', color: colors.accent }}
      />
      <RiderToken
        left="51%"
        top="32%"
        size={40}
        initials="RS"
        ringColor={v.ring}
        statusColor={colors.warning}
        display={v.others}
      />
      <RiderToken
        left="59%"
        top="51%"
        size={46}
        initials="JP"
        ringColor={v.ring}
        statusColor=""
        you
        pulse={v.pulse}
        label={{ text: 'You', bg: 'rgba(32,214,168,0.14)', color: colors.accent }}
      />
      <RiderToken
        left="33%"
        top="67%"
        size={40}
        initials="MD"
        ringColor={v.ring}
        statusColor={colors.success}
        display={v.others}
      />
      <RiderToken
        left="25%"
        top="83%"
        size={42}
        initials="VT"
        ringColor={v.ring}
        statusColor={colors.success}
        display={v.others}
        label={{ text: 'Sweep', bg: 'rgba(255,255,255,0.08)', color: colors.textMuted }}
      />
    </div>
  );
}

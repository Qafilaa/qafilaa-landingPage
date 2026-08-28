/**
 * Live map — where riders are right now.
 *
 * ## Why this draws its own map instead of using one
 *
 * The repo has exactly two dependencies, React and React DOM, and a tile-based map would add both a
 * library and a third-party request on every load. More to the point, a tile map would be *worse* for
 * the question this panel answers. An operator here is not navigating; they are asking "where is the
 * crew, are they together, and how stale is what I am looking at?" — which is a question about
 * relative position and freshness, not about which road anybody is on.
 *
 * So this plots the riders against their own bounding box, with a real distance scale, and hands off
 * to Google Maps for the one-rider "where exactly" question. Nothing is drawn that we cannot defend:
 * there is no coastline, no roads, no basemap, because inventing geography around real coordinates
 * would be the most misleading thing on this console.
 *
 * ## Freshness is the primary quantity, not position
 *
 * A fix is a claim about a moment. A twenty-minute-old position rendered identically to a live one is
 * how a search party ends up at the wrong place, so age drives the colour, the ring and the sort
 * order, and it is the first column in the table.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { listLive, type OpsLiveRider } from './api';
import { HG, NUM, SG, num } from './theme';
import {
  Badge, Banner, Button, Card, Chips, Empty, Loading, SectionTitle, Stat, StatGrid, Table, Td, Toolbar,
} from './ui';
import { useAsync } from './useAsync';

/** Age bands. Deliberately coarse — three states an operator can hold in their head, not a gradient. */
type Freshness = 'live' | 'stale' | 'old';

function freshness(ageSeconds: number): Freshness {
  if (ageSeconds <= 120) return 'live';
  if (ageSeconds <= 900) return 'stale';
  return 'old';
}

const FRESH_COLOR: Record<Freshness, string> = {
  live: 'var(--ok)',
  stale: 'var(--warn)',
  old: 'var(--sur)',
};

const FRESH_LABEL: Record<Freshness, string> = {
  live: 'Live',
  stale: 'Stale',
  old: 'Old',
};

/** "4m ago" reads faster than a timestamp when the whole point is how long ago. */
function ago(seconds: number): string {
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ago`;
}

export function Live() {
  const [window_, setWindow] = useState(60);
  const [auto, setAuto] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);

  const { data, error, loading, reload } = useAsync<OpsLiveRider[]>(
    useCallback(() => listLive(window_), [window_]), [window_],
  );

  /* Auto-refresh, off by default on a long window. Held in a ref so changing the interval does not
     restart the timer mid-cycle, and cleared on unmount — a console left open for a day should not
     accumulate timers. */
  const reloadRef = useRef(reload);
  reloadRef.current = reload;
  useEffect(() => {
    if (!auto) return;
    const id = window.setInterval(() => reloadRef.current(), 15_000);
    return () => window.clearInterval(id);
  }, [auto]);

  // Memoised so the identity is stable: `data ?? []` allocates a new array on every render, which
  // would invalidate the counts below (and the plot's projection) on every tick of the auto-refresh.
  const riders = useMemo(() => data ?? [], [data]);
  const counts = useMemo(() => ({
    live: riders.filter((r) => freshness(r.ageSeconds) === 'live').length,
    stale: riders.filter((r) => freshness(r.ageSeconds) === 'stale').length,
    old: riders.filter((r) => freshness(r.ageSeconds) === 'old').length,
    riding: riders.filter((r) => r.riding).length,
    lowBattery: riders.filter((r) => r.batteryPct !== null && r.batteryPct <= 20).length,
    moving: riders.filter((r) => (r.speedKmh ?? 0) > 5).length,
  }), [riders]);

  /* Riders grouped by the trip they are on. A crew is the unit an operator thinks in — "is everyone
     on trip 45 together?" — and a flat list sorted by fix age scatters them. */
  const byTrip = useMemo(() => {
    const out = new Map<number, { name: string; riders: OpsLiveRider[] }>();
    for (const r of riders) {
      const entry = out.get(r.tripId);
      if (entry) entry.riders.push(r);
      else out.set(r.tripId, { name: r.tripName ?? `Trip #${r.tripId}`, riders: [r] });
    }
    return [...out.entries()].sort((a, b) => b[1].riders.length - a[1].riders.length);
  }, [riders]);

  /** Widest gap between any two riders on the same trip — the "are they together?" number. */
  const spreadKm = useMemo(() => {
    const out = new Map<number, number>();
    for (const [tripId, { riders: crew }] of byTrip) {
      let max = 0;
      for (let i = 0; i < crew.length; i++) {
        for (let j = i + 1; j < crew.length; j++) {
          max = Math.max(max, haversineKm(crew[i], crew[j]));
        }
      }
      out.set(tripId, max);
    }
    return out;
  }, [byTrip]);

  return (
    <>
      <SectionTitle
        eyebrow="Live"
        title="Where riders are"
        note="Last known fix only — never a track, never a history. Age is the number that matters: a stale position shown as if it were current is how a search goes to the wrong place."
        action={
          <>
            <Button variant={auto ? 'primary' : 'secondary'} onClick={() => setAuto((a) => !a)}>
              {auto ? 'Auto-refresh on' : 'Auto-refresh off'}
            </Button>
            <Button onClick={reload}>Refresh</Button>
          </>
        }
      />

      <Toolbar>
        <Chips
          label="Seen within"
          value={window_}
          options={[{ v: 15, l: '15 min' }, { v: 60, l: '1 hour' }, { v: 360, l: '6 hours' }, { v: 1440, l: '24 hours' }]}
          onPick={setWindow}
        />
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {loading && !data ? <Loading rows={4} /> : null}

      {data && riders.length === 0 ? (
        <Empty>
          Nobody has sent a position in the last {window_ < 60 ? `${window_} minutes` : `${window_ / 60} hours`}.
          <br />
          <span style={{ fontSize: 12.5 }}>
            That is the normal state when no one is riding — it is not an error.
          </span>
        </Empty>
      ) : null}

      {data && riders.length > 0 ? (
        <>
          <StatGrid>
            <Stat
              label="Fixes this fresh"
              value={num(counts.live)}
              tone={counts.live > 0 ? 'ok' : 'neutral'}
              sub={`${counts.stale} stale · ${counts.old} old`}
            />
            <Stat
              label="On an open ride"
              value={num(counts.riding)}
              tone={counts.riding > 0 ? 'accent' : 'neutral'}
              sub="told us they are out there"
            />
            <Stat
              label="Actually moving"
              value={num(counts.moving)}
              sub="over 5 km/h at last fix"
            />
            <Stat
              label="Battery under 20%"
              value={num(counts.lowBattery)}
              tone={counts.lowBattery > 0 ? 'danger' : 'ok'}
              sub={counts.lowBattery > 0 ? 'a dead phone stops sharing' : 'nobody low'}
            />
          </StatGrid>

          <div style={{ height: 16 }} />

          {counts.old > 0 ? (
            <Banner tone="warn" title={`${counts.old} position${counts.old === 1 ? ' is' : 's are'} over 15 minutes old`}>
              Shown because they are the last thing we know, not because they are current. A rider in a
              dead zone and a rider who stopped sharing look identical from here.
            </Banner>
          ) : null}

          <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 18 }}>
            <Plot riders={riders} selected={selected} onSelect={setSelected} />
          </Card>

          {byTrip.length > 1 || (byTrip[0]?.[1].riders.length ?? 0) > 1 ? (
            <Card style={{ marginBottom: 18 }}>
              <h3 style={{ font: `600 15px ${SG}`, color: 'var(--ink)', margin: '0 0 4px' }}>By crew</h3>
              <p style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', margin: '0 0 12px' }}>
                Spread is the widest gap between any two riders on that trip — the &ldquo;are they still
                together?&rdquo; number.
              </p>
              {byTrip.map(([tripId, { name, riders: crew }]) => {
                const spread = spreadKm.get(tripId) ?? 0;
                return (
                  <div
                    key={tripId}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '9px 0', borderTop: '1px solid var(--line)' }}
                  >
                    <div>
                      <div style={{ font: `600 13.5px ${HG}`, color: 'var(--ink)' }}>{name}</div>
                      <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)' }}>
                        {crew.length} rider{crew.length === 1 ? '' : 's'} ·{' '}
                        {crew.filter((r) => r.riding).length} riding
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ ...NUM, fontSize: 16, fontWeight: 600, color: spread > 20 ? 'var(--warn)' : 'var(--ink)' }}>
                        {crew.length < 2 ? '—' : spread < 1 ? `${Math.round(spread * 1000)} m` : `${spread.toFixed(1)} km`}
                      </div>
                      <div style={{ font: `400 11.5px ${HG}`, color: 'var(--sur)' }}>spread</div>
                    </div>
                  </div>
                );
              })}
            </Card>
          ) : null}

          <Table head={['Age', 'Rider', 'Trip', 'Speed', 'Battery', 'Position', '']}>
            {riders.map((r) => {
              const f = freshness(r.ageSeconds);
              return (
                <tr
                  key={r.riderId}
                  className="qf-row"
                  style={{ background: selected === r.riderId ? 'rgba(14,124,134,.07)' : undefined, cursor: 'pointer' }}
                  onClick={() => setSelected(selected === r.riderId ? null : r.riderId)}
                >
                  <Td>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      <span
                        aria-hidden
                        className={f === 'live' ? 'qf-pulse' : undefined}
                        style={{ width: 8, height: 8, borderRadius: 8, background: FRESH_COLOR[f], flex: '0 0 8px' }}
                      />
                      <span style={{ ...NUM, fontSize: 13, color: 'var(--ink)' }}>{ago(r.ageSeconds)}</span>
                    </span>
                  </Td>
                  <Td>
                    <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>
                      {r.riderName ?? `Rider #${r.riderId}`}
                    </div>
                    {r.riding ? <Badge tone="accent">Riding</Badge> : <Badge>{FRESH_LABEL[f]}</Badge>}
                  </Td>
                  <Td>{r.tripName ?? <span style={{ ...NUM, color: 'var(--sur)' }}>#{r.tripId}</span>}</Td>
                  <Td mono>{r.speedKmh === null ? '—' : `${r.speedKmh} km/h`}</Td>
                  <Td mono style={{ color: r.batteryPct !== null && r.batteryPct <= 15 ? 'var(--danger)' : undefined }}>
                    {r.batteryPct === null ? '—' : `${r.batteryPct}%`}
                  </Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>
                    {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                  </Td>
                  <Td style={{ textAlign: 'right' }}>
                    <a
                      className="qf-a"
                      href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ font: `600 12.5px ${HG}`, color: 'var(--acc2)', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      Open in Maps →
                    </a>
                  </Td>
                </tr>
              );
            })}
          </Table>
        </>
      ) : null}
    </>
  );
}

/**
 * The plot.
 *
 * Equirectangular, which is honest at this scale: over a crew's spread (tens of km) the distortion is
 * far below the size of the dot. Longitude is scaled by cos(latitude) so east–west distance is not
 * exaggerated — without that, riders at 28°N would look ~12% further apart horizontally than they are.
 *
 * A single rider has no bounding box, so the box is floored to a minimum span and the scale bar tells
 * you what you are looking at. That is the case where a naive plot divides by zero and vanishes.
 */
function Plot({
  riders, selected, onSelect,
}: { riders: OpsLiveRider[]; selected: number | null; onSelect: (id: number | null) => void }) {
  const W = 760;
  const H = 340;
  const pad = 34;

  const geo = useMemo(() => {
    const lats = riders.map((r) => r.latitude);
    const lons = riders.map((r) => r.longitude);
    const midLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const k = Math.cos((midLat * Math.PI) / 180) || 1;

    // Work in "projected" units: x scaled by cos(lat) so both axes are comparable distances.
    const xs = lons.map((l) => l * k);
    const ys = lats;

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    // ~500 m floor, so one rider (or a stationary crew) still renders sensibly instead of collapsing.
    const floor = 0.0045;
    const spanX = Math.max(maxX - minX, floor);
    const spanY = Math.max(maxY - minY, floor);
    const span = Math.max(spanX, spanY) * 1.25;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    return { k, span, cx, cy, midLat };
  }, [riders]);

  const project = (r: OpsLiveRider) => {
    const x = r.longitude * geo.k;
    const size = Math.min(W - pad * 2, H - pad * 2);
    return {
      cx: (W - size) / 2 + ((x - geo.cx) / geo.span + 0.5) * size,
      // SVG y grows downward; latitude grows north, so it is inverted here.
      cy: (H - size) / 2 + (0.5 - (r.latitude - geo.cy) / geo.span) * size,
    };
  };

  // One degree of latitude is ~111.32 km everywhere. The bar is the visible span, rounded to something
  // a person can read, so the plot carries a real sense of distance rather than being decorative.
  const spanKm = geo.span * 111.32;
  const niceKm = niceNumber(spanKm / 3);
  const barFraction = niceKm / spanKm;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label={`Positions of ${riders.length} riders, spanning about ${spanKm.toFixed(1)} kilometres.`}
        style={{ display: 'block', background: 'var(--ctr)' }}
        onClick={() => onSelect(null)}
      >
        <defs>
          <pattern id="qfgrid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M38 0H0V38" fill="none" stroke="var(--line)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#qfgrid)" />

        {riders.map((r) => {
          const { cx, cy } = project(r);
          const f = freshness(r.ageSeconds);
          const on = selected === r.riderId;
          return (
            <g
              key={r.riderId}
              onClick={(e) => { e.stopPropagation(); onSelect(on ? null : r.riderId); }}
              style={{ cursor: 'pointer' }}
            >
              {f === 'live' ? (
                <circle cx={cx} cy={cy} r={16} fill={FRESH_COLOR[f]} opacity={0.14} className="qf-ping" />
              ) : null}
              <circle cx={cx} cy={cy} r={on ? 11 : 8} fill={FRESH_COLOR[f]} stroke="var(--card)" strokeWidth={2.5} />

              {/* Heading, when the device reported one. A wedge rather than an arrow: it reads at 8px. */}
              {r.heading !== null && f !== 'old' ? (
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx + Math.sin((r.heading * Math.PI) / 180) * 20}
                  y2={cy - Math.cos((r.heading * Math.PI) / 180) * 20}
                  stroke={FRESH_COLOR[f]}
                  strokeWidth={2.5}
                  strokeLinecap="round"
                />
              ) : null}

              {(on || riders.length <= 8) ? (
                <text
                  x={cx}
                  y={cy - (on ? 18 : 15)}
                  textAnchor="middle"
                  style={{ font: `600 11.5px ${SG}`, fill: 'var(--ink)', paintOrder: 'stroke' }}
                  stroke="var(--card)"
                  strokeWidth={3}
                >
                  {r.riderName ?? `#${r.riderId}`}
                </text>
              ) : null}
            </g>
          );
        })}

        {/* Scale bar. Without it the plot is a picture of relative position with no magnitude at all. */}
        <g transform={`translate(${pad}, ${H - 18})`}>
          <line x1={0} y1={0} x2={(W - pad * 2) * barFraction} y2={0} stroke="var(--mut)" strokeWidth={2} />
          <line x1={0} y1={-4} x2={0} y2={4} stroke="var(--mut)" strokeWidth={2} />
          <line
            x1={(W - pad * 2) * barFraction} y1={-4}
            x2={(W - pad * 2) * barFraction} y2={4}
            stroke="var(--mut)" strokeWidth={2}
          />
          <text x={(W - pad * 2) * barFraction + 8} y={4} style={{ font: `500 11px ${SG}`, fill: 'var(--mut)' }}>
            {niceKm >= 1 ? `${niceKm} km` : `${Math.round(niceKm * 1000)} m`}
          </text>
        </g>
      </svg>

      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--line)', font: `400 12.5px ${HG}`, color: 'var(--sur)' }}>
        Relative positions only — no basemap, because drawing invented geography around real coordinates
        would be the most misleading thing here. Use <strong>Open in Maps</strong> for a road view.
      </div>
    </div>
  );
}

/**
 * Great-circle distance in kilometres.
 *
 * Haversine rather than a flat approximation: the crew-spread figure is the one number here an
 * operator might act on, and a planar estimate drifts by percent over the distances a convoy covers.
 */
function haversineKm(a: OpsLiveRider, b: OpsLiveRider): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Rounds to 1, 2 or 5 times a power of ten — the values a scale bar can label without noise. */
function niceNumber(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const n = value / base;
  const rounded = n >= 5 ? 5 : n >= 2 ? 2 : 1;
  return Number((rounded * base).toPrecision(2));
}

/** The activation funnel, rendered as stepped bars with the drop-off between stages named. */
export function Funnel({ stages }: { stages: { label: string; value: number; note?: string }[] }) {
  const top = Math.max(1, stages[0]?.value ?? 1);

  return (
    <div>
      {stages.map((s, i) => {
        const prev = i === 0 ? null : stages[i - 1].value;
        const pctOfTop = Math.round((s.value / top) * 100);
        const drop = prev !== null && prev > 0 ? Math.round(((prev - s.value) / prev) * 100) : null;

        return (
          <div key={s.label} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <span style={{ font: `600 13.5px ${HG}`, color: 'var(--ink)' }}>{s.label}</span>
              <span style={{ ...NUM, fontSize: 13, color: 'var(--mut)' }}>
                {num(s.value)} <span style={{ color: 'var(--sur)' }}>· {pctOfTop}%</span>
              </span>
            </div>
            <div style={{ height: 10, borderRadius: 5, background: 'var(--ctr)', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pctOfTop}%`, height: '100%', borderRadius: 5,
                  background: `linear-gradient(90deg, var(--acc), var(--acc2))`,
                  transition: 'width .5s cubic-bezier(.2,.7,.3,1)',
                }}
              />
            </div>
            {s.note ? (
              <div style={{ font: `400 11.5px ${HG}`, color: 'var(--sur)', marginTop: 4 }}>{s.note}</div>
            ) : null}
            {drop !== null && drop > 0 ? (
              <div style={{ font: `400 11.5px ${HG}`, color: 'var(--warn)', marginTop: 4 }}>
                {drop}% did not get this far
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

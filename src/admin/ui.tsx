/**
 * The console's visual vocabulary.
 *
 * Everything here is built from the Daylight tokens in `theme.ts` and the site's two typefaces —
 * nothing new is invented. Styles are inline objects for the same reason `LegalShell` uses them: the
 * marketing stylesheet is generated from the design handoff by `tools/gencss.py`, and hand-adding
 * admin rules to it would be silently reverted by the next handoff regeneration. What genuinely
 * cannot be inline (media queries, `:focus-visible`, keyframes) goes in `<Styles/>` below, as one
 * scoped block that the generator never touches.
 */
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { CARD, EYEBROW, FOCUS_RING, HG, NUM, SG, day, inputStyle, num } from './theme';

/* --------------------------------------------------------------- primitives */

export function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div style={{ ...CARD, padding: 18, ...style }}>{children}</div>;
}

export function SectionTitle({
  eyebrow, title, note, action,
}: { eyebrow?: string; title: string; note?: ReactNode; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 18 }}>
      <div style={{ maxWidth: 720 }}>
        {eyebrow ? <div style={{ ...EYEBROW, marginBottom: 6 }}>{eyebrow}</div> : null}
        <h2 style={{ font: `600 24px ${SG}`, color: 'var(--ink)', margin: 0, letterSpacing: '-.02em' }}>{title}</h2>
        {note ? <p style={{ font: `400 13.5px/1.6 ${HG}`, color: 'var(--mut)', margin: '8px 0 0' }}>{note}</p> : null}
      </div>
      {action ? <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{action}</div> : null}
    </div>
  );
}

type Tone = 'neutral' | 'ok' | 'warn' | 'danger' | 'accent';

const TONE_FG: Record<Tone, string> = {
  neutral: 'var(--mut)', ok: 'var(--ok)', warn: 'var(--warn)', danger: 'var(--danger)', accent: 'var(--acc2)',
};
const TONE_BG: Record<Tone, string> = {
  neutral: 'var(--ctr)', ok: 'var(--okBg)', warn: 'var(--warnBg)', danger: 'var(--dangerBg)', accent: 'rgba(14,124,134,.10)',
};

export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 9px', borderRadius: 999,
        background: TONE_BG[tone], color: TONE_FG[tone],
        font: `600 11px ${SG}`, letterSpacing: '.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}

export function Button({
  children, onClick, variant = 'secondary', disabled, type = 'button', full, title,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  type?: 'button' | 'submit';
  full?: boolean;
  title?: string;
}) {
  const base: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 40, padding: '0 16px', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    font: `600 14px ${HG}`, transition: 'background .15s, border-color .15s, opacity .15s',
    opacity: disabled ? 0.5 : 1, width: full ? '100%' : undefined, border: '1px solid transparent',
  };
  const skin: Record<string, CSSProperties> = {
    primary: { background: 'var(--acc)', color: 'var(--ctaInk)' },
    secondary: { background: 'var(--card)', color: 'var(--ink)', borderColor: 'var(--line)' },
    danger: { background: 'var(--danger)', color: '#FFF' },
    ghost: { background: 'transparent', color: 'var(--mut)' },
  };
  return (
    <button className="qf-a" type={type} onClick={onClick} disabled={disabled} title={title} style={{ ...base, ...skin[variant] }}>
      {children}
    </button>
  );
}

export function Field({
  label, hint, children,
}: { label: ReactNode; hint?: ReactNode; children: ReactNode }) {
  return (
    <label style={{ display: 'block', marginBottom: 14 }}>
      <span style={{ ...EYEBROW, display: 'block', marginBottom: 6 }}>{label}</span>
      {children}
      {hint ? <span style={{ display: 'block', font: `400 12.5px/1.5 ${HG}`, color: 'var(--sur)', marginTop: 6 }}>{hint}</span> : null}
    </label>
  );
}

/* ------------------------------------------------------------- feedback bits */

export function Banner({ tone, title, children }: { tone: Tone; title?: string; children: ReactNode }) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      style={{
        display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12, marginBottom: 14,
        background: TONE_BG[tone], border: `1px solid ${TONE_FG[tone]}33`,
      }}
    >
      <div aria-hidden style={{ width: 3, borderRadius: 3, background: TONE_FG[tone], flex: '0 0 3px' }} />
      <div>
        {title ? <div style={{ font: `600 13px ${SG}`, color: TONE_FG[tone], marginBottom: 3 }}>{title}</div> : null}
        <div style={{ font: `400 13.5px/1.6 ${HG}`, color: 'var(--mut)' }}>{children}</div>
      </div>
    </div>
  );
}

/** Skeleton rows. A spinner says "wait"; this says "a table is coming and roughly how big". */
export function Loading({ rows = 3 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="qf-shimmer" style={{ height: 44, borderRadius: 10, marginBottom: 8 }} />
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div style={{ padding: '36px 18px', textAlign: 'center', font: `400 14px ${HG}`, color: 'var(--sur)' }}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------- tiles */

/**
 * One headline figure.
 *
 * `sub` is for the denominator or the comparison — a bare count answers "how many" but almost never
 * the question the operator actually has, which is "how many, out of what".
 */
export function Stat({
  label, value, sub, tone = 'neutral',
}: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  return (
    <div style={{ ...CARD, padding: '16px 18px' }}>
      <div style={{ ...EYEBROW, marginBottom: 10 }}>{label}</div>
      <div style={{ ...NUM, fontSize: 30, lineHeight: 1, fontWeight: 600, color: tone === 'neutral' ? 'var(--ink)' : TONE_FG[tone] }}>
        {value}
      </div>
      {sub ? <div style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', marginTop: 8 }}>{sub}</div> : null}
    </div>
  );
}

export function StatGrid({ children }: { children: ReactNode }) {
  return <div className="qf-statgrid">{children}</div>;
}

/* ------------------------------------------------------------------- chart */

/**
 * Signups per day, as bars.
 *
 * Hand-drawn SVG because this repo has exactly two dependencies — React and React DOM — and pulling
 * a charting library in to draw thirty rectangles would be the single largest thing in the bundle.
 *
 * Two decisions worth keeping. Zero days are drawn as a visible baseline tick rather than nothing, so
 * a quiet week reads as *measured and empty* instead of as missing data. And the y-axis is scaled to
 * the series maximum with a floor of 1, so a series of all-zeros draws a flat empty chart rather than
 * dividing by zero and vanishing.
 */
export function SignupChart({ points }: { points: { day: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length === 0) return <Empty>No signup data.</Empty>;

  const max = Math.max(1, ...points.map((p) => p.count));
  const W = 720;
  const H = 160;
  const pad = { top: 8, right: 8, bottom: 22, left: 30 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const slot = plotW / points.length;
  const barW = Math.max(2, Math.min(18, slot - 3));

  const active = hover === null ? null : points[hover];

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          role="img"
          aria-label={`Signups per day for the last ${points.length} days. Highest ${max}.`}
          style={{ display: 'block', overflow: 'visible' }}
          onMouseLeave={() => setHover(null)}
        >
          {[0, 0.5, 1].map((f) => {
            const y = pad.top + plotH * (1 - f);
            return (
              <g key={f}>
                <line x1={pad.left} x2={W - pad.right} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" style={{ font: `400 10px ${SG}`, fill: 'var(--sur)' }}>
                  {Math.round(max * f)}
                </text>
              </g>
            );
          })}

          {points.map((p, i) => {
            const h = (p.count / max) * plotH;
            const x = pad.left + i * slot + (slot - barW) / 2;
            const isHot = hover === i;
            return (
              <g key={p.day} onMouseEnter={() => setHover(i)}>
                {/* Full-height hit area: a 2px bar is not a pointer target. */}
                <rect x={pad.left + i * slot} y={pad.top} width={slot} height={plotH} fill="transparent" />
                <rect
                  x={x}
                  y={pad.top + plotH - Math.max(h, p.count === 0 ? 1.5 : h)}
                  width={barW}
                  height={Math.max(h, p.count === 0 ? 1.5 : h)}
                  rx={2}
                  fill={p.count === 0 ? 'var(--line)' : isHot ? 'var(--acc)' : 'var(--acc2)'}
                />
              </g>
            );
          })}

          {points.map((p, i) =>
            i % Math.ceil(points.length / 6) === 0 ? (
              <text
                key={`t-${p.day}`}
                x={pad.left + i * slot + slot / 2}
                y={H - 6}
                textAnchor="middle"
                style={{ font: `400 10px ${SG}`, fill: 'var(--sur)' }}
              >
                {day(p.day)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
      <div style={{ font: `400 12.5px ${HG}`, color: 'var(--mut)', marginTop: 8, minHeight: 18 }}>
        {active ? (
          <>
            <strong style={{ ...NUM, color: 'var(--ink)' }}>{num(active.count)}</strong>{' '}
            {active.count === 1 ? 'signup' : 'signups'} on {day(active.day)}
          </>
        ) : (
          <span style={{ color: 'var(--sur)' }}>Hover a bar for that day&rsquo;s count.</span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- table */

export function Table({ head, children }: { head: ReactNode[]; children: ReactNode }) {
  return (
    <div style={{ overflowX: 'auto', border: '1px solid var(--line)', borderRadius: 14, background: 'var(--card)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th
                key={i}
                style={{
                  ...EYEBROW, textAlign: 'left', padding: '12px 14px',
                  borderBottom: '1px solid var(--line)', whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, mono, style }: { children: ReactNode; mono?: boolean; style?: CSSProperties }) {
  return (
    <td
      style={{
        padding: '12px 14px', borderBottom: '1px solid var(--line)', color: 'var(--ink)',
        font: mono ? `400 13px ${SG}` : `400 14px ${HG}`,
        fontVariantNumeric: mono ? 'tabular-nums' : undefined,
        verticalAlign: 'middle', ...style,
      }}
    >
      {children}
    </td>
  );
}

/* ------------------------------------------------------------------ dialog */

/**
 * A confirmation the operator has to read.
 *
 * `confirmWord` makes the destructive path require typing an exact string. That is not theatre: the
 * one action on this console that reaches every rider at once — arming a force update — has no undo
 * beyond a second write, and a misfire locks the fleet out of an app they cannot update to.
 */
export function ConfirmDialog({
  open, title, children, confirmLabel, confirmWord, tone = 'danger', onConfirm, onCancel, busy,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  confirmWord?: string;
  tone?: 'danger' | 'accent';
  onConfirm: () => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [typed, setTyped] = useState('');
  const firstRef = useRef<HTMLInputElement | HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) { setTyped(''); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    firstRef.current?.focus();
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;
  const ready = !confirmWord || typed.trim().toUpperCase() === confirmWord.toUpperCase();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(35,36,31,.45)', display: 'grid',
        placeItems: 'center', padding: 20, zIndex: 60,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div style={{ ...CARD, padding: 22, maxWidth: 520, width: '100%' }}>
        <h3 style={{ font: `600 18px ${SG}`, color: 'var(--ink)', margin: '0 0 10px' }}>{title}</h3>
        <div style={{ font: `400 14px/1.65 ${HG}`, color: 'var(--mut)' }}>{children}</div>

        {confirmWord ? (
          <div style={{ marginTop: 16 }}>
            <Field
              label={
                <>
                  Type{' '}
                  <em style={{ fontStyle: 'italic', letterSpacing: '.06em' }}>&ldquo;{confirmWord}&rdquo;</em>{' '}
                  to confirm
                </>
              }
            >
              <input
                ref={firstRef as React.RefObject<HTMLInputElement>}
                className="qf-a"
                style={inputStyle}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return;
                  e.preventDefault();
                  if (ready && !busy) onConfirm();
                }}
                autoComplete="off"
                spellCheck={false}
                autoFocus
              />
            </Field>
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} disabled={!ready || busy}>
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- controls */

/** A row of filter controls. Wraps on narrow screens instead of overflowing. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 18 }}>
      {children}
    </div>
  );
}

/**
 * A segmented filter. Values are numbers rather than strings so a caller can encode a tri-state
 * (all / yes / no) without inventing sentinel strings that then have to be parsed back out.
 */
export function Chips({
  label, value, options, onPick,
}: { label?: string; value: number; options: { v: number; l: string }[]; onPick: (v: number) => void }) {
  return (
    <div>
      {label ? <div style={{ ...EYEBROW, marginBottom: 6 }}>{label}</div> : null}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((o) => {
          const on = value === o.v;
          return (
            <button
              key={o.v}
              className="qf-a"
              onClick={() => onPick(o.v)}
              aria-pressed={on}
              style={{
                minHeight: 34, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
                border: `1px solid ${on ? 'var(--acc)' : 'var(--line)'}`,
                background: on ? 'var(--acc)' : 'var(--card)',
                color: on ? 'var(--ctaInk)' : 'var(--mut)',
                font: `600 13px ${HG}`, whiteSpace: 'nowrap',
              }}
            >
              {o.l}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Previous / next with the position spelled out, so the buttons are never the only cue. */
export function Pager({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', marginTop: 16 }}>
      <span style={{ font: `400 13px ${HG}`, color: 'var(--sur)' }}>Page {page} of {pages}</span>
      <Button disabled={page <= 1} onClick={() => onPage(page - 1)}>← Previous</Button>
      <Button disabled={page >= pages} onClick={() => onPage(page + 1)}>Next →</Button>
    </div>
  );
}

/** A right-hand detail panel. Escape closes it; so does clicking the scrim. */
export function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(35,36,31,.45)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ background: 'var(--card)', width: 'min(430px,100%)', height: '100%', overflow: 'auto', padding: 24, borderLeft: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>
        {children}
      </div>
    </div>
  );
}

/** A definition list. Long values wrap rather than pushing the drawer sideways. */
export function KeyValue({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl style={{ margin: 0 }}>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
          <dt style={{ font: `500 12.5px ${HG}`, color: 'var(--sur)', flex: '0 0 auto' }}>{k}</dt>
          <dd style={{ font: `400 13.5px ${HG}`, color: 'var(--ink)', margin: 0, textAlign: 'right', wordBreak: 'break-word' }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ------------------------------------------------------------------ styles */

/**
 * The rules that cannot be inline. Kept here rather than in `src/index.css` because that file is
 * generated from the design handoff by `tools/gencss.py` — anything hand-added there is reverted by
 * the next regeneration, which is exactly how the site's footer was lost once before.
 */
export function Styles() {
  return (
    <style>{`
      .qf-admin *{box-sizing:border-box}
      .qf-a:focus-visible{outline:none;box-shadow:${FOCUS_RING}}
      .qf-a:hover:not(:disabled){filter:brightness(.97)}
      .qf-row:hover{background:rgba(14,124,134,.045)}

      .qf-statgrid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(190px,1fr))}
      .qf-two{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}

      .qf-shell{display:grid;grid-template-columns:236px 1fr;min-height:100vh}
      .qf-rail{border-right:1px solid var(--line);padding:20px 14px;position:sticky;top:0;height:100vh;overflow:auto}
      .qf-rail{display:flex;flex-direction:column}
      .qf-railrule{height:1px;background:var(--line);margin:10px 6px}
      .qf-main{padding:30px 34px 72px;max-width:1240px}

      @media (max-width:900px){
        .qf-shell{grid-template-columns:1fr}
        .qf-rail{position:static;height:auto;border-right:none;border-bottom:1px solid var(--line);
                 display:flex;gap:6px;overflow-x:auto;padding:10px 12px}
        .qf-railhead{display:none}
        .qf-railrule{display:none}
        .qf-rail{flex-direction:row}
        .qf-main{padding:18px 16px 48px}
      }

      .qf-shimmer{background:linear-gradient(90deg,var(--ctr) 25%,rgba(255,255,255,.6) 37%,var(--ctr) 63%);
                  background-size:400% 100%;animation:qfshimmer 1.3s ease-in-out infinite}
      @keyframes qfshimmer{0%{background-position:100% 0}100%{background-position:0 0}}

      /* A live fix breathes. Only the LIVE band animates — if everything moved, movement would stop
         meaning anything, which is the whole point of the three bands. */
      .qf-pulse{animation:qfpulse 2s ease-in-out infinite}
      @keyframes qfpulse{0%,100%{opacity:1}50%{opacity:.35}}
      .qf-ping{transform-origin:center;animation:qfping 2.4s ease-out infinite}
      @keyframes qfping{0%{transform:scale(.5);opacity:.5}80%,100%{transform:scale(1.5);opacity:0}}

      @media (prefers-reduced-motion:reduce){
        .qf-shimmer,.qf-pulse,.qf-ping{animation:none}
        .qf-ping{opacity:.18}
      }

      /* --- narrow screens -------------------------------------------------
         The rail becomes a horizontal scroller (above), and everything else
         gives up its side padding before it gives up its content. Tables keep
         their own overflow container rather than being restyled into cards:
         an operator comparing a column of ages needs the column. */
      @media (max-width:640px){
        .qf-main{padding:16px 12px 44px}
        .qf-statgrid{grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}
        .qf-two{grid-template-columns:1fr}
      }
      @media (max-width:420px){
        .qf-statgrid{grid-template-columns:1fr 1fr}
      }
    `}</style>
  );
}

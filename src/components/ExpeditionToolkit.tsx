import type { CSSProperties, ReactNode } from 'react';
import { colors, fonts, layout, EASE } from '../theme';
import { Reveal } from './Reveal';
import { Eyebrow } from './Eyebrow';
import { useHover } from '../hooks/useHover';
import { useReveal } from '../hooks/useReveal';

/* ---- planning-feature icons (20×20, 2px stroke) ---- */
const s = (stroke: string) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

const ItineraryIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <rect x="3" y="4.5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v3M16 3v3" />
    <path d="M7 13h4M7 16.5h7" />
  </svg>
);
const StaysIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <path d="M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
    <path d="M3 14h18M6 10V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3" />
    <path d="M3 18v2M21 18v2" />
  </svg>
);
const DocsIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <path d="M6 2h8l4 4v16H6Z" />
    <path d="M14 2v4h4M9 13h6M9 17h6" />
  </svg>
);
const ExpensesIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M14.5 9.2a2.6 2.6 0 0 0-2.5-1.7c-1.5 0-2.6.9-2.6 2.1 0 2.7 5.2 1.6 5.2 4.4 0 1.2-1.1 2.2-2.7 2.2a2.7 2.7 0 0 1-2.6-1.8M12 6.2v1.6M12 16.2v1.6" />
  </svg>
);
const ChecklistIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <path d="M4 6.5 6 8.5 9.5 5" />
    <path d="M4 12.5 6 14.5 9.5 11" />
    <path d="M4 18.5 6 20.5 9.5 17" />
    <path d="M13 7h7M13 13h7M13 19h7" />
  </svg>
);
const ReminderIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9Z" />
    <path d="M10.5 21a1.8 1.8 0 0 0 3 0" />
  </svg>
);
const MedicalIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <path d="M12 21s-7-4.5-7-10a4.2 4.2 0 0 1 7-3 4.2 4.2 0 0 1 7 3c0 5.5-7 10-7 10Z" />
    <path d="M12 9v4M10 11h4" />
  </svg>
);
const DlIcon = ({ c }: { c: string }) => (
  <svg {...s(c)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="8.5" cy="11" r="2" />
    <path d="M5.5 16a3 3 0 0 1 6 0" />
    <path d="M14 9h4M14 12.5h4M14 16l1.3 1.3L18 14.5" />
  </svg>
);

interface PlanItem {
  Icon: (props: { c: string }) => ReactNode;
  title: string;
  body: string;
  /** Medical card uses the danger accent. */
  danger?: boolean;
}

const items: PlanItem[] = [
  { Icon: ItineraryIcon, title: 'Day-wise itinerary', body: 'Each day broken into legs with rally points, distances and a night stop.' },
  { Icon: StaysIcon, title: 'Stays', body: 'Lock the night halt for each leg so the whole crew knows where it sleeps.' },
  { Icon: DocsIcon, title: 'Documents & permits', body: 'ILP, RC, insurance — carried for every rider, ready at the checkpoint.' },
  { Icon: ExpensesIcon, title: 'Expenses, split', body: 'Fuel, food, fixes — log it once, settle up Splitwise-style at the end.' },
  { Icon: ChecklistIcon, title: 'Checklists', body: 'Packing, spares, readiness — shared lists so nothing gets left at home.' },
  { Icon: ReminderIcon, title: 'Reminders', body: 'Service due, permit cut-offs, early starts — nudged before they bite.' },
  { Icon: MedicalIcon, title: 'Medical card', body: 'Blood group, allergies, emergency contacts — shared with the crew for the worst case.', danger: true },
  { Icon: DlIcon, title: 'DL verification', body: 'Scan a licence once to earn a verified badge the whole ride can trust.' },
];

const planCard: CSSProperties = {
  background: colors.surface,
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 22,
  transition: 'border-color .3s',
};

function PlanCard({ Icon, title, body, danger }: PlanItem) {
  const hover = useHover({ borderColor: danger ? 'rgba(255,82,71,0.3)' : 'rgba(32,214,168,0.3)' });
  const accent = danger ? colors.danger : colors.accent;
  return (
    <div data-plan-card {...hover.hoverProps} style={{ ...planCard, ...hover.style }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 11,
          background: danger ? 'rgba(255,82,71,0.10)' : 'rgba(32,214,168,0.10)',
          border: `1px solid ${danger ? 'rgba(255,82,71,0.24)' : 'rgba(32,214,168,0.24)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
        }}
      >
        <Icon c={accent} />
      </div>
      <h3 style={{ fontFamily: fonts.display, fontSize: 17, fontWeight: 600, margin: 0 }}>{title}</h3>
      <p style={{ color: '#9FB0AC', fontSize: 14, lineHeight: 1.5, margin: '7px 0 0' }}>{body}</p>
    </div>
  );
}

export function ExpeditionToolkit() {
  const grid = useReveal<HTMLDivElement>({ delay: 80 });
  return (
    <section style={{ maxWidth: layout.maxWidth, margin: '0 auto', padding: '30px 28px 40px' }}>
      <Reveal style={{ marginBottom: 34 }}>
        <Eyebrow>Before the first switchback</Eyebrow>
        <h2
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(28px,3.6vw,42px)',
            lineHeight: 1.12,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            margin: '14px 0 0',
          }}
        >
          The whole expedition, not just the ride.
        </h2>
        <p style={{ color: colors.textMuted, fontSize: 17, lineHeight: 1.6, margin: '16px 0 0', maxWidth: 600, textWrap: 'pretty' }}>
          Plan the route, sort the paperwork, and settle up after — all in the same app the ride already lives in.
        </p>
      </Reveal>

      <div
        ref={grid.ref}
        data-plan-grid
        style={{
          ...grid.style,
          transition: `opacity .9s ${EASE}, transform .9s ${EASE}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 14,
        }}
      >
        {items.map((item) => (
          <PlanCard key={item.title} {...item} />
        ))}
      </div>
    </section>
  );
}

/**
 * The read-mostly panels: the dashboard, the rider directory, feature flags, the support queue and
 * the runtime config dump.
 *
 * Force update lives in its own file because it is the one screen that can reach every rider at once
 * and it carries a page of hard-won rules with it. Everything here is either read-only or a single
 * audited toggle.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ApiError, getFeatureFlags, getOverview, getRuntimeConfig, getSignups, listTickets, listUsers,
  putFeatureFlag, type FeatureFlag, type OpsOverview, type OpsSignupSeries, type OpsUser,
  type OpsUserList, type SupportTicket, type UserQuery,
} from './api';
import { HG, NUM, SG, inputStyle, num, when } from './theme';
import {
  Badge, Banner, Button, Card, ConfirmDialog, Empty, Field, Loading, SectionTitle, SignupChart, Stat,
  StatGrid, Table, Td,
} from './ui';

function errorText(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return `${e.message}${e.detail ? ` — ${e.detail}` : ''}`;
  return fallback;
}

/* ================================================================= overview */

export function Overview({ onGoToUsers }: { onGoToUsers: (q: UserQuery) => void }) {
  const [data, setData] = useState<OpsOverview | null>(null);
  const [series, setSeries] = useState<OpsSignupSeries | null>(null);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    Promise.all([getOverview(), getSignups(days)])
      .then(([o, s]) => { if (alive) { setData(o); setSeries(s); } })
      .catch((e) => { if (alive) setError(errorText(e, 'Could not load the dashboard.')); });
    return () => { alive = false; };
  }, [days]);

  if (error) return <Banner tone="danger" title="Could not load">{error}</Banner>;
  if (!data || !series) return <Loading rows={4} />;

  const onboardedPct = data.totalUsers ? Math.round((data.onboardedUsers / data.totalUsers) * 100) : 0;
  const stalled = data.totalUsers - data.onboardedUsers;

  return (
    <>
      <SectionTitle
        eyebrow="Dashboard"
        title="Overview"
        note={<>Read {when(data.generatedAt)}. Figures are computed server-side in one round trip.</>}
      />

      <StatGrid>
        <Stat label="Riders" value={num(data.totalUsers)} sub={`${num(data.onboardedUsers)} finished setup (${onboardedPct}%)`} />
        <Stat label="New today" value={num(data.newToday)} sub="since 00:00 UTC" tone={data.newToday > 0 ? 'accent' : 'neutral'} />
        <Stat label="New this week" value={num(data.newLast7Days)} sub="last 7 days" />
        <Stat label="New this month" value={num(data.newLast30Days)} sub="last 30 days" />
        <Stat label="Trips" value={num(data.totalTrips)} sub="all time, every state" />
        <Stat
          label="Open tickets"
          value={num(data.openSupportTickets)}
          sub="waiting on support"
          tone={data.openSupportTickets > 0 ? 'warn' : 'ok'}
        />
      </StatGrid>

      <div style={{ height: 18 }} />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ font: `600 16px ${SG}`, color: 'var(--ink)', margin: 0 }}>Signups per day</h3>
            <p style={{ font: `400 13px ${HG}`, color: 'var(--sur)', margin: '4px 0 0' }}>
              {num(series.total)} in {series.days} days. Empty days are drawn — they are data, not gaps.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 30, 90].map((d) => (
              <Button key={d} variant={days === d ? 'primary' : 'secondary'} onClick={() => setDays(d)}>
                {d}d
              </Button>
            ))}
          </div>
        </div>
        <SignupChart points={series.points} />
      </Card>

      <div style={{ height: 18 }} />

      <StatGrid>
        <Stat label="Reachable by email" value={num(data.usersWithEmail)} sub={`of ${num(data.totalUsers)} riders`} />
        <Stat label="Reachable by phone" value={num(data.usersWithPhone)} sub={`of ${num(data.totalUsers)} riders`} />
        <Stat
          label="Setup unfinished"
          value={num(stalled)}
          tone={stalled > 0 ? 'warn' : 'ok'}
          sub={
            <button
              className="qf-a"
              onClick={() => onGoToUsers({ onboarded: false })}
              style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--acc2)', font: `600 12.5px ${HG}` }}
            >
              Show these riders →
            </button>
          }
        />
      </StatGrid>
    </>
  );
}

/* ==================================================================== users */

export function Users({ initial }: { initial?: UserQuery }) {
  const [query, setQuery] = useState<UserQuery>({ page: 1, pageSize: 25, sort: 'recent', ...initial });
  const [text, setText] = useState(initial?.q ?? '');
  const [data, setData] = useState<OpsUserList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OpsUser | null>(null);
  const debounce = useRef<number | undefined>(undefined);

  useEffect(() => { setQuery((q) => ({ ...q, ...initial, page: 1 })); setText(initial?.q ?? ''); }, [initial]);

  useEffect(() => {
    let alive = true;
    setError(null);
    setData(null);
    listUsers(query)
      .then((d) => { if (alive) setData(d); })
      .catch((e) => { if (alive) setError(errorText(e, 'Could not load riders.')); });
    return () => { alive = false; };
  }, [query]);

  /* Debounced so typing a name is one request when you stop, not one per keystroke against a
     database this console shares with the live app. */
  function onText(v: string) {
    setText(v);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => setQuery((q) => ({ ...q, q: v.trim() || undefined, page: 1 })), 300);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;
  const filtered = query.q || query.withinDays || query.onboarded !== undefined;

  return (
    <>
      <SectionTitle
        eyebrow="Directory"
        title="Riders"
        note="Read-only. There is deliberately no edit or delete here — account deletion is a rider-initiated flow."
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end', marginBottom: 16 }}>
        <div style={{ flex: '1 1 260px', minWidth: 220 }}>
          <Field label="Search">
            <input
              className="qf-a"
              style={inputStyle}
              placeholder="Name, email, handle or phone"
              value={text}
              onChange={(e) => onText(e.target.value)}
              spellCheck={false}
            />
          </Field>
        </div>

        <Chips
          label="Joined"
          value={query.withinDays ?? 0}
          options={[{ v: 0, l: 'Any time' }, { v: 1, l: 'Today' }, { v: 7, l: '7 days' }, { v: 30, l: '30 days' }]}
          onPick={(v) => setQuery((q) => ({ ...q, withinDays: v || undefined, page: 1 }))}
        />

        <Chips
          label="Setup"
          value={query.onboarded === undefined ? 2 : query.onboarded ? 1 : 0}
          options={[{ v: 2, l: 'All' }, { v: 1, l: 'Complete' }, { v: 0, l: 'Unfinished' }]}
          onPick={(v) => setQuery((q) => ({ ...q, onboarded: v === 2 ? undefined : v === 1, page: 1 }))}
        />

        <Chips
          label="Sort"
          value={query.sort === 'oldest' ? 1 : query.sort === 'name' ? 2 : 0}
          options={[{ v: 0, l: 'Newest' }, { v: 1, l: 'Oldest' }, { v: 2, l: 'Name' }]}
          onPick={(v) => setQuery((q) => ({ ...q, sort: v === 1 ? 'oldest' : v === 2 ? 'name' : 'recent', page: 1 }))}
        />
      </div>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {data ? (
        <div style={{ font: `400 13px ${HG}`, color: 'var(--mut)', marginBottom: 10 }}>
          <strong style={{ ...NUM, color: 'var(--ink)' }}>{num(data.totalCount)}</strong>{' '}
          {data.totalCount === 1 ? 'rider' : 'riders'}
          {filtered ? ' matching' : ''} · page {data.page} of {totalPages}
        </div>
      ) : null}

      {!data && !error ? (
        <Loading rows={6} />
      ) : data && data.users.length === 0 ? (
        <Empty>No riders match that.</Empty>
      ) : data ? (
        <>
          <Table head={['Rider', 'Contact', 'Where', 'Setup', 'Joined']}>
            {data.users.map((u) => (
              <tr key={u.id} className="qf-row" style={{ cursor: 'pointer' }} onClick={() => setSelected(u)}>
                <Td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.displayName} />
                    <div>
                      <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>{u.displayName || '(no name)'}</div>
                      <div style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>
                        #{u.id}{u.handle ? ` · @${u.handle}` : ''}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td>
                  <div style={{ font: `400 13px ${HG}`, color: 'var(--ink)' }}>
                    {u.email ?? <span style={{ color: 'var(--sur)' }}>no email</span>}
                    {u.email && !u.emailVerified ? <span style={{ color: 'var(--warn)' }}> (unverified)</span> : null}
                  </div>
                  <div style={{ ...NUM, fontSize: 12, color: 'var(--sur)' }}>{u.phoneNumber ?? '—'}</div>
                </Td>
                <Td>{[u.city, u.state].filter(Boolean).join(', ') || <span style={{ color: 'var(--sur)' }}>—</span>}</Td>
                <Td>{u.onboardingComplete ? <Badge tone="ok">Complete</Badge> : <Badge tone="warn">Unfinished</Badge>}</Td>
                <Td mono style={{ whiteSpace: 'nowrap' }}>{when(u.createdAt)}</Td>
              </tr>
            ))}
          </Table>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'flex-end', marginTop: 14 }}>
            <Button variant="secondary" disabled={data.page <= 1} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) - 1 }))}>
              ← Previous
            </Button>
            <Button variant="secondary" disabled={data.page >= totalPages} onClick={() => setQuery((q) => ({ ...q, page: (q.page ?? 1) + 1 }))}>
              Next →
            </Button>
          </div>
        </>
      ) : null}

      <RiderDrawer user={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Chips({
  label, value, options, onPick,
}: { label: string; value: number; options: { v: number; l: string }[]; onPick: (v: number) => void }) {
  return (
    <div>
      <div style={{ font: `500 11px ${SG}`, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((o) => (
          <button
            key={o.v}
            className="qf-a"
            onClick={() => onPick(o.v)}
            style={{
              minHeight: 34, padding: '0 12px', borderRadius: 999, cursor: 'pointer',
              border: `1px solid ${value === o.v ? 'var(--acc)' : 'var(--line)'}`,
              background: value === o.v ? 'var(--acc)' : 'var(--card)',
              color: value === o.v ? 'var(--ctaInk)' : 'var(--mut)',
              font: `600 13px ${HG}`,
            }}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        width: 32, height: 32, borderRadius: 9, flex: '0 0 32px', display: 'grid', placeItems: 'center',
        background: 'var(--ctr)', color: 'var(--acc)', font: `600 12px ${SG}`,
      }}
    >
      {initials || '?'}
    </div>
  );
}

function RiderDrawer({ user, onClose }: { user: OpsUser | null; onClose: () => void }) {
  useEffect(() => {
    if (!user) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [user, onClose]);

  if (!user) return null;

  const rows: [string, React.ReactNode][] = [
    ['Rider id', `#${user.id}`],
    ['Display name', user.displayName || '—'],
    ['Handle', user.handle ? `@${user.handle}` : '—'],
    ['Email', user.email ?? '—'],
    ['Email verified', user.emailVerified ? 'Yes' : 'No'],
    ['Phone', user.phoneNumber ?? '—'],
    ['City', user.city ?? '—'],
    ['State', user.state ?? '—'],
    ['Setup complete', user.onboardingComplete ? 'Yes' : 'No'],
    ['Joined', when(user.createdAt)],
    ['Last updated', when(user.updatedAt)],
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Rider ${user.displayName}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(35,36,31,.45)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}
    >
      <div style={{ background: 'var(--card)', width: 'min(420px,100%)', height: '100%', overflow: 'auto', padding: 24, borderLeft: '1px solid var(--line)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Avatar name={user.displayName} />
            <div>
              <h3 style={{ font: `600 18px ${SG}`, color: 'var(--ink)', margin: 0 }}>{user.displayName || '(no name)'}</h3>
              <div style={{ ...NUM, fontSize: 12, color: 'var(--sur)' }}>#{user.id}</div>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <dl style={{ margin: 0 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <dt style={{ font: `500 12.5px ${HG}`, color: 'var(--sur)' }}>{k}</dt>
              <dd style={{ font: `400 13.5px ${HG}`, color: 'var(--ink)', margin: 0, textAlign: 'right', wordBreak: 'break-word' }}>{v}</dd>
            </div>
          ))}
        </dl>

        <p style={{ font: `400 12.5px/1.6 ${HG}`, color: 'var(--sur)', marginTop: 18 }}>
          Medical card, documents, bikes and location are deliberately not shown. An operator reading a
          directory has no reason to see a rider&rsquo;s blood group, and a field that is fetched is a field
          that eventually gets displayed.
        </p>
      </div>
    </div>
  );
}

/* ============================================================= feature flags */

export function Flags() {
  const [flags, setFlags] = useState<FeatureFlag[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<FeatureFlag | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setError(null);
    getFeatureFlags().then(setFlags).catch((e) => setError(errorText(e, 'Could not load flags.')));
  }, []);

  useEffect(load, [load]);

  async function apply() {
    if (!pending) return;
    setBusy(true);
    try {
      await putFeatureFlag(pending.key, !pending.enabled, reason.trim() || 'Toggled from the admin console.');
      setPending(null);
      setReason('');
      load();
    } catch (e) {
      setError(errorText(e, 'Toggle failed.'));
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <SectionTitle
        eyebrow="Ops"
        title="Feature flags"
        note="Every toggle is audited with who, when, old → new and why. The reason is not optional politeness — it is the only record of intent."
      />

      {error ? <Banner tone="danger" title="Problem">{error}</Banner> : null}

      {flags === null ? (
        <Loading rows={4} />
      ) : flags.length === 0 ? (
        <Empty>No flags are registered.</Empty>
      ) : (
        <Table head={['Flag', 'State', 'Changed', '']}>
          {flags.map((f) => (
            <tr key={f.key} className="qf-row">
              <Td>
                <div style={{ font: `600 14px ${SG}`, color: 'var(--ink)' }}>{f.key}</div>
                {f.description ? (
                  <div style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', marginTop: 3, maxWidth: 460 }}>{f.description}</div>
                ) : null}
              </Td>
              <Td>{f.enabled ? <Badge tone="ok">On</Badge> : <Badge>Off</Badge>}</Td>
              <Td mono style={{ whiteSpace: 'nowrap' }}>{when(f.updatedAt)}</Td>
              <Td style={{ textAlign: 'right' }}>
                <Button variant="secondary" onClick={() => { setPending(f); setReason(''); }}>
                  Turn {f.enabled ? 'off' : 'on'}
                </Button>
              </Td>
            </tr>
          ))}
        </Table>
      )}

      <ConfirmDialog
        open={pending !== null}
        title={pending ? `Turn ${pending.enabled ? 'off' : 'on'} ${pending.key}?` : ''}
        confirmLabel="Apply"
        tone="accent"
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => void apply()}
      >
        <p style={{ margin: '0 0 12px' }}>This takes effect for every rider. Say why, for the audit trail.</p>
        <Field label="Reason">
          <input className="qf-a" style={inputStyle} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={500} autoFocus />
        </Field>
      </ConfirmDialog>
    </>
  );
}

/* =================================================================== support */

const TICKET_STATUS: Record<string, { label: string; tone: 'warn' | 'accent' | 'ok' }> = {
  '0': { label: 'Open', tone: 'warn' },
  '1': { label: 'Awaiting rider', tone: 'accent' },
  '2': { label: 'Resolved', tone: 'ok' },
  Open: { label: 'Open', tone: 'warn' },
  AwaitingRider: { label: 'Awaiting rider', tone: 'accent' },
  Resolved: { label: 'Resolved', tone: 'ok' },
};

export function Support() {
  const [tickets, setTickets] = useState<SupportTicket[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<number | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setTickets(null);
    setError(null);
    listTickets(status)
      .then((d) => { if (alive) setTickets(d.tickets); })
      .catch((e) => { if (alive) setError(errorText(e, 'Could not load the queue.')); });
    return () => { alive = false; };
  }, [status]);

  return (
    <>
      <SectionTitle eyebrow="Help centre" title="Support queue" note="Newest first. Replying to a rider is done in the app's ops tooling — this is the read side." />

      <div style={{ marginBottom: 14 }}>
        <Chips
          label="Status"
          value={status === undefined ? 9 : status}
          options={[{ v: 9, l: 'All' }, { v: 0, l: 'Open' }, { v: 1, l: 'Awaiting rider' }, { v: 2, l: 'Resolved' }]}
          onPick={(v) => setStatus(v === 9 ? undefined : v)}
        />
      </div>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {tickets === null && !error ? (
        <Loading rows={5} />
      ) : tickets && tickets.length === 0 ? (
        <Empty>Nothing in the queue.</Empty>
      ) : tickets ? (
        <Table head={['Ticket', 'Rider', 'Status', 'Opened', 'Last message']}>
          {tickets.map((t) => {
            const s = TICKET_STATUS[String(t.status)];
            return (
              <tr key={t.id} className="qf-row">
                <Td>
                  <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>{t.subject || '(no subject)'}</div>
                  <div style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>#{t.id}</div>
                </Td>
                <Td>{t.riderDisplayName ?? '—'}</Td>
                <Td>{s ? <Badge tone={s.tone}>{s.label}</Badge> : <Badge>{String(t.status)}</Badge>}</Td>
                <Td mono style={{ whiteSpace: 'nowrap' }}>{when(t.createdAt)}</Td>
                <Td mono style={{ whiteSpace: 'nowrap' }}>{when(t.lastMessageAt)}</Td>
              </tr>
            );
          })}
        </Table>
      ) : null}
    </>
  );
}

/* ============================================================ runtime config */

export function Runtime() {
  const [config, setConfig] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getRuntimeConfig().then(setConfig).catch((e) => setError(errorText(e, 'Could not read runtime config.')));
  }, []);

  const entries = useMemo(() => (config ? flatten(config) : []), [config]);

  return (
    <>
      <SectionTitle
        eyebrow="Ops"
        title="Runtime config"
        note="What the running API believes it is configured with. Read-only — the host's .env overrides appsettings.json, so this is the only honest answer."
      />

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {config === null && !error ? (
        <Loading rows={6} />
      ) : entries.length === 0 && config ? (
        <Empty>The endpoint returned nothing.</Empty>
      ) : (
        <Table head={['Key', 'Value']}>
          {entries.map(([k, v]) => (
            <tr key={k} className="qf-row">
              <Td mono>{k}</Td>
              <Td mono style={{ color: v === 'true' ? 'var(--ok)' : v === 'false' ? 'var(--sur)' : 'var(--ink)' }}>{v}</Td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}

/** Flattens a nested config object to dotted keys so it reads like the `__` env vars on the host. */
function flatten(obj: unknown, prefix = ''): [string, string][] {
  if (obj === null || obj === undefined) return [[prefix, '—']];
  if (typeof obj !== 'object') return [[prefix, String(obj)]];
  if (Array.isArray(obj)) return [[prefix, obj.length ? obj.map(String).join(', ') : '(empty)']];
  return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
    flatten(v, prefix ? `${prefix}.${k}` : k),
  );
}

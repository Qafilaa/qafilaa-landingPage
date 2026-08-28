/**
 * The read-mostly panels: the dashboard, the rider directory, trips, safety alerts, feature flags,
 * the support queue, the audit trail and the runtime config dump.
 *
 * Force update lives in its own file because it is the one screen that can reach every rider at once
 * and it carries a page of hard-won rules with it. Everything here is either read-only or a single
 * audited toggle.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  ApiError, getFeatureFlags, getOverview, getRuntimeConfig, getSignups, getUser, listAlerts, listAudit,
  getFunnel, listTickets, listTrips, listUsers, putFeatureFlag, type FeatureFlag, type OpsAlert,
  type OpsAuditEntry, type OpsFunnel,
  type OpsOverview, type OpsSignupSeries, type OpsTrip, type OpsUserDetail, type OpsUserList,
  type SupportTicket, type UserQuery,
} from './api';
import { HG, NUM, SG, inputStyle, num, when } from './theme';
import {
  Badge, Banner, Button, Card, Chips, ConfirmDialog, Drawer, Empty, Field, KeyValue, Loading, Pager,
  SectionTitle, SignupChart, Stat, StatGrid, Table, Td, Toolbar,
} from './ui';
import { Funnel } from './Live';
import { useAsync } from './useAsync';

function errorText(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return `${e.message}${e.detail ? ` — ${e.detail}` : ''}`;
  return fallback;
}

/* ================================================================= overview */

export function Overview({ onGo }: { onGo: (panel: string, q?: UserQuery) => void }) {
  const [days, setDays] = useState(30);

  const overview = useAsync<OpsOverview>(getOverview, []);
  const series = useAsync<OpsSignupSeries>(useCallback(() => getSignups(days), [days]), [days]);
  const audit = useAsync<OpsAuditEntry[]>(useCallback(() => listAudit(8), []), []);
  const funnel = useAsync<OpsFunnel>(getFunnel, []);

  if (overview.error) return <Banner tone="danger" title="Could not load">{overview.error}</Banner>;
  if (!overview.data) return <Loading rows={5} />;

  const d = overview.data;
  const onboardedPct = d.totalUsers ? Math.round((d.onboardedUsers / d.totalUsers) * 100) : 0;
  const stalled = d.totalUsers - d.onboardedUsers;

  return (
    <>
      <SectionTitle
        eyebrow="Dashboard"
        title="Overview"
        note={<>Read {when(d.generatedAt)}. Every figure is computed server-side.</>}
        action={<Button onClick={() => { overview.reload(); series.reload(); audit.reload(); funnel.reload(); }}>Refresh</Button>}
      />

      {/* Safety first, literally. If a rider is out there or an alert is open, that is what an
          operator opening this page needs to see before any growth number. */}
      <StatGrid>
        <Stat
          label="Riding right now"
          value={num(d.activeRidesNow)}
          tone={d.activeRidesNow > 0 ? 'accent' : 'neutral'}
          sub="open leg rides — riders telling us they are out"
        />
        <Stat
          label="Open alerts"
          value={num(d.openAlerts)}
          tone={d.openAlerts > 0 ? 'danger' : 'ok'}
          sub={d.openAlerts > 0 ? <Link onClick={() => onGo('safety')}>Open safety →</Link> : 'nothing in the cascade'}
        />
        <Stat
          label="Sent a position"
          value={num(d.liveFixesLastHour)}
          tone={d.liveFixesLastHour > 0 ? 'accent' : 'neutral'}
          sub={d.liveFixesLastHour > 0
            ? <Link onClick={() => onGo('live')}>Open live map →</Link>
            : 'in the last hour'}
        />
        <Stat
          label="Open tickets"
          value={num(d.openSupportTickets)}
          tone={d.openSupportTickets > 0 ? 'warn' : 'ok'}
          sub={d.openSupportTickets > 0 ? <Link onClick={() => onGo('support')}>Open queue →</Link> : 'waiting on support'}
        />
      </StatGrid>

      <Rule />

      <StatGrid>
        <Stat label="Riders" value={num(d.totalUsers)} sub={`${num(d.onboardedUsers)} finished setup (${onboardedPct}%)`} />
        <Stat label="New today" value={num(d.newToday)} sub="since 00:00 UTC" tone={d.newToday > 0 ? 'accent' : 'neutral'} />
        <Stat label="New this week" value={num(d.newLast7Days)} sub="last 7 days" />
        <Stat label="New this month" value={num(d.newLast30Days)} sub="last 30 days" />
        <Stat label="Trips" value={num(d.totalTrips)} sub={`${num(d.tripsCreatedLast7Days)} created this week`} />
        <Stat label="Waitlist" value={num(d.waitlistSignups)} sub="signups the site captured" />
        <Stat
          label="Never joined a trip"
          value={num(d.ridersWithNoTrip)}
          tone={d.ridersWithNoTrip > 0 ? 'warn' : 'ok'}
          sub={`${num(d.ridersInATrip)} are in at least one`}
        />
        <Stat
          label="Have actually ridden"
          value={num(d.ridersWhoHaveRidden)}
          sub={`of ${num(d.totalUsers)} riders`}
        />
        <Stat
          label="SOS raised, all time"
          value={num(d.totalAlerts)}
          tone={d.totalAlerts > 0 ? 'warn' : 'neutral'}
          sub={`${num(d.alertsLast30Days)} in the last 30 days`}
        />
      </StatGrid>

      <Rule />

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ font: `600 16px ${SG}`, color: 'var(--ink)', margin: 0 }}>Signups per day</h3>
            <p style={{ font: `400 13px ${HG}`, color: 'var(--sur)', margin: '4px 0 0' }}>
              {series.data ? `${num(series.data.total)} in ${series.data.days} days. ` : ''}
              Empty days are drawn — they are data, not gaps.
            </p>
          </div>
          <Chips value={days} options={[{ v: 7, l: '7d' }, { v: 30, l: '30d' }, { v: 90, l: '90d' }]} onPick={setDays} />
        </div>
        {series.error ? <Banner tone="danger" title="Chart unavailable">{series.error}</Banner>
          : series.data ? <SignupChart points={series.data.points} />
          : <Loading rows={2} />}
      </Card>

      <Rule />

      <div className="qf-two">
        <Card>
          <h3 style={{ font: `600 16px ${SG}`, color: 'var(--ink)', margin: '0 0 4px' }}>Activation</h3>
          <p style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', margin: '0 0 16px' }}>
            Each stage is counted on its own, never derived by subtraction — a rider can join a trip
            without finishing setup, and deriving would invent people who do not exist.
          </p>
          {funnel.error ? <Banner tone="warn" title="Unavailable">{funnel.error}</Banner>
            : !funnel.data ? <Loading rows={4} />
            : (
              <Funnel stages={[
                { label: 'Signed up', value: funnel.data.signedUp },
                { label: 'Finished setup', value: funnel.data.finishedSetup, note: 'bike, medical card, contact' },
                { label: 'Joined a trip', value: funnel.data.joinedATrip },
                { label: 'Actually rode', value: funnel.data.rode, note: 'started at least one leg ride' },
                { label: 'Riding now', value: funnel.data.ridingNow },
              ]} />
            )}
        </Card>

        <Card>
          <h3 style={{ font: `600 16px ${SG}`, color: 'var(--ink)', margin: '0 0 4px' }}>Trips by status</h3>
          <p style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', margin: '0 0 14px' }}>
            <code>Active</code> is retired and nothing writes it — whether a crew is riding is answered by leg rides.
          </p>
          {d.tripsByStatus.length === 0 ? <Empty>No trips yet.</Empty>
            : <Bars rows={d.tripsByStatus.map((s) => ({ label: s.label, value: s.count }))} onPick={() => onGo('trips')} />}
        </Card>

        <Card>
          <h3 style={{ font: `600 16px ${SG}`, color: 'var(--ink)', margin: '0 0 4px' }}>Recent operator changes</h3>
          <p style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)', margin: '0 0 14px' }}>
            Feature flags and force update, newest first.
          </p>
          {audit.error ? <Banner tone="warn" title="Unavailable">{audit.error}</Banner>
            : !audit.data ? <Loading rows={3} />
            : audit.data.length === 0 ? <Empty>Nothing changed yet.</Empty>
            : (
              <>
                {audit.data.slice(0, 6).map((a, i) => <AuditRow key={i} entry={a} compact />)}
                <div style={{ marginTop: 12 }}><Link onClick={() => onGo('audit')}>Full audit trail →</Link></div>
              </>
            )}
        </Card>
      </div>

      <Rule />

      <StatGrid>
        <Stat label="Reachable by email" value={num(d.usersWithEmail)} sub={`of ${num(d.totalUsers)} riders`} />
        <Stat label="Reachable by phone" value={num(d.usersWithPhone)} sub={`of ${num(d.totalUsers)} riders`} />
        <Stat
          label="Setup unfinished"
          value={num(stalled)}
          tone={stalled > 0 ? 'warn' : 'ok'}
          sub={<Link onClick={() => onGo('users', { onboarded: false })}>Show these riders →</Link>}
        />
      </StatGrid>
    </>
  );
}

function Rule() {
  return <div style={{ height: 1, background: 'var(--line)', margin: '22px 0' }} />;
}

function Link({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      className="qf-a"
      onClick={onClick}
      style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', color: 'var(--acc2)', font: `600 12.5px ${HG}` }}
    >
      {children}
    </button>
  );
}

/** A labelled bar list. Proportional to the largest row, so it reads as a share without a legend. */
function Bars({ rows, onPick }: { rows: { label: string; value: number }[]; onPick?: () => void }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      {rows.map((r) => (
        <button
          key={r.label}
          className="qf-a"
          onClick={onPick}
          style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 0, padding: '6px 0', cursor: onPick ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 13px ${HG}`, color: 'var(--ink)', marginBottom: 5 }}>
            <span>{r.label}</span>
            <span style={{ ...NUM, color: 'var(--mut)' }}>{num(r.value)}</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--ctr)', overflow: 'hidden' }}>
            <div style={{ width: `${(r.value / max) * 100}%`, height: '100%', background: 'var(--acc2)', borderRadius: 3 }} />
          </div>
        </button>
      ))}
    </div>
  );
}

/* ==================================================================== users */

export function Users({ initial }: { initial?: UserQuery }) {
  const [query, setQuery] = useState<UserQuery>({ page: 1, pageSize: 25, sort: 'recent', ...initial });
  const [text, setText] = useState(initial?.q ?? '');
  const [selected, setSelected] = useState<number | null>(null);
  const debounce = useRef<number | undefined>(undefined);

  useEffect(() => { setQuery((q) => ({ ...q, ...initial, page: 1 })); setText(initial?.q ?? ''); }, [initial]);

  const { data, error, loading, reload } = useAsync<OpsUserList>(
    useCallback(() => listUsers(query), [query]), [query],
  );

  /* Debounced so typing a name is one request when you stop, not one per keystroke against the
     database the live app is also using. */
  function onText(v: string) {
    setText(v);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => setQuery((q) => ({ ...q, q: v.trim() || undefined, page: 1 })), 300);
  }

  /* Exports what is ON SCREEN, not the whole directory. Exporting everything from a filtered view is
     the kind of surprise that drops a complete rider list, phone numbers included, into Downloads. */
  function exportCsv() {
    if (!data) return;
    const head = ['id', 'name', 'email', 'emailVerified', 'phone', 'handle', 'city', 'state', 'setupComplete', 'joined'];
    const rows = data.users.map((u) => [
      u.id, u.displayName, u.email ?? '', u.emailVerified, u.phoneNumber ?? '', u.handle ?? '',
      u.city ?? '', u.state ?? '', u.onboardingComplete, u.createdAt,
    ]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `qafilaa-riders-page${data.page}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

  return (
    <>
      <SectionTitle
        eyebrow="Directory"
        title="Riders"
        note="Read-only. There is deliberately no edit or delete — account deletion is a rider-initiated flow."
        action={
          <>
            <Button onClick={exportCsv} disabled={!data || data.users.length === 0}>Export this page</Button>
            <Button onClick={reload}>Refresh</Button>
          </>
        }
      />

      <Toolbar>
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
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {data ? <Count total={data.totalCount} noun="rider" page={data.page} pages={totalPages} /> : null}

      {loading && !data ? <Loading rows={6} />
        : data && data.users.length === 0 ? <Empty>No riders match that.</Empty>
        : data ? (
          <>
            <Table head={['Rider', 'Contact', 'Where', 'Setup', 'Joined']}>
              {data.users.map((u) => (
                <tr key={u.id} className="qf-row" style={{ cursor: 'pointer' }} onClick={() => setSelected(u.id)}>
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
            <Pager page={data.page} pages={totalPages} onPage={(p) => setQuery((q) => ({ ...q, page: p }))} />
          </>
        ) : null}

      <RiderDrawer userId={selected} onClose={() => setSelected(null)} />
    </>
  );
}

function Count({ total, noun, page, pages }: { total: number; noun: string; page: number; pages: number }) {
  return (
    <div style={{ font: `400 13px ${HG}`, color: 'var(--mut)', margin: '2px 0 10px' }}>
      <strong style={{ ...NUM, color: 'var(--ink)' }}>{num(total)}</strong>{' '}
      {total === 1 ? noun : `${noun}s`} · page {page} of {pages}
    </div>
  );
}

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = (name || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] ?? '').join('').toUpperCase();
  return (
    <div
      aria-hidden
      style={{
        width: size, height: size, borderRadius: size / 3.5, flex: `0 0 ${size}px`, display: 'grid',
        placeItems: 'center', background: 'var(--ctr)', color: 'var(--acc)', font: `600 ${size / 2.7}px ${SG}`,
      }}
    >
      {initials || '?'}
    </div>
  );
}

function RiderDrawer({ userId, onClose }: { userId: number | null; onClose: () => void }) {
  const { data, error } = useAsync<OpsUserDetail | null>(
    useCallback(() => (userId === null ? Promise.resolve(null) : getUser(userId)), [userId]),
    [userId],
  );

  if (userId === null) return null;
  const u = data?.rider;

  return (
    <Drawer title={u?.displayName || 'Rider'} onClose={onClose}>
      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {!data ? <Loading rows={5} /> : u ? (
        <>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
            <Avatar name={u.displayName} size={44} />
            <div>
              <div style={{ font: `600 17px ${SG}`, color: 'var(--ink)' }}>{u.displayName || '(no name)'}</div>
              <div style={{ ...NUM, fontSize: 12, color: 'var(--sur)' }}>#{u.id}{u.handle ? ` · @${u.handle}` : ''}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8, marginBottom: 18 }}>
            <MiniStat label="Trips" value={data.tripCount} />
            <MiniStat label="Bikes" value={data.bikeCount} />
            <MiniStat label="Rides" value={data.rideCount} />
            <MiniStat label="Alerts raised" value={data.alertsRaised} tone={data.alertsRaised > 0 ? 'warn' : 'neutral'} />
          </div>

          <KeyValue rows={[
            ['Email', u.email ?? '—'],
            ['Email verified', u.emailVerified ? 'Yes' : 'No'],
            ['Phone', u.phoneNumber ?? '—'],
            ['City', u.city ?? '—'],
            ['State', u.state ?? '—'],
            ['Setup complete', u.onboardingComplete ? 'Yes' : 'No'],
            ['Last ride started', when(data.lastRideStartedAt)],
            ['Joined', when(u.createdAt)],
            ['Last updated', when(u.updatedAt)],
          ]} />

          <p style={{ font: `400 12.5px/1.6 ${HG}`, color: 'var(--sur)', marginTop: 18 }}>
            Medical card, documents and location are deliberately not shown. An operator reading a
            directory has no reason to see a rider&rsquo;s blood group, and a field that is fetched is a
            field that eventually gets displayed.
          </p>
        </>
      ) : null}
    </Drawer>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: 'warn' | 'neutral' }) {
  return (
    <div style={{ background: 'var(--ctr)', borderRadius: 10, padding: '10px 12px' }}>
      <div style={{ font: `500 10.5px ${SG}`, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sur)' }}>{label}</div>
      <div style={{ ...NUM, fontSize: 20, fontWeight: 600, color: tone === 'warn' ? 'var(--warn)' : 'var(--ink)', marginTop: 3 }}>
        {num(value)}
      </div>
    </div>
  );
}

/* ==================================================================== trips */

const TRIP_STATUSES = ['Draft', 'Planned', 'Completed', 'Cancelled'];

export function Trips() {
  const [query, setQuery] = useState<{ q?: string; status?: string; page: number }>({ page: 1 });
  const [text, setText] = useState('');
  const debounce = useRef<number | undefined>(undefined);

  const { data, error, loading, reload } = useAsync(
    useCallback(() => listTrips({ ...query, pageSize: 25 }), [query]), [query],
  );

  function onText(v: string) {
    setText(v);
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => setQuery((q) => ({ ...q, q: v.trim() || undefined, page: 1 })), 300);
  }

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

  return (
    <>
      <SectionTitle
        eyebrow="Planning"
        title="Trips"
        note="Every trip, newest first. Departed comes from ride evidence, never from the calendar."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      <Toolbar>
        <div style={{ flex: '1 1 240px', minWidth: 200 }}>
          <Field label="Search">
            <input className="qf-a" style={inputStyle} placeholder="Trip name" value={text}
              onChange={(e) => onText(e.target.value)} spellCheck={false} />
          </Field>
        </div>
        <Chips
          label="Status"
          value={query.status ? TRIP_STATUSES.indexOf(query.status) + 1 : 0}
          options={[{ v: 0, l: 'All' }, ...TRIP_STATUSES.map((s, i) => ({ v: i + 1, l: s }))]}
          onPick={(v) => setQuery((q) => ({ ...q, status: v === 0 ? undefined : TRIP_STATUSES[v - 1], page: 1 }))}
        />
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {data ? <Count total={data.totalCount} noun="trip" page={data.page} pages={totalPages} /> : null}

      {loading && !data ? <Loading rows={6} />
        : data && data.trips.length === 0 ? <Empty>No trips match that.</Empty>
        : data ? (
          <>
            <Table head={['Trip', 'Host', 'Dates', 'Crew', 'Status', 'Created']}>
              {data.trips.map((t: OpsTrip) => (
                <tr key={t.id} className="qf-row">
                  <Td>
                    <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>{t.name || '(unnamed)'}</div>
                    <div style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>#{t.id}</div>
                  </Td>
                  <Td>{t.hostName ?? <span style={{ ...NUM, color: 'var(--sur)' }}>#{t.hostUserId}</span>}</Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>{t.startDate} → {t.endDate}</Td>
                  <Td mono>{num(t.memberCount)}</Td>
                  <Td>
                    <Badge tone={t.status === 'Completed' ? 'ok' : t.status === 'Cancelled' ? 'danger' : 'neutral'}>
                      {t.status}
                    </Badge>
                    {t.hasDeparted ? <span style={{ marginLeft: 6 }}><Badge tone="accent">Departed</Badge></span> : null}
                  </Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>{when(t.createdAt)}</Td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={totalPages} onPage={(p) => setQuery((q) => ({ ...q, page: p }))} />
          </>
        ) : null}
    </>
  );
}

/* =================================================================== safety */

const ALERT_TONE: Record<string, 'danger' | 'warn' | 'ok' | 'neutral'> = {
  Detecting: 'warn', Countdown: 'danger', Active: 'danger', Delivering: 'danger',
  Delivered: 'warn', Cancelled: 'neutral', Resolved: 'ok',
};

export function Safety() {
  const [openOnly, setOpenOnly] = useState(true);
  const [page, setPage] = useState(1);

  const { data, error, loading, reload } = useAsync(
    useCallback(() => listAlerts(openOnly, page, 25), [openOnly, page]), [openOnly, page],
  );

  const totalPages = data ? Math.max(1, Math.ceil(data.totalCount / data.pageSize)) : 1;

  return (
    <>
      <SectionTitle
        eyebrow="Live"
        title="Safety alerts"
        note="Read-only, permanently. An alert's lifecycle belongs to the guarded domain transitions — a console that could resolve one from a desk could tell a crew a downed rider is fine."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      <Toolbar>
        <Chips
          label="Show"
          value={openOnly ? 1 : 0}
          options={[{ v: 1, l: 'Open only' }, { v: 0, l: 'Everything' }]}
          onPick={(v) => { setOpenOnly(v === 1); setPage(1); }}
        />
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {data ? <Count total={data.totalCount} noun="alert" page={data.page} pages={totalPages} /> : null}

      {loading && !data ? <Loading rows={5} />
        : data && data.alerts.length === 0 ? (
          <Empty>{openOnly ? 'Nothing open. Every alert has been resolved or cancelled.' : 'No alerts have ever been raised.'}</Empty>
        ) : data ? (
          <>
            <Table head={['Alert', 'Rider', 'Trip', 'State', 'Escalation', 'Raised', 'Resolved']}>
              {data.alerts.map((a: OpsAlert) => (
                <tr key={a.id} className="qf-row">
                  <Td>
                    <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>{a.type}</div>
                    <div style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>#{a.id} · {a.triggerKind}</div>
                  </Td>
                  <Td>{a.riderName ?? <span style={{ ...NUM, color: 'var(--sur)' }}>#{a.riderId}</span>}</Td>
                  <Td>{a.tripName ?? <span style={{ ...NUM, color: 'var(--sur)' }}>#{a.tripId}</span>}</Td>
                  <Td><Badge tone={ALERT_TONE[a.state] ?? 'neutral'}>{a.state}</Badge></Td>
                  <Td mono>{a.escalationStage}</Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>{when(a.createdAt)}</Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>{when(a.resolvedAt)}</Td>
                </tr>
              ))}
            </Table>
            <Pager page={data.page} pages={totalPages} onPage={setPage} />
          </>
        ) : null}
    </>
  );
}

/* ============================================================= feature flags */

export function Flags() {
  const { data, error, reload } = useAsync<FeatureFlag[]>(getFeatureFlags, []);
  const [pending, setPending] = useState<FeatureFlag | null>(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function apply() {
    if (!pending) return;
    setBusy(true);
    setSaveError(null);
    try {
      await putFeatureFlag(pending.key, !pending.enabled, reason.trim() || 'Toggled from the admin console.');
      setPending(null);
      setReason('');
      reload();
    } catch (e) {
      setSaveError(errorText(e, 'Toggle failed.'));
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
        note="Every toggle is audited with who, when, old → new and why. The reason is not politeness — it is the only record of intent."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {saveError ? <Banner tone="danger" title="Problem">{saveError}</Banner> : null}

      {!data ? <Loading rows={4} />
        : data.length === 0 ? <Empty>No flags are registered.</Empty>
        : (
          <Table head={['Flag', 'State', 'Changed', '']}>
            {data.map((f) => (
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
                  <Button onClick={() => { setPending(f); setReason(''); }}>Turn {f.enabled ? 'off' : 'on'}</Button>
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
  const [status, setStatus] = useState<number | undefined>(undefined);
  const { data, error, loading, reload } = useAsync(useCallback(() => listTickets(status), [status]), [status]);

  return (
    <>
      <SectionTitle
        eyebrow="Help centre"
        title="Support queue"
        note="Newest first. Replies go out through the app's own support tooling — this is the read side."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      <Toolbar>
        <Chips
          label="Status"
          value={status === undefined ? 9 : status}
          options={[{ v: 9, l: 'All' }, { v: 0, l: 'Open' }, { v: 1, l: 'Awaiting rider' }, { v: 2, l: 'Resolved' }]}
          onPick={(v) => setStatus(v === 9 ? undefined : v)}
        />
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {loading && !data ? <Loading rows={5} />
        : data && data.tickets.length === 0 ? <Empty>Nothing in the queue.</Empty>
        : data ? (
          <Table head={['Ticket', 'Rider', 'Status', 'Opened', 'Last message']}>
            {data.tickets.map((t: SupportTicket) => {
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

/* ===================================================================== audit */

export function Audit() {
  const { data, error, reload } = useAsync<OpsAuditEntry[]>(useCallback(() => listAudit(200), []), []);

  return (
    <>
      <SectionTitle
        eyebrow="Ops"
        title="Audit trail"
        note="Every feature-flag toggle and every force-update change, merged and newest first. Nothing here can be edited."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {!data ? <Loading rows={6} />
        : data.length === 0 ? <Empty>Nothing has been changed yet.</Empty>
        : <Card style={{ padding: 4 }}>{data.map((a, i) => <AuditRow key={i} entry={a} />)}</Card>}
    </>
  );
}

function AuditRow({ entry, compact }: { entry: OpsAuditEntry; compact?: boolean }) {
  return (
    <div style={{ padding: compact ? '8px 0' : '12px 14px', borderBottom: '1px solid var(--line)' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <Badge tone={entry.kind === 'Force update' ? 'danger' : 'accent'}>{entry.kind}</Badge>
        <span style={{ font: `600 13.5px ${SG}`, color: 'var(--ink)' }}>{entry.subject}</span>
        <span style={{ font: `400 13px ${HG}`, color: 'var(--mut)' }}>{entry.change}</span>
      </div>
      <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)', marginTop: 4 }}>
        {when(entry.changedAt)} · {entry.changedByName ?? (entry.changedByUserId === 0 ? 'automation' : `#${entry.changedByUserId}`)}
        {entry.reason ? <> · &ldquo;{entry.reason}&rdquo;</> : null}
      </div>
    </div>
  );
}

/* ============================================================ runtime config */

export function Runtime() {
  const { data, error, reload } = useAsync<Record<string, unknown>>(getRuntimeConfig, []);
  const [filter, setFilter] = useState('');

  const entries = useMemo(() => {
    const all = data ? flatten(data) : [];
    const q = filter.trim().toLowerCase();
    return q ? all.filter(([k, v]) => k.toLowerCase().includes(q) || v.toLowerCase().includes(q)) : all;
  }, [data, filter]);

  return (
    <>
      <SectionTitle
        eyebrow="Ops"
        title="Runtime config"
        note="What the running API believes it is configured with. The host's .env overrides appsettings.json, so this is the only honest answer."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {data ? (
        <Toolbar>
          <div style={{ flex: '1 1 260px', minWidth: 220 }}>
            <Field label="Filter">
              <input className="qf-a" style={inputStyle} placeholder="Key or value" value={filter}
                onChange={(e) => setFilter(e.target.value)} spellCheck={false} />
            </Field>
          </div>
        </Toolbar>
      ) : null}

      {!data ? <Loading rows={6} />
        : entries.length === 0 ? <Empty>{filter ? 'Nothing matches that.' : 'The endpoint returned nothing.'}</Empty>
        : (
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

/**
 * The support desk — the crew side of a Help-centre thread.
 *
 * ## What this can and cannot do, and why
 *
 * It can read the queue, open a thread with its full merged timeline, view the screenshots a rider
 * attached, read the ride log, reply, and re-triage (status, type, desk, subject).
 *
 * **It cannot delete a ticket, and that is deliberate.** The server has no delete route for one and
 * should not grow one: a ticket is the record of a rider asking for help, and deleting it destroys
 * both halves of a conversation — including the evidence of how long they waited and what they were
 * told. "Resolved" is what closing looks like here, and a resolved thread can be reopened by the
 * rider replying to it. If a thread is genuinely spam, resolve it; the queue filters it away.
 *
 * ## Replying is not a note to self
 *
 * `POST .../messages` flips the thread to "Needs your reply", stamps the first-response time the
 * median tile is built from, and **pushes and emails the rider**. The composer says so, because an
 * operator drafting a thought should know it leaves the building.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  ApiError, getAttachmentUrl, getRideLog, getTicket, listTickets, replyToTicket, updateTicket,
  type SupportAttachment, type SupportRideLog, type SupportTicket, type SupportTicketDetail,
  type SupportTimelineEntry,
} from './api';
import { HG, NUM, SG, inputStyle, num, when } from './theme';
import {
  Badge, Banner, Button, Card, Chips, Drawer, Empty, Field, Loading, SectionTitle, Stat, StatGrid,
  Table, Td, Toolbar,
} from './ui';
import { useAsync } from './useAsync';

function errorText(e: unknown, fallback: string): string {
  if (e instanceof ApiError) return `${e.message}${e.detail ? ` — ${e.detail}` : ''}`;
  return fallback;
}

/* The wire may serialise enums as names or as numbers depending on the converter, so both are mapped
   rather than assuming one. A ticket rendering as "0" tells an operator nothing. */
const STATUS: Record<string, { label: string; tone: 'warn' | 'accent' | 'ok'; note: string }> = {
  '0': { label: 'Open', tone: 'warn', note: 'With support — the ball is on our side' },
  '1': { label: 'Awaiting rider', tone: 'accent', note: 'We asked something; waiting on them' },
  '2': { label: 'Resolved', tone: 'ok', note: 'Answered and closed' },
  Open: { label: 'Open', tone: 'warn', note: 'With support — the ball is on our side' },
  AwaitingRider: { label: 'Awaiting rider', tone: 'accent', note: 'We asked something; waiting on them' },
  Resolved: { label: 'Resolved', tone: 'ok', note: 'Answered and closed' },
};

const TYPE: Record<string, string> = {
  '0': 'Inquiry', '1': 'Bug', '2': 'Feature request', '3': 'Billing',
  Inquiry: 'Inquiry', Bug: 'Bug', FeatureRequest: 'Feature request', Billing: 'Billing',
};

const AUTHOR: Record<string, { label: string; tone: 'accent' | 'ok' | 'neutral' }> = {
  '0': { label: 'Rider', tone: 'accent' },
  '1': { label: 'Support', tone: 'ok' },
  '2': { label: 'System', tone: 'neutral' },
  Rider: { label: 'Rider', tone: 'accent' },
  Support: { label: 'Support', tone: 'ok' },
  System: { label: 'System', tone: 'neutral' },
};

const statusOf = (v: string | number) => STATUS[String(v)];
const typeOf = (v: string | number | null | undefined) => (v === null || v === undefined ? '—' : TYPE[String(v)] ?? String(v));

/** How long a thread has been waiting on us. The queue is sorted by recency; this is the pressure. */
function waitingFor(ticket: SupportTicket): string | null {
  const s = statusOf(ticket.status);
  if (!s || s.label !== 'Open') return null;
  const hours = (Date.now() - new Date(ticket.lastMessageAt).getTime()) / 3_600_000;
  if (hours < 1) return 'under an hour';
  if (hours < 24) return `${Math.floor(hours)}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function Support() {
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [type, setType] = useState<number | undefined>(undefined);
  const [open, setOpen] = useState<number | null>(null);

  const { data, error, loading, reload } = useAsync(
    useCallback(() => listTickets(status, type), [status, type]), [status, type],
  );

  const tickets = useMemo(() => data?.tickets ?? [], [data]);
  const counts = useMemo(() => ({
    open: tickets.filter((t) => statusOf(t.status)?.label === 'Open').length,
    awaiting: tickets.filter((t) => statusOf(t.status)?.label === 'Awaiting rider').length,
    unanswered: tickets.filter((t) => t.firstResponseAt === null).length,
  }), [tickets]);

  return (
    <>
      <SectionTitle
        eyebrow="Help centre"
        title="Support desk"
        note="Read a thread, see what the rider attached, reply, and triage. A reply pushes and emails them."
        action={<Button onClick={reload}>Refresh</Button>}
      />

      <StatGrid>
        <Stat label="Open" value={num(counts.open)} tone={counts.open > 0 ? 'warn' : 'ok'} sub="waiting on support" />
        <Stat label="Awaiting rider" value={num(counts.awaiting)} sub="we answered, they have not" />
        <Stat
          label="Never answered"
          value={num(counts.unanswered)}
          tone={counts.unanswered > 0 ? 'danger' : 'ok'}
          sub="no first response at all"
        />
      </StatGrid>

      <div style={{ height: 18 }} />

      <Toolbar>
        <Chips
          label="Status"
          value={status === undefined ? 9 : status}
          options={[{ v: 9, l: 'All' }, { v: 0, l: 'Open' }, { v: 1, l: 'Awaiting rider' }, { v: 2, l: 'Resolved' }]}
          onPick={(v) => setStatus(v === 9 ? undefined : v)}
        />
        <Chips
          label="Type"
          value={type === undefined ? 9 : type}
          options={[
            { v: 9, l: 'All' }, { v: 0, l: 'Inquiry' }, { v: 1, l: 'Bug' },
            { v: 2, l: 'Feature' }, { v: 3, l: 'Billing' },
          ]}
          onPick={(v) => setType(v === 9 ? undefined : v)}
        />
      </Toolbar>

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      {loading && !data ? <Loading rows={5} />
        : tickets.length === 0 ? <Empty>Nothing in the queue.</Empty>
        : (
          <Table head={['Ticket', 'Rider', 'Type', 'Status', 'Waiting', 'Last message']}>
            {tickets.map((t) => {
              const s = statusOf(t.status);
              const wait = waitingFor(t);
              return (
                <tr key={t.id} className="qf-row" style={{ cursor: 'pointer' }} onClick={() => setOpen(t.id)}>
                  <Td>
                    <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>{t.subject || '(no subject)'}</div>
                    <div style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>
                      {t.reference}
                      {t.attachmentCount > 0 ? ` · ${t.attachmentCount} attachment${t.attachmentCount === 1 ? '' : 's'}` : ''}
                      {t.hasRideLog ? ' · ride log' : ''}
                    </div>
                    {t.lastMessagePreview ? (
                      <div style={{ font: `400 12.5px ${HG}`, color: 'var(--mut)', marginTop: 4, maxWidth: 420 }}>
                        {t.lastMessagePreview.slice(0, 110)}{t.lastMessagePreview.length > 110 ? '…' : ''}
                      </div>
                    ) : null}
                  </Td>
                  <Td>
                    <div style={{ font: `500 13.5px ${HG}`, color: 'var(--ink)' }}>{t.riderName || '—'}</div>
                    <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)' }}>{t.replyToEmail ?? t.phone ?? ''}</div>
                  </Td>
                  <Td>{typeOf(t.type)}</Td>
                  <Td>{s ? <Badge tone={s.tone}>{s.label}</Badge> : <Badge>{String(t.status)}</Badge>}</Td>
                  <Td mono style={{ color: wait && wait.endsWith('d') ? 'var(--danger)' : 'var(--mut)' }}>
                    {wait ?? '—'}
                  </Td>
                  <Td mono style={{ whiteSpace: 'nowrap' }}>{when(t.lastMessageAt)}</Td>
                </tr>
              );
            })}
          </Table>
        )}

      <TicketDrawer ticketId={open} onClose={() => setOpen(null)} onChanged={reload} />
    </>
  );
}

/* ------------------------------------------------------------------ thread */

function TicketDrawer({
  ticketId, onClose, onChanged,
}: { ticketId: number | null; onClose: () => void; onChanged: () => void }) {
  const [nonce, setNonce] = useState(0);
  // `nonce` is not read by the loader, only by useAsync's dep list — it is how a reply or a status
  // change re-fetches the thread it just altered. eslint cannot see that from the callback alone.
  const load = useCallback(
    () => (ticketId === null ? Promise.resolve(null) : getTicket(ticketId)),
    [ticketId],
  );
  const { data, error } = useAsync<SupportTicketDetail | null>(load, [ticketId, nonce]);

  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement | null>(null);

  useEffect(() => { setReply(''); setActionError(null); }, [ticketId]);

  async function send() {
    if (ticketId === null || reply.trim().length === 0) return;
    setBusy(true);
    setActionError(null);
    try {
      await replyToTicket(ticketId, reply.trim());
      setReply('');
      setNonce((n) => n + 1);
      onChanged();
      bottom.current?.scrollIntoView({ behavior: 'smooth' });
    } catch (e) {
      setActionError(errorText(e, 'Reply failed.'));
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(next: number) {
    if (ticketId === null) return;
    setBusy(true);
    setActionError(null);
    try {
      await updateTicket(ticketId, { status: next });
      setNonce((n) => n + 1);
      onChanged();
    } catch (e) {
      setActionError(errorText(e, 'Could not change the status.'));
    } finally {
      setBusy(false);
    }
  }

  if (ticketId === null) return null;

  const s = data ? statusOf(data.status) : undefined;

  return (
    <Drawer title={data?.subject ?? 'Ticket'} onClose={onClose}>
      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}
      {!data ? <Loading rows={6} /> : (
        <>
          <div style={{ marginBottom: 16 }}>
            <div style={{ font: `600 18px ${SG}`, color: 'var(--ink)', lineHeight: 1.25 }}>
              {data.subject || '(no subject)'}
            </div>
            <div style={{ ...NUM, fontSize: 12, color: 'var(--sur)', marginTop: 4 }}>
              {data.reference} · {typeOf(data.type)} · {data.desk}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {s ? <Badge tone={s.tone}>{s.label}</Badge> : null}
              {data.assignedToName ? <Badge>{data.assignedToName}</Badge> : null}
              {data.attachedLabel ? <Badge tone="accent">{data.attachedLabel}</Badge> : null}
            </div>
            {s ? (
              <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)', marginTop: 8 }}>{s.note}</div>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', padding: '12px 14px', background: 'var(--ctr)', borderRadius: 12, marginBottom: 16 }}>
            <Small label="Rider replies to" value={data.replyToEmail ?? data.phone ?? 'no contact'} />
            <Small label="Opened" value={when(data.createdAt)} />
            {data.resolvedAt ? <Small label="Resolved" value={when(data.resolvedAt)} /> : null}
          </div>

          {actionError ? <Banner tone="danger" title="Problem">{actionError}</Banner> : null}

          <RideLogBlock ticketId={ticketId} />

          <div style={{ ...({} as React.CSSProperties), marginBottom: 8, font: `600 12px ${SG}`, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sur)' }}>
            Thread
          </div>
          <div style={{ borderLeft: '2px solid var(--line)', paddingLeft: 14, marginBottom: 20 }}>
            {data.timeline.map((entry, i) => (
              <TimelineRow key={i} entry={entry} ticketId={ticketId} />
            ))}
            <div ref={bottom} />
          </div>

          <div style={{ paddingTop: 16, borderTop: '1px solid var(--line)' }}>
            <Field
              label="Reply to the rider"
              hint="This pushes and emails them, flips the thread to “Needs your reply”, and stamps the first-response time."
            >
              <textarea
                className="qf-a"
                style={{ ...inputStyle, minHeight: 96, padding: 12, resize: 'vertical', lineHeight: 1.55 }}
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write the answer the rider will read…"
              />
            </Field>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={() => void send()} disabled={busy || reply.trim().length === 0}>
                {busy ? 'Sending…' : 'Send reply'}
              </Button>
              {s?.label !== 'Resolved' ? (
                <Button onClick={() => void setStatus(2)} disabled={busy}>Mark resolved</Button>
              ) : (
                <Button onClick={() => void setStatus(0)} disabled={busy}>Reopen</Button>
              )}
              {s?.label !== 'Awaiting rider' ? (
                <Button onClick={() => void setStatus(1)} disabled={busy}>Awaiting rider</Button>
              ) : null}
            </div>

            <p style={{ font: `400 12px/1.6 ${HG}`, color: 'var(--sur)', marginTop: 14 }}>
              There is no delete. A ticket is the record of a rider asking for help — removing it destroys
              both halves of the conversation, including how long they waited and what they were told.
              Resolving is what closing looks like, and the rider can reopen it by replying.
            </p>
          </div>
        </>
      )}
    </Drawer>
  );
}

function Small({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ font: `500 10.5px ${SG}`, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sur)' }}>
        {label}
      </div>
      <div style={{ font: `400 13px ${HG}`, color: 'var(--ink)', marginTop: 2, wordBreak: 'break-all' }}>{value}</div>
    </div>
  );
}

function TimelineRow({ entry, ticketId }: { entry: SupportTimelineEntry; ticketId: number }) {
  const author = entry.authorKind === null || entry.authorKind === undefined
    ? null
    : AUTHOR[String(entry.authorKind)];

  return (
    <div style={{ position: 'relative', paddingBottom: 18 }}>
      <div
        aria-hidden
        style={{
          position: 'absolute', left: -20, top: 4, width: 9, height: 9, borderRadius: 9,
          background: author?.tone === 'ok' ? 'var(--ok)' : author?.tone === 'accent' ? 'var(--acc2)' : 'var(--line)',
          border: '2px solid var(--card)',
        }}
      />
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ font: `600 13px ${HG}`, color: 'var(--ink)' }}>
          {entry.authorName ?? entry.title}
        </span>
        {author ? <Badge tone={author.tone}>{author.label}</Badge> : null}
        <span style={{ ...NUM, fontSize: 11.5, color: 'var(--sur)' }}>{when(entry.at)}</span>
      </div>

      {entry.body ? (
        <p style={{ font: `400 13.5px/1.6 ${HG}`, color: 'var(--mut)', margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>
          {entry.body}
        </p>
      ) : entry.detail ? (
        <p style={{ font: `400 12.5px/1.55 ${HG}`, color: 'var(--sur)', margin: '4px 0 0' }}>{entry.detail}</p>
      ) : null}

      {entry.attachments && entry.attachments.length > 0 ? (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
          {entry.attachments.map((a) => (
            <AttachmentChip key={a.id} ticketId={ticketId} attachment={a} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/**
 * A screenshot the rider sent.
 *
 * The URL is minted on demand and is short-lived, so it is fetched on click rather than up front — a
 * thread with eight screenshots should not mint eight signed URLs nobody looks at, and a URL sitting
 * in the DOM for an hour is a URL that outlives the reason it was created.
 */
function AttachmentChip({ ticketId, attachment }: { ticketId: number; attachment: SupportAttachment }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function open() {
    setBusy(true);
    setFailed(false);
    try {
      const { url } = await getAttachmentUrl(ticketId, attachment.id);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  const kb = Math.max(1, Math.round(attachment.sizeBytes / 1024));

  return (
    <button
      className="qf-a"
      onClick={() => void open()}
      disabled={busy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 11px', borderRadius: 10,
        border: `1px solid ${failed ? 'var(--danger)' : 'var(--line)'}`, background: 'var(--card)',
        cursor: 'pointer', font: `500 12.5px ${HG}`, color: failed ? 'var(--danger)' : 'var(--ink)',
      }}
    >
      <span aria-hidden>🖼</span>
      {busy ? 'Opening…' : failed ? 'Could not open' : attachment.fileName || 'screenshot'}
      <span style={{ ...NUM, color: 'var(--sur)' }}>{kb} KB</span>
    </button>
  );
}

/**
 * The ride the rider attached.
 *
 * A 404 here is the ordinary case — most tickets have no ride attached — so it renders nothing rather
 * than an error. Only a real failure is worth saying out loud.
 */
function RideLogBlock({ ticketId }: { ticketId: number }) {
  const [log, setLog] = useState<SupportRideLog | null>(null);
  const [state, setState] = useState<'loading' | 'none' | 'ready' | 'error'>('loading');

  useEffect(() => {
    let alive = true;
    setState('loading');
    getRideLog(ticketId)
      .then((r) => { if (alive) { setLog(r); setState('ready'); } })
      .catch((e: unknown) => {
        if (!alive) return;
        setState(e instanceof ApiError && e.status === 404 ? 'none' : 'error');
      });
    return () => { alive = false; };
  }, [ticketId]);

  if (state === 'none' || state === 'loading') return null;
  if (state === 'error') {
    return <Banner tone="warn" title="Ride log unavailable">The attached ride could not be rendered.</Banner>;
  }
  if (!log) return null;

  return (
    <Card style={{ padding: 14, marginBottom: 18 }}>
      <div style={{ font: `600 12px ${SG}`, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: 10 }}>
        Attached ride
      </div>
      <div style={{ font: `600 14px ${HG}`, color: 'var(--ink)' }}>
        {log.tripName ?? `Trip #${log.tripId ?? '—'}`}
        {log.dayNumber ? ` · day ${log.dayNumber}` : ''}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(96px,1fr))', gap: 10, marginTop: 12 }}>
        <Small label="State" value={log.state ?? '—'} />
        <Small label="Distance" value={log.distanceKm === null ? '—' : `${log.distanceKm.toFixed(1)} km`} />
        <Small label="Stints" value={log.segmentCount === null ? '—' : String(log.segmentCount)} />
        <Small label="Track points" value={log.trackPointCount === null ? '—' : num(log.trackPointCount)} />
      </div>
      <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)', marginTop: 10 }}>
        {when(log.startedAt)} → {when(log.endedAt)}
      </div>

      {log.segments.length > 0 ? (
        <div style={{ marginTop: 12, borderTop: '1px solid var(--line)', paddingTop: 10 }}>
          {log.segments.map((seg) => (
            <div key={seg.index} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '4px 0', font: `400 12.5px ${HG}`, color: 'var(--mut)' }}>
              <span>Stint {seg.index + 1}</span>
              <span style={{ ...NUM }}>{seg.distanceKm === null ? '—' : `${seg.distanceKm.toFixed(1)} km`}</span>
            </div>
          ))}
        </div>
      ) : null}

      <p style={{ font: `400 11.5px/1.55 ${HG}`, color: 'var(--sur)', marginTop: 10 }}>
        Rendered from what the server recorded, not a file the rider uploaded — so it cannot be stale
        and cannot have been edited.
      </p>
    </Card>
  );
}

/**
 * Force update — the only screen here that reaches every rider at once.
 *
 * ## What this panel knows that a plain form would not
 *
 * Three things went wrong with this feature in production, and the UI is shaped by all three:
 *
 * 1. **`minimum_build` above what the store actually serves locks the fleet out.** The blocking screen
 *    sends the rider to the store, and the store offers them the build they already have. There is no
 *    way out from the rider's side. So the panel refuses to arm above `latestBuild`, and says plainly
 *    that "latest" means *what the store serves*, not what CI uploaded — those are hours (Android) to
 *    days (iOS) apart.
 *
 * 2. **The editorial copy goes stale in silence.** The ops PUT *replaces* the policy rather than
 *    patching it, so the automation re-sends `updateTitle`/`updateMessage` verbatim to avoid wiping
 *    authored copy — which means a build number written into that sentence is never updated by
 *    anything. On 2026-08-27 the live message still read "Qafilaa 1.0.0 (6) is required" while the
 *    minimum was 7. That sentence is what a blocked rider reads. This panel therefore shows the
 *    message next to the number and **warns when the message names a different build**.
 *
 * 3. **The stored row and what a device is told can disagree.** So the panel reads the anonymous
 *    `/app/update-check` endpoint — the same one the app calls — and shows the fleet's real answer
 *    beside the policy. If they differ, the policy row is not the truth.
 *
 * Disarming is `forceUpdateEnabled = false`, never lowering `minimum_build`: the disarm switch is the
 * designed escape and both the validator and the evaluator honour it independently.
 */
import { useCallback, useEffect, useState } from 'react';

import {
  ApiError, checkUpdate, getReleasePolicies, putReleasePolicy, type ReleasePolicy,
} from './api';
import { HG, NUM, SG, inputStyle, when } from './theme';
import {
  Badge, Banner, Button, Card, ConfirmDialog, Field, Loading, SectionTitle,
} from './ui';

type Platform = 'android' | 'ios';

interface LiveAnswer {
  minimumBuild: number;
  latestBuild: number;
  minimumVersion: string;
  latestVersion: string;
  message: string | null;
  title: string | null;
}

export function ForceUpdate() {
  const [policies, setPolicies] = useState<ReleasePolicy[] | null>(null);
  const [live, setLive] = useState<Partial<Record<Platform, LiveAnswer | 'error'>>>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPolicies(await getReleasePolicies());
    } catch (e) {
      setError(e instanceof ApiError ? `${e.message} ${e.detail ?? ''}`.trim() : 'Could not read the release policy.');
    }

    // Build 0 is below any conceivable minimum, so the answer describes the policy rather than a
    // particular device — this is a probe, not a version check.
    for (const p of ['android', 'ios'] as Platform[]) {
      try {
        const r = await checkUpdate(p, 0);
        setLive((s) => ({ ...s, [p]: r }));
      } catch {
        setLive((s) => ({ ...s, [p]: 'error' }));
      }
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <>
      <SectionTitle
        eyebrow="Release"
        title="Force update"
        note={
          <>
            <code>minimumBuild</code> is the only field that arms the gate. Everything else is copy or a
            pointer. Disarm with the switch, never by lowering the number.
          </>
        }
      />

      {error ? <Banner tone="danger" title="Could not load">{error}</Banner> : null}

      <Banner tone="warn" title="Never arm above what the store is serving">
        &ldquo;Latest&rdquo; here means the build riders can actually install — not the one CI uploaded.
        Play takes hours to offer a new release across every region and device; the App Store takes
        longer. A rider forced before their listing catches up gets a blocking screen with nothing to
        install. Confirm on the store listing itself first.
      </Banner>

      {policies === null ? (
        <Loading rows={2} />
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {policies.map((p) => (
            <PlatformCard
              key={p.platform ?? 'unknown'}
              policy={p}
              live={live[(p.platform ?? '').toLowerCase() as Platform]}
              onSaved={load}
            />
          ))}
        </div>
      )}
    </>
  );
}

function PlatformCard({
  policy, live, onSaved,
}: { policy: ReleasePolicy; live: LiveAnswer | 'error' | undefined; onSaved: () => void }) {
  const platform = (policy.platform ?? '').toLowerCase();
  const [minimumBuild, setMinimumBuild] = useState(String(policy.minimumBuild));
  const [minimumVersion, setMinimumVersion] = useState(policy.minimumVersion);
  const [latestBuild, setLatestBuild] = useState(String(policy.latestBuild));
  const [latestVersion, setLatestVersion] = useState(policy.latestVersion);
  const [storeUrl, setStoreUrl] = useState(policy.storeUrl);
  const [message, setMessage] = useState(policy.updateMessage ?? '');
  const [title, setTitle] = useState(policy.updateTitle ?? 'Update required');
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const min = Number(minimumBuild);
  const latest = Number(latestBuild);

  const armed = policy.forceUpdateEnabled && policy.minimumBuild > 0 && policy.storeUrl.trim() !== '';
  const urlChanged = storeUrl.trim() !== policy.storeUrl.trim();
  const raising = min > policy.minimumBuild;
  const overshoot = min > latest;
  const noStoreUrl = storeUrl.trim() === '';

  /* A store URL that is PRESENT but not real is worse than a blank one, because blank is the
     interlock: the validator and the evaluator both refuse to arm on it. A placeholder passes both
     and sends blocked riders to a 404. This is not hypothetical — the iOS row carried
     `.../idREPLACE_WITH_REAL_ID` in production, straight out of the runbook's example SQL. */
  const url = storeUrl.trim();
  const placeholderUrl =
    url !== '' && (
      /replace|example|placeholder|xxx|todo|your[-_]?app/i.test(url)
      || (url.includes('apps.apple.com') && !/\/id\d{6,}/.test(url))
      || (url.includes('play.google.com') && !/[?&]id=[\w.]+/.test(url))
    );

  /* Does the copy still name the build it is about? A message mentioning a different number is the
     exact drift that shipped to riders on 2026-08-27. */
  const buildsInMessage = Array.from(message.matchAll(/\((\d+)\)/g)).map((m) => Number(m[1]));
  const copyStale = buildsInMessage.length > 0 && !buildsInMessage.includes(min);

  const liveOk: LiveAnswer | null = live && live !== 'error' ? live : null;
  const liveDisagrees =
    liveOk !== null && (liveOk.minimumBuild !== policy.minimumBuild || liveOk.latestBuild !== policy.latestBuild);

  async function save(force: boolean) {
    setBusy(true);
    setSaveError(null);
    try {
      // The PUT REPLACES the policy — every field must be sent, or the ones omitted are nulled and
      // the authored copy is silently wiped.
      await putReleasePolicy(platform, {
        minimumBuild: min,
        minimumVersion: minimumVersion.trim(),
        latestBuild: latest,
        latestVersion: latestVersion.trim(),
        storeUrl: storeUrl.trim(),
        updateTitle: title.trim() || null,
        updateMessage: message.trim() || null,
        forceUpdateEnabled: force,
        badgeLabel: policy.badgeLabel ?? 'REQUIRED UPDATE',
        highlights: policy.highlights ?? [],
        downloadSizeLabel: policy.downloadSizeLabel ?? null,
        reason: `Admin console: minimum=${min} latest=${latest} force=${force}`,
      });
      setConfirm(false);
      onSaved();
    } catch (e) {
      setSaveError(e instanceof ApiError ? `${e.message} ${e.detail ?? ''}`.trim() : 'Save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card style={{ padding: 0, overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '14px 18px', borderBottom: '1px solid var(--line)', flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h3 style={{ font: `600 17px ${SG}`, color: 'var(--ink)', margin: 0, textTransform: 'capitalize' }}>
            {policy.platform ?? 'unknown'}
          </h3>
          {armed ? <Badge tone="danger">Armed at {policy.minimumBuild}</Badge> : <Badge tone="ok">Not forcing</Badge>}
          {noStoreUrl ? <Badge tone="warn">No store URL</Badge> : null}
        </div>
        <div style={{ font: `400 12.5px ${HG}`, color: 'var(--sur)' }}>
          Updated {when(policy.updatedAt)}
        </div>
      </div>

      <div style={{ padding: 18 }}>
        {/* What the fleet is really told, read without credentials. */}
        <div
          style={{
            display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))',
            padding: '12px 14px', background: 'var(--ctr)', borderRadius: 12, marginBottom: 16,
          }}
        >
          <Figure label="Policy minimum" value={policy.minimumBuild} sub={policy.minimumVersion} />
          <Figure label="Policy latest" value={policy.latestBuild} sub={policy.latestVersion} />
          <Figure
            label="Fleet is told"
            value={live === 'error' ? '—' : live ? live.minimumBuild : '…'}
            sub={live === 'error' ? 'unreadable' : live ? `min ${live.minimumVersion}` : 'reading'}
          />
        </div>

        {liveDisagrees ? (
          <Banner tone="danger" title="The live answer does not match this row">
            <code>/app/update-check</code> reports minimum {liveOk ? liveOk.minimumBuild : '?'} / latest{' '}
            {liveOk ? liveOk.latestBuild : '?'}. The policy is memoised for 60 seconds per
            host, so wait a minute and reload before concluding anything — if it still disagrees, this row is not
            what riders are getting.
          </Banner>
        ) : null}

        {placeholderUrl ? (
          <Banner tone="danger" title="The store URL is not a real listing">
            <code style={{ wordBreak: 'break-all' }}>{url}</code>
            <br />
            A blank URL is the interlock — the validator and the evaluator both refuse to arm on one. A
            placeholder passes both checks and sends every blocked rider to a dead link, which is the one
            failure here a rider cannot get out of. Fix this before raising the minimum.
          </Banner>
        ) : null}

        {noStoreUrl ? (
          <Banner tone="warn" title="This platform cannot be armed, by design">
            The store URL is blank, and both the validator and the evaluator refuse to gate on one. That is the
            interlock that stops a platform with no public listing being forced to a dead link. Fill it in only
            once the listing is genuinely live.
          </Banner>
        ) : null}

        <div style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))' }}>
          <Field label="Minimum build" hint="The gate. Below this, the app blocks.">
            <input className="qf-a" style={inputStyle} inputMode="numeric" value={minimumBuild}
              onChange={(e) => setMinimumBuild(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Minimum version" hint="Display only — the build number is what gates.">
            <input className="qf-a" style={inputStyle} value={minimumVersion} onChange={(e) => setMinimumVersion(e.target.value)} />
          </Field>
          <Field label="Latest build" hint="What the store serves. Never guess this.">
            <input className="qf-a" style={inputStyle} inputMode="numeric" value={latestBuild}
              onChange={(e) => setLatestBuild(e.target.value.replace(/\D/g, ''))} />
          </Field>
          <Field label="Latest version">
            <input className="qf-a" style={inputStyle} value={latestVersion} onChange={(e) => setLatestVersion(e.target.value)} />
          </Field>
        </div>

        <Field
          label="Store URL"
          hint={
            urlChanged
              ? 'Changed — this is where every blocked rider is sent. It is saved with the rest.'
              : 'Where the blocking screen sends a rider. A blank one keeps the gate disarmed, deliberately.'
          }
        >
          <input
            className="qf-a"
            style={{
              ...inputStyle,
              font: `400 13px ${SG}`,
              borderColor: placeholderUrl ? 'var(--danger)' : undefined,
            }}
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            spellCheck={false}
            placeholder={platform === 'ios'
              ? 'https://apps.apple.com/app/id0000000000'
              : 'https://play.google.com/store/apps/details?id=app.qafilaa'}
          />
        </Field>

        <Field label="Title">
          <input className="qf-a" style={inputStyle} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} />
        </Field>

        <Field
          label="Message"
          hint={`${message.length}/500 — this is the sentence a blocked rider reads.`}
        >
          <textarea
            className="qf-a"
            style={{ ...inputStyle, minHeight: 84, padding: 12, resize: 'vertical', lineHeight: 1.55 }}
            value={message}
            maxLength={500}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>

        {copyStale ? (
          <Banner tone="warn" title="The message names a different build">
            It mentions {buildsInMessage.map((b) => `(${b})`).join(', ')} but you are arming {min || '—'}. Nothing
            updates this sentence automatically — the ops write re-sends it verbatim so authored copy is never
            wiped, which is exactly why it goes stale. Rewrite it here.
          </Banner>
        ) : null}

        {overshoot ? (
          <Banner tone="danger" title="Minimum is above latest">
            You would be forcing riders to a build the store is not serving. The API refuses this, and it is the
            one mistake here with no way back for the rider.
          </Banner>
        ) : null}

        {saveError ? <Banner tone="danger" title="Save failed">{saveError}</Banner> : null}

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
          <Button
            variant="danger"
            disabled={busy || overshoot || noStoreUrl || placeholderUrl || !min}
            onClick={() => setConfirm(true)}
            title={
              overshoot ? 'Minimum is above latest'
                : placeholderUrl ? 'The store URL is not a real listing'
                : undefined
            }
          >
            {raising ? `Arm at build ${min}` : 'Save and keep armed'}
          </Button>

          {policy.forceUpdateEnabled ? (
            <Button variant="secondary" disabled={busy} onClick={() => void save(false)}>
              Disarm (leave the numbers alone)
            </Button>
          ) : (
            <Button variant="secondary" disabled={busy || noStoreUrl} onClick={() => void save(true)}>
              Re-enable forcing
            </Button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirm}
        title={`Force every ${policy.platform} rider below build ${min}?`}
        confirmLabel="Arm it"
        confirmWord="FORCE"
        busy={busy}
        onCancel={() => setConfirm(false)}
        onConfirm={() => void save(true)}
      >
        <p style={{ margin: '0 0 10px' }}>
          Every install below <strong>{min}</strong> gets a full-screen block within 60 seconds, and the only way
          past it is installing {latestVersion} ({latest}) from the store.
        </p>
        <p style={{ margin: 0 }}>
          The gate stands down for a live SOS, an armed ride and the safety surfaces, so nobody is locked out of
          an emergency. Ordinary riding is blocked. Disarm is one switch and takes effect just as fast.
        </p>
      </ConfirmDialog>
    </Card>
  );
}

function Figure({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div>
      <div style={{ font: `500 10.5px ${SG}`, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--sur)' }}>
        {label}
      </div>
      <div style={{ ...NUM, fontSize: 22, fontWeight: 600, color: 'var(--ink)', marginTop: 4 }}>{value}</div>
      {sub ? <div style={{ font: `400 12px ${HG}`, color: 'var(--sur)' }}>{sub}</div> : null}
    </div>
  );
}

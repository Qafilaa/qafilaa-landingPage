// Generated from `Qafilaa Site v2.dc.html` (handoff 13), lines 787-813.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function NoSignal() {
  return (
    <section id="offline" data-sec="No signal" data-tone="paper" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 18 · When there is no signal</div>
        <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,50px)', lineHeight: '1.08', letterSpacing: '-.02em', margin: '0', maxWidth: '20ch' }}>Offline is not a degraded mode. It is the mode this app was designed in.</h2>
        <p data-rv="1" style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--mut)', maxWidth: '64ch', margin: '20px 0 0' }}>Every screen reads from disk first. Every action you take is written locally and syncs when the road gives you a bar back. Nothing you do is lost because a mountain got in the way.</p>
        <div style={{ marginTop: '30px', maxWidth: '760px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
            <span>Drag the signal down</span><span data-siglabel="1" style={{ color: 'var(--acc)' }}>5G</span>
          </div>
          <input data-sig="1" type="range" min="0" max="4" step="1" defaultValue="0" aria-label="Connectivity level" style={{ width: '100%', height: '32px', marginTop: '4px', accentColor: '#0E7C86' }} />
          <div data-sigchips="1" style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}></div>
        </div>
        <div style={{ marginTop: '26px', alignItems: 'flex-start' }} data-strip="1">
          <div data-dock="1" data-screen="convoy" data-scale="0.52" data-kind="replace" data-sigdock="1" data-flowname="Losing signal" data-flow="convoy,convoyStale,convoyOffline"></div>
          <div data-static="convoyStale" data-scale="0.52" data-sigslot="2"></div>
          <div data-static="convoyOffline" data-scale="0.52" data-sigslot="3"></div>
        </div>
        <div data-rv="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px', marginTop: '16px', alignItems: 'baseline', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
          <span>Live</span><span style={{ opacity: '.4' }}>→</span><span>Last-known</span><span style={{ opacity: '.4' }}>→</span><span>Offline</span><span style={{ opacity: '.4' }}>·</span><span data-sigstate="1" style={{ color: 'var(--acc)' }}>Live</span>
        </div>
        <div data-rv="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '26px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
          <span>Never signs you out mid-trip</span><span style={{ opacity: '.4' }}>·</span><span>Queued actions reconcile in order</span>
        </div>
        <details className="qf-rcpt" data-rv="1" style={{ marginTop: '12px', maxWidth: '680px' }}>
          <summary style={{ cursor: 'pointer', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--acc)' }}>For the technically curious +</summary>
          <p style={{ margin: '10px 0 0', fontSize: '15px', lineHeight: '1.6', color: 'var(--mut)' }}>Reads are cache-then-network. Writes are idempotent and queued with a client-generated key, so a retry after a dropped connection can never double-post an expense. Conflicts resolve on a per-record version counter.</p>
        </details>
      </section>
  );
}

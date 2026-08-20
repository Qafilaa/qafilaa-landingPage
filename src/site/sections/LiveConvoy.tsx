// Generated from `Qafilaa Site v2.dc.html` (handoff 11), lines 597-628.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function LiveConvoy() {
  return (
    <section id="ride" data-sec="Live convoy" data-tone="night" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 15 · The live convoy</div>
        <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(32px,4.2vw,56px)', lineHeight: '1.06', letterSpacing: '-.02em', margin: '0', maxWidth: '20ch' }}>Not "share my location." The whole group, on one screen, all the time.</h2>
        <p data-rv="1" style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--mut)', maxWidth: '66ch', margin: '22px 0 0' }}>Positions ride their own lane so they arrive even when everything else is queued. A rider who joins late still sees where everyone is, not an empty map.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '44px', alignItems: 'center', marginTop: '44px' }} data-cols="1">
          <div style={{ background: '#04262A', border: '1px solid #0A5057', borderRadius: '20px', overflow: 'hidden' }}>
            <div data-convoymap="1" style={{ position: 'relative', height: '430px' }}></div>
            <div style={{ padding: '14px 18px 18px', borderTop: '1px solid #0A5057' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#9CC4C4' }}>
                <span>Replay the last 20 minutes</span><span data-scrubtime="1" style={{ color: '#14C3CE' }}>Live</span>
              </div>
              <input data-scrub="1" type="range" min="0" max="100" defaultValue="100" aria-label="Convoy replay" style={{ width: '100%', height: '32px', marginTop: '6px', accentColor: '#0E9AA7' }} />
              <div style={{ fontSize: '13px', color: '#9CC4C4' }}>Stretch is the distance from lead to sweep.</div>
            </div>
          </div>
          <div data-dock="1" data-screen="convoy" data-scale="0.56" data-kind="tab" data-flow="convoy,convoyList,riderDetail,rallyLive,quickActions,broadcast"></div>
        </div>
        <div data-rv="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '20px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
          <span>Positions get a dedicated uplink</span><span style={{ opacity: '.4' }}>·</span><span>Freshness measured on the server clock</span>
        </div>
        <details className="qf-rcpt" data-rv="1" style={{ marginTop: '12px', maxWidth: '680px' }}>
          <summary style={{ cursor: 'pointer', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#14C3CE' }}>For the technically curious +</summary>
          <p style={{ margin: '10px 0 0', fontSize: '15px', lineHeight: '1.6', color: 'var(--mut)' }}>Positions publish over MQTT on a channel separate from application traffic, with a retained snapshot per rider, so a late joiner receives the current state of the convoy on connect rather than waiting for the next beacon.</p>
        </details>
        <h3 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(24px,2.6vw,34px)', letterSpacing: '-.02em', margin: '60px 0 0' }}>Who is rolling, who is stopped, who is resting.</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', marginTop: '12px' }}>
          <span data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>R4 · Muster board</span>
          <button data-ping="1" data-magnet="1" data-tap="1" style={{ padding: '12px 20px', border: '1px solid #0A5057', borderRadius: '12px', background: '#04262A', color: '#14C3CE', font: '600 15px \'Hanken Grotesk\'', cursor: 'pointer' }}>Ping crew</button>
        </div>
        <div data-musterboard="1" style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '14px', marginTop: '18px' }}></div>
        <div data-musterlive="1" aria-live="polite" style={{ marginTop: '12px', minHeight: '18px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}></div>
      </section>
  );
}

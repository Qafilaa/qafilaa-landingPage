// Generated from `Qafilaa Site v2.dc.html` (handoff 11), lines 557-574.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function TheLobby() {
  return (
    <section id="lobby" data-sec="The lobby" data-tone="clay" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 13 · Before anyone turns a key</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '52px', alignItems: 'start' }} data-cols="1">
          <div>
            <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,48px)', lineHeight: '1.1', letterSpacing: '-.02em', margin: '0', maxWidth: '16ch' }}>The lobby tells you who is actually ready.</h2>
            <p data-rv="1" style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--mut)', maxWidth: '58ch', margin: '20px 0 0' }}>Medical card filled, offline map downloaded, fuel, permits. Rows go teal as they land. One rider stays amber, and everyone can see who.</p>
            <div data-readiness="1" style={{ marginTop: '28px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', overflow: 'hidden', maxWidth: '700px' }}></div>
            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
              <div data-roles="1" style={{ flex: '1 1 330px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px' }}></div>
              <div data-offlinepack="1" style={{ flex: '1 1 300px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }} data-strip="1">
            <div data-dock="1" data-screen="lobby" data-scale="0.54" data-kind="tab" data-flow="lobby,readiness,roles,crewReadiness,offlineMap"></div>
            <div data-static="crewReadiness" data-scale="0.54" style={{ marginTop: '40px' }}></div>
          </div>
        </div>
      </section>
  );
}

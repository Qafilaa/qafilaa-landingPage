// Generated from `Qafilaa Site v2.dc.html` (handoff 13), lines 515-535.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function DayWisePlan() {
  return (
    <section id="itinerary" data-sec="Day-wise plan" data-tone="light" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 07 · Day-wise itinerary</div>
        <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,48px)', lineHeight: '1.1', letterSpacing: '-.02em', margin: '0 0 32px', maxWidth: '18ch' }}>Legs, stays, rally points. Ten days, drawn out.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '48px', alignItems: 'start' }} data-cols="1">
          <div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', overflow: 'hidden' }}>
              <div data-legmap="1" style={{ position: 'relative', height: '340px' }}></div>
              <div data-elev="1" style={{ position: 'relative', height: '176px', borderTop: '1px solid var(--line)' }}></div>
              <div data-dayrail="1" role="tablist" aria-label="Trip days" style={{ display: 'flex', gap: '8px', padding: '14px', borderTop: '1px solid var(--line)', overflowX: 'auto' }}></div>
            </div>
            <div data-rv="1" style={{ marginTop: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start', maxWidth: '640px' }}>
              <span style={{ flex: 'none', position: 'relative', width: '14px', height: '14px', marginTop: '5px' }}>
                <span style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', background: 'var(--acc2)', opacity: '.2', animation: 'qf-ring 2.6s ease-out infinite' }}></span>
                <span style={{ position: 'absolute', inset: '0', borderRadius: '50%', background: 'var(--acc2)' }}></span>
              </span>
              <p style={{ margin: '0', fontSize: '17px', lineHeight: '1.6', color: 'var(--mut)' }}><b style={{ color: 'var(--ink)' }}>A rally point is the plan for when the plan fails.</b> Agreed before you leave. If comms drop, everyone rides to the next one and waits. No phone required.</p>
            </div>
          </div>
          <div data-dock="1" data-screen="itinerary" data-scale="0.56" data-kind="push" data-flowname="Build the days" data-flow="itinerary,dayLegs,legDetail,rallySheet,restDay,dayComplete"></div>
        </div>
      </section>
  );
}

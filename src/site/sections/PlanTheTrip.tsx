// Generated from `Qafilaa Site v3.dc.html` (handoff 14), lines 481-495.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function PlanTheTrip() {
  return (
    <section id="plan" data-sec="Plan the trip" data-tone="light" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: 'var(--qf-fs-11)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 05 · Plan the trip</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0,1fr)', gap: '64px', alignItems: 'center' }} data-cols="1">
          <div data-dock="1" data-screen="createTrip" data-scale="0.58" data-kind="push" data-flowname="Start a trip" data-flow="createTrip,tripDetail,itinerary"></div>
          <div>
            <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,48px)', lineHeight: '1.1', letterSpacing: '-.02em', margin: '0', maxWidth: '16ch' }}>Name it, date it, and the plan builds itself.</h2>
            <div data-tripcard="1" data-rv="1" style={{ marginTop: '30px', maxWidth: '520px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '16px', padding: '22px' }}></div>
            <div data-rv="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '22px', maxWidth: '620px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: 'var(--qf-fs-11)', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
              <span>Overlapping trips are refused</span><span style={{ opacity: '.4' }}>·</span>
              <span>Move the start, the whole plan cascades</span><span style={{ opacity: '.4' }}>·</span>
              <span>Read-only 3 days after the end</span>
            </div>
          </div>
        </div>
      </section>
  );
}

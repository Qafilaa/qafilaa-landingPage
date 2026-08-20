// Generated from `Qafilaa Site v2.dc.html` (handoff 12), lines 549-586.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function PapersAndLists() {
  return (
    <section id="papers" data-sec="Papers &amp; lists" data-tone="paper" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 10 · Papers, permits and lists</div>
        <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,48px)', lineHeight: '1.1', letterSpacing: '-.02em', margin: '0 0 34px', maxWidth: '20ch' }}>The dull things that end rides when they are missing.</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '48px', alignItems: 'start' }} data-cols="1">
          <div data-autogrid="1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px', alignItems: 'start' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px' }}>
              <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>Checklists</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginTop: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '21px', fontWeight: '500' }}>Pre-departure</div>
                <div data-cltoggle="1" data-seg="1" style={{ display: 'flex', gap: '4px', padding: '4px', background: 'color-mix(in srgb, var(--ink) 7%, transparent)', borderRadius: '999px' }}></div>
              </div>
              <div data-checklist="1" style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '2px' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
                <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true"><circle cx="17" cy="17" r="14" fill="none" stroke="var(--line)" strokeWidth="4"></circle><circle data-clring="1" cx="17" cy="17" r="14" fill="none" stroke="var(--acc2)" strokeWidth="4" strokeLinecap="round" strokeDasharray="88" strokeDashoffset="88" transform="rotate(-90 17 17)" style={{ transition: 'stroke-dashoffset .4s cubic-bezier(.22,.61,.36,1)' }}></circle></svg>
                <span data-clcount="1" style={{ fontSize: '14px', color: 'var(--mut)' }}>0 of 6 packed</span>
                <span data-clstamp="1" style={{ opacity: '0', transition: 'opacity .3s', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '12px', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--acc2)', border: '2px solid var(--acc2)', borderRadius: '6px', padding: '4px 8px', transform: 'rotate(-8deg)' }}>All packed</span>
              </div>
              <p style={{ margin: '14px 0 0', fontSize: '14px', color: 'var(--mut)' }}>Your personal list stays private.</p>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px' }}>
              <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>Reminders</div>
              <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '21px', fontWeight: '500', marginTop: '12px' }}>Time, or place.</div>
              <p style={{ margin: '10px 0 16px', fontSize: '15px', color: 'var(--mut)', lineHeight: '1.55' }}>Remind me to fill up when I am 10 km from Sarchu.</p>
              <div data-geofence="1" style={{ position: 'relative', height: '190px', borderRadius: '12px', border: '1px solid var(--line)', overflow: 'hidden' }}></div>
            </div>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '22px' }}>
              <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>Permits &amp; documents</div>
              <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '21px', fontWeight: '500', marginTop: '12px' }}>Per-rider, per-permit.</div>
              <p style={{ margin: '10px 0 14px', fontSize: '15px', color: 'var(--mut)', lineHeight: '1.55' }}>Inner Line permits tracked for every rider, and shared documents any crew member can open at a checkpoint.</p>
              <div data-permitrows="1" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}></div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }} data-strip="1">
            <div data-dock="1" data-screen="permits" data-scale="0.56" data-kind="push" data-flow="permits,docViewer,checklist,reminders"></div>
            <div data-static="reminders" data-scale="0.54" style={{ marginTop: '40px' }}></div>
          </div>
        </div>
      </section>
  );
}

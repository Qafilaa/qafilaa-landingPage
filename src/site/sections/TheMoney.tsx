// Generated from `Qafilaa Site v2.dc.html` (handoff 12), lines 519-546.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function TheMoney() {
  return (
    <section id="money" data-sec="The money" data-tone="light" data-pad="1" style={{ position: 'relative', zIndex: '5', padding: '110px 56px 110px 132px' }}>
        <div data-plot="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)', marginBottom: '24px' }}>Waypoint 09 · Settled before you are home</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: '56px', alignItems: 'start' }} data-cols="1">
          <div>
            <h2 data-lines="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(30px,3.6vw,48px)', lineHeight: '1.1', letterSpacing: '-.02em', margin: '0', maxWidth: '16ch' }}>Drag the amount. Watch it settle.</h2>
            <div style={{ marginTop: '28px', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: '18px', padding: '24px' }}>
              <div data-splitcats="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}></div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                <span data-splitamt="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '42px', fontVariantNumeric: 'tabular-nums' }}>₹4,800</span>
                <span data-splitpayer="1" style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>paid by Akash</span>
              </div>
              <input data-splitslider="1" type="range" min="400" max="20000" step="100" defaultValue="4800" aria-label="Expense amount" style={{ width: '100%', height: '32px', marginTop: '12px', accentColor: '#0E7C86' }} />
              <div data-splitviz="1" style={{ position: 'relative', marginTop: '12px', height: '200px' }}></div>
            </div>
            <div data-rv="1" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', marginTop: '18px', maxWidth: '680px', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sur)' }}>
              <span>Settle up in the fewest transfers</span><span style={{ opacity: '.4' }}>·</span><span>Works offline, reconciles later</span>
            </div>
            <details className="qf-rcpt" data-rv="1" style={{ marginTop: '12px', maxWidth: '680px' }}>
              <summary style={{ cursor: 'pointer', fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--acc)' }}>For the technically curious +</summary>
              <p style={{ margin: '10px 0 0', fontSize: '15px', lineHeight: '1.6', color: 'var(--mut)' }}>Amounts are held as integer paise, so a six-way split of ₹100 never loses a rupee to rounding. Twenty categories, each with its own default payer.</p>
            </details>
          </div>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }} data-strip="1">
            <div data-dock="1" data-screen="addExpense" data-scale="0.56" data-kind="sheet" data-flow="addExpense,balances,settle,money"></div>
            <div data-static="balances" data-scale="0.54" style={{ marginTop: '40px' }}></div>
          </div>
        </div>
      </section>
  );
}

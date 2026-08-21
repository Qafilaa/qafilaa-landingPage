// Generated from `Qafilaa Site v2.dc.html` (handoff 13), lines 1362-1401.
// Transcribed 1:1 — every data-* hook is read by src/site/engine.ts,
// which has no compile-time link to this markup. Do not rename them.

export function SecurityBody() {
  return (
    <article>
            <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E6B63' }}>qafilaa.in/security</div>
            <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '19px', fontWeight: '500', color: '#0A6068', marginTop: '22px' }}>How we hold the things you trust us with</div>
            <h1 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: 'clamp(38px,5vw,58px)', lineHeight: '1.04', letterSpacing: '-.025em', margin: '10px 0 0' }}>Security</h1><div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '12px', letterSpacing: '.14em', textTransform: 'uppercase', color: '#6E6B63', marginTop: '18px' }}>Last updated: 20/08/2026</div>
            <p style={{ margin: '20px 0 0', maxWidth: '64ch', fontSize: '19px', lineHeight: '1.6', color: '#4A4842', textWrap: 'pretty' }}>Qafilaa holds a live map of where people are and, if they filled it in, their blood group. We take that seriously. No system is perfectly secure, so here is what we actually do rather than a claim that nothing can go wrong.</p>

            <div style={{ marginTop: '38px', maxWidth: '70ch', padding: '24px 28px', borderLeft: '2px solid #0E7C86', background: '#FFFFFF' }}>
              <div style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontSize: '11px', letterSpacing: '.16em', textTransform: 'uppercase', color: '#6E6B63' }}>In plain English</div>
              <ul style={{ margin: '14px 0 0', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '16.5px', lineHeight: '1.6', color: '#4A4842' }}>
                <li>Everything travels encrypted, and documents are stored encrypted at rest.</li>
                <li>Accelerometer samples never leave your phone. Only the resulting alert does.</li>
                <li>There is no public map, and no endpoint that returns a stranger's position.</li>
                <li>Deleting your account removes the stored files too, not just the database rows.</li>
                <li>Found a hole? Tell us at <a href="mailto:admin@qafilaa.in?subject=Security">admin@qafilaa.in</a>. We will not come after you for reporting it in good faith.</li>
              </ul>
            </div>

            <div data-legalbody="1" style={{ maxWidth: '70ch' }}>
              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>In transit and at rest</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>All traffic between the app and our servers runs over TLS. Position updates publish on a channel separate from application traffic, with a retained snapshot per rider so a late joiner receives the current state of the convoy on connect. Documents and images you upload — licence, RC, insurance, permits, trip photos — are stored encrypted, and the stored file is removed when you delete the record, not orphaned in a bucket.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>What never leaves your phone</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>Crash detection reads the accelerometer continuously while you ride. Those samples are processed on the device and are never uploaded. What reaches us is the conclusion — an alert with your position, bearing and blood group — not the raw motion stream. Your phonebook is the same: if you grant contacts access, it is read locally so you can pick an emergency contact, and the address book is not uploaded.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>Who can reach your position</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>Location is scoped to a ride, not to an account. Riders in your active ride can see you while that ride is active; nobody else can, and there is no public map and no endpoint that will return a stranger's position. When the ride ends, sharing stops. Access to production data inside Qafilaa is limited to the people who need it to run the service.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>Working offline, safely</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>Every screen reads from the phone's own storage first, and writes are queued locally with a client-generated key so a retry after a dropped connection can never double-post. Cached data on your device is protected by the operating system's app sandbox and your device lock. If you lose the phone, delete your account and the sign-in sessions and position credentials go with it, so nothing can reconnect afterwards.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>Retention, deletion and backups</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>Raw location traces delete automatically after 90 days, or 7 if you shorten the window. Server logs and routine backups age out within 30 days. Account deletion runs as a single transaction — it either all goes or none of it does — so an account is never left half-erased. The detail is in <a href="/delete-account">Delete your account</a> and section 6 of the <a href="/privacy-policy">Privacy Policy</a>.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>Reporting a vulnerability</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>If you find something, email <a href="mailto:admin@qafilaa.in?subject=Security%20report">admin@qafilaa.in</a> with enough detail to reproduce it. We will acknowledge within three working days and keep you posted while we fix it. Please do not test against other people's accounts or rides, do not exfiltrate data, and give us a reasonable window before disclosing publicly. We will not pursue legal action against anyone who reports in good faith and follows this.</p>

              <h2 style={{ fontFamily: '\'Space Grotesk\',sans-serif', fontWeight: '600', fontSize: '23px', lineHeight: '1.25', letterSpacing: '-.01em', margin: '56px 0 0' }}>If something goes wrong</h2>
              <p style={{ margin: '14px 0 0', fontSize: '17px', lineHeight: '1.72', color: '#4A4842', textWrap: 'pretty' }}>In the event of a personal data breach we will notify the Data Protection Board of India and affected users as required under the Digital Personal Data Protection Act, 2023, and we will tell you what happened, what data was involved and what we are doing about it. Our Grievance Officer is <a href="mailto:admin@qafilaa.in">admin@qafilaa.in</a>.</p>
            </div>
          </article>
  );
}

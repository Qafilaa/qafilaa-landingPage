import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { colors, fonts } from '../theme';
import { Logo } from './icons';

export type LegalDoc = 'privacy' | 'terms' | null;

interface LegalModalProps {
  /** Which document to show, or null when the modal is closed. */
  legal: LegalDoc;
  onClose: () => void;
}

const h3: CSSProperties = {
  fontFamily: fonts.display,
  fontSize: 16,
  fontWeight: 600,
  color: colors.text,
  margin: '26px 0 8px',
};
const para: CSSProperties = { color: colors.textMuted, fontSize: 14.5, lineHeight: 1.65, margin: '0 0 8px' };
const paraTight: CSSProperties = { ...para, margin: '0 0 4px' };
const list: CSSProperties = {
  margin: '6px 0 8px',
  paddingLeft: 20,
  color: colors.textMuted,
  fontSize: 14.5,
  lineHeight: 1.65,
};
const li: CSSProperties = { margin: '0 0 5px' };
const strong: CSSProperties = { color: colors.text, fontWeight: 600 };
const linkStyle: CSSProperties = { color: colors.accent, textDecoration: 'none' };
const noteAmber: CSSProperties = {
  display: 'flex',
  gap: 10,
  padding: '12px 14px',
  borderRadius: 12,
  background: 'rgba(255,176,32,0.07)',
  border: '1px solid rgba(255,176,32,0.22)',
  margin: '0 0 18px',
};
const dateLine: CSSProperties = { fontSize: 13, color: colors.textDim, margin: '0 0 22px' };

function Mail({ children }: { children: ReactNode }) {
  return (
    <a href={`mailto:${children}`} style={linkStyle}>
      {children}
    </a>
  );
}

function Privacy() {
  return (
    <div>
      <div style={noteAmber}>
        <span style={{ fontSize: 12.5, color: '#E0B96A', lineHeight: 1.55 }}>
          This is a starter draft and not legal advice, please have a qualified Indian legal professional review it
          before publishing.
        </span>
      </div>
      <p style={dateLine}>Last updated: 20/07/2026</p>

      <h3 style={h3}>1. Who we are</h3>
      <p style={para}>
        Qafilaa (“Qafilaa”, “we”, “us”, “our”) is a group-ride coordination service operated by Qafilaa.in, with its
        registered office at Yashree, Plot no. 41 &amp; 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur,
        Maharashtra 416011, India. We are the Data Fiduciary responsible for the personal data described in this policy.
      </p>
      <p style={para}>
        This policy explains what personal data we collect, why we collect it, how we use and protect it, and the
        rights you have under applicable law, including the Digital Personal Data Protection Act, 2023.
      </p>

      <h3 style={h3}>2. The data we collect</h3>
      <p style={paraTight}>
        <strong style={strong}>When you join the waitlist or contact us</strong>
      </p>
      <ul style={list}>
        <li style={li}>Your email address (and your name, if you provide it).</li>
        <li style={li}>Any message content you send us.</li>
      </ul>
      <p style={paraTight}>
        <strong style={strong}>When you use our website</strong>
      </p>
      <ul style={list}>
        <li style={li}>
          Basic technical and usage data such as device type, browser, approximate location derived from IP, pages
          viewed, and referring links, collected through analytics and cookies (see Section 9).
        </li>
      </ul>
      <p style={paraTight}>
        <strong style={strong}>When you use the Qafilaa app (on launch)</strong>
      </p>
      <ul style={list}>
        <li style={li}>Account details you provide (such as name and email).</li>
        <li style={li}>A display name or initials shown to other riders in a ride.</li>
        <li style={li}>Location data, your live position, altitude, and movement, while a ride is active.</li>
        <li style={li}>
          Device and diagnostic data needed to run the service, such as device identifiers, app version, and crash
          logs.
        </li>
        <li style={li}>Content you create, such as ride names, rally points, and pins.</li>
      </ul>
      <p style={para}>We do not knowingly collect more than we need to run the service.</p>

      <h3 style={h3}>3. Why we use your data and our legal basis</h3>
      <p style={paraTight}>
        We process your personal data on the basis of your consent and to provide the service you have requested.
        Specifically, we use it to:
      </p>
      <ul style={list}>
        <li style={li}>Send you your beta invite and service-related updates (waitlist).</li>
        <li style={li}>Operate the live convoy map, gap tracking, rally points, and SOS features.</li>
        <li style={li}>Share your location with the other riders in your active ride (see Section 4).</li>
        <li style={li}>Maintain, secure, troubleshoot, and improve the service.</li>
        <li style={li}>Respond to your enquiries and provide support.</li>
        <li style={li}>Comply with legal obligations.</li>
      </ul>
      <p style={para}>
        We do not sell your personal data, and we do not use it for advertising you across other services.
      </p>

      <h3 style={h3}>4. How location data is shared</h3>
      <p style={paraTight}>
        Location sharing is the core of Qafilaa, and we have designed it to be tightly scoped:
      </p>
      <ul style={list}>
        <li style={li}>
          Your live location is shared only with the other riders in your active ride, and only while that ride is
          active.
        </li>
        <li style={li}>When a ride ends, live location sharing stops.</li>
        <li style={li}>
          If you lose signal, your last-known position is cached and shown to your ride with a timestamp until your
          device reconnects.
        </li>
        <li style={li}>There is no public map. Strangers cannot see your location.</li>
        <li style={li}>
          You can stop sharing by leaving a ride or closing the app, subject to how the feature works at launch.
        </li>
      </ul>

      <h3 style={h3}>5. Who we share data with</h3>
      <p style={paraTight}>We may share personal data with:</p>
      <ul style={list}>
        <li style={li}>The riders in your active ride, as described above.</li>
        <li style={li}>
          Service providers who help us run Qafilaa (for example hosting, analytics, email delivery, and crash
          reporting), under appropriate confidentiality and data-protection obligations, and only as needed.
        </li>
        <li style={li}>
          Authorities or third parties where required by law, or to protect the rights, safety, or property of users or
          the public.
        </li>
      </ul>
      <p style={para}>
        In the event of a merger, acquisition, or restructuring, data may be transferred as part of that transaction,
        subject to this policy.
      </p>

      <h3 style={h3}>6. Data retention</h3>
      <p style={paraTight}>We keep personal data only as long as needed for the purposes above:</p>
      <ul style={list}>
        <li style={li}>
          Waitlist emails are retained until you ask us to remove them or until the waitlist purpose ends.
        </li>
        <li style={li}>
          Ride and location data is retained for the limited period needed to operate the feature and is not kept as a
          permanent location history beyond what the service requires.
        </li>
        <li style={li}>We may retain certain data longer where required for legal, security, or accounting reasons.</li>
      </ul>

      <h3 style={h3}>7. Security</h3>
      <p style={para}>
        We use reasonable technical and organisational safeguards to protect personal data against unauthorised access,
        loss, or misuse. No system is perfectly secure, but we work to protect your information and to limit who within
        Qafilaa can access it.
      </p>

      <h3 style={h3}>8. Your rights</h3>
      <p style={paraTight}>Subject to applicable law, including the DPDP Act, you have the right to:</p>
      <ul style={list}>
        <li style={li}>Access the personal data we hold about you and a summary of how it is processed.</li>
        <li style={li}>Correct, complete, or update inaccurate or incomplete data.</li>
        <li style={li}>Erase your personal data where it is no longer needed.</li>
        <li style={li}>Withdraw consent at any time (this will not affect processing already carried out).</li>
        <li style={li}>Grievance redressal, raise a complaint with us about how your data is handled.</li>
        <li style={li}>Nominate another individual to exercise your rights in the event of death or incapacity.</li>
      </ul>
      <p style={para}>
        To exercise any of these, email <Mail>hello@qafilaa.in</Mail>. We may need to verify your identity before
        acting on a request.
      </p>

      <h3 style={h3}>9. Cookies and analytics</h3>
      <p style={para}>
        We use a small number of cookies and similar technologies to keep the website running and to understand what is
        working so we can improve it. We do not use them to track you across unrelated websites. You can control cookies
        through your browser settings; disabling some may affect how the site works.
      </p>

      <h3 style={h3}>10. Children</h3>
      <p style={para}>
        The Qafilaa service is intended for adults. We do not knowingly collect personal data from children
        (individuals under 18) without verifiable parental or lawful-guardian consent, as required under the DPDP Act.
        If you believe a child has provided us data without such consent, contact us and we will take appropriate steps.
      </p>

      <h3 style={h3}>11. Data transfers</h3>
      <p style={para}>
        We may process or store data on servers located in or outside India through our service providers. Where data
        is transferred, we take steps to ensure it is handled in line with this policy and applicable law.
      </p>

      <h3 style={h3}>12. Grievance Officer</h3>
      <p style={paraTight}>
        In line with applicable Indian law, you can contact our Grievance Officer for any concern about your personal
        data:
      </p>
      <ul style={list}>
        <li style={li}>Name: Yash Turmbekar</li>
        <li style={li}>
          Email: <Mail>admin@qafilaa.in</Mail>
        </li>
        <li style={li}>
          Address: Yashree, Plot no. 41 &amp; 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur, Maharashtra
          416011
        </li>
      </ul>
      <p style={para}>We will acknowledge and respond to grievances within the timelines required by law.</p>

      <h3 style={h3}>13. Changes to this policy</h3>
      <p style={para}>
        We may update this policy from time to time. We will post the updated version here with a revised “Last
        updated” date, and where appropriate we will notify you. Continued use of the service after changes means you
        accept the updated policy.
      </p>

      <h3 style={h3}>14. Contact us</h3>
      <p style={para}>
        Questions about this policy or your data? Email <Mail>hello@qafilaa.in</Mail> or write to Qafilaa.in, Yashree,
        Plot no. 41 &amp; 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur, Maharashtra 416011, India.
      </p>
    </div>
  );
}

function Terms() {
  return (
    <div>
      <div style={noteAmber}>
        <span style={{ fontSize: 12.5, color: '#E0B96A', lineHeight: 1.55 }}>
          This is a starter draft and not legal advice, please have a qualified Indian legal professional review it
          before publishing.
        </span>
      </div>
      <p style={dateLine}>Effective date: 20/07/2026</p>

      <h3 style={h3}>1. Agreement to these terms</h3>
      <p style={para}>
        These Terms of Use (“Terms”) govern your access to and use of the Qafilaa website, waitlist, and, on launch, the
        Qafilaa application and related services (together, the “Service”), operated by Qafilaa.in (“Qafilaa”, “we”,
        “us”). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the Service.
      </p>

      <h3 style={{ ...h3, color: '#FF8A80' }}>2. Important safety notice, please read</h3>
      <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(255,82,71,0.07)', border: '1px solid rgba(255,82,71,0.22)', margin: '0 0 8px' }}>
        <p style={para}>
          <strong style={strong}>
            Qafilaa is a coordination tool to help a group stay together. It is not an emergency, rescue, medical, or
            navigation service, and it does not replace any of them.
          </strong>
        </p>
        <ul style={list}>
          <li style={li}>
            Qafilaa depends on mobile signal, GPS, device battery, and your devices working correctly. In remote and
            mountainous areas, these are frequently unavailable or unreliable.
          </li>
          <li style={li}>
            The SOS feature can only reach riders who have signal and a working device. It does not contact emergency
            services or guarantee that help will arrive.
          </li>
          <li style={li}>
            Location, distance, altitude, and ETA information may be delayed, inaccurate, or unavailable, especially
            offline.
          </li>
          <li style={li}>
            You must always carry independent safety equipment, share your route and plans with someone outside the
            ride, and follow local laws and conditions.
          </li>
          <li style={li}>You ride and travel at your own risk. You are responsible for your own safety and decisions.</li>
        </ul>
        <p style={{ ...para, margin: 0 }}>
          Do not rely on Qafilaa as your only means of communication or safety in the backcountry.
        </p>
      </div>

      <h3 style={h3}>3. Eligibility</h3>
      <p style={para}>
        You must be at least 18 years old, or have the consent and supervision of a parent or lawful guardian, to use
        the Service. By using the Service you confirm you meet this requirement and can form a binding agreement.
      </p>

      <h3 style={h3}>4. The Service</h3>
      <p style={para}>
        Qafilaa lets a group share a live map, track gaps between riders, set rally points, assign roles such as lead
        and sweep, hold last-known positions when signal drops, and broadcast a one-tap SOS to the group. Features
        described on our website are subject to change, and during the public beta the Service is provided on an
        evolving, “as-is” basis.
      </p>

      <h3 style={h3}>5. Waitlist and beta</h3>
      <p style={para}>
        By joining the waitlist you agree to receive launch-related email from us. Beta access is offered at our
        discretion and may be limited, changed, or withdrawn. Beta features may be incomplete, may change, and may not
        always work as intended.
      </p>

      <h3 style={h3}>6. Accounts and ride links</h3>
      <p style={para}>
        You are responsible for keeping any account credentials and ride-join links secure. Anyone with an active ride
        link may be able to join that ride; share links only with people you intend to ride with. You are responsible
        for activity that occurs through your account or the rides you create.
      </p>

      <h3 style={h3}>7. Your responsibilities and acceptable use</h3>
      <p style={paraTight}>When using the Service, you agree that you will not:</p>
      <ul style={list}>
        <li style={li}>Use it for any unlawful, harmful, or fraudulent purpose.</li>
        <li style={li}>
          Share another person’s location through the Service without their knowledge and agreement to participate in
          the ride.
        </li>
        <li style={li}>Misuse the SOS feature or send false alerts.</li>
        <li style={li}>Attempt to disrupt, reverse-engineer, overload, or gain unauthorised access to the Service.</li>
        <li style={li}>Use the Service to harass, stalk, endanger, or track anyone without their consent.</li>
      </ul>
      <p style={para}>
        You are responsible for ensuring everyone in your ride understands that their location is shared with the group
        while the ride is active.
      </p>

      <h3 style={h3}>8. Intellectual property</h3>
      <p style={para}>
        The Service, including its software, design, content, and branding, is owned by Qafilaa and its licensors and
        is protected by law. We grant you a limited, non-exclusive, non-transferable, revocable licence to use the
        Service for its intended purpose. You may not copy, modify, distribute, or create derivative works except as
        permitted by law or with our written consent. Content you create (such as ride names and pins) remains yours;
        you grant us the limited rights needed to operate the Service.
      </p>

      <h3 style={h3}>9. Pricing and payment</h3>
      <p style={para}>
        Waitlist riders receive the first season free, with locked-in early pricing afterward. Final plans and prices
        will be published before launch. Where paid features apply, the applicable payment terms will be presented to
        you before you are charged.
      </p>

      <h3 style={h3}>10. Disclaimer of warranties</h3>
      <p style={para}>
        To the maximum extent permitted by law, the Service is provided “as is” and “as available”, without warranties
        of any kind, whether express or implied, including fitness for a particular purpose, accuracy, reliability, or
        uninterrupted or error-free operation. We do not warrant that location data, connectivity, or the SOS feature
        will be available or accurate at any given time.
      </p>

      <h3 style={h3}>11. Limitation of liability</h3>
      <p style={para}>
        To the maximum extent permitted by law, Qafilaa and its team will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or for any loss of data, injury, or harm, arising from or related
        to your use of or inability to use the Service, including any reliance on its location, connectivity, or SOS
        features. Nothing in these Terms excludes liability that cannot be excluded under applicable law.
      </p>

      <h3 style={h3}>12. Assumption of risk and indemnity</h3>
      <p style={para}>
        You acknowledge that riding, driving, trekking, and travelling in remote and mountainous terrain carry inherent
        risks, and you assume those risks. You agree to indemnify and hold harmless Qafilaa and its team from claims,
        losses, and expenses arising from your use of the Service, your breach of these Terms, or your violation of any
        law or the rights of others.
      </p>

      <h3 style={h3}>13. Termination</h3>
      <p style={para}>
        We may suspend or end your access to the Service at any time if you breach these Terms or to protect the Service
        or its users. You may stop using the Service at any time. Provisions that by their nature should survive
        termination will survive.
      </p>

      <h3 style={h3}>14. Changes to the Service and these Terms</h3>
      <p style={para}>
        We may change, suspend, or discontinue parts of the Service, and we may update these Terms from time to time. We
        will post the updated Terms here with a revised effective date. Continued use after changes means you accept the
        updated Terms.
      </p>

      <h3 style={h3}>15. Governing law and jurisdiction</h3>
      <p style={para}>
        These Terms are governed by the laws of India. Subject to any applicable dispute-resolution process, you agree
        that the courts at Kolhapur, India, will have exclusive jurisdiction over any disputes arising from these Terms
        or the Service.
      </p>

      <h3 style={h3}>16. Contact</h3>
      <p style={para}>
        Questions about these Terms? Email <Mail>hello@qafilaa.in</Mail> or write to Qafilaa.in, Yashree, Plot no. 41
        &amp; 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur, Maharashtra 416011, India.
      </p>
    </div>
  );
}

export function LegalModal({ legal, onClose }: LegalModalProps) {
  useEffect(() => {
    if (!legal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [legal, onClose]);

  const title = legal === 'terms' ? 'Terms of Service' : 'Privacy Policy';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        display: legal ? 'flex' : 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: 'clamp(18px,5vh,60px) 18px',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(3,7,6,0.82)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 720,
          background: colors.surface,
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 22,
          boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            padding: '20px 26px',
            background: 'rgba(12,19,17,0.97)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: colors.surfaceInset,
                border: '1px solid rgba(32,214,168,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Logo size={18} />
            </div>
            <h2 style={{ fontFamily: fonts.display, fontSize: 21, fontWeight: 600, margin: 0, letterSpacing: '-0.01em' }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 11,
              border: '1px solid rgba(255,255,255,0.10)',
              background: '#121b18',
              color: colors.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color .2s, border-color .2s',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <div style={{ padding: '26px 28px 36px' }}>{legal === 'terms' ? <Terms /> : <Privacy />}</div>
      </div>
    </div>
  );
}

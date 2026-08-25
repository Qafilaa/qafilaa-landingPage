// Published contact and trader identity. Satisfies App Store Review Guideline
// 1.2 ("published contact information"), the EU Digital Services Act trader
// disclosure, and India's DPDP Act grievance-officer publication requirement.
// The address, email and phone here must match what is filed in App Store
// Connect and Play Console.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

const ADDRESS =
  'Yashree, Plot no. 41 & 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur, Maharashtra 416011, India';

export function ContactBody() {
  return (
    <Doc
      slug="qafilaa.in/contact"
      deck="Who we are, and how to reach a person"
      title="Contact"
      lede="One inbox, read by the people who build this. There is no ticket-deflection maze and no chatbot. If you need help using Qafilaa, the Help centre is faster; if you need to reach us formally, everything you need is on this page."
      updated="20/08/2026"
    >
      <Callout label="Fastest route">
        <UL>
          <li>
            <b>Help with the app</b>: <a href="/support">Help centre</a>, or in-app, where a query gets a
            ticket and a timeline you can follow.
          </li>
          <li>
            <b>Something unsafe or abusive</b>: <a href="/report">Report content</a>.
          </li>
          <li>
            <b>Anything else</b>: <Mail />, answered by a person.
          </li>
        </UL>
      </Callout>

      <H2>Business details</H2>
      <Rows
        rows={[
          ['Service', 'Qafilaa'],
          ['Operated by', 'Qafilaa.in'],
          ['Registered address', ADDRESS],
          ['Email', <Mail key="e" />],
          [
            'Phone',
            <span key="p">
              <a href="tel:+918830997757">+91 88309 97757</a>, also on{' '}
              <a href="https://wa.me/918830997757" target="_blank" rel="noopener">
                WhatsApp
              </a>
            </span>,
          ],
          ['Country of establishment', 'India'],
        ]}
      />
      <P>
        These are the details we file with Apple and Google as our trader information under the EU Digital
        Services Act, and they are the details shown on our store listings. If what you see on a store page
        differs from what is here, tell us. One of the two is out of date and we want to know which.
      </P>

      <H2>Named contacts</H2>
      <Rows
        rows={[
          [
            'Grievance Officer',
            'Yash Turmbekar, for any complaint about how your personal data is handled, under the Digital Personal Data Protection Act, 2023.',
          ],
          [
            'Child safety',
            <span key="c">
              Yash Turmbekar. See <a href="/child-safety">Child safety</a> for our standards and what we do.
            </span>,
          ],
          [
            'Security reports',
            <span key="s">
              <a href="/security">Security</a>. We will not come after you for reporting a hole in good faith.
            </span>,
          ],
          ['Accessibility', <a key="a" href="/accessibility">Accessibility</a>],
        ]}
      />
      <P>
        All of the above are reachable at <Mail />. Put the subject in the subject line and it gets routed
        correctly.
      </P>

      <H2>How long we take</H2>
      <Rows
        rows={[
          ['Child safety reports', 'Immediately, ahead of everything.'],
          ['Reports of abusive or objectionable content', 'Reviewed and actioned within 24 hours.'],
          ['Security reports', 'Acknowledged within 2 working days.'],
          ['Support questions', 'Usually the same day; within 3 working days at the outside.'],
          ['Data requests and grievances', 'Within the timelines the DPDP Act requires.'],
          ['Accessibility', 'Replied to within 5 working days.'],
        ]}
      />

      <H2>What Qafilaa is not</H2>
      <P>
        <b>We are not an emergency service.</b> Qafilaa alerts the riders around you; it does not call an
        ambulance and it does not monitor alerts around the clock. In an emergency call the local emergency
        number first: <b>112</b> in India, or <b>108</b> for an ambulance. The full position is in the safety
        notice in our <a href="/terms-and-conditions">Terms</a>.
      </P>

      <H2>Legal notices</H2>
      <P>
        Notices from a public authority, court orders, and intellectual-property complaints should go to{' '}
        <Mail subject="Legal notice" /> and, if formal service is required, to the registered address above. Tell
        us the authority, the legal basis, and what you are asking for.
      </P>

      <H2>Press and partnerships</H2>
      <P>
        Same address, subject line "Press" or "Partnership". We are a small team and would rather answer
        properly than quickly.
      </P>
    </Doc>
  );
}

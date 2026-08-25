// The public reporting route. App Store Review Guideline 1.2 requires a
// mechanism to report offensive content plus published contact information;
// Google Play's UGC policy requires an in-app reporting system with a
// reachable fallback. Also serves as the notice-and-action point of contact
// under the EU Digital Services Act.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function ReportBody() {
  return (
    <Doc
      slug="qafilaa.in/report"
      deck="Something crossed a line. Tell us."
      title="Report content or a rider"
      lede="Every note, photo, message and profile in Qafilaa has a report action beside it. This page is the way in when the app is not: you left the trip, you deleted the app, or you are not a Qafilaa rider at all and something of yours ended up in it."
      updated="20/08/2026"
    >
      <Callout label="If someone is in danger right now">
        <UL>
          <li>
            Call the local emergency number first. In India that is <b>112</b>, or <b>108</b> for an ambulance.
          </li>
          <li>Qafilaa is not an emergency service and we do not monitor alerts around the clock.</li>
          <li>
            Then tell us at <Mail subject="URGENT safety report" />, with URGENT in the subject line.
          </li>
        </UL>
      </Callout>

      <H2>Reporting from inside the app</H2>
      <P>
        This is the fastest route, because it carries the context with it. Open the note, photo, message or
        rider profile, choose <b>Report</b>, pick a reason, and add anything we should know. The rider you
        report is never told who reported them.
      </P>
      <P>
        Blocking is separate and immediate: a blocked rider cannot see your position, your notes or your
        profile, and cannot be in a trip alongside you. You do not need to report someone to block them, and you
        do not need our permission.
      </P>

      <H2>Reporting from here</H2>
      <P>
        Email <Mail subject="Report content" /> and include as much of this as you have:
      </P>
      <UL>
        <li>What you saw, in your own words.</li>
        <li>Where it was: the trip name, the day, and whether it was a note, a photo, a name, or a broadcast.</li>
        <li>The display name of the rider who posted it, if you know it.</li>
        <li>A screenshot, if you can take one safely.</li>
        <li>Roughly when it happened.</li>
        <li>How to reach you, if you want to hear what we decided.</li>
      </UL>
      <P>
        You can report anonymously as far as the other riders are concerned. We will still need a way to reply
        to you if you want an answer.
      </P>

      <H2>What we do, and how fast</H2>
      <Rows
        rows={[
          ['Acknowledged', 'Within 24 hours of the report reaching us.'],
          ['Reviewed and actioned', 'Within 24 hours for content that breaks the Community guidelines.'],
          ['Child safety reports', 'Immediately, ahead of everything else. See the Child safety page.'],
          ['You are told the outcome', 'By email or in-app, unless you asked us not to contact you.'],
          ['Appeal', 'Reply to our message, or email admin@qafilaa.in with "Appeal" in the subject.'],
        ]}
      />
      <P>
        Content that looks likely to be a serious violation is hidden from the crew while we look at it, rather
        than after we decide. Accounts responsible for the most serious content are closed, not warned.
      </P>

      <H2>Other things you might be reporting</H2>
      <UL>
        <li>
          <b>A security hole.</b> Send it to <Mail subject="Security" /> and read the{' '}
          <a href="/security">Security</a> page first. We will not come after you for reporting one in good
          faith.
        </li>
        <li>
          <b>Your data, in someone else's trip.</b> If you are an emergency contact who never agreed to be one,
          or your photo is in a note you did not consent to, email us and we will remove it. You do not need a
          Qafilaa account.
        </li>
        <li>
          <b>A privacy or data-protection grievance.</b> Our Grievance Officer under the Digital Personal Data
          Protection Act, 2023 is named on the <a href="/contact">Contact</a> page.
        </li>
        <li>
          <b>Copyright or trademark.</b> Email us with the work, where it appears in Qafilaa, and your authority
          to act for the rights holder.
        </li>
        <li>
          <b>An order or notice from a public authority.</b> Send it to <Mail subject="Legal notice" /> and we
          will route it.
        </li>
      </UL>

      <H2>If you think we got it wrong</H2>
      <P>
        Every decision can be looked at again by a person. Reply to the message we sent you, or email{' '}
        <Mail subject="Appeal" /> with what we decided and why you disagree. We will not hold an appeal against
        you.
      </P>

      <H2>Reporting in bad faith</H2>
      <P>
        Reports are read by people, and a false one takes attention away from a real one. Repeatedly reporting a
        rider you simply disagree with, or filing reports to get someone removed from a trip, is itself a breach
        of the <a href="/community-guidelines">Community guidelines</a>.
      </P>
    </Doc>
  );
}

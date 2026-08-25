// Published child safety standards. This is the "standards against CSAE" URL
// Google Play's Child Safety Standards declaration asks for: it must be
// globally accessible, name the app or developer as it appears on the store
// listing, and explicitly prohibit CSAE. Keep the app name and the point of
// contact below in sync with the Play Console declaration.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function ChildSafetyBody() {
  return (
    <Doc
      slug="qafilaa.in/child-safety"
      deck="Our standards against child sexual abuse and exploitation"
      title="Child safety"
      lede="Qafilaa, published by Qafilaa.in, prohibits child sexual abuse and exploitation absolutely. This page is our published standard, the thing we will be held to, and the address to write to if you find something."
      updated="20/08/2026"
    >
      <Callout label="The short version">
        <UL>
          <li>Child sexual abuse and exploitation (CSAE) is banned on Qafilaa without exception.</li>
          <li>Child sexual abuse material (CSAM) is removed the moment we know about it, and reported.</li>
          <li>The account responsible is closed. There is no warning and no second chance.</li>
          <li>Every note, photo, message and profile in the app can be reported from inside the app.</li>
          <li>
            A named person is on the other end of <Mail subject="Child safety" />.
          </li>
        </UL>
      </Callout>

      <H2>What Qafilaa is</H2>
      <P>
        Qafilaa is a group-riding companion for motorcycle trips. It is built for adult riders. There is no
        public feed, no discovery of strangers, no random or anonymous chat, and no way to message someone who
        has not been invited into the same trip by its coordinator. Content is visible to a closed crew, not the
        open internet.
      </P>
      <P>
        We say that plainly because it shapes the risk. It does not remove it, and it does not change what we
        owe a child who ends up in front of this app.
      </P>

      <H2>What is prohibited</H2>
      <P>
        The following are prohibited on Qafilaa in every surface: profile names and photos, bike photos, trip
        and crew names, day notes and their attachments, broadcasts, documents, and anything sent to our help
        centre:
      </P>
      <UL>
        <li>
          <b>Child sexual abuse material (CSAM)</b> in any form, real, edited or generated, including drawings,
          renders and anything produced by a model.
        </li>
        <li>
          <b>Child sexual abuse and exploitation (CSAE)</b> more broadly: sexualising a minor, sexual
          commentary about a minor, or presenting a minor in a sexualised way.
        </li>
        <li><b>Grooming</b>: building a relationship with a minor to sexually exploit them.</li>
        <li><b>Sextortion</b>: threatening to release intimate imagery to coerce a minor.</li>
        <li><b>Trafficking a minor</b>, or advertising, soliciting or arranging their sexual exploitation.</li>
        <li><b>Seeking or offering CSAM</b>, including links, codes, or directions to it elsewhere.</li>
        <li><b>Normalising or promoting</b> sexual interest in minors.</li>
      </UL>
      <P>
        This list is not a limit. Anything that endangers a child is prohibited whether or not it is named here.
      </P>

      <H2>Reporting it</H2>
      <P>
        <b>Inside the app:</b> every piece of content and every rider profile has a report action next to it.
        Choose <b>Report</b>, and you can reach us without leaving the app. Blocking a rider is separate,
        immediate, and needs nobody's approval.
      </P>
      <P>
        <b>From anywhere:</b> email <Mail subject="Child safety" />. You do not need a Qafilaa account, and you
        do not need to be in the trip. Put "Child safety" in the subject line and it goes to the top of the
        queue.
      </P>
      <P>
        If a child is in immediate danger, contact the police first. In India call <b>112</b>, or the
        Childline helpline on <b>1098</b>. Qafilaa is not an emergency service.
      </P>

      <H2>What we do when we know</H2>
      <UL>
        <li>
          <b>Remove it immediately</b> on obtaining actual knowledge, ahead of every other report in the queue.
        </li>
        <li><b>Close the account</b> responsible, and block the device and sign-in identifiers where we can.</li>
        <li>
          <b>Preserve the evidence</b> (the content, the account, and the associated records) rather than
          deleting it, so an investigation is still possible.
        </li>
        <li>
          <b>Report it</b> to the appropriate authority, including the National Cyber Crime Reporting Portal
          and, where applicable, NCMEC, and cooperate with lawful requests that follow.
        </li>
        <li><b>Tell the reporter</b> that we acted, without disclosing anything about the account.</li>
      </UL>
      <P>
        We comply with the Protection of Children from Sexual Offences Act, 2012 and the Information Technology
        Act, 2000 and rules made under it, including the obligation to report.
      </P>

      <H2>Children and their data</H2>
      <P>
        Qafilaa is intended for adults. Under the Digital Personal Data Protection Act, 2023 a child is anyone
        under 18, and we do not knowingly process a child's personal data without verifiable consent from a
        parent or lawful guardian. We run no behavioural advertising and no ad profiling, on anyone.
      </P>
      <P>
        If you believe a child has given us data, email <Mail subject="Child data" /> and we will delete it. See{' '}
        <a href="/privacy-policy">Privacy Policy</a>, section 10.
      </P>

      <H2>Point of contact</H2>
      <P>
        A named person is responsible for these standards and is able to speak to how we prevent, detect and act
        on CSAE, including to Google Play and Apple.
      </P>
      <Rows
        rows={[
          ['Name', 'Yash Turmbekar'],
          ['Role', 'Child safety point of contact, Qafilaa.in'],
          ['Email', <Mail key="e" subject="Child safety" />],
          [
            'Address',
            'Yashree, Plot no. 41 & 42, Shanti Udyan, Apate Nagar, Radhanagari Road, Kolhapur, Maharashtra 416011, India',
          ],
        ]}
      />

      <H2>Keeping this current</H2>
      <P>
        These standards are reviewed at least once a year and whenever the app gains a new way for riders to
        share content. Related: <a href="/community-guidelines">Community guidelines</a>,{' '}
        <a href="/report">Report content</a>, and <a href="/privacy-policy">Privacy Policy</a>.
      </P>
    </Doc>
  );
}

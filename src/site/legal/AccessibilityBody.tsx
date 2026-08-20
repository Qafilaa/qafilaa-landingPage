// Accessibility statement. The European Accessibility Act (in force 28 June
// 2025) requires service providers to publish one, name an accessible support
// channel, and be honest about what is not yet conformant. Claims here must be
// checkable against the code — do not add one we have not implemented.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function AccessibilityBody() {
  return (
    <Doc
      slug="qafilaa.in/accessibility"
      deck="What works, what does not, and who to tell"
      title="Accessibility"
      lede="Qafilaa is a safety product. If a rider cannot read the screen that tells them their crew is two kilometres back, that is a safety failure and not a cosmetic one. This is an honest account of where we are, including the parts we have not finished."
      updated="20/08/2026"
    >
      <Callout label="The short version">
        <UL>
          <li>We aim at WCAG 2.2 level AA for this website and for the app.</li>
          <li>We are <b>partially conformant</b>. The gaps are listed below rather than hidden.</li>
          <li>Reduced-motion settings are respected. The site stops animating if you ask it to.</li>
          <li>
            Email <Mail subject="Accessibility" /> and a person will answer. That is the accessible support
            channel.
          </li>
        </UL>
      </Callout>

      <H2>What this covers</H2>
      <P>
        The qafilaa.in website, and the Qafilaa app on iOS and Android. Both are made by Qafilaa.in, Kolhapur,
        Maharashtra. Contact details are on the <a href="/contact">Contact</a> page.
      </P>

      <H2>What works today, on this site</H2>
      <UL>
        <li>
          <b>Reduced motion.</b> If your system asks for less motion, the scroll journey stops moving: no
          flying device, no staggered reveals, no typed text. Everything is simply there.
        </li>
        <li>
          <b>Keyboard.</b> A skip link is the first focusable element. Every control has a visible focus ring.{' '}
          <b>J</b> and <b>K</b> move between sections, <b>?</b> lists shortcuts, <b>Esc</b> closes.
        </li>
        <li>
          <b>Screen readers.</b> Each section is a landmark with a name. The decorative device mockups are
          marked as images and removed from the tab order, so you are not walked through several hundred
          controls that do nothing.
        </li>
        <li>
          <b>Target size.</b> Interactive controls are at least 44 px on their smallest side.
        </li>
        <li>
          <b>Text.</b> Body text is set at 17 px and up, and reflows to a single column without horizontal
          scrolling down to 320 px wide.
        </li>
        <li>
          <b>Live regions.</b> Status that changes without a page load — an alert countdown, a form result — is
          announced.
        </li>
      </UL>

      <H2>Where we fall short</H2>
      <P>
        Stated plainly, because a statement that claims full conformance is usually not true:
      </P>
      <UL>
        <li>
          <b>No independent audit yet.</b> These claims come from our own testing, not a third-party
          assessment. We will name the assessor here when there is one.
        </li>
        <li>
          <b>The home page is a scroll narrative.</b> It is navigable by keyboard and readable by a screen
          reader, but it is long, and a linear read is a slow way to reach a specific fact. The{' '}
          <a href="/support">Help centre</a> and these policy pages are plain documents and are the faster route
          to an answer.
        </li>
        <li>
          <b>Some contrast is at the boundary.</b> The small uppercase labels meet AA at their size but are
          deliberately quiet. If any of them are hard for you to read, tell us — that is exactly the report we
          want.
        </li>
        <li>
          <b>The map is visual.</b> A live convoy map is inherently spatial. Distances, gaps and rider states
          are also available as text in the crew list and the muster board, but the map itself is not a
          substitute-free experience yet.
        </li>
        <li>
          <b>The app has not been fully audited</b> against VoiceOver and TalkBack end to end. Core flows work;
          we are not going to claim more than that.
        </li>
      </UL>

      <H2>If something is not usable</H2>
      <Rows
        rows={[
          ['Email', <Mail key="e" subject="Accessibility" />],
          ['What to include', 'The page or screen, what you were trying to do, and the assistive technology you use.'],
          ['We reply within', '5 working days.'],
          ['We aim to fix within', '30 days, or tell you why it will take longer and what we will do meanwhile.'],
        ]}
      />
      <P>
        If you need something from this site in another format — a policy read out, or sent as plain text — ask
        and we will send it.
      </P>

      <H2>Riding-specific settings worth knowing</H2>
      <UL>
        <li>Battery mode reduces how often your position updates on long legs and restores it near passes.</li>
        <li>Alerts can be reduced to essentials only for the rest of a trip with a single switch.</li>
        <li>Manual SOS has three routes in — tap, hold the overlay, or flip the phone — because gloves and adrenaline are real.</li>
        <li>Recap and share cards have a dark variant for low light.</li>
      </UL>

      <H2>Standing behind this</H2>
      <P>
        This statement was prepared on 20 August 2026 by self-assessment of the current release, and is reviewed
        whenever the site or the app changes materially. If you think it overstates what we deliver, that is a
        report we want: <Mail subject="Accessibility" />.
      </P>
    </Doc>
  );
}

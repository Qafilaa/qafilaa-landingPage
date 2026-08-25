// Published community standards. App Store Review Guideline 1.2 requires apps
// with user-generated content to publish these, and Google Play's User
// Generated Content policy requires the same. Linked from the app and the site
// footer; do not move the URL without updating both stores' listings.
import { Callout, Doc, H2, Mail, P, UL } from './prose';

export function CommunityGuidelinesBody() {
  return (
    <Doc
      slug="qafilaa.in/community-guidelines"
      deck="What belongs on Qafilaa, and what does not"
      title="Community guidelines"
      lede="Qafilaa is not a public social network. There is no feed, no follower count and no way to find a stranger. Almost everything you write is visible only to the riders in the trip you were invited to. These rules still apply, because a small group is exactly where a bad actor does the most damage."
      updated="20/08/2026"
    >
      <Callout label="In plain English">
        <UL>
          <li>Write for the people on the ride. Nothing you post reaches the open internet.</li>
          <li>No harassment, no threats, no sexual content, nothing involving a child.</li>
          <li>Report anything that crosses a line. We act within 24 hours.</li>
          <li>A coordinator can remove a rider from a trip. You can block a rider outright.</li>
          <li>Faking a crash alert or an SOS is the fastest way to lose your account.</li>
        </UL>
      </Callout>

      <H2>Where these rules apply</H2>
      <P>
        Anywhere you can put words or pictures in front of another rider: your display name and profile photo,
        bike names and photos, trip and crew names, day notes and the photos attached to them, checklists,
        reminders, expense descriptions, rally-point and stay names, broadcast messages during a live ride, and
        anything you send us through the help centre.
      </P>
      <P>
        Documents you upload (licence, registration, insurance, permits) are handled separately and are not a
        posting surface. See the <a href="/privacy-policy">Privacy Policy</a> for how those are stored.
      </P>

      <H2>What is not allowed</H2>
      <UL>
        <li>
          <b>Anything sexual involving a minor.</b> Zero tolerance, no warning, immediate removal and a report to
          the authorities. Our full position is on the <a href="/child-safety">Child safety</a> page.
        </li>
        <li><b>Harassment, bullying or threats</b> against another rider, in a note, a name or a broadcast.</li>
        <li><b>Hate speech</b>: attacking someone for their religion, caste, ethnicity, nationality, gender, sexuality, disability or age.</li>
        <li><b>Sexual or pornographic content</b>, including in a profile photo or a bike name.</li>
        <li><b>Graphic violence or gore</b> posted for shock rather than to report a genuine incident on the road.</li>
        <li><b>Impersonating</b> another rider, a coordinator, a police or medical authority, or Qafilaa itself.</li>
        <li><b>Someone else's private information</b>: a phone number, an address, a document, a photo of a person who has not agreed to it.</li>
        <li><b>Illegal activity</b>, including organising the sale of drugs, weapons, or a route designed to evade a lawful checkpoint.</li>
        <li><b>Deliberately false safety signals.</b> Triggering an SOS, a crash alert or a rally-point call you know to be untrue. People change how they ride because of those.</li>
        <li><b>Spam, scams and advertising</b> aimed at a crew that did not ask for it.</li>
        <li><b>Interfering with the service</b>: scraping, reverse-engineering the location channel, or trying to read a position you were not shared.</li>
      </UL>
      <P>
        These are the lines, not the whole of good behaviour. A coordinator can set stricter expectations for
        their own trip, and we will back them.
      </P>

      <H2>Reporting something</H2>
      <P>
        Every note, photo, message and rider profile has a report action next to it in the app. If you cannot
        reach the app (you left the trip, or you deleted it), use the <a href="/report">report page</a> or
        email <Mail subject="Report content" />. Tell us what you saw and where; a screenshot helps.
      </P>
      <P>
        You do not have to be in the trip to report something you were shown, and you can report anonymously to
        the rest of the crew. We never tell the person you reported who reported them.
      </P>

      <H2>What happens after you report</H2>
      <UL>
        <li><b>Within 24 hours</b> we review the report and remove anything that breaks these rules.</li>
        <li>We tell you what we decided, at the email or number on your account.</li>
        <li>Where the content is serious enough, we suspend or remove the account that posted it.</li>
        <li>Where it is a crime, we preserve what we hold and report it to the appropriate authority.</li>
      </UL>
      <P>
        Content that is reported and looks likely to be a serious violation is hidden from the crew while we
        look at it, rather than after.
      </P>

      <H2>Blocking, and removing a rider from a trip</H2>
      <P>
        You can block a rider from your side at any time. A blocked rider cannot see your position, your notes
        or your profile, and cannot appear in a trip alongside you. Blocking is yours alone and needs nobody's
        permission.
      </P>
      <P>
        Separately, a trip coordinator can remove a rider from a trip. That ends the removed rider's access to
        that trip's plan, notes and live map immediately. It is not an alarm and it raises no alert to anyone
        else.
      </P>

      <H2>Suspension, and asking us to look again</H2>
      <P>
        Depending on what happened we may remove a single post, restrict a feature, suspend an account, or
        close it. Serious cases skip the smaller steps. If you think we got it wrong, reply to the message we
        sent you or email <Mail subject="Appeal" /> and a person will look at it again.
      </P>

      <H2>Your content stays yours</H2>
      <P>
        You keep ownership of everything you write and photograph. You give us only the permission we need to
        store it and show it to the riders you shared it with. Deleting a note deletes it for the crew;
        deleting your account removes the files too, not only the database rows. See{' '}
        <a href="/delete-account">Delete your account</a>.
      </P>

      <H2>Contact</H2>
      <P>
        Content and conduct questions: <Mail subject="Community guidelines" />. Anything time-critical involving
        someone's safety should say so in the subject line and we will treat it that way. Postal address and our
        Grievance Officer are on the <a href="/contact">Contact</a> page.
      </P>
    </Doc>
  );
}

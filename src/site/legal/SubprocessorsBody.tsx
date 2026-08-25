// The named list of third parties that can touch user data. App Store Review
// Guideline 5.1.1 requires the privacy policy to identify them and to confirm
// they give the same or greater protection; this page is where that list and
// that confirmation actually live. Keep it in step with reality.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function SubprocessorsBody() {
  return (
    <Doc
      slug="qafilaa.in/subprocessors"
      deck="Everyone who can touch your data, by name"
      title="Subprocessors"
      lede="A privacy policy that says 'we share data with service providers' tells you nothing. This is the list. Each one is here because Qafilaa cannot run without it, and each is bound to protect your data to the same standard we promise you."
      updated="20/08/2026"
    >
      <Callout label="The commitment">
        <UL>
          <li>Every party below is under a written contract with confidentiality and data-protection terms.</li>
          <li>
            Each is required to provide <b>the same or greater protection</b> of your data than our{' '}
            <a href="/privacy-policy">Privacy Policy</a> promises.
          </li>
          <li>None of them is permitted to use your data for their own purposes, or to sell it.</li>
          <li>There are no advertising networks or data brokers on this list, and there will not be.</li>
        </UL>
      </Callout>

      <H2>Running the service</H2>
      <Rows
        rows={[
          [
            'Amazon Web Services',
            'Hosting, database, object storage for your photos and documents, and the real-time channel that carries rider positions. This is where Qafilaa lives.',
          ],
          [
            'Google Firebase Cloud Messaging',
            'Delivers push notifications (crash alerts, SOS, rally-point calls) to your device. Carries the alert, not your ride data.',
          ],
          [
            'Google Firebase Crashlytics',
            'Crash diagnostics, so a bug that ends a ride can be found and fixed. Reports carry no identifier for you and no request contents.',
          ],
          [
            'Google Firebase Analytics',
            'Product analytics (which screens get opened, which actions get used) reporting into GA4. Events and screen names, not the contents of what you write. On by default in released builds; the diagnostics switch in Settings turns it and Crashlytics off together.',
          ],
          [
            'Google Maps Platform',
            'Base maps, place search and road routing. Place search and routing are proxied through our backend, so your identity is not passed on. Map tiles are drawn by Google’s own SDK on the device, which means your IP address reaches Google when a map is on screen. Offline and route-preview maps use OpenStreetMap tiles instead.',
          ],
          [
            'Open-Meteo',
            'Weather and conditions for a riding day. Receives a coordinate and a date, and nothing that identifies you. No account, no key, no tracking.',
          ],
          [
            'Apple and Google identity',
            'Only if you choose Sign in with Apple or Google. They confirm to us that you are you; we receive an identifier and, if you allow it, your email.',
          ],
        ]}
      />

      <H2>Running the website</H2>
      <P>
        Separate from the app, and much smaller. qafilaa.in itself uses:
      </P>
      <Rows
        rows={[
          ['Amazon Web Services', 'Static hosting and content delivery for this site.'],
          [
            'Google Analytics 4',
            'How many people read a page and where they arrived from. No account data, and nothing from the app. See Cookies.',
          ],
          ['Google Fonts', 'Serves the two typefaces this site is set in. Receives your IP address to do so.'],
        ]}
      />

      <H2>Where your data is processed</H2>
      <P>
        Primarily in India, and in other regions where our providers operate. Where data is transferred outside
        India, we take steps to ensure it is handled in line with our{' '}
        <a href="/privacy-policy">Privacy Policy</a> and applicable law, including the Digital Personal Data
        Protection Act, 2023. See section 11 of the policy.
      </P>

      <H2>What is not on this list, deliberately</H2>
      <UL>
        <li>No advertising network, ad exchange, or attribution SDK.</li>
        <li>No data broker, enrichment service, or people-search provider.</li>
        <li>No session recording, no heatmaps, and no behavioural profiling. The product analytics named above count screens and actions; they do not replay what you did.</li>
        <li>No third party receives your medical card, your documents, or your live position. Those stay between you, your crew, and our own infrastructure.</li>
      </UL>

      <H2>Changes</H2>
      <P>
        We update this page when a provider is added or removed. If a change materially affects how your
        personal data is handled, we will say so in the <a href="/privacy-policy">Privacy Policy</a> and, where
        appropriate, tell you directly.
      </P>
      <P>
        Think something is missing here? That is worth knowing about. Write to <Mail subject="Subprocessors" />{' '}
        and we will either add it or explain why it does not belong.
      </P>
    </Doc>
  );
}

// A human-readable mirror of the two store disclosures: Google Play's Data
// safety form and Apple's App Privacy ("nutrition label") answers. Reviewers
// and users both land here. If either store form changes, change this too —
// a mismatch between the form and this page is worse than having neither.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function DataSafetyBody() {
  return (
    <Doc
      slug="qafilaa.in/data-safety"
      deck="The store forms, in language you can actually read"
      title="Data safety"
      lede="Google Play and Apple both make us declare what Qafilaa collects, in their own categories and their own words. This page is the same set of answers written out properly, so you can check what we told them against what we tell you."
      updated="20/08/2026"
    >
      <Callout label="The four that matter">
        <UL>
          <li>
            <b>We do not sell your data.</b> Not to anyone, for anything.
          </li>
          <li>
            <b>We do not track you.</b> No advertising identifier, no ad network, no cross-app or cross-site
            tracking in the app. Apple's "Data Used to Track You" is empty.
          </li>
          <li>
            <b>Your location is shared with your crew, not the world.</b> Only the riders in your active ride,
            only while it is active. There is no public map.
          </li>
          <li>
            <b>All of it can be deleted</b>, from inside the app, without emailing anyone.
          </li>
        </UL>
      </Callout>

      <H2>What Qafilaa collects</H2>
      <P>
        Grouped in Google Play's Data safety categories. "Shared" means it leaves Qafilaa and its service
        providers; showing your position to the riders in your own trip is the service working, and is listed
        as such.
      </P>
      <UL>
        <li>
          <b>Location — precise.</b> Your position, altitude, speed and heading, continuously while a ride is
          active, including in the background. Shown to the riders in that ride. Required for the live map,
          gaps, rally points and crash alerts. Raw traces auto-delete after 90 days, or 7 if you shorten the
          window in Settings.
        </li>
        <li>
          <b>Personal info.</b> Name, email address, phone number, profile photo, and a user ID. Optionally date
          of birth and address. Required to have an account; the optional fields are optional.
        </li>
        <li>
          <b>Health and fitness.</b> The medical card you choose to fill in — blood group, allergies,
          medications, notes. Entirely optional. Shown to other riders only during an active alert.
        </li>
        <li>
          <b>Contacts.</b> The emergency contacts you nominate, by name, phone, email and relationship. If you
          allow contacts access we read your phonebook only so you can pick one. We do not upload your address
          book.
        </li>
        <li>
          <b>Photos and videos.</b> Images you add — profile, bikes, day notes, and document scans. Only the
          ones you pick or capture.
        </li>
        <li>
          <b>Files and docs.</b> Licence, registration, insurance, PUC and permits, if you store them. Stored
          encrypted.
        </li>
        <li>
          <b>App activity.</b> The content you create — trips, itineraries, rally points, stays, notes,
          checklists, reminders, expenses and settlements — and your ride history.
        </li>
        <li>
          <b>App info and performance.</b> App version, platform, and crash reports through Firebase
          Crashlytics. Crash reports carry no identifier for you and no request contents.
        </li>
        <li>
          <b>Device or other IDs.</b> A push token, so a crash or SOS alert can reach your device.
        </li>
      </UL>

      <H2>What Qafilaa does not collect</H2>
      <UL>
        <li>No advertising ID, and no advertising or analytics SDK in the app.</li>
        <li>No microphone, no call log, no SMS, no browsing history.</li>
        <li>No financial or payment information. Trip expenses are amounts between riders, not card details.</li>
        <li>No biometrics. No race, religion, caste, politics or sexual orientation.</li>
        <li>No accelerometer samples. Those are processed on the device and discarded; only an alert leaves.</li>
      </UL>

      <H2>Where it goes</H2>
      <Rows
        rows={[
          ['Riders in your active ride', 'Your live position, and — during an active alert only — your medical card.'],
          ['Service providers', 'Hosting, push delivery, crash reporting and maps. Named on the Subprocessors page.'],
          ['Authorities', 'Only where required by law, or to protect someone’s safety.'],
          ['Advertisers, data brokers', 'Never. There is no such relationship.'],
        ]}
      />

      <H2>Security answers</H2>
      <UL>
        <li>
          <b>Encrypted in transit:</b> yes, everything.
        </li>
        <li>
          <b>Encrypted at rest:</b> yes, including the stored document and image files.
        </li>
        <li>
          <b>You can request deletion:</b> yes — from inside the app, or from{' '}
          <a href="/delete-account">Delete your account</a> and <a href="/delete-data">Delete my data</a>{' '}
          without installing anything.
        </li>
        <li>
          <b>Independent security review:</b> not yet. We will say so here when that changes rather than imply
          it now.
        </li>
      </UL>

      <H2>Apple's App Privacy answers</H2>
      <Rows
        rows={[
          ['Data used to track you', 'None.'],
          [
            'Data linked to you',
            'Location, contact info, contacts, health and fitness, photos, user content, identifiers, diagnostics.',
          ],
          ['Data not linked to you', 'Crash diagnostics.'],
        ]}
      />
      <P>
        "Linked to you" is Apple's term for data tied to your account. It is not a synonym for shared, sold, or
        used to profile you — none of which happens here.
      </P>

      <H2>If this page and the store disagree</H2>
      <P>
        Tell us and we will fix whichever is wrong: <Mail subject="Data safety" />. The binding document is the{' '}
        <a href="/privacy-policy">Privacy Policy</a>; this page exists to make it checkable at a glance. See
        also <a href="/permissions">Permissions</a> and <a href="/subprocessors">Subprocessors</a>.
      </P>
    </Doc>
  );
}

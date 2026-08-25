// Plain-language permission disclosure. Supports Google Play's prominent
// disclosure requirement for background location (and the location permissions
// declaration form), and Apple's expectation that purpose strings are backed by
// a public explanation. Every row must match what the app actually requests.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function PermissionsBody() {
  return (
    <Doc
      slug="qafilaa.in/permissions"
      deck="Every permission we ask for, and the real reason"
      title="Permissions"
      lede="Qafilaa asks for a small number of permissions and each one buys a specific thing. This page says what each is for, what breaks if you refuse it, and how to take it back. The app asks for none of them at install; each is requested in context, the first time it is needed."
      updated="20/08/2026"
    >
      <Callout label="In plain English">
        <UL>
          <li>Location is the only one the app genuinely cannot work without.</li>
          <li>Background location runs only while a ride is active, and stops when the ride ends.</li>
          <li>Motion data is read on your phone and never uploaded. Only a resulting alert is.</li>
          <li>Refusing notifications means a crash alert cannot reach you. Everything else still works.</li>
          <li>Every one of these can be revoked in your phone's settings, at any time.</li>
        </UL>
      </Callout>

      <H2>Location, while you are using the app</H2>
      <Rows
        rows={[
          ['Android', 'ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION'],
          ['iOS', 'NSLocationWhenInUseUsageDescription'],
          ['Why', 'To put you on the convoy map, measure the gap to the rider ahead, and navigate to the next rally point.'],
          ['If you refuse', 'The live map, gap tracking and navigation do not work. Planning a trip still does.'],
        ]}
      />

      <H2>Location, in the background</H2>
      <Rows
        rows={[
          ['Android', 'ACCESS_BACKGROUND_LOCATION, FOREGROUND_SERVICE_LOCATION'],
          ['iOS', 'NSLocationAlwaysAndWhenInUseUsageDescription'],
          [
            'Why',
            'A rider does not hold their phone. It is in a mount with the screen off, or in a jacket pocket. Without background access your position freezes the moment the screen sleeps, and the crew behind you is riding towards a stale dot.',
          ],
          [
            'When it runs',
            'Only while a ride is active. It starts when the ride starts and stops when the ride ends, not when you close the app, and not on a schedule of ours.',
          ],
          ['If you refuse', 'You can still ride, but your crew sees your last position from when the screen was last on.'],
        ]}
      />
      <P>
        Android shows a persistent notification for the whole time this is running. That notification is not
        decoration. It is how you can tell, at a glance, that Qafilaa is still publishing your position, and it
        stops when the ride does.
      </P>
      <P>
        Battery mode reduces how often your position is published on long straight legs and restores full
        frequency near passes and rally points, where knowing exactly where the group is matters most.
      </P>

      <H2>Motion and fitness</H2>
      <Rows
        rows={[
          ['Android', 'ACTIVITY_RECOGNITION, high-rate sensor access'],
          ['iOS', 'NSMotionUsageDescription'],
          [
            'Why',
            'Crash detection reads the accelerometer to recognise the signature of a fall. Without it, a fall is just a phone that stopped moving.',
          ],
          [
            'Where it is processed',
            'On your device. The samples never leave your phone. Only the resulting alert is sent, and only if the countdown completes.',
          ],
          ['If you refuse', 'Automatic crash detection is off. Manual SOS (tap, hold, or flip the phone) still works.'],
        ]}
      />

      <H2>Notifications</H2>
      <Rows
        rows={[
          ['Android', 'POST_NOTIFICATIONS'],
          ['iOS', 'User notifications, including critical alerts where granted'],
          [
            'Why',
            'An SOS has to reach you on the lock screen, in a mount, at 80 kmph. Rally-point calls, roll-out, and crew signals use the same channel.',
          ],
          ['If you refuse', 'You will not be told when another rider needs help. Nothing else changes.'],
        ]}
      />

      <H2>Camera and photos</H2>
      <Rows
        rows={[
          ['Android', 'CAMERA, READ_MEDIA_IMAGES'],
          ['iOS', 'NSCameraUsageDescription, NSPhotoLibraryUsageDescription'],
          [
            'Why',
            'To set a profile or bike photo, attach a photo to a day note, and scan documents such as your licence, registration, insurance and permits.',
          ],
          [
            'What we take',
            'Only the images you pick or capture in that moment. We do not read your photo library, and we do not scan it in the background.',
          ],
          ['If you refuse', 'You can use everything else; you just type instead of photographing.'],
        ]}
      />

      <H2>Contacts</H2>
      <Rows
        rows={[
          ['Android', 'READ_CONTACTS'],
          ['iOS', 'NSContactsUsageDescription'],
          [
            'Why',
            'Only so you can pick an emergency contact from your phonebook instead of typing a number wrong.',
          ],
          [
            'What we take',
            'The one contact you choose. We do not upload your address book, and we do not use it to find other riders.',
          ],
          ['If you refuse', 'Type the contact in by hand. Nothing else is affected.'],
        ]}
      />
      <P>
        An emergency contact is someone else's personal data. Please ask them first. The app makes you confirm
        that you have. See <a href="/privacy-policy">Privacy Policy</a>, section 4a.
      </P>

      <H2>The rest</H2>
      <UL>
        <li>
          <b>Network and connectivity state</b>: to know whether to send now or queue for later. No prompt;
          it carries no personal data.
        </li>
        <li>
          <b>Storage</b>: to hold offline maps and your cached trip on the device, so every screen reads from
          disk first.
        </li>
        <li>
          <b>Wake lock and battery optimisation</b>: so the operating system does not put the ride to sleep
          under you mid-leg.
        </li>
        <li>
          <b>Boot completed</b>: so an interrupted ride can resume after a phone restart rather than
          silently ending.
        </li>
      </UL>

      <H2>Taking a permission back</H2>
      <P>
        <b>Android:</b> Settings → Apps → Qafilaa → Permissions. <b>iOS:</b> Settings → Qafilaa. You can also
        review what you have granted inside the app, under App permissions, which shows the current state of
        each and links straight out to the system screen.
      </P>
      <P>
        Revoking a permission never deletes data we already hold. To remove that, see{' '}
        <a href="/delete-data">Delete my data</a> or <a href="/delete-account">Delete your account</a>.
      </P>

      <H2>What we do not ask for</H2>
      <P>
        No microphone, no call log, no SMS, no advertising identifier, no accessibility service, no "all files"
        access, no cross-app tracking, and no advertising software of any kind. The app does carry product
        analytics (see <a href="/data-safety">Data safety</a>), which you can switch off in Settings. If you
        find a permission in the app that is not on this page, tell us at{' '}
        <Mail subject="Permissions" /> and we will either explain it or remove it.
      </P>
    </Doc>
  );
}

// Cookie / analytics disclosure for qafilaa.in. Referenced by section 9 of the
// Privacy Policy. This describes the site only — the Qafilaa app contains no
// analytics or advertising SDK at all.
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function CookiesBody() {
  return (
    <Doc
      slug="qafilaa.in/cookies"
      deck="What this website stores in your browser"
      title="Cookies"
      lede="This page is about qafilaa.in, the website you are reading. The Qafilaa app is a different thing entirely: it carries no analytics or advertising software, and nothing on this page applies to it."
      updated="20/08/2026"
    >
      <Callout label="In plain English">
        <UL>
          <li>We use one analytics tool, Google Analytics 4, to count page views.</li>
          <li>We do not use advertising cookies, and we do not track you across other websites.</li>
          <li>Nothing here is connected to your Qafilaa account or anything in the app.</li>
          <li>You can refuse all of it in your browser and the site works exactly the same.</li>
        </UL>
      </Callout>

      <H2>What is set, and why</H2>
      <Rows
        rows={[
          [
            'Google Analytics 4',
            'Cookies named _ga and _ga_<id>. They give this browser a random identifier so a repeat visit is not counted as a new person, and record which page you read and which link brought you here. Typically expire after two years.',
          ],
          [
            'Google Fonts',
            'Sets no cookie, but loading the two typefaces sends your IP address to Google so the files can be served.',
          ],
          [
            'Strictly necessary',
            'None. This is a static site — there is no login, no basket, and no session to keep.',
          ],
        ]}
      />
      <P>
        That is the complete list. We do not use advertising or retargeting cookies, social-network pixels,
        heatmaps or session recording.
      </P>

      <H2>What we do with it</H2>
      <P>
        We look at which pages people read and which do not land, so we know what to rewrite. It is aggregate,
        it is about pages rather than people, and it never leaves that purpose. Analytics data from this site is
        never joined to a Qafilaa account, because the site does not know who you are.
      </P>

      <H2>Turning it off</H2>
      <UL>
        <li>
          <b>Block cookies in your browser</b> for this site. Every major browser can do this per-site, and
          nothing here breaks without them.
        </li>
        <li>
          <b>Google's opt-out add-on</b> for Chrome, Firefox, Edge and Safari switches off Google Analytics
          everywhere, not just here.
        </li>
        <li>
          <b>Browse privately.</b> A private window discards these cookies when you close it.
        </li>
        <li>
          <b>Block the domain</b> — any content blocker that stops googletagmanager.com will stop analytics on
          this site.
        </li>
      </UL>
      <P>
        We do not currently show a cookie banner. If you are reading this from somewhere that requires prior
        consent for analytics cookies, block them using one of the routes above, and write to us if you would
        like your prior visits removed from the analytics record — <Mail subject="Cookies" />.
      </P>

      <H2>Do Not Track</H2>
      <P>
        Browsers send a Do Not Track or Global Privacy Control signal inconsistently and there is no agreed
        standard for honouring it, so we would rather tell you the truth than claim compliance: this site does
        not currently respond to those signals. The blocking routes above do work, immediately and completely.
      </P>

      <H2>Changes</H2>
      <P>
        If we add or remove anything that stores data in your browser, it will appear here first. Related:{' '}
        <a href="/privacy-policy">Privacy Policy</a> section 9, and <a href="/subprocessors">Subprocessors</a>.
      </P>
    </Doc>
  );
}

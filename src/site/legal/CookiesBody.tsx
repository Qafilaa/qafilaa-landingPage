// Cookie / analytics disclosure for qafilaa.in. Referenced by section 9 of the
// Privacy Policy. This describes the site only — the Qafilaa app contains no
// analytics or advertising SDK at all.
import { CookieChoice } from './CookieChoice';
import { Callout, Doc, H2, Mail, P, Rows, UL } from './prose';

export function CookiesBody() {
  return (
    <Doc
      slug="qafilaa.in/cookies"
      deck="What this website stores in your browser"
      title="Cookies"
      lede="This page is about qafilaa.in, the website you are reading. The Qafilaa app is a separate thing and nothing on this page applies to it: it uses no cookies, and its own product analytics are described in Data safety and switched off from Settings."
      updated="20/08/2026"
    >
      <Callout label="In plain English">
        <UL>
          <li>We use one analytics tool, Google Analytics 4, to count page views.</li>
          <li>
            <b>Nothing loads until you say yes.</b> Until then this site makes no request to Google at all and sets
            no cookie.
          </li>
          <li>We do not use advertising cookies, and we do not track you across other websites.</li>
          <li>Nothing here is connected to your Qafilaa account or anything in the app.</li>
          <li>Say no and the site works exactly the same. You can change your mind on this page, any time.</li>
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
            'Your cookie choice',
            'Not a cookie: one localStorage entry, qf-consent-analytics, holding "granted" or "denied". It is how we avoid asking you again, it is exempt from consent because it exists to record consent, and it never leaves your browser.',
          ],
          [
            'Strictly necessary',
            'Nothing else. This is a static site — there is no login, no basket, and no session to keep.',
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
        Or use the control below, which is the same choice the notice offers the first time you arrive. If you
        would also like your earlier visits removed from the analytics record, ask us —{' '}
        <Mail subject="Cookies" />.
      </P>
      <CookieChoice />

      <H2>Do Not Track and Global Privacy Control</H2>
      <P>
        Both are honoured. If your browser sends <b>Global Privacy Control</b>, or the older{' '}
        <b>Do Not Track</b> set to 1, we treat that as a no: analytics never loads, no cookie is set, and we do
        not show you the notice at all. You have already answered, and asking again would be asking you to
        repeat yourself.
      </P>
      <P>
        Only GPC carries legal weight, and only in some places. We honour Do Not Track anyway — it costs nothing
        and ignoring a request that explicit would be rude.
      </P>

      <H2>Changes</H2>
      <P>
        If we add or remove anything that stores data in your browser, it will appear here first. Related:{' '}
        <a href="/privacy-policy">Privacy Policy</a> section 9, and <a href="/subprocessors">Subprocessors</a>.
      </P>
    </Doc>
  );
}

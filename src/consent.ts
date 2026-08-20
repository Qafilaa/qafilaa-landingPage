/**
 * Analytics consent.
 *
 * The tag is not loaded until someone accepts — the loader lives inline in
 * `index.html` as `window.qfStartAnalytics()` so a returning visitor's "yes" is
 * honoured before React hydrates. This module is the client half: read the
 * stored choice, write a new one, and undo one that is withdrawn.
 */
export type ConsentChoice = 'granted' | 'denied';

/** Kept in sync with `window.QF_CONSENT_KEY` in index.html. */
const KEY = 'qf-consent-analytics';

/**
 * True when the browser is already asking us not to be tracked.
 *
 * Global Privacy Control is a legally recognised opt-out signal in several
 * jurisdictions; Do-Not-Track is not, but honouring it costs nothing and
 * ignoring a request this explicit would be rude. Either one means we do not
 * ask, do not load, and do not store.
 */
export function signalsOptOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  if (nav.globalPrivacyControl === true) return true;
  const dnt = nav.doNotTrack ?? nav.msDoNotTrack ?? (window as { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
}

/** `null` when the visitor has not chosen yet — that is when the banner shows. */
export function readConsent(): ConsentChoice | null {
  // An opt-out signal is an answer. Asking anyway would be asking someone to
  // repeat themselves.
  if (signalsOptOut()) return 'denied';
  try {
    const v = localStorage.getItem(KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    // Storage blocked (private mode, or the browser is locked down). Treat it
    // as "not asked": we cannot remember an answer, so we must not assume one.
    return null;
  }
}

/**
 * Expire the cookies GA4 has already written.
 *
 * Called on withdrawal — taking consent back has to remove what was stored, not
 * just stop adding to it — and once on arrival when no choice is on record,
 * which clears cookies left by a visit from before this gate existed.
 */
export function clearAnalyticsCookies() {
  const names = document.cookie
    .split(';')
    .map((c) => c.split('=')[0].trim())
    .filter((n) => n === '_ga' || n.startsWith('_ga_') || n === '_gid' || n.startsWith('_gat'));

  const { hostname } = window.location;
  // A cookie set on `.qafilaa.in` is not cleared by expiring it on `qafilaa.in`,
  // so walk the domain up as well as trying the host on its own.
  const parts = hostname.split('.');
  const domains = [undefined as string | undefined, hostname];
  for (let i = 0; i < parts.length - 1; i++) domains.push('.' + parts.slice(i).join('.'));

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    }
  }
}

/** Persist a choice and act on it immediately. */
export function setConsent(choice: ConsentChoice) {
  try {
    localStorage.setItem(KEY, choice);
  } catch {
    // Cannot remember it, but still honour it for this page view.
  }

  if (choice === 'granted') {
    window.qfStartAnalytics?.();
    return;
  }

  window.gtag?.('consent', 'update', { analytics_storage: 'denied' });
  clearAnalyticsCookies();
}

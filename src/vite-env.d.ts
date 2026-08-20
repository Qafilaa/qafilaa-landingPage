/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    /** Backend origin for the waitlist API. Defaults to production when unset. */
    readonly VITE_API_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }

  interface Window {
    /** Consent-gated GA4 loader, defined inline in index.html. */
    qfStartAnalytics?: () => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    QF_GA_ID?: string;
    QF_CONSENT_KEY?: string;
    __qfGaLoaded?: boolean;
    /** Screen id -> pre-rendered app-screen HTML, from `public/qafilaa-screens.js`. */
    QAF_SCREENS?: Record<string, string>;
    /** Screen id -> the design's own label, e.g. `R4 · Muster board`. */
    QAF_SCREEN_LABELS?: Record<string, string>;
    /** Shared stylesheet the screens above are authored against. */
    QAF_SCREEN_CSS?: string;
    /** Build-step trace the engine writes; a `!name` entry marks a failed step. */
    __QAF_STEPS?: string[];
    /** Last error thrown inside the engine's frame loop, if any. */
    __QAF_FERR?: string;
    __QAF?: unknown;
  }
}

export {};

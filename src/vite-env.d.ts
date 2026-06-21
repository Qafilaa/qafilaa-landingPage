/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Qafilaa backend API (no trailing slash). Defaults to production when unset. */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

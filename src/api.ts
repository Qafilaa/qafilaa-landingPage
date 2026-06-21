/**
 * Thin client for the Qafilaa backend. The only call the landing page makes today is the public
 * waitlist signup. The API base URL is build-time configurable via `VITE_API_BASE_URL`; it defaults
 * to production so a plain `vite build` deploys against the live API.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.qafilaa.in').replace(/\/+$/, '');

export interface JoinWaitlistInput {
  email: string;
  /** Which form captured it — `"hero"` or `"cta"` — for conversion analytics. */
  source?: string;
  /** Hidden honeypot; real humans leave it empty, bots fill it. */
  company?: string;
}

/**
 * Submits a waitlist signup. Resolves on success — including when the email was already on the list,
 * which the backend reports as a non-error — and rejects on a network or validation failure so the
 * form can surface an inline message instead of falsely showing the success state.
 */
export async function joinWaitlist(input: JoinWaitlistInput): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/waitlist`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Waitlist signup failed (${response.status})`);
  }
}

/**
 * Returns how many signups the backend has captured. The landing page adds this to its own base count
 * for the social-proof line. Throws on failure so the caller can fall back to the base alone.
 */
export async function getWaitlistCount(): Promise<number> {
  const response = await fetch(`${API_BASE}/api/v1/waitlist/count`);
  if (!response.ok) {
    throw new Error(`Waitlist count failed (${response.status})`);
  }
  const data: { count: number } = await response.json();
  return data.count;
}

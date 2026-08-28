/**
 * The admin console's client for the Qafilaa ops API.
 *
 * ## How a browser is allowed to talk to this API at all
 *
 * The backend's CORS policy (`CorsPolicies.PublicSite`) is origin-pinned to `qafilaa.in` and
 * `www.qafilaa.in` — the same origins this console is served from — and was widened in the same
 * change as this file to permit the `Authorization` header and the `PUT` method. Without both, every
 * ops call fails in preflight and the failure reads exactly like a 401, which is a genuinely
 * miserable thing to debug. If the console ever moves to its own hostname, that origin must be added
 * to `Cors:AllowedOrigins` on the API host — nothing here can work around it.
 *
 * ## Why there is no refresh-token dance
 *
 * The app refreshes because a rider must never be signed out mid-trip. An operator at a desk is the
 * opposite case: a console that silently keeps itself signed in forever is a console left open on an
 * unattended laptop. So the access token is held in memory plus `sessionStorage` — it dies with the
 * tab — and an expired one simply returns the operator to the sign-in screen.
 */

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.qafilaa.in').replace(/\/+$/, '');

/** The single address permitted to hold a session here. Mirrored server-side by `Ops:AdminEmails`. */
export const ADMIN_EMAIL = 'admin@qafilaa.in';

const TOKEN_KEY = 'qf.admin.token';
const IDENTITY_KEY = 'qf.admin.identity';

export interface AdminIdentity {
  email: string;
  displayName: string;
  /** How this session was established — shown in the header so an operator knows which door they came through. */
  via: 'sso' | 'code';
}

/** Thrown for any non-2xx. `status` lets callers separate "signed out" from "not allowed" from "broken". */
export class ApiError extends Error {
  constructor(readonly status: number, message: string, readonly detail?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    // Private mode, or storage blocked outright. The session simply does not survive a reload.
    return null;
  }
}

export function readIdentity(): AdminIdentity | null {
  try {
    const raw = sessionStorage.getItem(IDENTITY_KEY);
    return raw ? (JSON.parse(raw) as AdminIdentity) : null;
  } catch {
    return null;
  }
}

export function storeSession(token: string, identity: AdminIdentity): void {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(IDENTITY_KEY, JSON.stringify(identity));
  } catch {
    /* Storage refused. The session still works for this page view; it just will not survive a reload. */
  }
}

export function clearSession(): void {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(IDENTITY_KEY);
  } catch {
    /* nothing to do */
  }
}

async function request<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (init?.auth !== false) {
    const token = readToken();
    if (!token) throw new ApiError(401, 'Signed out.');
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers: { ...headers, ...init?.headers } });
  } catch {
    // A CORS rejection and a dead network are indistinguishable from here — the browser refuses to
    // say which. Naming both is more honest than guessing one.
    throw new ApiError(0, 'Could not reach the API.', 'Network error, or the origin is not allowed by CORS.');
  }

  if (response.status === 204) return undefined as T;

  const body = await response.text();
  const parsed = body ? safeJson(body) : null;

  if (!response.ok) {
    const detail =
      (parsed && typeof parsed === 'object' && 'detail' in parsed && typeof parsed.detail === 'string'
        ? parsed.detail
        : undefined) ?? (body || undefined);
    throw new ApiError(response.status, messageFor(response.status), detail);
  }

  return parsed as T;
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function messageFor(status: number): string {
  if (status === 401) return 'Signed out — the token expired or was rejected.';
  if (status === 403) return 'That account is not on the ops allow-list.';
  if (status === 404) return 'Not found.';
  if (status === 409) return 'Someone else changed this first.';
  if (status === 429) return 'Too many attempts. Wait a moment.';
  if (status >= 500) return 'The API failed.';
  return `Request failed (${status}).`;
}

/* ------------------------------------------------------------------ sign-in */

interface AuthTokensResponse {
  accessToken: string;
  refreshToken?: string;
  user?: { email?: string; displayName?: string };
}

/**
 * Exchange a Google ID token for a Qafilaa session.
 *
 * The address check here is UX, not security: it lets the console say "that is not the admin
 * account" instead of handing over a session that 403s on every subsequent call. The real gate is
 * `Policies.Ops` on the server, which this cannot influence.
 */
export async function signInWithGoogle(idToken: string): Promise<AdminIdentity> {
  const res = await request<AuthTokensResponse>('/api/v1/auth/sso/google', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ idToken }),
  });

  const email = (res.user?.email ?? '').toLowerCase();
  if (email !== ADMIN_EMAIL) {
    throw new ApiError(403, `Signed in as ${email || 'an unknown account'}.`, `Only ${ADMIN_EMAIL} may use this console.`);
  }

  const identity: AdminIdentity = { email, displayName: res.user?.displayName ?? 'Admin', via: 'sso' };
  storeSession(res.accessToken, identity);
  return identity;
}

/**
 * The fixed-code door.
 *
 * This is NOT a second credential system — it is the backend's existing `Auth:Demo` path, which
 * writes a configured fixed code into the same OTP store, under the same key, with the same lifetime
 * and the same rate limiter as a mailed code. Adding `admin@qafilaa.in` to `Auth:Demo:Accounts` on
 * the API host is what arms it; with nothing configured, this call falls through to an ordinary
 * emailed OTP, which still works and is arguably what you want day to day.
 */
export async function requestCode(email: string): Promise<void> {
  await request<unknown>('/api/v1/auth/email-otp/request', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function signInWithCode(email: string, code: string): Promise<AdminIdentity> {
  const res = await request<AuthTokensResponse>('/api/v1/auth/email-otp/verify', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, code }),
  });

  const resolved = (res.user?.email ?? email).toLowerCase();
  if (resolved !== ADMIN_EMAIL) {
    throw new ApiError(403, `Signed in as ${resolved}.`, `Only ${ADMIN_EMAIL} may use this console.`);
  }

  const identity: AdminIdentity = { email: resolved, displayName: res.user?.displayName ?? 'Admin', via: 'code' };
  storeSession(res.accessToken, identity);
  return identity;
}

/* --------------------------------------------------------------- ops shapes */

export interface OpsUser {
  id: number;
  displayName: string;
  email: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  handle: string | null;
  city: string | null;
  state: string | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface OpsUserList {
  users: OpsUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CountByLabel {
  label: string;
  count: number;
}

export interface OpsOverview {
  totalUsers: number;
  newToday: number;
  newLast7Days: number;
  newLast30Days: number;
  onboardedUsers: number;
  usersWithEmail: number;
  usersWithPhone: number;
  totalTrips: number;
  tripsCreatedLast7Days: number;
  activeRidesNow: number;
  openAlerts: number;
  totalAlerts: number;
  alertsLast30Days: number;
  openSupportTickets: number;
  waitlistSignups: number;
  ridersInATrip: number;
  ridersWithNoTrip: number;
  ridersWhoHaveRidden: number;
  liveFixesLastHour: number;
  tripsByStatus: CountByLabel[];
  generatedAt: string;
}

/** Signed up → finished setup → joined a trip → rode → riding now. */
export interface OpsFunnel {
  signedUp: number;
  finishedSetup: number;
  joinedATrip: number;
  rode: number;
  ridingNow: number;
}

/** One rider's LAST fix. Never a track — see the server-side contract for why. */
export interface OpsLiveRider {
  riderId: number;
  riderName: string | null;
  tripId: number;
  tripName: string | null;
  latitude: number;
  longitude: number;
  deviceTs: string;
  ageSeconds: number;
  speedKmh: number | null;
  heading: number | null;
  batteryPct: number | null;
  riding: boolean;
}

/** One rider plus the counts that say whether the account is actually in use. */
export interface OpsUserDetail {
  rider: OpsUser;
  tripCount: number;
  bikeCount: number;
  rideCount: number;
  lastRideStartedAt: string | null;
  alertsRaised: number;
}

export interface OpsTrip {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  hostUserId: number;
  hostName: string | null;
  memberCount: number;
  hasDeparted: boolean;
  createdAt: string;
}

export interface OpsTripList {
  trips: OpsTrip[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OpsAlert {
  id: number;
  tripId: number;
  tripName: string | null;
  riderId: number;
  riderName: string | null;
  type: string;
  triggerKind: string;
  state: string;
  escalationStage: string;
  createdAt: string;
  resolvedAt: string | null;
}

export interface OpsAlertList {
  alerts: OpsAlert[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OpsAuditEntry {
  kind: string;
  subject: string;
  change: string;
  reason: string | null;
  changedByUserId: number;
  changedByName: string | null;
  changedAt: string;
}

export interface OpsSignupSeries {
  points: { day: string; count: number }[];
  days: number;
  total: number;
}

export interface ReleasePolicy {
  platform?: string;
  minimumBuild: number;
  minimumVersion: string;
  latestBuild: number;
  latestVersion: string;
  storeUrl: string;
  updateTitle: string | null;
  updateMessage: string | null;
  forceUpdateEnabled: boolean;
  badgeLabel?: string | null;
  downloadSizeLabel?: string | null;
  highlights?: string[] | null;
  updatedAt?: string | null;
  version?: number;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string | null;
  updatedAt?: string | null;
}

export interface SupportTicket {
  id: number;
  subject?: string | null;
  status: string | number;
  type?: string | number;
  createdAt: string;
  lastMessageAt?: string | null;
  riderDisplayName?: string | null;
}

export interface SupportTicketList {
  tickets: SupportTicket[];
  totalCount: number;
  nextCursor: number | null;
}

/* ------------------------------------------------------------------- routes */

export interface UserQuery {
  q?: string;
  withinDays?: number;
  onboarded?: boolean;
  sort?: 'recent' | 'oldest' | 'name';
  page?: number;
  pageSize?: number;
}

export function listUsers(query: UserQuery = {}): Promise<OpsUserList> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.withinDays) params.set('withinDays', String(query.withinDays));
  if (query.onboarded !== undefined) params.set('onboarded', String(query.onboarded));
  if (query.sort) params.set('sort', query.sort);
  params.set('page', String(query.page ?? 1));
  params.set('pageSize', String(query.pageSize ?? 25));
  return request<OpsUserList>(`/api/v1/ops/users?${params}`);
}

export const getUser = (id: number) => request<OpsUserDetail>(`/api/v1/ops/users/${id}`);
/**
 * Irreversibly delete a rider and everything of theirs.
 *
 * Runs the same T11 cascade a rider's own "delete my account" runs — the server reuses that path
 * rather than deleting rows for operators, so the two can never drift. There is no bulk equivalent
 * and there should not be: a filter that selects one rider too many is unrecoverable.
 */
export const deleteUser = (id: number) =>
  request<void>(`/api/v1/ops/users/${id}`, { method: 'DELETE' });

export const getOverview = () => request<OpsOverview>('/api/v1/ops/metrics/overview');
export const getSignups = (days = 30) => request<OpsSignupSeries>(`/api/v1/ops/metrics/signups?days=${days}`);

export interface TripQuery {
  q?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export function listTrips(query: TripQuery = {}): Promise<OpsTripList> {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.status) params.set('status', query.status);
  params.set('page', String(query.page ?? 1));
  params.set('pageSize', String(query.pageSize ?? 25));
  return request<OpsTripList>(`/api/v1/ops/trips?${params}`);
}

export function listAlerts(openOnly = false, page = 1, pageSize = 25): Promise<OpsAlertList> {
  const params = new URLSearchParams({ openOnly: String(openOnly), page: String(page), pageSize: String(pageSize) });
  return request<OpsAlertList>(`/api/v1/ops/alerts?${params}`);
}

export const listAudit = (limit = 100) => request<OpsAuditEntry[]>(`/api/v1/ops/audit?limit=${limit}`);

export const getFunnel = () => request<OpsFunnel>('/api/v1/ops/metrics/funnel');

export const listLive = (withinMinutes = 60) =>
  request<OpsLiveRider[]>(`/api/v1/ops/live?withinMinutes=${withinMinutes}`);

export const getReleasePolicies = () => request<ReleasePolicy[]>('/api/v1/ops/app-release');

export const putReleasePolicy = (platform: string, body: Partial<ReleasePolicy> & { reason?: string }) =>
  request<ReleasePolicy>(`/api/v1/ops/app-release/${platform}`, { method: 'PUT', body: JSON.stringify(body) });

export const getFeatureFlags = () => request<FeatureFlag[]>('/api/v1/ops/feature-flags');

export const putFeatureFlag = (key: string, enabled: boolean, reason: string) =>
  request<FeatureFlag>(`/api/v1/ops/feature-flags/${encodeURIComponent(key)}`, {
    method: 'PUT',
    body: JSON.stringify({ enabled, reason }),
  });

export const getRuntimeConfig = () => request<Record<string, unknown>>('/api/v1/ops/runtime-config');

export const listTickets = (status?: number, limit = 50) => {
  const params = new URLSearchParams({ limit: String(limit) });
  if (status !== undefined) params.set('status', String(status));
  return request<SupportTicketList>(`/api/v1/ops/support/tickets?${params}`);
};

/**
 * What the fleet is actually told, read WITHOUT credentials.
 *
 * This is the anonymous endpoint the app itself calls, so it is the only reading of the force-update
 * gate that proves what a real device gets — as opposed to what the policy row says it should. The
 * console shows both, side by side, because on 2026-08-27 they disagreed in a way that mattered: the
 * stored `updateMessage` still named a build two releases old, and that sentence is what a blocked
 * rider reads.
 */
export const checkUpdate = (platform: 'android' | 'ios', build: number) =>
  request<{
    status: string;
    latestVersion: string;
    latestBuild: number;
    minimumVersion: string;
    minimumBuild: number;
    storeUrl: string;
    title: string | null;
    message: string | null;
  }>(`/api/v1/app/update-check?platform=${platform}&build=${build}`, { auth: false });

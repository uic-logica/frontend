/** Thrown by `api()` on a non-2xx response — carries the HTTP status for callers that need to branch on it. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

/**
 * Last successful GET responses, so the dashboard paints what you saw last
 * time at once and refreshes behind it, instead of "Loading…" on every visit.
 *
 * - Kept in localStorage, so a new tab or a reload starts warm too.
 * - Tagged with the account that read it: a different account (or none)
 *   drops everything first, and sign-out clears it.
 * - A write only drops the reads under the same resource (a PATCH to
 *   /api/events/x forgets /api/events*), plus the two summaries that echo
 *   almost every change: /api/dashboard and /api/notifications.
 * - Identical GETs in flight at the same time share one request.
 *
 * Every cached read is refreshed from the server as soon as it's shown, so
 * the worst case is a stale first frame, never a stale page.
 * ponytail: localStorage size cap (~5MB) — the dashboard reads are small JSON; if
 * documents listings ever grow, cap or skip them in remember().
 */
const CACHE = "api-cache:";
const OWNER = "api-cache-owner";

function store(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** The last good response for a GET path, or undefined. Browser-only. */
export function peek<T>(path: string): T | undefined {
  try {
    const raw = store()?.getItem(CACHE + path);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

/** Forget cached reads: all of them, or only those whose path starts with `prefix`. */
export function clearApiCache(prefix = "") {
  const s = store();
  if (!s) return;
  try {
    for (const key of Object.keys(s)) if (key.startsWith(CACHE + prefix)) s.removeItem(key);
    if (!prefix) s.removeItem(OWNER);
  } catch {}
}

function remember(path: string, body: unknown) {
  try {
    store()?.setItem(CACHE + path, JSON.stringify(body));
  } catch {}
}

/** "/api/events/abc/rsvp?x=1" → "/api/events": the resource a write touches. */
export function resourceOf(path: string) {
  return path.split("?")[0].split("/").slice(0, 3).join("/");
}

const inFlight = new Map<string, Promise<unknown>>();

// Same-origin — next.config.ts rewrites /api/* to the backend, so the
// session cookie stays first-party and `credentials` doesn't need "include".
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const read = !init?.method || init.method.toUpperCase() === "GET";
  if (read && !init?.body) {
    const pending = inFlight.get(path);
    if (pending) return pending as Promise<T>;
    const request = send<T>(path, init, true).finally(() => inFlight.delete(path));
    inFlight.set(path, request);
    return request;
  }
  return send<T>(path, init, read);
}

async function send<T>(path: string, init: RequestInit | undefined, read: boolean): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!read) {
    // Signing in or out changes whose data this is: start clean.
    if (path.startsWith("/api/auth")) clearApiCache();
    else for (const prefix of [resourceOf(path), "/api/dashboard", "/api/notifications"]) clearApiCache(prefix);
  }
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed: ${res.status}`, res.status);
  if (read && typeof window !== "undefined") {
    if (path === "/api/auth/session") {
      // A different (or no) account in this browser: drop everything read before.
      const id = (body as { user?: { id?: string } } | null)?.user?.id ?? "";
      if (store()?.getItem(OWNER) !== id) {
        clearApiCache();
        try {
          if (id) store()?.setItem(OWNER, id);
        } catch {}
      }
    }
    remember(path, body);
  }
  return body as T;
}

/** Warm the cache for reads a section will need, when the browser is idle. */
export function prefetch(paths: string[]) {
  if (typeof window === "undefined") return;
  const run = () => paths.forEach((path) => void api(path).catch(() => {}));
  if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 3000 });
  else setTimeout(run, 1500);
}

/**
 * Ends the session (works for both MEMBER and SPEAKER accounts — Auth.js's
 * signout endpoint just deletes the Session row by cookie, same either way).
 * Auth.js's `/api/auth/signout` rejects a bare POST with `MissingCSRF` —
 * confirmed by testing, not assumed — so the token has to be fetched first.
 */
export async function signOut(callbackUrl: string): Promise<void> {
  clearApiCache();
  const csrfResponse = await fetch("/api/auth/csrf");
  const csrf = await csrfResponse.json().catch(() => null);
  if (!csrfResponse.ok || typeof csrf?.csrfToken !== "string") {
    throw new ApiError("Could not start sign out.", csrfResponse.status);
  }

  const response = await fetch("/api/auth/signout", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "X-Auth-Return-Redirect": "1",
    },
    body: new URLSearchParams({ csrfToken: csrf.csrfToken, callbackUrl }),
  });
  const result = await response.json().catch(() => null);
  const errorPath =
    typeof result?.url === "string" &&
    new URL(result.url, "http://localhost").pathname === "/api/auth/error";
  if (!response.ok || typeof result?.url !== "string" || errorPath) {
    throw new ApiError("Could not sign out.", response.status);
  }
}

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
 * Last successful GET responses, per browser tab (sessionStorage), so the
 * dashboard can paint what you saw last time instantly and refresh behind
 * it instead of showing a skeleton on every load. Any write — a save, a
 * sign-in, a sign-out — clears the whole cache, so a change is never hidden
 * behind an old copy and nothing outlives the account that read it.
 * ponytail: clear-everything-on-write, per-path invalidation if writes get frequent enough to matter.
 */
const CACHE = "api-cache:";

/** The last good response for a GET path, or undefined. Browser-only. */
export function peek<T>(path: string): T | undefined {
  try {
    const raw = sessionStorage.getItem(CACHE + path);
    return raw ? (JSON.parse(raw) as T) : undefined;
  } catch {
    return undefined;
  }
}

export function clearApiCache() {
  try {
    for (const key of Object.keys(sessionStorage)) if (key.startsWith(CACHE)) sessionStorage.removeItem(key);
  } catch {}
}

function remember(path: string, body: unknown) {
  try {
    sessionStorage.setItem(CACHE + path, JSON.stringify(body));
  } catch {}
}

// Same-origin — next.config.ts rewrites /api/* to the backend, so the
// session cookie stays first-party and `credentials` doesn't need "include".
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const read = !init?.method || init.method.toUpperCase() === "GET";
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!read) clearApiCache();
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed: ${res.status}`, res.status);
  if (read && typeof window !== "undefined") {
    // A different (or no) account in this tab: drop everything read before.
    if (path === "/api/auth/session" && peek<{ user?: { id?: string } }>(path)?.user?.id !== (body as { user?: { id?: string } } | null)?.user?.id) clearApiCache();
    remember(path, body);
  }
  return body as T;
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

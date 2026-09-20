/** Thrown by `api()` on a non-2xx response — carries the HTTP status for callers that need to branch on it. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// logica-lean: bare-minimum fetch wrapper for the e2e/bare-minimum scaffold.
// Same-origin — next.config.ts rewrites /api/* to the backend, so the
// session cookie stays first-party and `credentials` doesn't need "include".
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.error ?? `Request failed: ${res.status}`, res.status);
  return body as T;
}

/**
 * Ends the session (works for both MEMBER and SPEAKER accounts — Auth.js's
 * signout endpoint just deletes the Session row by cookie, same either way).
 * Auth.js's `/api/auth/signout` rejects a bare POST with `MissingCSRF` —
 * confirmed by testing, not assumed — so the token has to be fetched first.
 */
export async function signOut(): Promise<void> {
  const { csrfToken } = await (await fetch("/api/auth/csrf")).json();
  await fetch("/api/auth/signout", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ csrfToken, json: "true" }),
  });
}

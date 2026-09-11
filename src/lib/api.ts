// logica-lean: bare-minimum fetch wrapper for the e2e/bare-minimum scaffold.
// Same-origin — next.config.ts rewrites /api/* to the backend, so the
// session cookie stays first-party and `credentials` doesn't need "include".
export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error ?? `Request failed: ${res.status}`);
  return body as T;
}

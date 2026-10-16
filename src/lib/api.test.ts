import { afterEach, describe, expect, it, vi } from "vitest";
import { signOut } from "./api";

afterEach(() => vi.unstubAllGlobals());

describe("signOut", () => {
  it("uses the Auth.js redirect protocol and waits for a successful response", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(Response.json({ csrfToken: "csrf" }))
      .mockResolvedValueOnce(Response.json({ url: "http://localhost/signin" }));
    vi.stubGlobal("fetch", fetch);

    await signOut("/signin");

    const init = fetch.mock.calls[1][1] as RequestInit;
    expect(init.headers).toMatchObject({ "X-Auth-Return-Redirect": "1" });
    expect(init.body?.toString()).toBe("csrfToken=csrf&callbackUrl=%2Fsignin");
  });

  it("rejects an Auth.js error redirect instead of treating it as success", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(Response.json({ csrfToken: "csrf" }))
        .mockResolvedValueOnce(
          Response.json({ url: "http://localhost/api/auth/error?error=MissingCSRF" }),
        ),
    );

    await expect(signOut("/signin")).rejects.toThrow("Could not sign out.");
  });
});

describe("api cache", () => {
  function fakeStorage() {
    const data = new Map<string, string>();
    const s = {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    };
    // Object.keys(localStorage) lists stored keys in a browser; mirror that.
    return new Proxy(s, { ownKeys: () => [...data.keys()], getOwnPropertyDescriptor: (_t, k) => ({ enumerable: true, configurable: true, value: data.get(String(k)) }) });
  }

  it("keeps reads across a write to another resource, and drops the written one", async () => {
    const { api, peek } = await import("./api");
    vi.stubGlobal("window", { localStorage: fakeStorage() });
    vi.stubGlobal("fetch", vi.fn(async () => Response.json([{ id: "x" }])));
    await api("/api/events");
    await api("/api/posts");
    await api("/api/events/abc/rsvp", { method: "POST", body: "{}" });
    expect(peek("/api/events")).toBeUndefined();
    expect(peek("/api/posts")).toEqual([{ id: "x" }]);
  });

  it("starts clean when a different account signs in", async () => {
    const { api, peek } = await import("./api");
    vi.stubGlobal("window", { localStorage: fakeStorage() });
    const fetch = vi.fn(async (path: string) => Response.json(path === "/api/auth/session" ? { user: { id: "a" } } : [1]));
    vi.stubGlobal("fetch", fetch);
    await api("/api/auth/session");
    await api("/api/posts");
    fetch.mockImplementation(async (path: string) => Response.json(path === "/api/auth/session" ? { user: { id: "b" } } : [2]));
    await api("/api/auth/session");
    expect(peek("/api/posts")).toBeUndefined();
  });

  it("shares one request between identical GETs in flight", async () => {
    const { api } = await import("./api");
    vi.stubGlobal("window", { localStorage: fakeStorage() });
    const fetch = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal("fetch", fetch);
    await Promise.all([api("/api/dashboard"), api("/api/dashboard")]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe("resourceOf", () => {
  it("names the resource a path belongs to", async () => {
    const { resourceOf } = await import("./api");
    expect(resourceOf("/api/events/abc/rsvp?x=1")).toBe("/api/events");
    expect(resourceOf("/api/board/items/1")).toBe("/api/board");
  });
});

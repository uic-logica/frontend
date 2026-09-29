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

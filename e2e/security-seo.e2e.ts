import { expect, test } from "@playwright/test";

test("serves hardened headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(response.headers()["content-security-policy"]).toContain("strict-dynamic");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(response.headers()["strict-transport-security"]).toBe("max-age=63072000; includeSubDomains; preload");
  expect(response.headers()["x-powered-by"]).toBeUndefined();
});

test("publishes crawl metadata and a real 404", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  expect(await sitemap.text()).toContain("<loc>https://logicauic.org/</loc>");

  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Sitemap: https://logicauic.org/sitemap.xml");

  expect((await request.get("/manifest.webmanifest")).ok()).toBeTruthy();
  expect((await request.get("/.well-known/security.txt")).ok()).toBeTruthy();
  expect((await request.get("/definitely-not-a-page")).status()).toBe(404);
});

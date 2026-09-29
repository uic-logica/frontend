import { expect, test } from "@playwright/test";

// Each public page renders its main heading and throws no uncaught errors,
// even when the backend is down (CI has none).
for (const path of ["/", "/events", "/join", "/signin", "/signup"]) {
  test(`${path} renders`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

import { defineConfig } from "@playwright/test";

// Smoke tests: the public pages load and render with no backend running.
// ponytail: runs against `next start`, not a Vercel preview — add a preview URL when previews need checking.
export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: `http://localhost:${process.env.PLAYWRIGHT_PORT ?? "3100"}` },
  webServer: {
    command: `npm run start -- -H 127.0.0.1 -p ${process.env.PLAYWRIGHT_PORT ?? "3100"}`,
    url: `http://localhost:${process.env.PLAYWRIGHT_PORT ?? "3100"}`,
    reuseExistingServer: false,
  },
});

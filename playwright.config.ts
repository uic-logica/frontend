import { defineConfig } from "@playwright/test";

// Smoke tests: the public pages load and render with no backend running.
// ponytail: runs against `next start`, not a Vercel preview — add a preview URL when previews need checking.
export default defineConfig({
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  retries: process.env.CI ? 1 : 0,
  use: { baseURL: "http://localhost:3000" },
  webServer: { command: "npm run start", url: "http://localhost:3000", reuseExistingServer: !process.env.CI },
});

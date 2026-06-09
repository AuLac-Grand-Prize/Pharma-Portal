import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E config. Specs live in `e2e/`. The smoke spec is skippable so
 * `playwright test --list` works (and CI passes) without a running dev server;
 * set `PLAYWRIGHT_RUN_E2E=1` with the app on :3000 to actually execute it.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

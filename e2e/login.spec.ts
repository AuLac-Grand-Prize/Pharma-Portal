import { test, expect } from "@playwright/test";

// Smoke E2E: the /login page renders the pharmacy sign-in heading.
// Skipped unless PLAYWRIGHT_RUN_E2E=1 so `playwright test --list` and CI do not
// require a running dev server + backend. Enumerable via `playwright test --list`.
test.describe("login page", () => {
  test.skip(
    process.env.PLAYWRIGHT_RUN_E2E !== "1",
    "Set PLAYWRIGHT_RUN_E2E=1 with the app running on :3000 to execute.",
  );

  test("renders the pharmacy login heading", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Đăng nhập nhà thuốc" }),
    ).toBeVisible();
  });
});

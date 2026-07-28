import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  const testEmail = `e2e-test-${Date.now()}@example.com`;
  const testPassword = "TestPass123!";

  test("register a new user and see confirmation screen", async ({ page }) => {
    await page.goto("/register");

    await expect(page.locator("h1")).toHaveText("Create Account");

    await page.fill("#fullName", "E2E Test User");
    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", testPassword);

    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    await expect(page.locator("h1")).toHaveText("Check your email");

    await expect(page.locator(`text=${testEmail}`)).toBeVisible();

    await expect(page.locator('a[href="/login"]')).toBeVisible();
  });

  test("login with existing credentials redirects to home", async ({ page }) => {
    await page.goto("/login");

    await expect(page.locator("h1")).toHaveText("Welcome back");

    await page.fill("#email", testEmail);
    await page.fill("#password", testPassword);

    await page.click('button[type="submit"]');

    await page.waitForURL(/\/$/, { timeout: 15_000 });
  });

  test("register form rejects mismatched passwords", async ({ page }) => {
    await page.goto("/register");

    await page.fill("#fullName", "E2E Test User");
    await page.fill("#email", `mismatch-${Date.now()}@example.com`);
    await page.fill("#password", testPassword);
    await page.fill("#confirmPassword", "DifferentPass123!");

    await page.check('input[type="checkbox"]');

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Passwords do not match")).toBeVisible();

    await expect(page.locator("h1")).toHaveText("Create Account");
  });
});
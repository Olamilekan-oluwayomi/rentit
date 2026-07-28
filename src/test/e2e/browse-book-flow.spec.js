import { test, expect } from "@playwright/test";

test.describe("Browse and book flow", () => {
  test("landing page shows public content for unauthenticated users", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("h1")).toBeVisible();
  });

  test("listing detail page shows not-found for invalid id", async ({ page }) => {
    await page.goto("/listings/00000000-0000-0000-0000-000000000000");

    await expect(page.locator('text=Not found')).toBeVisible({ timeout: 15_000 });

    await expect(page.locator('a[href="/"]')).toBeVisible();
  });

  test("listing detail renders skeleton while loading then content or error", async ({ page }) => {
    await page.goto("/listings/00000000-0000-0000-0000-000000000000");

    const skeleton = page.locator(".animate-pulse");
    await expect(skeleton).toBeVisible({ timeout: 5_000 });

    await expect(page.locator('text=Not found')).toBeVisible({ timeout: 15_000 });
  });

  test("public pages are accessible without auth", async ({ page }) => {
    const publicPages = ["/about", "/contact", "/privacy", "/terms", "/pricing"];

    for (const path of publicPages) {
      await page.goto(path);
      await expect(page.locator("h1")).toBeVisible();
      expect(await page.locator("h1").textContent()).toBeTruthy();
    }
  });
});
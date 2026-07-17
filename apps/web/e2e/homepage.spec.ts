import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("homepage marketing", () => {
  test("visitor lands on homepage with workforce positioning", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/AI workforce/i);
    await expect(page.getByRole("link", { name: /Start Free Trial/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Book a Demo/i }).first()).toBeVisible();
  });

  test("product menu opens", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Product" }).click();
    await expect(page.getByRole("menuitem", { name: /AI Employee Builder/i })).toBeVisible();
  });

  test("start free trial routes to signup", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("main").getByRole("link", { name: /Start Free Trial/i }).first().click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test("mobile navigation opens", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.getByRole("button", { name: /Open menu/i }).click();
    const drawer = page.getByRole("dialog", { name: /Mobile navigation/i });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole("link", { name: "Start free trial" })).toBeVisible();
  });

  test("FAQ opens an answer", async ({ page }) => {
    await page.goto("/#faq");
    const button = page.getByRole("button", { name: /What is an AI employee/i });
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByText(/configured digital teammate/i)).toBeVisible();
  });

  test("pricing navigation works", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing/);
  });

  test("demo form validates and shows fields", async ({ page }) => {
    await page.goto("/audit");
    await expect(page.getByLabel(/Business email/i)).toBeVisible();
    await expect(page.getByLabel(/Industry/i)).toBeVisible();
    await page.getByRole("button", { name: /Book a Demo|Contact Sales/i }).click();
    await expect(page).toHaveURL(/\/audit/);
  });

  test("homepage has no serious accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
});

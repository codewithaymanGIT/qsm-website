import { expect, test } from "@playwright/test";
import { signIn } from "./admin-helpers";

test("admin pages require signing in", async ({ page }) => {
  await page.goto("/admin/leads/");
  await expect(page).toHaveURL(/\/admin\/login\/\?next=%2Fadmin%2Fleads/);
  await expect(page.getByRole("heading", { name: "Sign in to the admin panel" })).toBeVisible();
});

test("wrong password shows a neutral error", async ({ page }) => {
  await page.goto("/admin/login/");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password").fill("not-the-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.locator("form").getByRole("alert")).toHaveText("Email or password is incorrect.");
});

test("signing in shows the dashboard and signing out ends the session", async ({ page }) => {
  await signIn(page);
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Signed in as Test Admin.")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login\//);
  await page.goto("/admin/");
  await expect(page).toHaveURL(/\/admin\/login\//);
});

test("a forged session cookie is rejected", async ({ page, context }) => {
  await context.addCookies([{ name: "qsm_session", value: "forged-token-value", url: "http://127.0.0.1:4173" }]);
  await page.goto("/admin/");
  await expect(page).toHaveURL(/\/admin\/login\//);
});

test("the menu matches the role", async ({ page }) => {
  await signIn(page, "sales");
  const nav = page.getByRole("navigation", { name: "Admin" });
  await expect(nav.getByRole("link", { name: "Enquiries" })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Products" })).toHaveCount(0);
  await expect(nav.getByRole("link", { name: "Users" })).toHaveCount(0);
});

test("admin pages are not indexed and have no public chrome", async ({ page }) => {
  await page.goto("/admin/login/");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator("[data-action-bar]")).toHaveCount(0);
});

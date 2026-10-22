import { expect, test } from "@playwright/test";

test("weight calculator works out kg and carries the size into a quote", async ({ page }) => {
  await page.goto("/weight-calculator/?grade=h13");
  await page.waitForLoadState("networkidle");
  await expect(page.locator("h1")).toContainText("Steel weight calculator");
  await expect(page.getByLabel("Steel grade")).toHaveValue("h13");
  await page.getByLabel("Diameter (mm)").fill("100");
  await page.getByLabel("Length (mm)").fill("1000");
  await page.getByLabel("Pieces").fill("2");
  const result = page.getByRole("status");
  await expect(result).toContainText("61.26 kg");
  await expect(result).toContainText("122.52 kg");

  await page.getByRole("link", { name: "Request a quote for this" }).click();
  await expect(page).toHaveURL(/\/quote\/\?/);
  // Next keeps the previous page mounted but hidden; check the visible form only.
  const visible = (label: string) => page.getByLabel(label).filter({ visible: true });
  await expect(visible("Steel grade")).toHaveValue("h13");
  await expect(visible("Dimensions")).toHaveValue("Round 100 mm dia x 1000 mm");
  await expect(visible("Quantity")).toHaveValue("2 pcs (approx. 122.52 kg)");
});

test("other shapes recalculate", async ({ page }) => {
  await page.goto("/weight-calculator/?grade=d2");
  await page.waitForLoadState("networkidle");
  await page.getByText("Flat / block / plate").click();
  await page.getByLabel("Thickness (mm)").fill("50");
  await page.getByLabel("Width (mm)").fill("200");
  await page.getByLabel("Length (mm)").fill("300");
  await expect(page.getByRole("status")).toContainText("23.10 kg");
});

test("the calculator is reachable from the menu and from grade pages", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Weight calculator" })).toBeVisible();
  await page.goto("/grades/h13/");
  await expect(page.locator('main a[href="/weight-calculator/?grade=h13"]')).toBeVisible();
});

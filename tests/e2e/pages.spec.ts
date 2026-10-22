import { expect, test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

test.describe("quote form", () => {
  test("shows a clear error for each missing required field", async ({ page }) => {
    await page.goto("/quote/");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Enter your name.")).toBeVisible();
    await expect(page.getByText("Enter a phone number with at least 10 digits.")).toBeVisible();
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();
  });

  test("preselects the grade from the link", async ({ page }) => {
    await page.goto("/quote/?grade=h13");
    await expect(page.getByLabel("Steel grade")).toHaveValue("h13");
  });

  test("rejects disallowed files with a reason", async ({ page }) => {
    const tmp = path.join(os.tmpdir(), "setup.exe");
    fs.writeFileSync(tmp, "x");
    await page.goto("/quote/");
    // File checks run in the browser, so wait until the form's scripts are active.
    await page.waitForLoadState("networkidle");
    await page.getByLabel(/Drawing/).setInputFiles(tmp);
    await expect(page.getByText("Use PDF, DWG, DXF, STEP, JPG, PNG or WEBP files.")).toBeVisible();
  });

  test("a valid enquiry shows the preview notice and a filled WhatsApp link", async ({ page }) => {
    await page.goto("/quote/?grade=d2");
    await page.getByLabel("Your name").fill("Ravi Kumar");
    await page.getByLabel("Phone").fill("+91 98200 00000");
    await page.getByLabel("Email").fill("ravi@example.com");
    await page.getByLabel("Dimensions").fill("Flat 50 x 200 x 300");
    await page.getByLabel("Quantity").fill("2 pcs");
    await page.getByRole("button", { name: "Send enquiry" }).click();
    await expect(page.getByText("Preview only: enquiries are not sent yet.")).toBeVisible();
    const href = await page.getByRole("link", { name: /Send on WhatsApp/ }).getAttribute("href");
    expect(href).toContain(encodeURIComponent("D2 Steel"));
    expect(href).toContain(encodeURIComponent("Dimensions: Flat 50 x 200 x 300"));
  });
});

test("grade pages include the enquiry form with the grade selected", async ({ page }) => {
  await page.goto("/grades/p20/");
  await expect(page.getByLabel("Steel grade")).toHaveValue("p20");
});

const services = ["bandsaw-cutting", "precision-machining", "surface-grinding", "custom-cutting"];
for (const slug of services) {
  test(`service page ${slug} has hero, photos, form and file upload`, async ({ page }) => {
    await page.goto(`/services/${slug}/`);
    await expect(page.locator("h1")).toBeVisible();
    expect(await page.locator("[data-image-slot]").count()).toBeGreaterThanOrEqual(2);
    await expect(page.getByLabel(/Drawing/)).toBeAttached();
    await expect(page.getByRole("button", { name: "Send enquiry" })).toBeVisible();
  });
}

test("services index links all four services", async ({ page }) => {
  await page.goto("/services/");
  for (const slug of services) await expect(page.locator(`main a[href="/services/${slug}/"]`).first()).toBeVisible();
});

test("about page tells the story without placeholder certificates", async ({ page }) => {
  await page.goto("/about/");
  await expect(page.getByText(/Rs\s500/).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: /certificate|brochure/i })).toHaveCount(0);
});

test("contact page shows Mohit Agrawal and never a warehouse address", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.getByText("Mohit Agrawal").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/warehouse/i);
  await expect(page.getByRole("button", { name: "Send enquiry" })).toBeVisible();
});

test("clients & partners is hidden until logos exist, with a preview switch", async ({ page }) => {
  await page.goto("/clients-partners/");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await page.goto("/clients-partners/?preview=1");
  await expect(page.locator("[data-logo]").first()).toBeVisible();
});

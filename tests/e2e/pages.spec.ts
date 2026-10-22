import { expect, test } from "@playwright/test";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { Client } from "pg";

async function queryOne(sql: string, params: unknown[]) {
  const client = new Client({ connectionString: process.env.E2E_DATABASE_URL ?? "postgresql://qsm:qsm_dev_password@127.0.0.1:5432/qsm_test" });
  await client.connect();
  try {
    return (await client.query(sql, params)).rows[0];
  } finally {
    await client.end();
  }
}

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

  test("a valid enquiry is saved with a drawing and shows its reference", async ({ page }) => {
    const pdf = path.join(os.tmpdir(), "e2e-drawing.pdf");
    fs.writeFileSync(pdf, "%PDF-1.7\n1 0 obj\n");
    await page.goto("/quote/?grade=d2");
    await page.waitForLoadState("networkidle");
    await page.getByLabel("Your name").fill("Ravi Kumar");
    await page.getByLabel("Phone").fill("+91 98200 00000");
    await page.getByLabel("Email").fill("ravi@example.com");
    await page.getByLabel("Dimensions").fill("Flat 50 x 200 x 300");
    await page.getByLabel("Quantity").fill("2 pcs");
    await page.getByLabel(/Drawing/).setInputFiles(pdf);
    await page.getByRole("button", { name: "Send enquiry" }).click();
    const status = page.getByRole("status");
    await expect(status).toContainText("Enquiry received");
    const reference = (await status.textContent())?.match(/QSM-\d{4}-\d{4}/)?.[0];
    expect(reference).toBeTruthy();
    const lead = await queryOne(
      `SELECT l."gradeSlug", l.dimensions, count(u.id)::int AS files FROM "Lead" l LEFT JOIN "Upload" u ON u."leadId" = l.id WHERE l.reference = $1 GROUP BY l.id`,
      [reference],
    );
    expect(lead).toEqual({ gradeSlug: "d2", dimensions: "Flat 50 x 200 x 300", files: 1 });
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

test("customers appear on the homepage and their own page", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const band = page.getByRole("region", { name: "Trusted by" });
  await band.scrollIntoViewIfNeeded();
  for (const name of ["Maruti Suzuki", "Tata", "Mahindra", "Bhilai Steel Plant (SAIL)", "Sandvik Coromant"]) {
    const logo = band.getByRole("img", { name, exact: true }).first();
    await expect(logo).toBeAttached();
    // The logo file is served (images load lazily, so check the file rather than the paint).
    const src = await logo.getAttribute("src");
    expect((await page.request.get(src!)).headers()["content-type"]).toBe("image/png");
  }
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Clients" }).click();
  await expect(page.locator("h1").filter({ visible: true })).toHaveText("Companies we have supplied.");
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test("call and WhatsApp buttons use the company number", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/grades/h13/");
  const hrefs = await page.locator("[data-action-bar] a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(hrefs[0]).toMatch(/^https:\/\/wa\.me\/919284127584\?text=/);
  expect(hrefs[1]).toBe("tel:+919284127584");
});

test("contact page shows the office address and never the warehouse", async ({ page }) => {
  await page.goto("/contact/");
  await expect(page.getByText("Sanghvi Steel Compound").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/nighoje|chakan|uno minda/i);
});

test("the clients grid centres an incomplete last row", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/clients-partners/");
  const tiles = page.locator("main ul li");
  const boxes = await tiles.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, y: r.y, w: r.width })));
  const rows = [...new Set(boxes.map((b) => Math.round(b.y)))];
  const last = boxes.filter((b) => Math.round(b.y) === rows[rows.length - 1]);
  const first = boxes.filter((b) => Math.round(b.y) === rows[0]);
  const centre = (row: typeof boxes) => (Math.min(...row.map((b) => b.x)) + Math.max(...row.map((b) => b.x + b.w))) / 2;
  expect(Math.abs(centre(last) - centre(first))).toBeLessThan(2);
});

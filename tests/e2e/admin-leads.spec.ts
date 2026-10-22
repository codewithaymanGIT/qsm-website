import { expect, test } from "@playwright/test";
import { signIn } from "./admin-helpers";

async function submitEnquiry(request: import("@playwright/test").APIRequestContext, name: string) {
  const res = await request.post("/api/leads", {
    headers: { "x-forwarded-for": `198.51.100.${Math.floor(Math.random() * 250) + 1}` },
    multipart: {
      name,
      company: "Admin Test Moulds",
      phone: "+91 98200 00000",
      email: "buyer@example.com",
      grade: "h13",
      dimensions: "Round 120 mm dia x 300 mm",
      quantity: "4 pcs",
      message: "=HYPERLINK(\"http://evil.example\")",
      drawing: { name: "drawing.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.7\n1 0 obj\n") },
    },
  });
  expect(res.status()).toBe(201);
  return (await res.json()).reference as string;
}

test("sales staff find, track and export an enquiry", async ({ page, request }) => {
  const name = `Buyer ${Date.now()}`;
  const reference = await submitEnquiry(request, name);
  await signIn(page, "sales");

  await page.goto(`/admin/leads/?q=${encodeURIComponent(name)}`);
  await expect(page.getByRole("link", { name: reference })).toBeVisible();
  await page.getByRole("link", { name: reference }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("Round 120 mm dia x 300 mm")).toBeVisible();

  await page.getByLabel("Status", { exact: true }).filter({ visible: true }).selectOption("QUOTED");
  await page.getByRole("button", { name: "Save status" }).click();
  await expect(page.getByText(/Test Sales: status New → Quoted/)).toBeVisible();
  await page.getByLabel("Add a note").fill("Sent quotation by WhatsApp.");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText(/Test Sales: Sent quotation by WhatsApp\./)).toBeVisible();

  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "drawing.pdf" }).click();
  expect((await download).suggestedFilename()).toBe("drawing.pdf");

  // Export the way staff do: filter, then click the button.
  await page.goto(`/admin/leads/?q=${encodeURIComponent(name)}`);
  const exported = page.waitForEvent("download");
  await page.getByRole("link", { name: "Export to Excel" }).click();
  const file = await exported;
  expect(file.suggestedFilename()).toMatch(/^qsm-enquiries-\d{4}-\d{2}-\d{2}\.csv$/);
  const text = (await import("node:fs")).readFileSync((await file.path())!, "utf8");
  expect(text).toContain(reference);
  expect(text).toContain("Quoted");
  expect(text).toContain(`"'=HYPERLINK(""http://evil.example"")"`);
});

test("files and exports need a signed-in user", async ({ playwright }) => {
  const anon = await playwright.request.newContext({ baseURL: "http://127.0.0.1:4173" });
  const exp = await anon.get("/admin/leads/export/", { maxRedirects: 0 });
  expect([307, 308, 401]).toContain(exp.status());
  const file = await anon.get("/admin/uploads/anything/", { maxRedirects: 0 });
  expect([307, 308, 401]).toContain(file.status());
  const forged = await playwright.request.newContext({
    baseURL: "http://127.0.0.1:4173",
    extraHTTPHeaders: { cookie: "qsm_session=forged" },
  });
  expect((await forged.get("/admin/leads/export/")).status()).toBe(401);
  await anon.dispose();
  await forged.dispose();
});

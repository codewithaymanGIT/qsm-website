import { expect, test } from "@playwright/test";
import { signIn } from "./admin-helpers";

// 1×1 transparent PNG: passes the server's file signature check.
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");

test("an editor's change to a grade shows on the public page straight away", async ({ page }) => {
  await signIn(page, "editor");
  await page.goto("/admin/products/");
  await page.getByRole("link", { name: /^H13\b/ }).click();
  const tagline = page.getByLabel("Tagline");
  const original = await tagline.inputValue();
  const changed = `Hot work die steel, tested ${Date.now()}`;

  try {
    await tagline.fill(changed);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved. The website is updated.")).toBeVisible();
    await page.goto("/grades/h13/");
    await expect(page.getByText(changed)).toBeVisible();
  } finally {
    await page.goto("/admin/products/");
    await page.getByRole("link", { name: /^H13\b/ }).click();
    await page.getByLabel("Tagline").fill(original);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByText("Saved. The website is updated.")).toBeVisible();
  }
});

test("a validation error keeps what was typed", async ({ page }) => {
  await signIn(page, "editor");
  await page.goto("/admin/products/new/");
  await page.getByLabel("Grade name").fill("Test grade");
  await page.getByLabel("Web address").fill("Not A Slug!");
  await page.getByLabel("Category", { exact: true }).selectOption({ index: 1 });
  await page.getByLabel("Tagline").fill("Testing");
  await page.getByLabel("Overview").fill("Testing");
  await page.getByRole("button", { name: "Create grade" }).click();
  await expect(page.getByText(/use lowercase letters, numbers and hyphens/)).toBeVisible();
  await expect(page.getByLabel("Grade name")).toHaveValue("Test grade");
});

test("a customer logo uploaded in the admin appears on the clients page", async ({ page }) => {
  const name = `Logo Test ${Date.now()}`;
  await signIn(page, "editor");
  await page.goto("/admin/customers/");
  const add = page.getByRole("region", { name: "Add a customer" });
  await add.getByLabel("Company name").fill(name);
  await add.getByLabel("Logo").setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: PNG });
  await add.getByRole("button", { name: "Add customer" }).click();
  await expect(add.getByText("Customer added.")).toBeVisible();

  await page.goto("/clients-partners/");
  const logo = page.getByRole("img", { name }).first();
  await expect(logo).toBeAttached();
  const src = await logo.getAttribute("src");
  expect(src).toMatch(/^\/files\/[0-9a-f-]{36}\.png$/);
  expect((await page.request.get(src!)).status()).toBe(200);

  await page.goto("/admin/customers/");
  const row = page.getByRole("region", { name });
  await row.getByText("Delete", { exact: true }).click();
  await row.getByLabel("Yes, delete it permanently").check();
  await row.getByRole("button", { name: `Delete ${name}` }).click();
  await expect(row).toHaveCount(0);
  expect((await page.request.get(src!)).status()).toBe(404);
});

test("an SVG cannot be uploaded as a logo", async ({ page }) => {
  await signIn(page, "editor");
  await page.goto("/admin/customers/");
  const add = page.getByRole("region", { name: "Add a customer" });
  await add.getByLabel("Company name").fill("SVG Test");
  await add.getByLabel("Logo").setInputFiles({
    name: "logo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg onload='alert(1)'/>"),
  });
  await add.getByRole("button", { name: "Add customer" }).click();
  await expect(add.getByText("Upload a JPG, PNG or WEBP file.")).toBeVisible();
});

test("roles: sales cannot open products, editors cannot open users", async ({ browser }) => {
  const sales = await browser.newPage();
  await signIn(sales, "sales");
  await sales.goto("/admin/products/");
  await expect(sales).toHaveURL(/\/admin\/\?denied=1/);
  await expect(sales.getByRole("link", { name: "Products" })).toHaveCount(0);

  const editor = await browser.newPage();
  await signIn(editor, "editor");
  await editor.goto("/admin/users/");
  await expect(editor).toHaveURL(/\/admin\/\?denied=1/);
  await expect(editor.getByRole("link", { name: "Users" })).toHaveCount(0);
  await expect(editor.getByRole("link", { name: "Products" })).toBeVisible();
});

test("an admin creates a user who can then sign in", async ({ page, browser }) => {
  const email = `new${Date.now()}@example.com`;
  await signIn(page, "admin");
  await page.goto("/admin/users/");
  const add = page.getByRole("region", { name: "Add a user" });
  await add.getByLabel("Name").fill("New Sales Person");
  await add.getByLabel("Email").fill(email);
  await add.getByLabel("Role").selectOption("SALES");
  await add.getByLabel("Temporary password").fill("short");
  await add.getByRole("button", { name: "Create user" }).click();
  await expect(add.getByText("Passwords need at least 12 characters.")).toBeVisible();
  await add.getByLabel("Temporary password").fill("a-long-temporary-pass");
  await add.getByRole("button", { name: "Create user" }).click();
  await expect(add.getByText(`Created ${email}.`, { exact: false })).toBeVisible();

  const other = await browser.newPage();
  await other.goto("/admin/login/");
  await other.getByLabel("Email").fill(email);
  await other.getByLabel("Password").fill("a-long-temporary-pass");
  await other.getByRole("button", { name: "Sign in" }).click();
  await expect(other).toHaveURL(/\/admin\/$/);
});

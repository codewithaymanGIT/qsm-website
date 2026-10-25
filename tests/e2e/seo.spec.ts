import { expect, test } from "@playwright/test";

test("sitemap lists public pages only, robots keeps crawlers out of the admin", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/grades/h13/</loc>");
  expect(sitemap).toContain("/services/</loc>");
  expect(sitemap).not.toContain("/admin");
  const robots = await (await request.get("/robots.txt")).text();
  expect(robots).toMatch(/Disallow: \/admin\//);
  expect(robots).toMatch(/Sitemap: .*\/sitemap\.xml/);
});

test("pages carry a canonical link, share image and structured data", async ({ page }) => {
  await page.goto("/grades/h13/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/grades\/h13\/$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /opengraph-image/);
  const crumbs = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
  expect(crumbs["@type"]).toBe("BreadcrumbList");
  expect(crumbs.itemListElement.at(-1).name).toBe("H13");

  await page.goto("/");
  const org = JSON.parse((await page.locator('script[type="application/ld+json"]').first().textContent())!);
  expect(org).toMatchObject({
    "@type": "Organization",
    foundingDate: "2002",
    founder: { name: "Hemant Bansal" },
  });
  expect(JSON.stringify(org)).not.toMatch(/Nighoje|Chakan|Uno Minda/i);
  await expect(page).toHaveTitle(/^Quality Steel and Metals \| Tool Steel/);
});

test("the share image renders", async ({ request }) => {
  const res = await request.get("/opengraph-image");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/png");
});

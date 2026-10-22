import { afterAll, describe, expect, it } from "vitest";
import { db } from "@/lib/server/db";
import { jsonLd, pageMetadata, publicPaths } from "@/lib/seo";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

afterAll(async () => {
  await db.seoEntry.deleteMany({ where: { path: "/services/" } });
});

describe("pageMetadata", () => {
  it("uses page defaults with a canonical link", async () => {
    const m = await pageMetadata("/about/", {
      title: "About Us",
      description: "Since 2002.",
    });
    expect(m.title).toBe("About Us");
    expect(m.description).toBe("Since 2002.");
    expect(m.alternates?.canonical).toBe("/about/");
    expect(m.openGraph?.url).toBe("/about/");
  });

  it("applies admin overrides, including noindex", async () => {
    await db.seoEntry.create({
      data: {
        path: "/services/",
        title: "Steel Cutting Services Pune",
        description: "Custom.",
        noindex: true,
      },
    });
    const m = await pageMetadata("/services/", {
      title: "Processing Services",
      description: "Default.",
    });
    expect(m.title).toBe("Steel Cutting Services Pune");
    expect(m.description).toBe("Custom.");
    expect(m.robots).toEqual({ index: false, follow: true });
  });
});

describe("sitemap and robots", () => {
  it("lists every public page with absolute URLs and no admin pages", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toContain("http://localhost:3000/grades/h13/");
    expect(urls).toContain("http://localhost:3000/products/hot-work-die-steel/");
    expect(urls).toContain("http://localhost:3000/weight-calculator/");
    expect(urls.some((u) => u.includes("/admin"))).toBe(false);
    expect(urls).not.toContain("http://localhost:3000/services/"); // noindex override above
  });

  it("keeps crawlers out of admin and API", () => {
    const r = robots();
    const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules;
    expect(rule.disallow).toEqual(["/admin/", "/api/"]);
    expect(r.sitemap).toBe("http://localhost:3000/sitemap.xml");
  });

  it("knows all public paths for the SEO editor", async () => {
    const paths = await publicPaths();
    expect(paths).toContain("/");
    expect(paths).toContain("/grades/p20-ni/");
    expect(paths).toContain("/services/surface-grinding/");
  });
});

describe("jsonLd", () => {
  it("escapes characters that could close the script tag", () => {
    expect(jsonLd({ name: "</script><script>alert(1)</script>" })).not.toContain("</script>");
  });
});

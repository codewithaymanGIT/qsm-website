// Parsing and saving for the admin content editors. Server Actions call these after
// requireUser() and then updateTag(CATALOG_TAG) so the public site refreshes.
import "server-only";
import { z } from "zod";
import { db } from "./db";

/** A validation problem worded for the person filling in the form. */
export class AdminInputError extends Error {}

const text = (form: FormData, key: string) => String(form.get(key) ?? "").trim();
const lines = (form: FormData, key: string) =>
  text(form, key)
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
const commaList = (form: FormData, key: string) =>
  text(form, key)
    .split(",")
    .map((l) => l.trim())
    .filter(Boolean);

/** Repeated rows named prefix.0.field, prefix.1.field … Rows with every field blank are skipped. */
export function rows<F extends string>(form: FormData, prefix: string, fields: readonly F[]): Record<F, string>[] {
  const out: Record<F, string>[] = [];
  for (let i = 0; i < 100; i++) {
    if (!fields.some((f) => form.has(`${prefix}.${i}.${f}`))) break;
    const row = Object.fromEntries(fields.map((f) => [f, text(form, `${prefix}.${i}.${f}`)])) as Record<F, string>;
    if (fields.some((f) => row[f])) out.push(row);
  }
  return out;
}

function check<T>(schema: z.ZodType<T>, value: unknown): T {
  const r = schema.safeParse(value);
  if (!r.success) throw new AdminInputError(r.error.issues[0].message);
  return r.data;
}

const number = (label: string) =>
  z
    .string()
    .transform((v) => (v === "" ? undefined : Number(v)))
    .refine((v) => v === undefined || Number.isFinite(v), `${label} must be a number, like 0.45.`);

export const slugSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Web address: use lowercase letters, numbers and hyphens only (e.g. p20-ni).");

const productSchema = z.object({
  name: z.string().min(1, "Enter the grade name."),
  slug: slugSchema,
  categoryId: z.string().min(1, "Choose a category."),
  tagline: z.string().min(1, "Enter a short tagline."),
  equivalents: z.array(z.string()),
  overview: z.string().min(1, "Enter an overview."),
  applications: z.array(z.string()),
  industries: z.array(z.string()),
  hardness: z.string(),
  forms: z.array(z.string()),
  order: z.number().int(),
  published: z.boolean(),
  composition: z.array(
    z.object({
      element: z.string().min(1, "Each composition row needs an element."),
      min: number("Minimum"),
      max: number("Maximum"),
    }),
  ),
  mechanical: z.array(
    z.object({
      label: z.string().min(1, "Each property needs a name."),
      value: z.string(),
    }),
  ),
  heatTreatment: z.array(
    z.object({
      step: z.string().min(1, "Each heat treatment row needs a step."),
      detail: z.string(),
    }),
  ),
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductForm(form: FormData): ProductInput {
  const parsed = check(productSchema, {
    name: text(form, "name"),
    slug: text(form, "slug").toLowerCase(),
    categoryId: text(form, "categoryId"),
    tagline: text(form, "tagline"),
    equivalents: commaList(form, "equivalents"),
    overview: text(form, "overview"),
    applications: lines(form, "applications"),
    industries: lines(form, "industries"),
    hardness: text(form, "hardness"),
    forms: lines(form, "forms"),
    order: Number(text(form, "order") || 0),
    published: form.get("published") === "on",
    composition: rows(form, "composition", ["element", "min", "max"] as const),
    mechanical: rows(form, "mechanical", ["label", "value"] as const),
    heatTreatment: rows(form, "heatTreatment", ["step", "detail"] as const),
  });
  // Drop undefined min/max so the stored JSON matches the website's shape exactly.
  parsed.composition = parsed.composition.map((c) => JSON.parse(JSON.stringify(c)));
  return parsed;
}

/** Creates (id = null) or updates a product. Returns its id. */
export async function saveProduct(id: string | null, input: ProductInput): Promise<string> {
  const clash = await db.product.findUnique({ where: { slug: input.slug } });
  if (clash && clash.id !== id) throw new AdminInputError(`The web address "${input.slug}" is already used by ${clash.name}.`);
  const data = {
    ...input,
    composition: input.composition,
    mechanical: input.mechanical,
    heatTreatment: input.heatTreatment,
  };
  const saved = id ? await db.product.update({ where: { id }, data }) : await db.product.create({ data });
  return saved.id;
}

const categorySchema = z.object({
  name: z.string().min(1, "Enter the category name."),
  slug: slugSchema,
  shortDescription: z.string().min(1, "Enter a short description."),
  order: z.number().int(),
});

export async function saveCategory(id: string | null, form: FormData) {
  const input = check(categorySchema, {
    name: text(form, "name"),
    slug: text(form, "slug").toLowerCase(),
    shortDescription: text(form, "shortDescription"),
    order: Number(text(form, "order") || 0),
  });
  const clash = await db.category.findUnique({ where: { slug: input.slug } });
  if (clash && clash.id !== id) throw new AdminInputError(`The web address "${input.slug}" is already used by ${clash.name}.`);
  return id ? db.category.update({ where: { id }, data: input }) : db.category.create({ data: input });
}

export async function deleteCategory(id: string) {
  const count = await db.product.count({ where: { categoryId: id } });
  if (count > 0) throw new AdminInputError(`Move or delete its ${count} grade${count === 1 ? "" : "s"} first.`);
  return (await db.category.delete({ where: { id } })).imageKey;
}

const serviceSchema = z.object({
  name: z.string().min(1, "Enter the service name."),
  summary: z.string().min(1, "Enter a one-line summary."),
  description: z.array(z.string()).min(1, "Enter at least one paragraph."),
  capabilities: z.array(z.string()),
  order: z.number().int(),
  published: z.boolean(),
});

export async function saveService(id: string, form: FormData) {
  const input = check(serviceSchema, {
    name: text(form, "name"),
    summary: text(form, "summary"),
    description: lines(form, "description"),
    capabilities: lines(form, "capabilities"),
    order: Number(text(form, "order") || 0),
    published: form.get("published") === "on",
  });
  return db.service.update({ where: { id }, data: input });
}

const contactSchema = z.object({
  contactName: z.string().min(1, "Enter the contact person."),
  phone: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "Phone needs at least 10 digits."),
  whatsapp: z.string().refine((v) => v.replace(/\D/g, "").length >= 10, "WhatsApp number needs at least 10 digits."),
  email: z.string().email("Enter a valid email address."),
  officeAddress: z.string().min(1, "Enter the office address."),
  mapEmbedUrl: z
    .string()
    .refine(
      (v) => v === "" || /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed\?/.test(v),
      "Map link must be a Google Maps embed link (Share → Embed a map).",
    )
    .transform((v) => v || null),
});

export async function saveSettings(form: FormData) {
  const input = check(
    contactSchema,
    Object.fromEntries(["contactName", "phone", "whatsapp", "email", "officeAddress", "mapEmbedUrl"].map((k) => [k, text(form, k)])),
  );
  const current = ((await db.setting.findUnique({ where: { key: "contact" } }))?.value ?? {}) as Record<string, unknown>;
  await db.setting.upsert({
    where: { key: "contact" },
    update: { value: { ...current, ...input } },
    create: { key: "contact", value: { ...current, ...input } },
  });
}

export async function saveTimeline(form: FormData) {
  const entries = rows(form, "rows", ["year", "title", "body"] as const);
  for (const e of entries) if (!e.year || !e.title) throw new AdminInputError("Each timeline entry needs a year and a title.");
  await db.setting.upsert({
    where: { key: "timeline" },
    update: { value: entries },
    create: { key: "timeline", value: entries },
  });
}

const seoSchema = z.object({
  title: z.string().max(70, "Keep the title under 70 characters; Google cuts longer ones."),
  description: z.string().max(200, "Keep the description under 200 characters."),
  noindex: z.boolean(),
});

/** Page title/description overrides. Blank fields fall back to the page's own text. */
export async function saveSeoEntry(path: string, form: FormData) {
  const { publicPaths } = await import("@/lib/seo");
  if (!(await publicPaths()).includes(path)) throw new AdminInputError("That page does not exist.");
  const input = check(seoSchema, {
    title: text(form, "title"),
    description: text(form, "description"),
    noindex: form.get("noindex") === "on",
  });
  const data = {
    title: input.title || null,
    description: input.description || null,
    noindex: input.noindex,
  };
  if (!data.title && !data.description && !data.noindex) {
    await db.seoEntry.deleteMany({ where: { path } });
    return;
  }
  await db.seoEntry.upsert({
    where: { path },
    update: data,
    create: { path, ...data },
  });
}

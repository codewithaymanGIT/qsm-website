# QSM Website Phase 1 (Front End) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The public website for Quality Steel and Metals, built as real Next.js code with sample content and published as a private static preview for client review.

**Architecture:** A Next.js App Router site, statically exported (`output: 'export'`). All content comes from typed data files in `src/content/`, accessed only through loader functions in `src/lib/content.ts`, so Phase 2 replaces the loaders with Prisma queries without touching pages. Motion uses Framer Motion plus Lenis smooth scroll, and both respect `prefers-reduced-motion`.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Lenis, Zod, react-hook-form, Vitest, Playwright (Chromium at /opt/pw-browsers).

**Spec:** `docs/superpowers/specs/2026-10-22-qsm-frontend-design.md`

## Global Constraints

- Colours: `#0A0A0A` primary, `#1A1A1A` secondary, `#C9A35D` accent, `#F8F8F8` surface. Gold text on light backgrounds uses `#7A5D24`.
- Fonts: Inter Tight (headings), Inter (body), via `next/font/google`.
- No prices, stock quantities, cart or checkout anywhere.
- No invented clients, awards, certifications, turnover, numbers, partnerships, milestones or testimonials. Timeline entries are only 2002 (Rs 500, Hemant Agrawal) and Today.
- Never render a warehouse address. Settings expose `officeAddress` only.
- Unknown contact data is shown as the literal tokens `[PHONE]`, `[WHATSAPP]`, `[EMAIL]`, `[OFFICE ADDRESS]`.
- No stock photography. Image slots render `ImageSlot` (a generated steel texture plus a label with aspect ratio and shot description).
- Technical data tables show "Typical values. Confirm against mill certificate."
- WhatsApp text: `Hello, I would like a quotation for {grade} Steel.\nDimensions:\nQuantity:\nPlease contact me.`
- Breakpoints: 1920, 1440, 1024, 768, 480, 360. No horizontal scroll at any of them.
- Only `transform` and `opacity` are animated.
- Routes: `/`, `/about`, `/products`, `/products/[category]`, `/grades/[slug]`, `/services`, `/services/[slug]`, `/clients-partners`, `/contact`, `/quote`.

## Review Focus

1. A grade name containing `+` (P20+Ni) in the WhatsApp link: it must be URL-encoded, or WhatsApp drops it. Tested in Task 2.
2. A WhatsApp number left as the token `[WHATSAPP]`: the link must still open WhatsApp (`https://wa.me/?text=…`) rather than produce a broken URL. Tested in Task 2.
3. The 360 px viewport: long grade names and huge headings must wrap rather than cause horizontal scroll. Tested in Task 7's Playwright spec on every route.
4. Reduced motion: with `prefers-reduced-motion: reduce`, content must be visible immediately and never stuck at opacity 0. Tested in Task 3.
5. Quote form file picker: files that are disallowed (e.g. `.exe`) or larger than 20 MB are rejected with a clear message, even in Phase 1. Tested in Task 6.

---

## File Structure

```
qsm-website/
  next.config.ts            output:'export', trailingSlash:true, images.unoptimized:true
  src/app/                  layout.tsx, globals.css, page.tsx, about/, products/, grades/[slug]/, services/, services/[slug]/, clients-partners/, contact/, quote/, not-found.tsx
  src/content/              types.ts, settings.ts, categories.ts, products.ts, services.ts, gallery.ts, partners.ts, timeline.ts
  src/lib/                  content.ts, whatsapp.ts, quote-schema.ts, upload-rules.ts
  src/components/brand/     Logo.tsx
  src/components/layout/    Header.tsx, MobileMenu.tsx, Footer.tsx, MobileActionBar.tsx, FloatingWhatsApp.tsx, SmoothScroll.tsx
  src/components/ui/        Button.tsx, Reveal.tsx, SectionHeading.tsx, ImageSlot.tsx, SteelTexture.tsx
  src/components/home/      Hero.tsx, Snapshot.tsx, CategoryCards.tsx, WhyChooseUs.tsx, ServicesPreview.tsx, FounderTimeline.tsx, InfrastructureGallery.tsx, EnquiryBanner.tsx
  src/components/product/   GradeHero.tsx, SpecTable.tsx, CompositionTable.tsx, Downloads.tsx, RelatedGrades.tsx
  src/components/forms/     QuoteForm.tsx, FileField.tsx
  tests/unit/               whatsapp.test.ts, content.test.ts, quote-schema.test.ts, upload-rules.test.ts
  tests/e2e/                responsive.spec.ts, motion.spec.ts
```

### Task 1: Scaffold, design tokens, content types and data

**Files:** project scaffold; `src/app/globals.css`; `src/content/*`; `src/lib/content.ts`; `tests/unit/content.test.ts`

**Interfaces — Produces:**
- `types.ts`: `Category {slug,name,shortDescription,order}`, `Product {slug,name,categorySlug,equivalents:string[],overview,applications:string[],industries:string[],composition:{element:string,min?:number,max?:number,typical?:string}[],mechanical:{label:string,value:string}[],heatTreatment:{step:string,detail:string}[],hardness:string,forms:string[],datasheets:Download[],certificates:Download[]}`, `Download {title,href}`, `Service {slug,name,summary,description:string[],capabilities:string[]}`, `GalleryItem {id,label,aspect:'portrait'|'landscape'|'square',shot:string}`, `PartnerLogo {id,name,src}`, `TimelineEntry {year:string,title,body}`, `Settings {contactName,phone,whatsapp,email,officeAddress,mapEmbedUrl:string|null}`.
- `content.ts`: `getCategories(): Category[]` (sorted by order), `getCategory(slug)`, `getProducts()`, `getProductsByCategory(slug)`, `getProduct(slug)`, `getRelatedProducts(slug, limit=3)` (same category first, then others), `getServices()`, `getService(slug)`, `getGallery()`, `getPartners()`, `getTimeline()`, `getSettings()`.

- [ ] Step 1: `create-next-app` (TS, Tailwind, App Router, src dir), add framer-motion, lenis, zod, react-hook-form, @hookform/resolvers, vitest, @playwright/test; set next.config as in the File Structure; `git init`.
- [ ] Step 2: Write `content.test.ts`: 8 categories in this order (plastic-mould-steel, hot-work-die-steel, cold-work-tool-steel, high-speed-steel, en-series-engineering-steel, alloy-steel, mould-base-plates, other-steel-grades); 9 products with slugs p20, p20-ni, h13, h11, d2, skd11, skd61, ohns, hchcr; every product's categorySlug exists; `getRelatedProducts('h13')` excludes h13 and has length 3; `getTimeline()` years equal `['2002','Today']`; `getSettings()` has no key containing "warehouse"; serialised content does not match `/₹|price|in stock|award|certified/i`.
- [ ] Step 3: Run `npx vitest run tests/unit/content.test.ts`. Expected: FAIL (modules missing).
- [ ] Step 4: Write the content and loaders. Category mapping: P20, P20+Ni → plastic mould; H13, H11, SKD61 → hot work; D2, SKD11, HCHCR, OHNS → cold work. Composition uses typical published ranges (AISI P20, H13, H11, D2, O1 for OHNS; JIS SKD11, SKD61; D3 for HCHCR). Datasheet and certificate arrays are empty. Tokens for unknown settings.
- [ ] Step 5: Tokens in `globals.css` `@theme`: the colours above, plus fluid display sizes `--text-display: clamp(2.75rem, 7vw, 7.5rem)` and `--text-h2: clamp(2rem, 4.5vw, 4.5rem)`.
- [ ] Step 6: Run the test. Expected: PASS. Commit "feat: scaffold and typed content".

### Task 2: WhatsApp link builder

**Files:** `src/lib/whatsapp.ts`, `tests/unit/whatsapp.test.ts`
**Produces:** `buildWhatsAppUrl(number: string, subject?: string): string`, `whatsappMessage(subject?: string): string`

- [ ] Step 1: Tests: `whatsappMessage('H13')` equals the exact Global Constraints text with `H13`; with no subject it says `a quotation for steel.`; `buildWhatsAppUrl('+91 98200 00000','P20+Ni')` starts with `https://wa.me/919820000000?text=` and contains `P20%2BNi`; `buildWhatsAppUrl('[WHATSAPP]','H13')` starts with `https://wa.me/?text=`.
- [ ] Step 2: Run. Expected FAIL. Step 3: implement (strip non-digits; empty means no number; `encodeURIComponent`). Step 4: Run. PASS. Commit.

### Task 3: Global shell: logo, header, menus, footer, action bar, motion primitives

**Files:** `components/brand/Logo.tsx`, `components/layout/*`, `components/ui/*`, `app/layout.tsx`, `tests/e2e/motion.spec.ts`
**Produces:** `<Logo variant="full"|"mark" tone="dark"|"light" />`, `<Reveal delay?>`, `<Button href variant="gold"|"ghost">`, `<ImageSlot aspect label shot />`, `<SectionHeading eyebrow title />`

- [ ] Step 1: `motion.spec.ts`: with `reducedMotion: 'reduce'`, on `/`, every `[data-reveal]` element has computed opacity "1" within 500 ms; under 1024 px, `[data-action-bar]` is visible with links whose hrefs start with `https://wa.me/`, `tel:` and `/quote`.
- [ ] Step 2: Build the components. Logo D refined as an inline SVG (three plates, gold top). The header goes solid after 40 px of scroll. The mobile menu is full-screen. `SmoothScroll` (Lenis) is disabled for reduced motion. `Reveal` uses `useReducedMotion()` and renders statically when it returns true.
- [ ] Step 3: `npm run build && npx playwright test tests/e2e/motion.spec.ts`. Expected: PASS. Commit.

### Task 4: Home page (8 sections), then preview publish → CLIENT REVIEW 1

**Files:** `components/home/*`, `app/page.tsx`
- [ ] Step 1: Build sections in spec order with the spec's exact headline and CTA text. The hero uses `SteelTexture` (CSS layered gradients plus slowly drifting plate shapes, transform-only) and a `<video>` slot that renders only when `settings.heroVideo` is set. The category cards are horizontal at ≥1024 px and stacked below that. The gallery uses CSS columns masonry.
- [ ] Step 2: `npm run build`. The static export goes to `out/`. Verify locally with Playwright screenshots at 1440 and 390 px.
- [ ] Step 3: Publish `out/` as a private Artifact (index.html plus `files`). If asset paths break, set `assetPrefix`/`basePath` and republish. Send the link to the client and wait for feedback.

### Task 5: Products, categories and grade pages → CLIENT REVIEW 2

**Files:** `app/products/**`, `app/grades/[slug]/page.tsx`, `components/product/*`
- [ ] Step 1: `generateStaticParams` from the loaders. Each grade page has the sections in spec order, `Downloads` returns null when both arrays are empty, and the WhatsApp link uses `buildWhatsAppUrl(settings.whatsapp, product.name)`. Each page has its own metadata (`title: "{name} Steel | Quality Steel and Metals"`).
- [ ] Step 2: Build, republish, review.

### Task 6: Quote form, services, about, contact, clients & partners → CLIENT REVIEW 3

**Files:** `lib/quote-schema.ts`, `lib/upload-rules.ts`, `components/forms/*`, the remaining `app/*` routes, `tests/unit/quote-schema.test.ts`, `tests/unit/upload-rules.test.ts`
**Produces:** `quoteSchema` (zod: name, company, phone ≥10 digits, email, grade, dimensions, quantity, message ≤2000 chars; company optional), `ALLOWED_EXTENSIONS = ['pdf','dwg','dxf','step','stp','jpg','jpeg','png','webp']`, `MAX_UPLOAD_BYTES = 20*1024*1024`, `validateUpload(name: string, size: number): {ok:true}|{ok:false,reason:string}`
- [ ] Step 1: Tests: `validateUpload('a.exe',10)` returns not ok with a reason mentioning allowed types; `validateUpload('part.STEP', 1)` returns ok (case-insensitive); a size of 20 MB + 1 returns not ok; `quoteSchema` rejects phone `"123"` and accepts a complete valid sample.
- [ ] Step 2: Run. FAIL. Step 3: implement. Step 4: PASS.
- [ ] Step 5: Pages. On submit in Phase 1 the form shows "Preview only: enquiries are not sent yet." plus a WhatsApp button. `/quote?grade=h13` preselects the grade. `/clients-partners` calls `notFound()` when `getPartners()` is empty, unless `?preview=1` (sample neutral shapes). About hides the certificates and brochure sections. Contact shows a map only when `mapEmbedUrl` is set.
- [ ] Step 6: Build, republish, review. Commit.

### Task 7: Responsive and performance pass → CLIENT REVIEW 4

**Files:** `tests/e2e/responsive.spec.ts`
- [ ] Step 1: For each route × [1920,1440,1024,768,480,360]: `document.documentElement.scrollWidth <= innerWidth`, no console errors.
- [ ] Step 2: Fix failures. Run Lighthouse (desktop and mobile) on the `out/` build. Target 95+, and report the real scores.
- [ ] Step 3: Generate `SHOT-LIST.md` from all `ImageSlot` labels. Republish. Commit.

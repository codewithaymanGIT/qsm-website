# Phase 2a: Database and working enquiries (design + plan)

Date: 2026-10-22 · Status: approved to proceed. The client delegated technical decisions ("let's move on"); the decisions below are recorded as rulings.

## Intent

Phase 1 delivered the approved public site, reading content from typed files. Phase 2a makes it a real system:
- All content lives in PostgreSQL, ready for the Phase 2b admin panel.
- Enquiries submitted on the website are stored, attached files are kept privately, and the team gets an email.

Non-goals for 2a: the admin panel UI, authentication, the SEO files, Docker and deployment. Those come in 2b and 2c. The schema already includes the tables those phases need.

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Runtime | Next.js server (`output: "standalone"`), `cacheComponents: true` | Needed for the API, uploads and admin. Static export is dropped. |
| Data access | Prisma 7 + `@prisma/adapter-pg`; loaders in `src/lib/content.ts` keep their names, become `async`, use `"use cache"` + `cacheLife("max")` + `cacheTag("catalog")` | Pages are prerendered like before (Lighthouse is unchanged); admin edits call `revalidateTag("catalog")`. |
| Build | Needs a reachable database (prerendering reads content) | Deploy script (2c) starts the database before building. |
| Seed | Current `src/content/*` files become the seed source (`prisma/seed.ts`) | One source of truth for the initial content; nothing is retyped. |
| Leads API | `POST /api/leads`, `multipart/form-data`: fields as in `quoteSchema`, plus `drawing`, `cad`, `service`, `website` (honeypot), `pagePath` | Same validation as the form (shared schema). |
| Files | Saved under `UPLOAD_DIR` (default `./storage/uploads`, outside `public/`), random UUID names, extension from an allow-list, content checked by magic bytes where the format has them (PDF, PNG, JPEG, WEBP, DWG `AC10`, STEP `ISO-10303-21`). DXF is text: the first 4 KB must be printable ASCII. 20 MB limit per file, enforced while streaming. | Prevents public access and disguised executables. |
| Email | Nodemailer over SMTP (`SMTP_URL`, `LEAD_NOTIFY_TO`, `MAIL_FROM`). If SMTP is not configured, or sending fails, the lead is still saved and the failure is logged in `Lead.emailError`. | The database is the system of record; email is a notification. |
| Abuse | Honeypot field. 5 submissions per IP per 10 minutes (counted in the database, so it survives restarts). IP stored as a SHA-256 hash with a server salt. | No third-party captcha, and no raw IPs stored. |
| Reference | `QSM-YYYY-NNNN` from a database sequence | Staff and buyers can quote it. |
| Preview link | The build-preview script runs `next build` + `next start` against the dev database, crawls internal links from `/`, and inlines assets as before. The preview form keeps its "preview only" notice (`NEXT_PUBLIC_PREVIEW=1`). | The preview host cannot run a server. |

## Schema (Prisma)

Tables: `User`, `Category`, `Product`, `Service`, `Download` (datasheets, certificates, brochure; kind enum; optional `productId`), `GalleryItem`, `PartnerLogo`, `Lead`, `Upload`, `Setting` (key/value JSON), `SeoEntry` (path, title, description, ogImage).

Product composition, mechanical properties and heat treatment are stored as JSON columns (validated by zod at the boundary). Their shapes are fixed, and they are always read together with the product.

Enums:
- `Role`: ADMIN, EDITOR, SALES
- `LeadStatus`: NEW, CONTACTED, QUOTED, WON, LOST, SPAM
- `DownloadKind`: DATASHEET, CERTIFICATE, BROCHURE
- `UploadKind`: DRAWING, CAD, IMAGE, DOCUMENT

## Tasks

1. **Schema, migration, seed.** Test: after seeding, the counts are 8 categories, 9 products and 4 services; the timeline and settings round-trip; there are no partner logos.
2. **Async loaders backed by Prisma**, all pages updated. Tests: the existing content tests run against the seeded test database; all Playwright page tests stay green against `next start`.
3. **File checks** (`src/lib/server/file-check.ts`). Tests: a real PDF passes; an `.exe` renamed to `.pdf` fails; a size over 20 MB fails; DXF binary garbage fails.
4. **Lead service and API.** Tests (integration, test database):
   - a valid lead is saved with reference `QSM-<year>-0001`;
   - files are stored outside `public` with DB rows;
   - a filled honeypot gets a silent 200 and nothing is saved;
   - the 6th submission in 10 minutes gets a 429;
   - with no SMTP configured the lead is saved and `emailError` is set.
5. **Form wiring.** Production posts to the API, shows the reference on success, and offers WhatsApp on failure. Playwright test against `next start`: submit with a PDF, the success message shows the reference, and the row exists in the database.
6. **Preview script on the server build**, republished. Host-simulation tests stay green.

## Review focus

1. Upload streaming: a 21 MB file must be rejected without buffering it whole in memory.
2. Filename traversal (`../../etc/passwd.pdf`): the stored name is never derived from the client name.
3. Email failure must never lose a lead.
4. The page cache must not serve stale content after an admin edit (2b relies on `revalidateTag("catalog")`).
5. Missing `DATABASE_URL` must fail loudly at startup, not render empty pages.

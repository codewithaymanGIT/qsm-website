# Phase 2b: Admin panel (design + plan)

Date: 2026-10-22 · Status: approved to proceed ("then do the admin panel"). Technical decisions are delegated to the builder.

## Intent

Staff run the website without a developer: answer enquiries, and keep products, images, logos, datasheets, contact details and SEO up to date. Every edit appears on the public site immediately.

## Roles

| Role | Can do |
|---|---|
| ADMIN | Everything, including managing users |
| EDITOR | Content: products, categories, services, gallery, customer logos, datasheets/brochure/certificates, contact details and timeline, SEO. Can also view enquiries. |
| SALES | Enquiries only: view, change status, add notes, open attached files, export |

## Decisions

| Topic | Decision | Why |
|---|---|---|
| Layout | Route groups: `(site)` holds the public pages with header/footer; `(admin)/admin` has its own shell. The root layout is html/body only. | The admin must not show the public header, footer and WhatsApp bar. |
| Auth | Email + password. Passwords hashed with Node `scrypt` (salted, N=2^15). A `Session` table stores a SHA-256 hash of a random 32-byte token. Cookie `qsm_session`: httpOnly, Secure in production, SameSite=Lax, 7-day expiry, rolling. Logout deletes the row. | No third-party auth dependency; sessions can be revoked. |
| Login abuse | At most 10 failed logins per email+IP in 15 minutes (`LoginAttempt` table). Identical error for unknown email and wrong password. | Brute-force resistance, no account enumeration. |
| Authorization | `requireUser(roles?)` in `src/lib/server/auth.ts`, called in **every** admin page, Server Action and admin route handler. `proxy.ts` only redirects visitors without a cookie (an optimistic check, not security). | The Next 16 guidance: verify close to the data. |
| Rendering | Admin pages are dynamic. Session reads sit inside `<Suspense>`, and admin data is never cached. | Cache Components rules; staff must see live data. |
| Mutations | Server Actions with zod validation. Content edits call `revalidateTag(CATALOG_TAG)`. | One-step refresh of the public pages. |
| CSRF | Server Actions (Next checks the Origin header) and a SameSite=Lax cookie. Route handlers that change data check `Origin` against `Host`. | |
| Media | Public media (logos, gallery, category images, datasheets, brochure, certificates) is stored under `MEDIA_DIR` (default `./storage/media`) and served by `GET /files/[key]` **only if** the key is referenced by a published database row. Allowed types: images jpg/png/webp, documents pdf. **No SVG** (script risk). Enquiry uploads stay under `UPLOAD_DIR`, served only by `GET /admin/uploads/[id]` to signed-in users. | Public/private separation. |
| Export | `GET /admin/leads/export`: CSV with a UTF-8 BOM (opens in Excel), honouring the current filters. | "Export inquiries" without a heavy xlsx dependency. |
| First admin | `npm run admin:create -- email name` prompts for a password (min 12 chars) and creates an ADMIN. | No default credentials, ever. |
| Audit | `updatedAt` on rows. Lead status changes are appended to `Lead.notes` with user and time. | Light but useful trail. |

## Screens

1. `/admin/login`
2. Dashboard: new enquiries count, the latest 5, quick links
3. Enquiries: list (status filter, search, pagination), detail (all fields, files, status, notes), export
4. Products: list, create/edit (all fields; repeatable rows for composition, mechanical properties and heat treatment), publish toggle, datasheets/MTC uploads
5. Categories: list, edit, order
6. Services: list, edit
7. Gallery: upload, label, order, publish
8. Customers (logos): name, logo upload, order, publish
9. Downloads: brochure, company certificates
10. Settings: contact details, timeline entries
11. SEO: title, description and noindex per path (the public pages read these in `generateMetadata`)
12. Users (ADMIN only): invite (create with a temporary password), change role, deactivate

## Tasks (each with tests)

1. **Route groups + auth core:** scrypt hashing, sessions, login/logout, `requireUser`, proxy redirect, `admin:create` script.
   - Unit/integration: hash and verify; a wrong password and an unknown email return the same error; an expired session is rejected; a deactivated user is rejected; the 11th failed login is blocked.
   - E2E: `/admin` redirects to login; logging in shows the dashboard; logging out works.
2. **Enquiries:** list/detail/status/notes, file download, CSV export.
   - Tests: SALES can view and export; a non-signed-in request to an upload or the export returns 401/redirect; CSV escaping (quotes, commas, formula-injection prefix `'` for cells starting with = + - @).
3. **Content editors:** products, categories, services, settings/timeline, with revalidation.
   - E2E: edit an H13 tagline in the admin, and the public H13 page shows it.
4. **Media:** gallery, logos, downloads, `/files/[key]`.
   - Tests: SVG is rejected; an unreferenced key returns 404; an unpublished item returns 404.
5. **SEO + users**, with RBAC tests: EDITOR cannot open Users; SALES cannot open Products.

## Review focus

1. Any admin Server Action reachable without a session (each action must call `requireUser`).
2. CSV formula injection from visitor-supplied enquiry fields.
3. Path traversal in `/files/[key]` and `/admin/uploads/[id]`.
4. Session fixation: a new token on every login; old sessions deleted on password change.
5. Stale public pages after an edit (revalidation missing in one action).

# Hosting on Vercel (preview / review stage)

Vercel's free Hobby plan is for **non-commercial use**. Use it for the owner's review link;
move to Vercel Pro or a VPS (Docker, `output: "standalone"`) before the site is used for business.

## One-time setup

1. Import the GitHub repo in Vercel (preset: Next.js; leave build settings empty).
   `npm run vercel-build` runs automatically: `prisma generate` → `prisma migrate deploy`
   → `scripts/seed-if-empty.ts` (starting content, **only** into an empty database) → `next build`.
2. Environment variables (Production and Preview):
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12+ characters), optional `ADMIN_NAME`: every deploy
     makes this account an active admin with this password (creating it if needed). Remove
     `ADMIN_PASSWORD` once signed in, so later deploys leave users alone.
   - (Alternative) `ADMIN_SETUP_TOKEN`: unlocks `/admin/setup/` once to create the first admin.
   - `IP_HASH_SALT`: random string; anonymises visitor IPs for rate limits.
   - Optional: `SITE_URL` (when a domain is added; otherwise the vercel.app address is used),
     `SMTP_URL`, `MAIL_FROM`, `LEAD_NOTIFY_TO` (enquiry emails; without them enquiries are
     still saved in the admin).
3. Storage tab: a Postgres database (Neon or Prisma Postgres) and a **Blob store (private)**,
   both connected to the project. The code picks the first `postgres://` address among
   `DATABASE_URL`, `POSTGRES_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`
   (migrations prefer the unpooled one).
4. Redeploy after connecting Blob: `BLOB_READ_WRITE_TOKEN` must exist **at build time**, because
   it switches the forms to browser-to-storage uploads (Vercel rejects request bodies over 4.5 MB).
5. Sign in at `https://<project>.vercel.app/admin/login/` with ADMIN_EMAIL / ADMIN_PASSWORD
   (or use `/admin/setup/` with the setup token). Both close for good once a user exists.

## How files work on Vercel

- Every file (gallery, logos, PDFs, enquiry drawings) is stored **private** in Blob and served
  only through `/files/[key]` (published content only) and `/admin/uploads/[id]` (staff only).
- The browser asks `/api/uploads/` for a one-file upload permission (staff-only for site media,
  rate-limited per IP for enquiry drawings), uploads to `incoming/<uuid>/<name>`, then the form
  sends that path. The server re-checks type, size and file signature, moves it to its final
  place and deletes the temporary copy. Unclaimed temporary uploads are swept after a day.

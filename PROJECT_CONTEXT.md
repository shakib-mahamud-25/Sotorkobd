# Sotorko — Project Context

This document exists so that you (or an AI assistant helping you later) can understand the whole system quickly without re-reading every file. Read this first before making changes.

---

## What Sotorko is

A crowdsourced, anonymous safety-reporting map for women in Dhaka. Anyone can submit a report of an unsafe location/incident with no account required. Reports appear on a public map with pins or heatmap view, filterable by category, severity, time of day, and date range. The product is explicitly **not** a mechanism for accusing named individuals — it documents locations, not people.

**Stack:** Next.js 15 (App Router, TypeScript) · Supabase (Postgres) · Cloudinary (photo storage) · Leaflet + OpenStreetMap (map, no API key needed) · Tailwind CSS v4 · Vercel (hosting).

**Non-goals for MVP:** user accounts, mobile app, named-individual accusations, public photo display, nationwide coverage (Dhaka only for now).

---

## Core product decisions and why

### Anonymous ownership via edit codes, not accounts
There are no user accounts anywhere in this system. When someone submits a report, the server generates a random 10-character code (format `XXXX-XXXX-XX`), shown to them exactly once in the response. Only a SHA-256 hash of this code is stored in the database (`reports.edit_code_hash`). To edit or delete a report later, the person provides the report ID + code, which the server hashes and compares. **This means codes cannot be recovered if lost — this is intentional and disclosed to users.** See `src/lib/editCode.ts`.

### Rate-limiting without identity
To prevent one person from spamming fake reports, we compute a coarse "device fingerprint" client-side (`src/lib/fingerprint.ts`) — a hash of browser/screen/timezone signals. This is **not** a unique identifier and is not tied to any personal data; it's a rate-limit signal only. If a fingerprint submits 5+ reports in 24 hours, the new report is auto-flagged for admin review (still published-pending in the `flagged` status, visible to admin at `/admin/dashboard`) rather than auto-rejected. See `src/app/api/reports/route.ts`.

### Seed data that self-purges per neighborhood
The database ships with ~25 hand-written realistic reports (`supabase/seed_data.sql`), tagged `is_seed = true`, so the map isn't empty at launch. A Postgres trigger (`maybe_purge_seed_data()` in `schema.sql`) runs after every new real report insert: it checks how many real (non-seed) published reports exist in that same ~1.1km grid cell, and if that count crosses a threshold (default 5, configurable via the `admin_settings` table), it sets all seed reports in that cell to `status = 'removed'`. This means different neighborhoods "graduate" from seed data independently as real reports come in — the map never goes blank, but it also never stays artificially populated once real data exists.

### Photos are admin-only, never public
Uploaded images are never shown on the public map or in public report views — only in the admin dashboard (`/admin/dashboard`). This was a deliberate privacy tradeoff: photos are the highest-risk content type for identifying bystanders or reporters. All uploads go through Cloudinary with automatic face-pixelation (`effect: pixelate_faces`) and metadata stripping happens by default (Cloudinary strips EXIF unless explicitly told to preserve it, and we never request that). See `src/app/api/upload/route.ts`.

### No named individuals
The report form's description field explicitly instructs users not to name specific people, and the About page states this as a moderation policy. There is currently no automated keyword filter for this — it relies on the disclaimer plus admin moderation of flagged/reported content. If this needs automated enforcement later, that logic would go in `src/app/api/reports/route.ts` before the insert.

### Admin is a single shared password, not per-admin accounts
`ADMIN_PASSWORD` is a single environment variable. Logging in at `/admin` sets an HTTP-only cookie containing a hash of `"sotorko_admin_" + password` (see `src/lib/adminSession.ts`) — this proves the cookie-holder knows the password without storing the raw password in the cookie. Fine for a single admin (you); if this ever needs multiple admins with distinct permissions, it should be replaced with Supabase Auth.

### Bilingual from day one
All UI strings live in `src/lib/i18n/translations.ts` as a flat key-value dictionary for `en` and `bn`. The `useI18n()` hook (`src/lib/i18n/context.tsx`) provides `t(key)` and persists the chosen language to `localStorage`. Database content (categories) also has `label_en`/`label_bn` columns. User-submitted report descriptions are **not** translated — they display in whatever language the submitter wrote them.

---

## File map

```
supabase/
  schema.sql          Run this FIRST in Supabase SQL Editor. Defines all tables,
                       RLS policies, and the seed-data-purge trigger.
  seed_data.sql        Run SECOND. ~25 sample reports across Dhaka.

src/
  types/index.ts       All shared TypeScript types (Report, Category, etc.)

  lib/
    supabase/
      client.ts         Browser Supabase client (anon key, respects RLS)
      server.ts          Server-only Supabase client (service role key, bypasses RLS).
                          NEVER import this into a "use client" component.
    editCode.ts         Generate/hash/verify anonymous edit codes
    fingerprint.ts      Coarse device fingerprint for rate-limiting (not identity)
    categories.ts       Static category list (mirrors DB) + label/color helpers
    dhakaAreas.ts        ~50 Dhaka neighborhoods with center coordinates, used in
                          the location dropdown fallback
    iconMap.tsx         Maps category icon name strings to lucide-react components
    cloudinary.ts        Cloudinary SDK config
    adminSession.ts      Admin cookie session logic
    i18n/
      translations.ts    All UI copy, English + Bangla
      context.tsx        React context/hook for language switching

  components/
    Header.tsx, Footer.tsx
    StatsStrip.tsx       Homepage live stats
    LocationPickerMap.tsx  Leaflet map for manual pin-drop (used in report form)
    SafetyMap.tsx          Main map component: pins + heatmap layer + popups
    FilterPanel.tsx        Map filter sidebar (category/severity/time/date)
    report/
      LocationStep.tsx, CategoryStep.tsx, SeverityStep.tsx,
      TimeDateStep.tsx, DetailsStep.tsx   The 5 steps of the report form
      ReportReceipt.tsx   Post-submission edit-code display + PDF download

  app/
    layout.tsx            Root layout, wraps everything in I18nProvider
    page.tsx               Homepage
    globals.css            Design tokens (colors, fonts) — see below
    report/page.tsx         Report submission flow (orchestrates the 5 step components)
    map/page.tsx             Public safety map page
    about/page.tsx            Mission, privacy policy, moderation guidelines
    admin/
      page.tsx                Admin login
      dashboard/page.tsx       Moderation dashboard (approve/hide/remove reports)
    api/
      reports/route.ts          POST: submit new report
      reports/list/route.ts      GET: fetch published reports (map data), with filters
      reports/edit/route.ts       PATCH/DELETE: edit or remove report via edit code
      reports/confirm/route.ts     POST: "I experienced this too" counter
      upload/route.ts               POST: photo upload to Cloudinary (admin-only visibility)
      stats/route.ts                 GET: homepage statistics
      admin/login/route.ts            POST: admin login
      admin/logout/route.ts            POST: admin logout
      admin/reports/route.ts            GET: list reports for moderation (auth required)
      admin/reports/[id]/route.ts        PATCH: change report status (auth required)
```

---

## Design system

Defined in `src/app/globals.css` as CSS custom properties, exposed to Tailwind via `@theme inline`.

- **Colors**: `--color-ink` (#0F2A3D, deep teal-navy, primary), `--color-paper` (#F7F4EE, warm off-white bg), `--color-amber` (#C9793E, sparing accent), `--color-brick` (#8A2E2E, high-severity only, never decorative), `--color-ink-mid` (#1D4E5F, secondary).
- **Type**: Fraunces (display/headings) + Inter (body) for English; Noto Serif Bengali + Noto Sans Bengali for Bangla. Loaded via Google Fonts CDN in `globals.css`.
- **Map styling**: a `.dusk-tiles` CSS filter class desaturates the default OpenStreetMap tiles for a calmer, less alarming visual tone — applied to both `SafetyMap.tsx` and `LocationPickerMap.tsx`.
- **Severity color coding**: 1-2 = mid teal, 3 = amber, 4-5 = brick red. See `getSeverityColor()` in `src/lib/categories.ts`.

If you ask an AI assistant to build new pages/components later, point it to this section so new UI stays visually consistent.

---

## Database schema summary

See `supabase/schema.sql` for full detail with comments. Key tables:

- **`reports`** — the core table. Status is one of `published | flagged | hidden | removed`. Note there is no `draft` state; every report is immediately one of these four.
- **`categories`** — the 10 fixed incident types, bilingual labels, referenced by `reports.category_id`.
- **`report_media`** — photos, always admin-only (no public RLS read policy).
- **`report_flags`** — audit log of why a report was flagged (currently only `rate_limit` is generated automatically).
- **`submission_log`** — every submission attempt per fingerprint, used to compute the rate-limit window.
- **`admin_settings`** — key-value config table; currently only holds `seed_threshold_per_area`.

**Row Level Security**: the anon (public) key can only `SELECT` from `reports` where `status = 'published'`, and can `INSERT` new reports/media. All edits, deletes, and moderation actions go through API routes using the service-role key, which bypasses RLS — this keeps the edit-code verification and admin-auth logic server-side where it can't be tampered with from the browser.

---

## Known limitations / intentional MVP scope cuts

- No automated keyword detection for named individuals in report descriptions — relies on the user-facing disclaimer + manual admin moderation.
- No email/push notifications (explicitly deferred per product decisions).
- No organization/business verified profiles (deferred).
- No downloadable research data export for NGOs (deferred — would be a new admin-only API route + CSV export button).
- Admin is single-password, not multi-user with roles.
- Device fingerprint is coarse by design (many real devices will share a fingerprint) — this is a feature, not a bug, for privacy, but means the rate-limit isn't perfectly precise.

---

## If you (or an AI assistant) need to extend this later

- **New incident category**: add to both `supabase/schema.sql`'s `categories` insert AND `src/lib/categories.ts`'s `CATEGORIES` array — they must stay in sync since the frontend uses the static file to avoid an extra fetch.
- **New report field**: add the column via a new SQL migration (Supabase SQL Editor), add it to `src/types/index.ts`'s `Report`/`NewReportInput`, update the relevant form step component, and update `src/app/api/reports/route.ts`'s insert.
- **Changing the seed-data threshold**: update the `admin_settings` row in Supabase (`key = 'seed_threshold_per_area'`) — no code change needed.
- **Adding a new language**: add a new key to `translations.ts` (e.g. `"hi"`), add font imports to `globals.css` if the script needs a new typeface, and update the `Locale` type in `src/types/index.ts`.

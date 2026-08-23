# Sotorko V2 — complete repo

This is the **whole Sotorko codebase** — your original v1 files plus every
V2 change, already merged into one tree. This is not a patch or a diff.
Delete everything in your current GitHub repo, drag this whole folder in,
and you have V2. No merging, no comparing files by hand.

If you're setting this up for the first time, or need the GitHub/Vercel/
Supabase steps (all web-based, no terminal), go straight to
**`SETUP_GUIDE.md`**.

---

## One thing you need to know before you delete anything

**`src/app/about/page.tsx` is missing from this repo, on purpose.**

The original file you gave me for this project literally contained the
placeholder text `[Binary file]` instead of your real About page's code —
this wasn't something that broke during my work, the source file itself
never had this page's actual content in it at any point. I'm not going to
fabricate an About page and hand it to you as if it were your real one —
a page that likely covers your mission, privacy stance, and moderation
guidelines is not something I should be inventing on your behalf.

**Before you delete your current repo**, go to your live GitHub repo and
save a copy of `src/app/about/page.tsx` from there (open the file, copy
its contents) — then add it back into this folder at the same path after
you drag this in. Every other file in this repo is confirmed real, either
your original v1 code or a genuine, tested V2 change.

---

## What's actually new or changed vs. your original v1

**New (didn't exist in v1):**
- `src/app/manifest.ts`, `public/sw.js` — PWA install + service worker
- `src/app/offline/page.tsx` — offline fallback screen
- `src/app/insights/page.tsx` — lightweight Insights page
- `src/app/resources/page.tsx`, `src/lib/crisisResources.ts` — crisis/safety resources (999, 109)
- `src/app/api/push/*` (3 routes), `src/lib/webPush.ts` — push notification subscribe/unsubscribe/test
- `src/components/AreaFollowButton.tsx`, `InstallPrompt.tsx`, `ServiceWorkerRegistration.tsx`, `CrisisResourcesLink.tsx`
- `supabase/migrations/001-006` — 6 SQL migrations (security fixes, seed retirement, push notifications)
- `supabase/functions/send-digest/` — Supabase Edge Function for the notification digest

**Modified (existed in v1, changed for V2):**
- `src/app/api/admin/login/route.ts` — added login rate limiting
- `src/app/api/reports/confirm/route.ts` — fixed a race condition (atomic increment)
- `src/app/api/upload/route.ts` — fixed a real auth gap (edit code wasn't actually checked)
- `src/lib/editCode.ts` — fixed a timing-unsafe comparison
- `src/app/api/stats/route.ts`, `src/types/index.ts` — seed data no longer silently counted as real reports
- `src/app/api/reports/list/route.ts` — trimmed an overfetching query
- `src/components/SafetyMap.tsx` — added pin clustering + accessibility fixes
- `src/app/map/page.tsx` — confirm-count now reflects the real server value
- `src/components/report/SeverityStep.tsx` — accessibility fixes
- `src/components/Header.tsx`, `Footer.tsx` — added nav links to new pages
- `src/app/report/page.tsx` — added crisis-resources link, edit-code fix wiring
- `src/app/layout.tsx` — PWA registration, install prompt wiring
- `src/lib/i18n/translations.ts` — added all new copy, both English and Bangla
- `next.config.ts` — was empty, now configured for Cloudinary image optimization
- `package.json` — 4 new dependencies

**Untouched — your original v1 code, unchanged:**
Everything else — all `ui/` components, `FilterPanel.tsx`,
`LocationPickerMap.tsx`, all report-flow steps except `SeverityStep.tsx`,
`categories.ts`, `dhakaAreas.ts`, `cloudinary.ts`, `fingerprint.ts`,
`adminSession.ts`, the i18n context, admin pages, the original schema and
seed data SQL, and more.

Full reasoning behind every change — why, what alternatives were
considered, what was verified vs. assumed — is preserved in
`docs/` if you want it, available separately on request; this repo
folder ships the code itself, not the phase-by-phase build log.

---

## New environment variables needed

On top of whatever you already have set (`ADMIN_PASSWORD`,
`CLOUDINARY_*`, your Supabase keys):

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

Full generation and setup instructions are in `SETUP_GUIDE.md`.

---

## App icons — still needed, not included

`src/app/manifest.ts` references four icon files under `public/icons/`
that aren't included — real app icon artwork shouldn't be auto-generated.
See `public/icons/README_NEEDS_REAL_ICONS.md` for exact sizes and a fast
path using maskable.app. The app installs fine without them in the
meantime, just with a generic fallback icon.

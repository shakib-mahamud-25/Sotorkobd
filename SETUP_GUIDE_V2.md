# Sotorko V2 — Setup Guide (fresh drag-and-drop, 100% web-based)

**This guide assumes you already have Sotorko v1 running** — an existing
Supabase project with the schema loaded, Vercel deployment, Cloudinary
account, etc. It only covers what's *new* for V2. If you're setting any
of these services up for the very first time, use `SETUP_GUIDE.md`
(your original v1 guide, also included in this repo) for that first —
this guide picks up from there.

This guide is for **replacing your entire repo** with this complete V2
codebase — not merging file by file. Everything here uses each service's
website: GitHub's file uploader, Vercel's dashboard, Supabase's dashboard.
No `git` commands, no terminal, no local installs required for deployment.

**One honest exception**: generating VAPID keys (Part 2, step 2.2)
technically needs *some* JavaScript engine to run one line of code. Two
real options are given — a free web tool, or the official command if
you're ever willing to open a terminal once. Everything else here has no
CLI-only step.

Everything stays within each service's free tier. Anywhere a step *could*
push you onto a paid tier, it's flagged explicitly.

---

## Part 0 — before you delete anything

1. **Save your real `src/app/about/page.tsx`.** This repo is missing that
   one file — see `README_V2_NOTES.md` for why. Open it on your current
   live GitHub repo, copy its contents into a text file on your computer,
   so you can add it back in after Part 1.
2. **Note your current environment variables.** Go to your Vercel
   project → Settings → Environment Variables and either take a
   screenshot or copy down every value (`ADMIN_PASSWORD`, Supabase URL,
   Supabase service role key, Cloudinary credentials, etc.) — deleting
   your repo doesn't delete these from Vercel, but it's worth having them
   written down in case you ever need to recreate the project from
   scratch.
3. **Your Supabase project and data are untouched by any of this.**
   Deleting and re-uploading your GitHub repo doesn't touch your Supabase
   database, existing reports, or admin password at all — those live in
   Supabase and Vercel's settings, not in the repo's files.

---

## Part 1 — replace your GitHub repo with this V2 codebase

### 1.1 — Unzip the folder

Unzip the file you were given. Add the saved `about/page.tsx` from Part 0
back into it at `src/app/about/page.tsx` before proceeding.

### 1.2 — Delete the contents of your existing repo

1. Go to your repo on github.com.
2. For each top-level item (`public`, `src`, `supabase`, and every loose
   file like `README.md`, `package.json`, etc.), click into it, then use
   the trash/delete icon (or click the file, then the "..." menu → Delete
   file) to remove it. Commit each deletion, or batch them if GitHub's
   interface allows selecting multiple.

   *(If this feels tedious file-by-file: an alternative is creating a
   **new empty repository** instead of clearing the old one, then
   connecting Vercel to the new repo in Part 3. Either approach works —
   pick whichever feels less error-prone to you.)*

### 1.3 — Upload the complete V2 folder

1. On your now-empty repo, click **Add file → Upload files**.
2. Drag in the entire unzipped folder — `public`, `src`, `supabase`, and
   all the loose root files (`package.json`, `next.config.ts`,
   `tsconfig.json`, `README.md`, `PROJECT_CONTEXT.md`, etc.) all at once,
   or in a few batches if GitHub's uploader struggles with the total file
   count in one go.
3. Scroll down, write a commit message (e.g. "V2 — fresh codebase"), and
   click **Commit changes**.

### 1.4 — Confirm the upload

Browse your repo's file tree on GitHub and spot-check these exist:
- `src/app/about/page.tsx` (the one you added back manually)
- `src/app/manifest.ts`
- `src/app/resources/page.tsx`
- `supabase/migrations/006_schedule_digest_cron.sql`
- `public/sw.js`

---

## Part 2 — Supabase setup (dashboard only, free tier)

You already have a Supabase project from v1 — nothing here needs a new
project, and none of this touches your existing data. Every step uses
Supabase's website.

### 2.1 — Run the new SQL migrations, in order

Go to your Supabase project → **SQL Editor** → **New query**. Open each
file from `supabase/migrations/` in your GitHub repo, copy its full
contents, paste into the SQL Editor, click **Run**. One at a time, in
order, waiting for each to succeed:

1. `001_atomic_confirm_increment.sql`
2. `002_admin_login_rate_limit.sql`
3. `003_gradual_seed_retirement.sql`
4. **Stop here — don't run 004-006 yet.** Continue to 2.2 first.

*(Note: `supabase/schema.sql` and `supabase/seed_data.sql` in this repo
are your original v1 setup files — don't re-run these, they're only here
for reference/history. Only run the numbered files in
`supabase/migrations/`.)*

### 2.2 — Generate VAPID keys

**Option A — a web-based generator (no install at all):**
Go to [vapidkeys.com](https://vapidkeys.com), click generate, copy both
keys. Since this runs on a third-party site, don't reuse these keys
anywhere else sensitive.

**Option B — the official command (needs a one-time terminal):**
```
npx web-push generate-vapid-keys
```

Either way, save both the **public key** and **private key** somewhere
temporary — you'll need them in three places over the next steps.

### 2.3 — Run the remaining migrations

4. `004_push_subscriptions.sql`
5. `005_notification_digest_state.sql`
6. **Don't run 006 yet** — needs the Edge Function deployed and two
   secrets set first.

### 2.4 — Deploy the Edge Function, from the Supabase dashboard

No CLI needed — Supabase's dashboard has a built-in code editor.

1. Go to **Edge Functions** (left sidebar).
2. Click **Deploy a new function → Via Editor**.
3. Name it exactly `send-digest`.
4. Delete the template code, paste in the full contents of
   `supabase/functions/send-digest/index.ts` from your repo.
5. Click **Deploy**.

**Worth knowing:** the dashboard editor has no version history — updating
this function later means pasting new code and redeploying over the old
version, no undo. Fine for this use case, just not git-style history.

### 2.5 — Set the Edge Function's secrets

1. In **Edge Functions**, find **Secrets Management**.
2. Add these four, one at a time:
   - `VAPID_PUBLIC_KEY` — from step 2.2
   - `VAPID_PRIVATE_KEY` — from step 2.2
   - `VAPID_SUBJECT` — `mailto:you@example.com` or an `https://` URL
     (required format — Apple's push service rejects anything else)
   - `SITE_URL` — your Vercel app's URL, e.g. `https://sotorko.vercel.app`

   (`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided
   automatically — don't set these yourself.)

### 2.6 — Store two Vault secrets

In SQL Editor (fill in your real project URL and anon key from
**Settings → API**):

```sql
select vault.create_secret('https://YOUR-PROJECT-REF.supabase.co', 'project_url');
select vault.create_secret('YOUR-ANON-KEY', 'anon_key');
```

### 2.7 — Run the last migration

7. `006_schedule_digest_cron.sql`

Registers a `pg_cron` job pinging your Edge Function every 30 minutes.
Both `pg_cron` and `pg_net` are free-tier — no upgrade needed.

### 2.8 — Verify

```sql
select * from cron.job;
```
Should show `send-report-digest`. After ~30 minutes:
```sql
select * from cron.job_run_details order by start_time desc limit 5;
```
`status` should read `succeeded`.

---

## Part 3 — Vercel setup (dashboard only, free tier)

### 3.1 — If you deleted-and-reused your existing repo (Part 1.2, option 1)

Your existing Vercel project is already connected to this repo and will
auto-deploy from your new commit. Just add the new environment variables
below and you're mostly done.

### 3.2 — If you created a brand-new repo instead (Part 1.2, option 2)

You'll need to connect a **new** Vercel project to it:
1. On vercel.com, click **Add New → Project**.
2. Select your new GitHub repo.
3. Vercel auto-detects Next.js — no config changes needed.
4. Before deploying, add all your environment variables (your original
   ones from Part 0, step 2, plus the new ones below) under **Environment
   Variables** in the import screen, or add them after in Project
   Settings.
5. Click **Deploy**.

### 3.3 — Add the new environment variables

**Settings → Environment Variables** (apply to Production, and Preview
if you use it):

| Key | Value |
|---|---|
| `VAPID_PUBLIC_KEY` | from step 2.2 |
| `VAPID_PRIVATE_KEY` | from step 2.2 |
| `VAPID_SUBJECT` | same value used in step 2.5 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | **same value as `VAPID_PUBLIC_KEY`** — needs its own separate entry with the `NEXT_PUBLIC_` prefix, since Next.js only exposes prefixed variables to the browser |

Your original v1 variables (`ADMIN_PASSWORD`, Supabase keys, Cloudinary
credentials) carry over unchanged if you kept the same Vercel project; if
you created a new project, re-add them from what you saved in Part 0.

### 3.4 — Redeploy if needed

If you added environment variables after your first deploy, trigger a
fresh one from the **Deployments** tab — env var changes need a new
deploy to take effect.

### 3.5 — Why there's no Vercel Cron step

Intentional: **Vercel's free Hobby tier only allows once-per-day cron** —
sub-daily needs the paid Pro plan. The 30-minute digest runs entirely
inside Supabase (Part 2) instead, staying fully free.

---

## Part 4 — verify everything works

On your real deployed Vercel URL, not `localhost`:

1. **PWA installs** — Chrome/Android or desktop Chrome/Edge should show
   an install prompt or icon in the address bar.
2. **Offline fallback** — install, turn off WiFi, open the installed app.
   Should show the calm offline page, not a browser error.
3. **Push notifications** — follow an area on the map, accept the
   permission prompt, expect an immediate test notification.
   - **iPhone**: only works after adding to Home Screen first (Share →
     Add to Home Screen) and opening from there — a Safari tab can't
     receive push at all, an Apple platform limit, not a bug here.
4. **Crisis resources** — `/resources` should show 999 and 109 with
   working `tel:` links (test on an actual phone).
5. **Insights** — `/insights` should show real numbers (or zeros on a
   fresh install, since seed data is correctly excluded).
6. **Map clustering** — zoomed-out pins view should group into numbered
   clusters, not overlap.
7. **Digest** (up to 30 min) — submit a real test report in a followed
   area, expect a push within 30 minutes. If not, check
   `cron.job_run_details` (step 2.8).
8. **About page** — confirm it still shows your real content, not
   something missing, since this was the one file you had to add back
   manually.

---

## Ongoing costs — confirming this is really free tier

| Service | What's used | Free tier limit | Expected usage |
|---|---|---|---|
| Vercel | Hosting, serverless functions | 100GB bandwidth/mo | Comfortable at this scale |
| Supabase | Postgres, Edge Functions, pg_cron | 500MB DB, 100k function calls/mo | ~1,440 digest calls/mo |
| Cloudinary | Image storage/transform | ~25 credits/mo | Unchanged from v1 |
| Web Push | Notification delivery | Free | N/A |

Unrelated to this update, but worth knowing: **Supabase's free tier
pauses a project after 7 days of no API activity**, causing a slow first
load after a pause. Not something this changes — just don't mistake it
for a new bug.

---

## If something goes wrong

- **Push subscribe fails silently**: check browser console — usually
  `NEXT_PUBLIC_VAPID_PUBLIC_KEY` missing in Vercel.
- **Digest never arrives**: check `cron.job_run_details`, then the
  function's logs under Edge Functions → send-digest → Logs.
- **Migration 006 fails**: the two Vault secrets (2.6) weren't set first,
  or aren't named exactly `project_url` and `anon_key`.
- **Vercel build fails**: check that `src/app/about/page.tsx` was
  actually added back in (Part 0/1.1) — a missing page referenced by a
  route will fail the build, not just look empty.
- **Your existing reports/data seem gone**: they're not — this whole
  process only touches your GitHub repo's code, never your Supabase
  database. If the site looks empty, check you're looking at the right
  deployed URL and that the Supabase project didn't just wake up from a
  free-tier pause (can take a few seconds on first load).

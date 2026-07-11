# Sotorko — Setup Guide

This guide walks you through setting up every external service Sotorko needs, from a completely empty account to a fully configured backend. Follow it in order — later steps depend on earlier ones.

You do not need to touch a terminal for any of this. Everything happens in web dashboards.

---

## 1. Supabase (database)

### 1.1 Create the project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) → **New Project**.
2. Name: `sotorko`. Set a strong database password and save it somewhere safe (a password manager). Region: **Singapore (ap-southeast-1)** for best latency to Dhaka.
3. Wait ~2 minutes for provisioning.

### 1.2 Run the schema
1. In the left sidebar, click **SQL Editor** → **New query**.
2. Open `supabase/schema.sql` from this project, copy its entire contents, paste into the SQL editor, and click **Run**.
3. You should see "Success. No rows returned." If you see an error, stop and re-check you copied the whole file.

### 1.3 Load seed data
1. New query again in the SQL Editor.
2. Open `supabase/seed_data.sql`, copy its entire contents, paste, and **Run**.
3. This adds ~25 sample reports across Dhaka so your map isn't empty at launch. They're tagged `is_seed = true` and will automatically disappear neighborhood-by-neighborhood once real reports accumulate there.

### 1.4 Get your API keys
1. Left sidebar → **Project Settings** (gear icon) → **API**.
2. You'll need three values for later steps:
   - **Project URL** — looks like `https://xxxxx.supabase.co`
   - **anon public** key — long string starting with `eyJ...`
   - **service_role** key — another long string starting with `eyJ...` (click "Reveal" to see it)

**Important:** the `service_role` key bypasses all database security rules. Never put it in any file that gets committed to GitHub, never use it in client-side code, and only ever enter it into Vercel's environment variables (Step 3 below). Treat it like a password.

---

## 2. Cloudinary (photo storage)

1. Go to [cloudinary.com/console](https://cloudinary.com/console).
2. On your dashboard homepage, you'll see **Cloud name**, **API Key**, and **API Secret**. Copy all three.
3. No further configuration needed — the app handles metadata stripping and face-blurring automatically on upload via code, not dashboard settings.

---

## 3. Vercel (hosting)

### 3.1 Push the code to GitHub first
Before this step, make sure the Sotorko code is in a GitHub repository (see the **Deployment Guide** for exact steps if you haven't done this yet).

### 3.2 Import the project
1. Go to [vercel.com/new](https://vercel.com/new).
2. Find your `sotorko` repository and click **Import**.
3. Framework Preset should auto-detect as **Next.js**. Leave build settings as default.

### 3.3 Add environment variables
Before clicking Deploy, expand **Environment Variables** and add each of these one at a time (Name, then Value, then **Add**):

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service_role key |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret |
| `ADMIN_PASSWORD` | A strong password you choose — this is how you'll log into `/admin` |

Double check there are no extra spaces before/after any value — this is the most common cause of "it doesn't work" after deployment.

### 3.4 Deploy
Click **Deploy**. Wait 2-3 minutes. You'll get a live URL like `sotorko.vercel.app`.

---

## 4. Verify everything works

Visit your live URL and check each of these:

- [ ] Homepage loads, shows stats (should show ~25 reports from seed data)
- [ ] `/map` shows pins scattered across Dhaka
- [ ] `/report` — fill out and submit a test report, confirm you get an edit code receipt
- [ ] Go back to `/map` — your test report should appear
- [ ] `/admin` — log in with your `ADMIN_PASSWORD`, confirm you see the dashboard
- [ ] Switch language (button in top-right) — confirm Bangla text displays correctly

If anything fails, check the **Deployment Guide**'s troubleshooting section.

---

## 5. Ongoing account maintenance

- **Supabase free tier**: pauses your database after 7 days of inactivity. If your site goes down after a quiet week, log into Supabase and click "Restore" — it takes about 2 minutes. Once you have real traffic this won't happen.
- **Cloudinary free tier**: 25 GB storage / 25 GB bandwidth per month. Fine for MVP; monitor usage in the Cloudinary dashboard as you grow.
- **Vercel free tier**: 100 GB bandwidth/month, generous for an MVP. You'll get an email warning before any limit is hit.

You will not need to touch any of this again unless you see a warning email or the free-tier settings above change.

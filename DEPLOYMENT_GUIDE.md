# Sotorko — Deployment Guide

This guide covers getting the code from this chat onto GitHub, connecting it to Vercel, and how to make changes later. Written for GitHub's web interface — no terminal required.

---

## Part A — First-time upload to GitHub

### A.1 Create the repository
1. Go to [github.com/new](https://github.com/new).
2. Repository name: `sotorko`. Set to **Private** (recommended, since it'll contain no secrets but there's no reason to make it public yet — you can always make it public later).
3. **Do not** check "Add a README" — leave the repo completely empty.
4. Click **Create repository**.

### A.2 Upload the files
GitHub's web uploader works, but this project has 60+ files in a nested folder structure, and the web uploader flattens drag-and-drop in a way that breaks folder structure for deeply nested paths. The reliable way to do this without a terminal:

1. On your new empty repo's page, click **uploading an existing file** (a link shown on the empty repo page).
2. Drag the entire project folder contents in. Modern browsers (Chrome, Edge) preserve folder structure when you drag a whole folder onto the GitHub upload zone — drag the **contents** of the project folder (not a zip), i.e. select `src`, `supabase`, `public`, `package.json`, `next.config.ts`, etc. all at once and drag them in together.
3. **Do NOT upload**: `node_modules/`, `.next/`, `.env.local`. If you see these in your file list, remove them before uploading — `node_modules` alone is tens of thousands of files and will fail or take forever. (There should be a `.gitignore` file included that normally prevents this if you ever move to a Git-based workflow, but the drag-and-drop uploader doesn't respect `.gitignore`, so check manually.)
4. Scroll down, write a commit message like "Initial commit", click **Commit changes**.

### A.3 Verify
Refresh the repo page. You should see folders: `src`, `supabase`, `public`, and files like `package.json`, `next.config.ts`, `tailwind.config.ts` (if present), `tsconfig.json`.

---

## Part B — Connect to Vercel

Follow **Section 3** of the `SETUP_GUIDE.md` — this covers importing the repo into Vercel and setting environment variables.

---

## Part C — Making changes later

Since you're editing via GitHub's web interface:

1. Navigate to the file you want to change in the GitHub repo (e.g. `src/app/page.tsx`).
2. Click the **pencil icon** (top-right of the file view) to edit.
3. Make your change.
4. Scroll down, write a short commit message describing what changed, click **Commit changes** (choose "Commit directly to the `main` branch").
5. **Vercel automatically redeploys** within about a minute of any commit to `main`. Watch the deployment progress at [vercel.com/dashboard](https://vercel.com/dashboard) → your project → **Deployments** tab.

No further action needed — this is the entire update loop for the life of the project.

---

## Part D — Database changes later

If you ever need to change the database schema (e.g. add a new field):

1. Write the SQL change (ask me, and I'll give you the exact SQL).
2. Supabase dashboard → **SQL Editor** → **New query** → paste → **Run**.
3. If the change affects what data the app reads/writes, you'll also need a corresponding code change via Part C above.

---

## Troubleshooting

**Site shows a blank page or error after deploying:**
Go to Vercel → your project → **Deployments** → click the failed/latest deployment → **Build Logs**. Look for a red error line. The most common cause is a missing or misspelled environment variable — double check Section 3.3 of `SETUP_GUIDE.md`.

**Map doesn't show any pins:**
- Confirm you ran `seed_data.sql` in Supabase (Section 1.3 of Setup Guide).
- Open your browser's developer console (F12) on the `/map` page and look for red errors — usually a Supabase credential issue.

**"Could not save report" when submitting:**
This usually means `SUPABASE_SERVICE_ROLE_KEY` is missing or wrong in Vercel's environment variables. Re-check Section 3.3, redeploy (Vercel → Deployments → ⋯ menu → Redeploy).

**Photos won't upload:**
Check the three `CLOUDINARY_*` environment variables are set correctly in Vercel with no extra spaces.

**Admin login says "Admin login is not configured":**
The `ADMIN_PASSWORD` environment variable isn't set in Vercel. Add it (Section 3.3) and redeploy.

**Bangla text shows as boxes or question marks:**
This shouldn't happen (fonts are loaded from Google Fonts automatically), but if it does, check your browser's console for a font-loading network error — likely a temporary Google Fonts CDN issue, not a code problem.

**I made a change and it's not showing up on the live site:**
Check Vercel → Deployments — confirm a new deployment actually triggered from your commit and shows "Ready" (green), not "Building" or "Error". Hard-refresh your browser (Ctrl+Shift+R / Cmd+Shift+R) in case it's a caching issue.

---

## Redeploying manually (without a code change)

Sometimes useful after fixing environment variables: Vercel → your project → **Deployments** tab → click the **⋯** menu on the most recent deployment → **Redeploy**.

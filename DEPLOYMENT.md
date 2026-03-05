# Deployment Guide

## Prerequisites

- Node.js 20+
- A Vercel account (Pro plan recommended for 60s function timeout)
- A Supabase project
- A Resend account with a verified sending domain
- A Google Cloud project with PageSpeed Insights API enabled

---

## Step 1 — Set up Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to **Dashboard → SQL Editor**
3. Paste and run the entire contents of `supabase/schema.sql`
4. Copy your **Project URL** and **Service Role Key** from:
   `Settings → API → Project API keys`

---

## Step 2 — Set up Resend

1. Sign up at https://resend.com
2. Add and verify your sending domain (e.g. `thealphacreative.com`)
3. Create an API key with **Full Access**
4. Set `EMAIL_FROM` to a valid address on your verified domain
   (e.g. `growth@thealphacreative.com`)

---

## Step 3 — Get a PageSpeed API Key

1. Go to https://console.cloud.google.com
2. Create a project (or use existing)
3. Enable the **PageSpeed Insights API**
4. Create an API key under **APIs & Services → Credentials**
5. Restrict the key to PageSpeed Insights API for security

---

## Step 4 — Deploy to Vercel

### Option A: Vercel CLI (recommended)

```bash
# Install dependencies
npm install

# Install Vercel CLI
npm i -g vercel

# Deploy (follow prompts)
vercel

# Set environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add RESEND_API_KEY
vercel env add ADMIN_PASSWORD
vercel env add EMAIL_FROM
vercel env add ADMIN_EMAIL
vercel env add NEXT_PUBLIC_BASE_URL
vercel env add PAGESPEED_API_KEY

# Redeploy with env vars
vercel --prod
```

### Option B: GitHub + Vercel Dashboard

1. Push this repo to GitHub
2. Import at https://vercel.com/new
3. Add all environment variables in the Vercel project settings
4. Deploy

---

## Step 5 — Configure Function Timeout

In your Vercel project:
1. Go to **Settings → Functions**
2. Set **Maximum Duration** to `60` seconds
3. This ensures the audit pipeline has enough time for 25-page crawls

If you're on the Hobby plan (10s limit), the audit will fall back to crawling fewer pages.

---

## Step 6 — Custom Domain (optional)

In Vercel project settings → Domains, add:
```
score.thealphacreative.com
```

Update `NEXT_PUBLIC_BASE_URL` accordingly.

---

## Step 7 — Test the deployment

Run through the Smoke Test Checklist in `SMOKE_TEST.md`.

---

## Local Development

```bash
# Clone and install
git clone [your-repo]
cd growth-intelligence-engine
npm install

# Copy env file
cp .env.example .env.local
# Fill in your values

# Run dev server
npm run dev

# Visit
open http://localhost:3000/growth-score
```

---

## Architecture Notes

### Background Processing
The audit pipeline uses `waitUntil` from `@vercel/functions` to run the crawl in the background after the form submission response is sent. This means:
- The user gets immediate feedback ("your report is being generated")
- The audit runs for up to 60 seconds without blocking the HTTP response
- The `/report/[token]` page polls every 5 seconds until the audit completes

### Rate Limiting
The in-memory rate limiter works fine for single-instance deployments. If you scale to multiple instances, replace `lib/rate-limiter.ts` with an Upstash Redis-backed implementation.

### Database Security
All tables have Row Level Security enabled. Only the service role key (used server-side) can read/write data. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.

---

## Upgrading the Scoring Model

To update the scoring model:
1. Modify `lib/scoring-engine.ts`
2. Update the `model` constant to the new version string (e.g. `AC-GIE-v1.1`)
3. All new audits will use the new model
4. Old audit results in the DB retain their original scores (immutable)

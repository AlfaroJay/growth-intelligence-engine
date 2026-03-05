# AlphaCreative Growth Intelligence Engine
### Model: AC-GIE-v1.0

A production-ready digital growth diagnostic engine that generates a deterministic **Digital Growth Score** (0–100) and automated audit report for any website.

---

## What it does

1. User fills out a 3-step intake form at `/growth-score`
2. Submission is saved to Supabase and an audit job is created
3. The system crawls the website (up to 25 pages), calls Google PageSpeed Insights, and detects analytics tags
4. The AC-GIE-v1.0 scoring model calculates subscores across 5 pillars
5. An HTML report is generated and saved
6. Client receives a branded email with score + CTA
7. Admin receives a lead alert with full contact data

---

## Scoring Model: AC-GIE-v1.0

| Pillar | Max | Signals |
|--------|-----|---------|
| Measurement Maturity | 30 | GA4, GTM, conversion tracking (from intake) |
| Search Opportunity | 25 | Title tags, meta descriptions, H1s, sitemap, page depth, canonicals |
| Performance & UX | 20 | Google PageSpeed (performance × 0.10, accessibility × 0.05, best practices × 0.03, SEO × 0.02) |
| Conversion Readiness | 15 | CTA detection, contact method, landing pages, offer clarity |
| Execution Fit | 10 | Budget, decision maker, timeline, strategic priority |

### Tier Assignment
- **0–44** → Foundation
- **45–69** → Acceleration
- **70–100** → Scale

---

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase Postgres
- **Email**: Resend
- **Crawler**: Native `fetch` + Cheerio (server-side)
- **Scoring**: Deterministic TypeScript model
- **Hosting**: Vercel (Pro recommended for 60s function timeout)
- **Language**: TypeScript (strict mode)

---

## Project Structure

```
growth-intelligence-engine/
├── app/
│   ├── growth-score/page.tsx     ← 3-step intake form
│   ├── report/[token]/page.tsx   ← Public report viewer (polls until complete)
│   ├── admin/page.tsx            ← Password-protected admin portal
│   └── api/
│       ├── submit/route.ts       ← Form submission handler
│       ├── audit/process/route.ts ← Audit pipeline (crawl → score → email)
│       ├── report/[token]/route.ts ← Report data API
│       └── admin/jobs/           ← Admin API (list + detail)
├── lib/
│   ├── crawler.ts                ← Web crawler + PageSpeed caller
│   ├── scoring-engine.ts         ← AC-GIE-v1.0 scoring logic
│   ├── report-generator.ts       ← HTML report template
│   ├── email.ts                  ← Resend email sender
│   ├── rate-limiter.ts           ← In-memory IP rate limiter
│   └── supabase.ts               ← Server-side Supabase client
├── types/index.ts                ← All shared TypeScript interfaces
└── supabase/schema.sql           ← Database schema
```

---

## Anti-Abuse Measures

- **Honeypot field**: Hidden form field; bot submissions are silently dropped
- **Rate limiting**: 3 submissions per IP per 15 minutes (in-memory)
- **Crawl timeout**: 8s per page, 55s total budget
- **Max pages**: Hard cap of 25 pages per crawl
- **Admin protection**: Password-protected via `ADMIN_PASSWORD` env var

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (never expose to client) |
| `RESEND_API_KEY` | ✅ | Resend API key |
| `ADMIN_PASSWORD` | ✅ | Password for /admin |
| `EMAIL_FROM` | ✅ | Verified Resend sender address |
| `ADMIN_EMAIL` | ✅ | Where lead alerts are sent |
| `NEXT_PUBLIC_BASE_URL` | ✅ | Full base URL (e.g. https://score.thealphacreative.com) |
| `PAGESPEED_API_KEY` | Recommended | Google PageSpeed Insights API key |
| `ENABLE_SERP_API` | Optional | Feature flag for future SERP integration |

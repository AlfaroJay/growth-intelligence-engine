# Smoke Test Checklist
## AlphaCreative Growth Intelligence Engine — AC-GIE-v1.0

Run this checklist after every deployment to verify the system is working end-to-end.

---

## 1. Environment & Setup

- [ ] All 8 required env vars are set in Vercel (or `.env.local` for local dev)
- [ ] Supabase schema has been applied (`supabase/schema.sql`)
- [ ] Resend domain is verified
- [ ] PageSpeed API key is active

---

## 2. Intake Form — /growth-score

- [ ] Page loads without errors at `/growth-score`
- [ ] Step 1 validates: empty name, invalid email, and missing URL are rejected
- [ ] Step 1 accepts valid data and advances to Step 2
- [ ] Step 2 validates: no services selected and missing budget/timeline are rejected
- [ ] Step 2 accepts valid selections and advances to Step 3
- [ ] Step 3 validates: no tracking maturity selected is rejected
- [ ] Honeypot: manually set `website_confirm` to a non-empty value → submission is silently accepted but no audit fires (check Supabase)
- [ ] Successful submission shows the "generating report" success screen with a share token URL
- [ ] Success screen includes the strategy call link

---

## 3. Database — Supabase

After a successful form submission:
- [ ] A row appears in `intake_submissions`
- [ ] A row appears in `audit_jobs` with `status = queued`
- [ ] After ~30–60 seconds, `audit_jobs` status changes to `complete`
- [ ] `audit_jobs.score` contains a valid JSON score object
- [ ] `audit_jobs.report_html` contains the rendered HTML report
- [ ] Rows appear in `crawled_pages` for the job

---

## 4. Audit Quality

After audit completes for `thealphacreative.com`:
- [ ] `crawled_pages` has at least 5 rows (ideally 10+)
- [ ] Pages have `title`, `status_code = 200`, `h1_present` populated
- [ ] `audit_jobs.result.signals.hasHttps = true` (site is HTTPS)
- [ ] `audit_jobs.score.total` is between 0 and 100
- [ ] `audit_jobs.score.tier` is one of: Foundation, Acceleration, Scale
- [ ] `audit_jobs.score.priority_actions` has 3–5 items
- [ ] `audit_jobs.score.model = "AC-GIE-v1.0"`

---

## 5. Report Page — /report/[token]

- [ ] Visiting `/report/[token]` while audit is running shows a spinner/loading state
- [ ] Page auto-refreshes and shows the full report once complete
- [ ] Score circle/badge displays the correct score
- [ ] Subscores display correctly with progress bars
- [ ] Priority actions are listed and readable
- [ ] Full HTML report renders without layout breaks
- [ ] Strategy call CTA links to `https://alphacreative.as.me/`
- [ ] Invalid token shows a 404-style error message

---

## 6. Email Delivery

- [ ] Client email arrives at the submitted email address
- [ ] Subject line includes score and tier
- [ ] Email shows correct score, subscores, and top 3 actions
- [ ] Strategy call CTA in email links correctly
- [ ] "View full report" link in email points to `/report/[token]`
- [ ] Admin alert email arrives at `ADMIN_EMAIL`
- [ ] Admin email includes company name, score, tier, and a link to the report

---

## 7. Admin Portal — /admin

- [ ] Page loads at `/admin`
- [ ] Wrong password is rejected with an error
- [ ] Correct password shows the dashboard
- [ ] Stats (total, completed, in-progress, avg score) are visible
- [ ] All submitted jobs appear in the table
- [ ] Clicking a row opens the detail panel
- [ ] Detail panel shows contact info, score summary, and crawled pages
- [ ] "View Report" link opens the correct report
- [ ] "Email" link opens default mail client with correct address
- [ ] Search/filter works for company, email, and domain

---

## 8. Anti-Abuse

- [ ] Submit the form 4 times from the same IP → 4th submission returns a 429 rate limit error
- [ ] Wait 15 minutes → submissions are allowed again (or verify via `lib/rate-limiter.ts` logic)

---

## 9. Edge Cases

- [ ] Submit a non-existent domain (e.g. `https://this-domain-does-not-exist-xyz.com`) → audit marks as `failed`, admin receives alert, user sees error state on report page
- [ ] Submit a site that blocks crawlers → audit still completes with partial data (not failed)
- [ ] Submit an HTTP (non-HTTPS) site → `signals.hasHttps = false`, reflected in score

---

## 10. Performance

- [ ] Full audit completes in under 60 seconds for a standard site
- [ ] `/growth-score` page loads in under 2 seconds (Vercel cold start)
- [ ] Report page loads instantly once audit is complete (no spinner)

---

## Sign-off

| Tester | Date | Notes |
|--------|------|-------|
| | | |

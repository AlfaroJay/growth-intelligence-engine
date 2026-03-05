/**
 * POST /api/audit/process
 *
 * Executes the full audit pipeline for a given job ID:
 * 1. Mark job as 'running'
 * 2. Crawl website (up to 25 pages)
 * 3. Run scoring engine
 * 4. Generate HTML report
 * 5. Save crawled pages to DB
 * 6. Update job with result, score, and report
 * 7. Send emails (client + admin)
 * 8. Mark job as 'complete' (or 'failed' on error)
 *
 * Called internally by /api/submit via waitUntil.
 * Configure maxDuration in Vercel project settings (60s for Pro).
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { crawlWebsite } from '@/lib/crawler';
import { calculateScore } from '@/lib/scoring-engine';
import { generateReport } from '@/lib/report-generator';
import { sendClientEmail, sendAdminEmail } from '@/lib/email';
import type { IntakeSubmission } from '@/types';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@example.com';

// Tell Vercel to allow up to 60 seconds for this function
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  let jobId: string;
  try {
    const body = await request.json();
    jobId = String(body.jobId ?? '');
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!jobId) {
    return NextResponse.json({ error: 'jobId required' }, { status: 400 });
  }

  // ── Fetch job + submission ──────────────────────────────────
  const { data: job, error: jobFetchError } = await supabase
    .from('audit_jobs')
    .select('*, intake_submissions(*)')
    .eq('id', jobId)
    .single();

  if (jobFetchError || !job) {
    console.error('[audit] Job not found:', jobId);
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // Avoid double-processing
  if (job.status === 'running' || job.status === 'complete') {
    return NextResponse.json({ status: job.status });
  }

  const submission = job.intake_submissions as IntakeSubmission;

  // ── Mark as running ─────────────────────────────────────────
  await supabase
    .from('audit_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId);

  try {
    // ── Crawl ─────────────────────────────────────────────────
    console.log(`[audit] Starting crawl for ${submission.website}`);
    const crawlResult = await crawlWebsite(submission.website);
    console.log(`[audit] Crawled ${crawlResult.pages.length} pages in ${crawlResult.durationMs}ms`);

    // ── Score ─────────────────────────────────────────────────
    const score = calculateScore(crawlResult, submission);
    console.log(`[audit] Score: ${score.total}/100 (${score.tier})`);

    // ── Generate report ───────────────────────────────────────
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ??
      `https://${request.headers.get('host')}`;
    const reportUrl = `${baseUrl}/report/${job.share_token}`;
    const reportHtml = generateReport(score, submission, reportUrl);

    // ── Save crawled pages (bulk insert) ──────────────────────
    if (crawlResult.pages.length > 0) {
      const pageRows = crawlResult.pages.map((p) => ({
        job_id: jobId,
        url: p.url,
        status_code: p.statusCode,
        title: p.title || null,
        meta_description: p.metaDescription || null,
        h1_present: p.h1Present,
        canonical: p.canonical || null,
        word_count: p.wordCount,
        internal_links: p.internalLinks,
      }));

      const { error: pagesError } = await supabase
        .from('crawled_pages')
        .insert(pageRows);

      if (pagesError) {
        console.warn('[audit] Failed to insert crawled pages:', pagesError.message);
      }
    }

    // ── Update job ─────────────────────────────────────────────
    const { error: updateError } = await supabase
      .from('audit_jobs')
      .update({
        status: 'complete',
        finished_at: new Date().toISOString(),
        result: crawlResult as unknown as Record<string, unknown>,
        score: score as unknown as Record<string, unknown>,
        report_html: reportHtml,
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('[audit] Failed to update job:', updateError.message);
    }

    // ── Send emails ────────────────────────────────────────────
    try {
      console.log(`[audit] Sending emails to ${submission.email} and admin...`);
      const emailResults = await Promise.allSettled([
        sendClientEmail(submission, score, reportUrl),
        sendAdminEmail(submission, score, jobId, reportUrl),
      ]);
      emailResults.forEach((result, idx) => {
        const recipient = idx === 0 ? submission.email : ADMIN_EMAIL;
        if (result.status === 'fulfilled') {
          console.log(`[audit] Email sent successfully to ${recipient}`);
        } else {
          console.error(`[audit] Email failed to ${recipient}:`, result.reason);
        }
      });
      console.log('[audit] Email dispatch complete.');
    } catch (emailErr) {
      console.error('[audit] Email send failed (non-fatal):', emailErr);
    }

    return NextResponse.json({ success: true, score: score.total, tier: score.tier });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[audit] Pipeline failed:', message);

    await supabase
      .from('audit_jobs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error_message: message,
      })
      .eq('id', jobId);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

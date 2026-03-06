/**
 * GET /api/report/[token]
 * Returns the job data (score + submission) for a given share token.
 * PRIVATE: Only accessible to the person who submitted the report or admin.
 * Requires ?email=submitter@email.com query param for verification.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;
  const { searchParams } = new URL(request.url);
  const viewerEmail = searchParams.get('email')?.toLowerCase().trim();

  if (!token || token.length < 8) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 });
  }

  // Fetch the report with submitter email
  const { data: job, error } = await supabase
    .from('audit_jobs')
    .select(
      `id, status, domain, share_token, score, report_html, finished_at,
       intake_submissions(name, email, company, website, services_selected, budget, timeline)`
    )
    .eq('share_token', token)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  // Security: Verify the viewer is either the submitter or admin
  const submitterEmail = (job.intake_submissions?.[0]?.email || '').toLowerCase().trim();
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();

  // Log for debugging
  console.log(`[report auth] Token: ${token.substring(0, 8)}...`);
  console.log(`[report auth] Viewer: ${viewerEmail}`);
  console.log(`[report auth] Submitter: ${submitterEmail}`);
  console.log(`[report auth] Admin: ${adminEmail}`);

  // Check if viewer email matches submitter or is admin
  if (!viewerEmail) {
    return NextResponse.json(
      { error: 'Access denied. Email verification required.' },
      { status: 403 }
    );
  }

  const isSubmitter = viewerEmail === submitterEmail;
  const isAdmin = viewerEmail === adminEmail;

  console.log(`[report auth] isSubmitter: ${isSubmitter}, isAdmin: ${isAdmin}`);

  if (!isSubmitter && !isAdmin) {
    return NextResponse.json(
      { error: 'Access denied. This report is private.' },
      { status: 403 }
    );
  }

  return NextResponse.json(job);
}

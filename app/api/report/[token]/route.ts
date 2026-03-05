/**
 * GET /api/report/[token]
 * Returns the job data (score + submission) for a given share token.
 * Used by the public /report/[token] page.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface RouteParams {
  params: Promise<{ token: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { token } = await params;

  if (!token || token.length < 8) {
    return NextResponse.json({ error: 'Invalid token.' }, { status: 400 });
  }

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

  return NextResponse.json(job);
}

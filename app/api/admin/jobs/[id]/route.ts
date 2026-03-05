/**
 * GET /api/admin/jobs/[id]
 * Returns full detail for a single audit job including crawled pages.
 * Protected by ADMIN_PASSWORD header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function isAuthorized(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;

  const [jobResult, pagesResult] = await Promise.all([
    supabase
      .from('audit_jobs')
      .select(
        `*, intake_submissions(*)`
      )
      .eq('id', id)
      .single(),
    supabase
      .from('crawled_pages')
      .select('*')
      .eq('job_id', id)
      .order('crawled_at', { ascending: true }),
  ]);

  if (jobResult.error || !jobResult.data) {
    return NextResponse.json({ error: 'Job not found.' }, { status: 404 });
  }

  return NextResponse.json({
    job: jobResult.data,
    pages: pagesResult.data ?? [],
  });
}

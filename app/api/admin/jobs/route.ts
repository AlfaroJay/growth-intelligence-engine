/**
 * GET /api/admin/jobs
 * Returns a list of all audit jobs with submission data.
 * Protected by ADMIN_PASSWORD header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function isAuthorized(request: NextRequest): boolean {
  const password = request.headers.get('x-admin-password');
  return password === process.env.ADMIN_PASSWORD;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('admin_jobs_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('[admin/jobs] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch jobs.' }, { status: 500 });
  }

  return NextResponse.json({ jobs: data ?? [] });
}

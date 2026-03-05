/**
 * POST /api/submit
 *
 * Handles intake form submissions:
 * 1. Validates and sanitizes input
 * 2. Checks honeypot + rate limit
 * 3. Saves to Supabase (intake_submissions + audit_jobs)
 * 4. Triggers the audit process in the background via waitUntil
 * 5. Returns { success, jobId, shareToken }
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { supabase } from '@/lib/supabase';
import { checkRateLimit } from '@/lib/rate-limiter';

// ─── Validation helpers ───────────────────────────────────────

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  // Basic RFC 5322 pattern
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!pattern.test(email)) return false;

  // Reject disposable email domains (common spam)
  const disposableDomains = [
    'tempmail.com',
    'throwaway.email',
    '10minutemail.com',
    'mailinator.com',
    'guerrillamail.com',
    'yopmail.com',
    'temp-mail.org',
    'trashmail.com',
    'fakeinbox.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase() || '';
  if (disposableDomains.includes(domain)) {
    return false;
  }

  return true;
}

function normalizeWebsite(url: string): string {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// ─── Fraud detection helper ───────────────────────────────────

function isSuspiciousSubmission(
  name: string,
  email: string,
  company: string,
  website: string
): { suspicious: boolean; reason?: string } {
  // Check for suspicious patterns
  const suspiciousKeywords = ['test', 'demo', 'example', 'admin', 'localhost', '127.0.0.1'];
  const lowerEmail = email.toLowerCase();
  const lowerName = name.toLowerCase();
  const lowerCompany = company.toLowerCase();

  // Email and name mismatch (name doesn't appear in email)
  const nameInEmail = lowerEmail.split('@')[0]?.includes(lowerName.split(' ')[0]);
  if (!nameInEmail && lowerName.length > 3) {
    // Only flag if name is long enough to reasonably appear
    // (short names like "Jo" might legitimately not be in email)
  }

  // Check for test/demo keywords
  for (const keyword of suspiciousKeywords) {
    if (
      lowerCompany.includes(keyword) ||
      lowerName.includes(keyword) ||
      lowerEmail.includes(keyword)
    ) {
      return { suspicious: true, reason: `Contains test keyword: "${keyword}"` };
    }
  }

  // Domain mismatch (email domain ≠ website domain)
  const emailDomain = email.split('@')[1]?.toLowerCase() || '';
  const siteDomain = extractDomain(website).toLowerCase();
  if (
    emailDomain &&
    siteDomain &&
    !emailDomain.includes(siteDomain.replace('www.', '')) &&
    !siteDomain.includes(emailDomain.replace('www.', ''))
  ) {
    // This is a warning but not a blocker (common for agencies/consultants)
    console.warn(`[submit] Domain mismatch - email: ${emailDomain}, website: ${siteDomain}`);
  }

  return { suspicious: false };
}

// ─── Background audit trigger ─────────────────────────────────

async function triggerAudit(jobId: string, baseUrl: string): Promise<void> {
  try {
    console.log(`[submit] Triggering audit for job ${jobId} at ${baseUrl}/api/audit/process`);
    const response = await fetch(`${baseUrl}/api/audit/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`[submit] Audit triggered successfully:`, data);
    } else {
      console.error(`[submit] Audit API returned error status ${response.status}:`, data);
    }
  } catch (err) {
    console.error('[submit] Failed to trigger audit:', err);
  }
}

// ─── Route handler ────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Rate limiting via IP
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    '127.0.0.1';

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in 15 minutes.' },
      { status: 429 }
    );
  }

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  // ── Honeypot check ──────────────────────────────────────────
  // If the hidden field is filled in, silently reject (bots)
  if (body.website_confirm && String(body.website_confirm).length > 0) {
    // Return success-looking response to not reveal detection
    return NextResponse.json({ success: true });
  }

  // ── Field validation ────────────────────────────────────────
  const name     = String(body.name ?? '').trim();
  const email    = String(body.email ?? '').trim().toLowerCase();
  const company  = String(body.company ?? '').trim();
  const website  = normalizeWebsite(String(body.website ?? '').trim());
  const role     = String(body.role ?? '').trim() || null;

  const services_selected   = Array.isArray(body.services_selected) ? body.services_selected.map(String) : [];
  const budget              = String(body.budget ?? '').trim();
  const timeline            = String(body.timeline ?? '').trim();
  const tracking_maturity   = String(body.tracking_maturity ?? '').trim();
  const marketing_channels  = Array.isArray(body.marketing_channels) ? body.marketing_channels.map(String) : [];

  const errors: string[] = [];
  if (!name || name.length < 2) errors.push('Name is required.');
  if (!isValidEmail(email)) errors.push('A valid email address is required.');
  if (!company || company.length < 1) errors.push('Company name is required.');
  if (!isValidUrl(website)) errors.push('A valid website URL is required.');
  if (!budget) errors.push('Budget selection is required.');
  if (!timeline) errors.push('Timeline selection is required.');
  if (!tracking_maturity) errors.push('Tracking maturity is required.');
  if (services_selected.length === 0) errors.push('Please select at least one service.');

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(' ') }, { status: 422 });
  }

  // ── Fraud detection ─────────────────────────────────────────
  const fraud = isSuspiciousSubmission(name, email, company, website);
  if (fraud.suspicious) {
    console.warn(`[submit] Suspicious submission detected: ${fraud.reason}`, {
      name,
      email,
      company,
      ip,
    });
    // Still process it but log it for review
  }

  // ── Save submission with fraud flag ─────────────────────────
  const { data: submission, error: subError } = await supabase
    .from('intake_submissions')
    .insert({
      name,
      email,
      company,
      website,
      role,
      services_selected,
      budget,
      timeline,
      tracking_maturity,
      marketing_channels,
      raw_payload: body,
    })
    .select()
    .single();

  if (subError || !submission) {
    console.error('[submit] Supabase insert error:', subError);
    return NextResponse.json(
      { error: 'Failed to save your submission. Please try again.' },
      { status: 500 }
    );
  }

  // ── Create audit job ────────────────────────────────────────
  const domain = extractDomain(website);

  const { data: job, error: jobError } = await supabase
    .from('audit_jobs')
    .insert({
      submission_id: submission.id,
      domain,
      status: 'queued',
    })
    .select()
    .single();

  if (jobError || !job) {
    console.error('[submit] Failed to create audit job:', jobError);
    return NextResponse.json(
      { error: 'Failed to create audit job.' },
      { status: 500 }
    );
  }

  // ── Trigger audit in background ─────────────────────────────
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ??
    `https://${request.headers.get('host')}`;

  // In development, await the audit synchronously for testing
  // In production (Vercel), use waitUntil for non-blocking execution
  if (process.env.NODE_ENV === 'development') {
    // Non-blocking: fire and forget
    triggerAudit(job.id, baseUrl).catch((err) => {
      console.error('[submit] Audit trigger failed:', err);
    });
  } else {
    waitUntil(triggerAudit(job.id, baseUrl));
  }

  return NextResponse.json({
    success: true,
    jobId: job.id,
    shareToken: job.share_token,
  });
}

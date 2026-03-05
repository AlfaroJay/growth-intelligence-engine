/**
 * AlphaCreative Growth Intelligence Engine – Email Sender
 * Uses Resend (https://resend.com)
 */

import { Resend } from 'resend';
import type { GrowthScore, IntakeSubmission } from '@/types';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.EMAIL_FROM ?? 'jose@thealphacreative.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'jose@thealphacreative.com';

// ─── Tier colours ─────────────────────────────────────────────

const TIER_COLOR: Record<string, string> = {
  Foundation:    '#dc2626',
  Acceleration:  '#d97706',
  Scale:         '#16a34a',
};

// ─── Client email ─────────────────────────────────────────────

export async function sendClientEmail(
  submission: IntakeSubmission,
  score: GrowthScore,
  reportUrl: string
): Promise<void> {
  const tierColor = TIER_COLOR[score.tier] ?? '#4f46e5';
  const top3 = score.priority_actions.slice(0, 3);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Your AlphaCreative Growth Score</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

    <!-- Header bar -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:28px 32px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,.7);margin-bottom:4px;">AlphaCreative</div>
      <div style="font-size:22px;font-weight:800;color:#fff;">Your Growth Score is Ready</div>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      <p style="font-size:15px;color:#374151;margin-bottom:24px;">
        Hi ${submission.name.split(' ')[0]}, thanks for completing the AlphaCreative Growth Diagnostic. Here's what we found for <strong>${submission.website}</strong>.
      </p>

      <!-- Score callout -->
      <div style="background:#f8f9ff;border:2px solid #4f46e5;border-radius:10px;padding:24px;text-align:center;margin-bottom:24px;">
        <div style="font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#6b7280;margin-bottom:4px;">Digital Growth Score</div>
        <div style="font-size:56px;font-weight:800;color:#4f46e5;line-height:1;">${score.total}</div>
        <div style="font-size:14px;color:#6b7280;margin-bottom:8px;">out of 100</div>
        <div style="display:inline-block;background:${tierColor};color:#fff;font-size:13px;font-weight:700;padding:4px 14px;border-radius:20px;">
          ${score.tier} Tier
        </div>
      </div>

      <!-- Subscores -->
      <div style="margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:#111827;margin-bottom:12px;">Score Breakdown</div>
        ${[
          ['📊 Measurement Maturity', score.subscores.measurement_maturity, 30],
          ['🔍 Search Opportunity',   score.subscores.search_opportunity,   25],
          ['⚡ Performance & UX',     score.subscores.performance_ux,       20],
          ['🎯 Conversion Readiness', score.subscores.conversion_readiness, 15],
          ['🚀 Execution Fit',        score.subscores.execution_fit,        10],
        ]
          .map(
            ([label, pts, max]) => `
          <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #f3f4f6;">
            <span style="font-size:13px;color:#374151;">${label}</span>
            <span style="font-size:13px;font-weight:600;color:#111827;">${Math.round(pts as number)}/${max}</span>
          </div>`
          )
          .join('')}
      </div>

      <!-- Top 3 actions -->
      <div style="background:#fffbeb;border-radius:8px;padding:20px;margin-bottom:24px;">
        <div style="font-size:14px;font-weight:700;color:#92400e;margin-bottom:12px;">🎯 Your Top 3 Priority Actions</div>
        ${top3
          .map(
            (action, i) => `
          <div style="display:flex;gap:10px;margin-bottom:8px;">
            <div style="background:#d97706;color:#fff;font-size:11px;font-weight:700;border-radius:50%;width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
            <div style="font-size:13px;color:#374151;">${action}</div>
          </div>`
          )
          .join('')}
      </div>

      <!-- CTA -->
      <div style="text-align:center;margin-bottom:24px;">
        <a href="https://alphacreative.as.me/"
          style="display:inline-block;background:#4f46e5;color:#fff;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;text-decoration:none;margin-bottom:12px;">
          Book Your Strategy Call →
        </a>
        <br/>
        <a href="${reportUrl}"
          style="font-size:13px;color:#6366f1;text-decoration:none;">
          View your full report online
        </a>
      </div>

      <p style="font-size:13px;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;">
        This report was generated by the AlphaCreative Growth Intelligence Engine (AC-GIE-v1.0).
        Questions? Reply to this email or visit <a href="https://thealphacreative.com" style="color:#6366f1;">thealphacreative.com</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: submission.email,
    subject: `Your AlphaCreative Growth Score: ${score.total}/100 (${score.tier})`,
    html,
  });
}

// ─── Admin email ──────────────────────────────────────────────

export async function sendAdminEmail(
  submission: IntakeSubmission,
  score: GrowthScore,
  jobId: string,
  reportUrl: string
): Promise<void> {
  const tierColor = TIER_COLOR[score.tier] ?? '#4f46e5';
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ?? 'https://localhost:3000';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>New Growth Score Lead</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">

    <div style="background:#111827;padding:20px 28px;">
      <div style="color:#9ca3af;font-size:11px;text-transform:uppercase;letter-spacing:2px;">AlphaCreative GIE</div>
      <div style="color:#fff;font-size:18px;font-weight:700;margin-top:2px;">New Growth Score Lead</div>
    </div>

    <div style="padding:28px;">
      <!-- Contact info -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:14px;">
        <tr><td style="padding:6px 0;color:#6b7280;width:140px;">Name</td><td style="padding:6px 0;font-weight:600;">${submission.name}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Email</td><td style="padding:6px 0;"><a href="mailto:${submission.email}" style="color:#4f46e5;">${submission.email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Company</td><td style="padding:6px 0;">${submission.company}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Website</td><td style="padding:6px 0;"><a href="${submission.website}" style="color:#4f46e5;">${submission.website}</a></td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Role</td><td style="padding:6px 0;">${submission.role ?? '—'}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Budget</td><td style="padding:6px 0;">${submission.budget}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Timeline</td><td style="padding:6px 0;">${submission.timeline}</td></tr>
        <tr><td style="padding:6px 0;color:#6b7280;">Services</td><td style="padding:6px 0;">${submission.services_selected.join(', ')}</td></tr>
      </table>

      <!-- Score summary -->
      <div style="background:#f8f9ff;border-left:4px solid #4f46e5;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:1px;">Growth Score</div>
            <div style="font-size:32px;font-weight:800;color:#4f46e5;">${score.total}<span style="font-size:14px;color:#6b7280;">/100</span></div>
          </div>
          <div style="background:${tierColor};color:#fff;font-weight:700;font-size:14px;padding:6px 16px;border-radius:20px;">${score.tier}</div>
        </div>
      </div>

      <!-- Quick links -->
      <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:20px;">
        <a href="${reportUrl}"
          style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">
          View Report
        </a>
        <a href="${baseUrl}/admin"
          style="background:#f3f4f6;color:#374151;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">
          Open Admin Portal
        </a>
        <a href="mailto:${submission.email}?subject=Your%20AlphaCreative%20Strategy%20Call"
          style="background:#f0fdf4;color:#166534;padding:10px 18px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;">
          Email ${submission.name.split(' ')[0]}
        </a>
      </div>

      <p style="font-size:12px;color:#9ca3af;">Job ID: ${jobId}</p>
    </div>
  </div>
</body>
</html>`;

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `🎯 New Lead: ${submission.company} scored ${score.total}/100 (${score.tier})`,
    html,
  });
}

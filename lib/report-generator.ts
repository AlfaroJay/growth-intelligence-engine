/**
 * AlphaCreative Growth Intelligence Engine – HTML Report Generator
 * AC-GIE-v1.0
 *
 * Generates a self-contained HTML report for email delivery and
 * the public /report/[token] share page.
 */

import type { GrowthScore, IntakeSubmission, Subscores, ScoringDetail } from '@/types';

// ─── Tier colours ─────────────────────────────────────────────

const TIER_CONFIG: Record<
  string,
  { color: string; bg: string; description: string }
> = {
  Foundation: {
    color: '#dc2626',
    bg: '#fef2f2',
    description:
      'Your digital foundation needs strengthening before scaling spend. The good news: quick wins are available that will unlock compounding growth.',
  },
  Acceleration: {
    color: '#d97706',
    bg: '#fffbeb',
    description:
      'Your fundamentals are in place. You\'re ready to accelerate. The right strategy will compound quickly from here.',
  },
  Scale: {
    color: '#16a34a',
    bg: '#f0fdf4',
    description:
      'You have a strong digital foundation. The opportunity is to scale what\'s working and close the remaining gaps for maximum ROI.',
  },
};

// ─── Score meter SVG ──────────────────────────────────────────

function scoreMeterSvg(total: number): string {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (total / 100) * circumference;
  const scoreColor =
    total >= 70 ? '#16a34a' : total >= 45 ? '#d97706' : '#dc2626';

  return `
  <svg viewBox="0 0 200 200" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <circle cx="100" cy="100" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="16"/>
    <circle cx="100" cy="100" r="${radius}" fill="none"
      stroke="${scoreColor}" stroke-width="16"
      stroke-dasharray="${progress} ${circumference}"
      stroke-dashoffset="${circumference * 0.25}"
      stroke-linecap="round"
      transform="rotate(-90 100 100)"
    />
    <text x="100" y="95" text-anchor="middle" font-family="Inter,sans-serif"
      font-size="40" font-weight="700" fill="${scoreColor}">${total}</text>
    <text x="100" y="120" text-anchor="middle" font-family="Inter,sans-serif"
      font-size="13" fill="#6b7280">out of 100</text>
  </svg>`;
}

// ─── Subscore bar ─────────────────────────────────────────────

function subscoreBar(
  label: string,
  score: number,
  max: number
): string {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';
  return `
  <div style="margin-bottom:12px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
      <span style="font-size:13px;color:#374151;">${label}</span>
      <span style="font-size:13px;font-weight:600;color:${color};">${score}/${max}</span>
    </div>
    <div style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden;">
      <div style="background:${color};height:8px;border-radius:9999px;width:${pct}%;"></div>
    </div>
  </div>`;
}

// ─── Detail rows ──────────────────────────────────────────────

function detailRow(detail: ScoringDetail): string {
  const icon = detail.earned
    ? '✅'
    : '⚠️';
  const textColor = detail.earned ? '#166534' : '#92400e';
  const bgColor = detail.earned ? '#f0fdf4' : '#fffbeb';

  return `
  <div style="background:${bgColor};border-radius:8px;padding:12px 14px;margin-bottom:8px;">
    <div style="display:flex;align-items:flex-start;gap:8px;">
      <span style="font-size:16px;line-height:1.3;">${icon}</span>
      <div>
        <div style="font-size:13px;font-weight:600;color:${textColor};margin-bottom:2px;">${detail.label}</div>
        <div style="font-size:12px;color:#6b7280;">${detail.explanation}</div>
      </div>
    </div>
  </div>`;
}

// ─── Pillar section ───────────────────────────────────────────

function pillarSection(
  title: string,
  score: number,
  max: number,
  details: ScoringDetail[]
): string {
  const earned = details.filter((d) => d.earned).length;
  return `
  <div style="margin-bottom:32px;">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;border-bottom:2px solid #f3f4f6;padding-bottom:8px;">
      <h3 style="margin:0;font-size:16px;font-weight:700;color:#111827;">${title}</h3>
      <span style="font-size:13px;color:#6b7280;">${earned}/${details.length} signals · <strong style="color:#111827;">${score}/${max} pts</strong></span>
    </div>
    ${details.map(detailRow).join('')}
  </div>`;
}

// ─── Priority action card ─────────────────────────────────────

function actionCard(action: string, index: number): string {
  const colors = ['#4f46e5', '#0891b2', '#16a34a', '#d97706', '#dc2626'];
  const color = colors[index % colors.length];
  return `
  <div style="display:flex;align-items:flex-start;gap:12px;padding:14px;background:#f9fafb;border-left:4px solid ${color};border-radius:4px;margin-bottom:10px;">
    <div style="background:${color};color:#fff;font-size:12px;font-weight:700;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${index + 1}</div>
    <div style="font-size:13px;color:#374151;">${action}</div>
  </div>`;
}

// ─── Main generator ───────────────────────────────────────────

export function generateReport(
  score: GrowthScore,
  submission: IntakeSubmission,
  reportUrl: string
): string {
  const tier = score.tier;
  const tierConfig = TIER_CONFIG[tier];
  const { subscores, details, priority_actions } = score;

  const pillarMap: Array<{
    key: keyof Subscores;
    label: string;
    max: number;
  }> = [
    { key: 'measurement_maturity', label: '📊 Measurement Maturity', max: 30 },
    { key: 'search_opportunity',   label: '🔍 Search Opportunity',   max: 25 },
    { key: 'performance_ux',       label: '⚡ Performance & UX',     max: 20 },
    { key: 'conversion_readiness', label: '🎯 Conversion Readiness', max: 15 },
    { key: 'execution_fit',        label: '🚀 Execution Fit',        max: 10 },
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${submission.company} – AlphaCreative Growth Score Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#f9fafb;color:#111827;line-height:1.5;}
    .container{max-width:760px;margin:0 auto;padding:40px 20px;}
    @media(prefers-color-scheme:dark){body{background:#0f172a;color:#f1f5f9;}}
  </style>
</head>
<body>
  <div class="container">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:40px;">
      <div style="font-size:13px;text-transform:uppercase;letter-spacing:2px;color:#6b7280;margin-bottom:8px;">AlphaCreative</div>
      <h1 style="font-size:28px;font-weight:800;color:#111827;margin-bottom:4px;">Growth Intelligence Report</h1>
      <div style="font-size:14px;color:#6b7280;">${submission.company} &middot; ${submission.website} &middot; ${new Date(score.scored_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>

    <!-- Score card -->
    <div style="background:#fff;border-radius:16px;padding:36px 32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <div style="display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap;">
        <div style="text-align:center;">
          ${scoreMeterSvg(score.total)}
          <div style="font-size:14px;font-weight:600;color:#111827;margin-top:8px;">Digital Growth Score</div>
          <div style="font-size:12px;color:#6b7280;">Model AC-GIE-v1.0</div>
        </div>
        <div style="flex:1;min-width:240px;">
          <div style="background:${tierConfig.bg};border:2px solid ${tierConfig.color};border-radius:10px;padding:16px 20px;margin-bottom:16px;">
            <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${tierConfig.color};margin-bottom:4px;">Recommended Tier</div>
            <div style="font-size:24px;font-weight:800;color:${tierConfig.color};">${tier}</div>
            <div style="font-size:13px;color:#374151;margin-top:6px;line-height:1.4;">${tierConfig.description}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Subscores -->
    <div style="background:#fff;border-radius:16px;padding:28px 32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:20px;">Score Breakdown</h2>
      ${pillarMap
        .map(({ key, label, max }) =>
          subscoreBar(label, Math.round(subscores[key]), max)
        )
        .join('')}
    </div>

    <!-- Priority Actions -->
    <div style="background:#fff;border-radius:16px;padding:28px 32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;">🎯 Priority Actions</h2>
      <p style="font-size:13px;color:#6b7280;margin-bottom:16px;">Ranked by potential score impact. Addressing these in order will compound results fastest.</p>
      ${priority_actions.map((a, i) => actionCard(a, i)).join('')}
    </div>

    <!-- Detailed Findings -->
    <div style="background:#fff;border-radius:16px;padding:28px 32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;margin-bottom:24px;">Detailed Findings</h2>
      ${pillarMap
        .map(({ key, label, max }) =>
          pillarSection(label, Math.round(subscores[key]), max, details[key])
        )
        .join('')}
    </div>

    <!-- CTA -->
    <div style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px;padding:36px 32px;text-align:center;margin-bottom:32px;">
      <h2 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:8px;">Ready to move from diagnostic to execution?</h2>
      <p style="font-size:14px;color:rgba(255,255,255,.85);margin-bottom:24px;">Book a 30-minute strategy call with the AlphaCreative team. We'll walk through your score, prioritise your roadmap, and outline what a partnership looks like.</p>
      <a href="https://alphacreative.as.me/"
        style="display:inline-block;background:#fff;color:#4f46e5;font-weight:700;font-size:15px;padding:14px 32px;border-radius:8px;text-decoration:none;">
        Book Your Strategy Call →
      </a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;font-size:12px;color:#9ca3af;padding-top:8px;">
      <p>AlphaCreative · <a href="https://thealphacreative.com" style="color:#9ca3af;">thealphacreative.com</a></p>
      <p style="margin-top:4px;">Report ID: ${reportUrl.split('/').pop()} &middot; Powered by AC-GIE-v1.0</p>
      <p style="margin-top:4px;"><a href="${reportUrl}" style="color:#6366f1;">View this report online</a></p>
    </div>

  </div>
</body>
</html>`;
}

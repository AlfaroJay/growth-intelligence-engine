/**
 * AlphaCreative Growth Intelligence Engine – HTML Report Generator v2
 * AC-GIE-v1.0
 *
 * Generates signal-based HTML reports showing:
 * - Overall growth score (0-100) with confidence
 * - 5-pillar breakdown with measured signals
 * - Growth opportunities with severity levels and evidence
 * - Revenue impact estimates
 * - Key recommendations
 */

import type { SignalBasedScore, IntakeSubmission } from '@/types';

// ─── Tier colors based on score ────────────────────────────────

function getTierConfig(score: number): { color: string; bg: string; tier: string; description: string } {
  if (score >= 70) {
    return {
      color: '#16a34a',
      bg: '#f0fdf4',
      tier: 'Scale',
      description: 'You have a strong digital foundation. The opportunity is to scale what\'s working and close remaining gaps for maximum ROI.',
    };
  } else if (score >= 45) {
    return {
      color: '#d97706',
      bg: '#fffbeb',
      tier: 'Acceleration',
      description: 'Your fundamentals are in place. You\'re ready to accelerate. The right strategy will compound quickly from here.',
    };
  }
  return {
    color: '#dc2626',
    bg: '#fef2f2',
    tier: 'Foundation',
    description: 'Your digital foundation needs strengthening before scaling spend. Quick wins are available that will unlock compounding growth.',
  };
}

// ─── Score meter SVG ──────────────────────────────────────────

function scoreMeterSvg(total: number): string {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = (total / 100) * circumference;
  const scoreColor =
    total >= 70 ? '#16a34a' : total >= 45 ? '#d97706' : '#dc2626';

  // Calculate start position for the progress arc (top of circle, rotating clockwise)
  // We need to offset by -90 degrees since SVG arcs start at 0 degrees (right side)
  const startAngle = -90;
  const endAngle = startAngle + (total / 100) * 360;

  // Convert angles to radians and calculate path
  const startRad = (startAngle * Math.PI) / 180;
  const endRad = (endAngle * Math.PI) / 180;
  const x1 = 100 + radius * Math.cos(startRad);
  const y1 = 100 + radius * Math.sin(startRad);
  const x2 = 100 + radius * Math.cos(endRad);
  const y2 = 100 + radius * Math.sin(endRad);
  const largeArc = total > 50 ? 1 : 0;

  return `
  <svg viewBox="0 0 200 200" width="160" height="160" xmlns="http://www.w3.org/2000/svg">
    <!-- Background circle -->
    <circle cx="100" cy="100" r="${radius}" fill="none" stroke="#e5e7eb" stroke-width="16"/>
    <!-- Progress arc -->
    <path d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}"
      fill="none" stroke="${scoreColor}" stroke-width="16" stroke-linecap="round"/>
    <!-- Score text -->
    <text x="100" y="105" text-anchor="middle" dominant-baseline="middle" font-family="Inter,sans-serif"
      font-size="40" font-weight="700" fill="${scoreColor}">${total}</text>
    <text x="100" y="125" text-anchor="middle" font-family="Inter,sans-serif"
      font-size="13" fill="#6b7280">out of 100</text>
  </svg>`;
}

// ─── Pillar score bar ─────────────────────────────────────────

function pillarBar(label: string, score: number, max: number): string {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';
  return `
  <div style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
      <span style="font-size:13px;color:#374151;font-weight:500;">${label}</span>
      <span style="font-size:13px;font-weight:600;color:${color};">${score}/${max}</span>
    </div>
    <div style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden;">
      <div style="background:${color};height:8px;border-radius:9999px;width:${pct}%;"></div>
    </div>
  </div>`;
}

// ─── Opportunity severity badge ───────────────────────────────

function severityBadge(severity: string): { color: string; bg: string; label: string } {
  const severityMap: Record<string, { color: string; bg: string; label: string }> = {
    critical: { color: '#991b1b', bg: '#fee2e2', label: 'Critical' },
    high: { color: '#c2410c', bg: '#fed7aa', label: 'High' },
    medium: { color: '#9333ea', bg: '#f3e8ff', label: 'Medium' },
    low: { color: '#1e40af', bg: '#dbeafe', label: 'Low' },
  };
  return severityMap[severity] || severityMap.low;
}

// ─── Main report generator ────────────────────────────────────

export function generateSignalBasedReport(
  signalScore: SignalBasedScore,
  submission: IntakeSubmission,
  reportUrl: string
): string {
  const tierConfig = getTierConfig(signalScore.growth_score);
  const { breakdown, opportunities, revenue_opportunity, confidence, pages_analyzed, signals_detected } = signalScore;

  const pillarLabels = {
    measurement_infrastructure: '📊 Measurement Infrastructure',
    search_opportunity: '🔍 Search Opportunity',
    performance_ux: '⚡ Performance & UX',
    conversion_readiness: '🎯 Conversion Readiness',
    execution_maturity: '🚀 Execution Maturity',
  };

  const pillarMaxes = {
    measurement_infrastructure: 25,
    search_opportunity: 25,
    performance_ux: 20,
    conversion_readiness: 20,
    execution_maturity: 10,
  };

  // Sort opportunities by severity
  const sortedOpportunities = [...opportunities].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (severityOrder[a.severity as keyof typeof severityOrder] || 3) - (severityOrder[b.severity as keyof typeof severityOrder] || 3);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${submission.company} – AlphaCreative Growth Score Report</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
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
    <div style="text-align:center;padding:32px 24px 28px;background:#000F1F;border-radius:16px;margin-bottom:32px;position:relative;overflow:hidden;">
      <!-- Dot grid texture -->
      <div style="position:absolute;inset:0;background-image:radial-gradient(circle,rgba(252,186,18,0.07) 1px,transparent 1px);background-size:28px 28px;pointer-events:none;"></div>
      <!-- Gold orb -->
      <div style="position:absolute;top:0;right:0;width:200px;height:200px;background:radial-gradient(circle,rgba(252,186,18,0.14) 0%,transparent 65%);transform:translate(30%,-30%);pointer-events:none;"></div>
      <!-- aC monogram + wordmark -->
      <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;position:relative;">
        <div style="background:#FCBA12;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="font-family:'Nunito',Inter,sans-serif;font-size:15px;font-weight:900;color:#001D3D;letter-spacing:-0.03em;">aC</span>
        </div>
        <div style="display:flex;flex-direction:column;line-height:1;font-family:'Nunito',Inter,sans-serif;">
          <span style="font-size:18px;font-weight:800;color:#FCBA12;letter-spacing:-0.03em;line-height:1;">alpha</span>
          <span style="font-size:10px;font-weight:700;color:#fff;letter-spacing:0.12em;line-height:1.3;">CREATIVE</span>
        </div>
      </div>
      <h1 style="font-family:'Nunito',Inter,sans-serif;font-size:26px;font-weight:900;color:#fff;margin-bottom:6px;letter-spacing:-0.025em;position:relative;">Growth Intelligence Report</h1>
      <div style="font-size:13px;color:rgba(252,186,18,0.75);position:relative;">${submission.company} &middot; ${signalScore.domain} &middot; ${new Date(signalScore.scored_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
    </div>

    <!-- Score card -->
    <div style="background:#fff;border-radius:16px;padding:36px 32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <div style="display:flex;align-items:center;justify-content:center;gap:40px;flex-wrap:wrap;margin-bottom:28px;">
        <div style="text-align:center;">
          ${scoreMeterSvg(signalScore.growth_score)}
          <div style="font-size:14px;font-weight:600;color:#111827;margin-top:8px;">Digital Growth Score</div>
          <div style="font-size:12px;color:#6b7280;margin-top:4px;">Based on ${signals_detected} measured signals</div>
        </div>
        <div style="flex:1;min-width:200px;">
          <div style="background:${tierConfig.bg};border-left:4px solid ${tierConfig.color};padding:16px;border-radius:8px;margin-bottom:16px;">
            <div style="font-size:14px;font-weight:600;color:${tierConfig.color};margin-bottom:6px;">📊 ${tierConfig.tier} Tier</div>
            <div style="font-size:13px;color:#6b7280;">${tierConfig.description}</div>
          </div>
          <div style="font-size:12px;color:#6b7280;">
            <div><strong>Pages analyzed:</strong> ${pages_analyzed}</div>
            <div><strong>Measurement confidence:</strong> ${confidence}%</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 5-Pillar Breakdown -->
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">Growth Score Breakdown</h2>
      ${Object.entries(pillarLabels).map(([key, label]) => 
        pillarBar(label, breakdown[key as keyof typeof breakdown] || 0, pillarMaxes[key as keyof typeof pillarMaxes])
      ).join('')}
    </div>

    <!-- Growth Opportunities -->
    ${opportunities.length > 0 ? `
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">Growth Opportunities (${opportunities.length})</h2>
      ${sortedOpportunities.map((opp) => {
        const badge = severityBadge(opp.severity);
        return `
        <div style="background:${badge.bg};border-left:4px solid ${badge.color};border-radius:8px;padding:16px;margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="flex:1;">
              <div style="font-size:13px;font-weight:600;color:${badge.color};margin-bottom:4px;">⚡ ${opp.type}</div>
              <div style="font-size:13px;color:#374151;line-height:1.5;">${opp.message}</div>
            </div>
            <div style="background:${badge.color};color:#fff;font-size:11px;font-weight:600;padding:4px 8px;border-radius:4px;white-space:nowrap;margin-left:12px;">${badge.label}</div>
          </div>
          ${opp.evidence && Object.keys(opp.evidence).length > 0 ? `
          <div style="font-size:12px;color:#6b7280;background:rgba(0,0,0,0.02);padding:12px;border-radius:6px;margin-top:12px;">
            <strong>Evidence:</strong>
            ${Object.entries(opp.evidence).map(([k, v]) => 
              `<div>• ${k.replace(/_/g, ' ')}: ${String(v)}</div>`
            ).join('')}
          </div>
          ` : ''}
        </div>
        `;
      }).join('')}
    </div>
    ` : ''}

    <!-- Revenue Impact -->
    <div style="background:#fff;border-radius:16px;padding:32px;margin-bottom:32px;box-shadow:0 1px 3px rgba(0,0,0,.08);">
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid #e5e7eb;">📈 Revenue Impact Estimate</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Monthly Lost Traffic</div>
          <div style="font-size:20px;font-weight:700;color:#111827;">${revenue_opportunity.lost_traffic_range.min.toLocaleString()}–${revenue_opportunity.lost_traffic_range.max.toLocaleString()}</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:4px;">potential visits/month</div>
        </div>
        <div style="background:#f3f4f6;padding:16px;border-radius:8px;">
          <div style="font-size:12px;color:#6b7280;margin-bottom:6px;">Monthly Lost Leads</div>
          <div style="font-size:20px;font-weight:700;color:#111827;">${revenue_opportunity.lost_leads_per_month.toLocaleString()}</div>
          <div style="font-size:11px;color:#9ca3af;margin-top:4px;">estimated qualified leads</div>
        </div>
      </div>
      <div style="background:#fef3c7;border-left:4px solid #d97706;padding:16px;border-radius:8px;">
        <div style="font-size:12px;color:#92400e;margin-bottom:6px;">💰 Estimated Annual Revenue Opportunity</div>
        <div style="font-size:20px;font-weight:700;color:#92400e;">$${revenue_opportunity.lost_revenue_range.min.toLocaleString()}–$${revenue_opportunity.lost_revenue_range.max.toLocaleString()}</div>
        <div style="font-size:11px;color:#b45309;margin-top:4px;">based on ${revenue_opportunity.confidence}% measurement confidence</div>
      </div>
    </div>

    <!-- Next Steps -->
    <div style="background:#f3f4f6;border-radius:16px;padding:32px;text-align:center;margin-bottom:32px;">
      <h2 style="font-size:18px;font-weight:700;color:#111827;margin-bottom:12px;">Ready to Close Your Gaps?</h2>
      <p style="font-size:13px;color:#6b7280;margin-bottom:20px;">
        Our growth strategists can help you prioritize and implement these opportunities.
      </p>
      <a href="https://thealphacreative.com/contact" style="display:inline-block;background:#000F1F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;">Start Your Growth Plan</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;border-top:1px solid #e5e7eb;">
      <div style="font-size:12px;color:#6b7280;margin-bottom:8px;">
        <strong>AlphaCreative Growth Intelligence Engine</strong> • AC-GIE-v1.0
      </div>
      <div style="font-size:11px;color:#9ca3af;">
        This report was generated by analyzing your website's structure, content, performance, and conversion signals.
        <br/>
        <a href="${reportUrl}" style="color:#0066cc;text-decoration:none;">View public report</a> • 
        <a href="https://thealphacreative.com" style="color:#0066cc;text-decoration:none;">Visit our website</a>
      </div>
    </div>

  </div>
</body>
</html>`;
}

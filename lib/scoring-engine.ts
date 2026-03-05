/**
 * AlphaCreative Growth Intelligence Engine – Scoring Engine
 * Model: AC-GIE-v1.0
 *
 * Total score:  0–100
 *
 * Subscores:
 *   Measurement Maturity    0–30
 *   Search Opportunity      0–25
 *   Performance & UX        0–20
 *   Conversion Readiness    0–15
 *   Execution Fit           0–10
 */

import type {
  CrawlResult,
  IntakeSubmission,
  GrowthScore,
  GrowthTier,
  ScoringDetail,
  Subscores,
} from '@/types';

// ─── Threshold helpers ────────────────────────────────────────

function pagesWithTitle(result: CrawlResult): number {
  return result.pages.filter(
    (p) => p.title && p.title.length >= 20 && p.title.length <= 60
  ).length;
}

function pagesWithMetaDesc(result: CrawlResult): number {
  return result.pages.filter(
    (p) => p.metaDescription && p.metaDescription.length >= 50
  ).length;
}

function pagesWithH1(result: CrawlResult): number {
  return result.pages.filter((p) => p.h1Present).length;
}

function pagesWithCanonical(result: CrawlResult): number {
  return result.pages.filter((p) => !!p.canonical).length;
}

function ratio(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

function budgetOver5k(budget: string): boolean {
  return (
    budget.includes('$5,000') ||
    budget.includes('$10,000') ||
    budget.toLowerCase().includes('$5k') ||
    budget.toLowerCase().includes('$10k')
  );
}

function timelineUnder90Days(timeline: string): boolean {
  return (
    timeline.toLowerCase().includes('asap') ||
    timeline.includes('30 days') ||
    timeline.includes('1–3 months') ||
    timeline.includes('1-3 months')
  );
}

function isDecisionMaker(role: string | null): boolean {
  if (!role) return false;
  return (
    role.toLowerCase().includes('founder') ||
    role.toLowerCase().includes('ceo') ||
    role.toLowerCase().includes('director') ||
    role.toLowerCase().includes('vp')
  );
}

function hasStrategicPriority(services: string[]): boolean {
  // 3+ services selected indicates strategic investment intent
  return services.length >= 3;
}

// ─── Pillar scorers ───────────────────────────────────────────

/**
 * Measurement Maturity (0–30)
 * Combines crawl signals and intake form answers.
 */
function scoreMeasurementMaturity(
  result: CrawlResult,
  intake: IntakeSubmission
): ScoringDetail[] {
  const { hasGA4, hasGTM } = result.signals;
  const maturity = intake.tracking_maturity.toLowerCase();

  const details: ScoringDetail[] = [
    {
      label: 'GA4 detected on site',
      points: 5,
      earned: hasGA4,
      explanation: hasGA4
        ? 'Google Analytics 4 tag found — baseline measurement in place.'
        : 'No GA4 tag detected. Installing GA4 is the single highest-priority quick win.',
    },
    {
      label: 'Tag Manager detected',
      points: 5,
      earned: hasGTM,
      explanation: hasGTM
        ? 'Google Tag Manager found — enables flexible tag governance.'
        : 'GTM not detected. GTM unlocks scalable tracking without developer deploys.',
    },
    {
      label: 'Conversion tracking configured',
      points: 10,
      earned:
        maturity.includes('conversion') ||
        maturity.includes('advanced') ||
        maturity.includes('full funnel'),
      explanation:
        maturity.includes('conversion') ||
        maturity.includes('advanced') ||
        maturity.includes('full funnel')
          ? 'Conversion events are being tracked — attribution data exists.'
          : 'No conversion tracking in place. Without this, measuring ROI is impossible.',
    },
    {
      label: 'Multiple events tracked',
      points: 5,
      earned:
        maturity.includes('custom events') ||
        maturity.includes('advanced') ||
        maturity.includes('full funnel'),
      explanation:
        maturity.includes('custom events') ||
        maturity.includes('advanced') ||
        maturity.includes('full funnel')
          ? 'Multiple custom events tracked — richer behavioural data available.'
          : 'Only basic page-view tracking. Custom events unlock funnel-level insights.',
    },
    {
      label: 'Attribution clarity',
      points: 5,
      earned:
        maturity.includes('attribution') || maturity.includes('full funnel'),
      explanation:
        maturity.includes('attribution') || maturity.includes('full funnel')
          ? 'Attribution model configured — revenue can be tied to channels.'
          : 'Attribution model not configured. You cannot accurately credit revenue to spend.',
    },
  ];

  return details;
}

/**
 * Search Opportunity (0–25)
 * Entirely derived from crawl data.
 */
function scoreSearchOpportunity(result: CrawlResult): ScoringDetail[] {
  const total = result.pages.length;
  const titleRatio = ratio(pagesWithTitle(result), total);
  const metaRatio = ratio(pagesWithMetaDesc(result), total);
  const h1Ratio = ratio(pagesWithH1(result), total);
  const canonRatio = ratio(pagesWithCanonical(result), total);

  const details: ScoringDetail[] = [
    {
      label: 'Title tags optimised',
      points: 5,
      earned: titleRatio >= 0.5,
      explanation:
        titleRatio >= 0.5
          ? `${Math.round(titleRatio * 100)}% of pages have well-formed title tags (20–60 chars).`
          : `Only ${Math.round(titleRatio * 100)}% of pages have optimised titles. Fixing titles is the fastest SEO win.`,
    },
    {
      label: 'Meta descriptions present',
      points: 3,
      earned: metaRatio >= 0.5,
      explanation:
        metaRatio >= 0.5
          ? `${Math.round(metaRatio * 100)}% of pages have meta descriptions — improving click-through rates.`
          : `${Math.round(metaRatio * 100)}% of pages have meta descriptions. Missing descriptions reduce organic CTR.`,
    },
    {
      label: 'H1 structure valid',
      points: 4,
      earned: h1Ratio >= 0.8,
      explanation:
        h1Ratio >= 0.8
          ? `${Math.round(h1Ratio * 100)}% of pages have an H1 tag — correct document structure.`
          : `${Math.round(h1Ratio * 100)}% of pages have an H1. Missing H1s weaken keyword signals for search engines.`,
    },
    {
      label: 'Sitemap.xml detected',
      points: 3,
      earned: result.signals.hasSitemap,
      explanation: result.signals.hasSitemap
        ? 'sitemap.xml found — search engines can efficiently discover all pages.'
        : 'No sitemap.xml found. A sitemap accelerates indexation of new and updated pages.',
    },
    {
      label: 'Site depth (>10 pages)',
      points: 5,
      earned: total > 10,
      explanation:
        total > 10
          ? `${total} pages crawled — sufficient content depth for topical authority.`
          : `Only ${total} pages found. Expanding content depth is essential for competitive rankings.`,
    },
    {
      label: 'Canonical tags present',
      points: 5,
      earned: canonRatio >= 0.5,
      explanation:
        canonRatio >= 0.5
          ? `${Math.round(canonRatio * 100)}% of pages use canonical tags — duplicate content risk is low.`
          : `Only ${Math.round(canonRatio * 100)}% of pages use canonicals. Duplicate content is diluting your authority.`,
    },
  ];

  return details;
}

/**
 * Performance & UX (0–20)
 * Based on Google PageSpeed Insights scores.
 *
 * Points = Performance×0.10 + Accessibility×0.05 + Best Practices×0.03 + SEO×0.02
 * Result is capped at 20.
 */
function scorePerformanceUX(result: CrawlResult): ScoringDetail[] {
  const { pagespeed } = result;

  const perfPoints = Math.round(pagespeed.performance * 0.10 * 10) / 10;
  const a11yPoints = Math.round(pagespeed.accessibility * 0.05 * 10) / 10;
  const bpPoints   = Math.round(pagespeed.bestPractices * 0.03 * 10) / 10;
  const seoPoints  = Math.round(pagespeed.seo * 0.02 * 10) / 10;

  const fmtScore = (s: number) =>
    pagespeed.fetchedOk ? `${s}/100` : 'not measured';

  const details: ScoringDetail[] = [
    {
      label: 'Core Web Vitals / Performance',
      points: 10,
      earned: pagespeed.performance >= 50,
      explanation: pagespeed.fetchedOk
        ? pagespeed.performance >= 90
          ? `Excellent performance score (${fmtScore(pagespeed.performance)}) — fast load times reduce bounce rate.`
          : pagespeed.performance >= 50
          ? `Moderate performance (${fmtScore(pagespeed.performance)}). Optimising Core Web Vitals can unlock meaningful ranking improvements.`
          : `Poor performance (${fmtScore(pagespeed.performance)}). Slow load times are actively costing rankings and conversions.`
        : 'PageSpeed not measured — add PAGESPEED_API_KEY to enable this check.',
    },
    {
      label: 'Accessibility score',
      points: 5,
      earned: pagespeed.accessibility >= 70,
      explanation: pagespeed.fetchedOk
        ? `Accessibility: ${fmtScore(pagespeed.accessibility)}. ${pagespeed.accessibility >= 70 ? 'Good baseline — keep improving for ADA compliance.' : 'Below threshold. Accessibility gaps hurt both users and SEO.'}`
        : 'Not measured.',
    },
    {
      label: 'Best Practices score',
      points: 3,
      earned: pagespeed.bestPractices >= 70,
      explanation: pagespeed.fetchedOk
        ? `Best Practices: ${fmtScore(pagespeed.bestPractices)}. ${pagespeed.bestPractices >= 70 ? 'Good technical hygiene.' : 'Technical issues detected that affect trust and rankings.'}`
        : 'Not measured.',
    },
    {
      label: 'PageSpeed SEO score',
      points: 2,
      earned: pagespeed.seo >= 70,
      explanation: pagespeed.fetchedOk
        ? `PageSpeed SEO audit: ${fmtScore(pagespeed.seo)}. ${pagespeed.seo >= 70 ? 'No major on-page issues flagged.' : 'On-page SEO issues found. Fix these before investing in link building.'}`
        : 'Not measured.',
    },
  ];

  // Override points with actual calculated values for accuracy
  details[0].points = parseFloat(perfPoints.toFixed(1));
  details[1].points = parseFloat(a11yPoints.toFixed(1));
  details[2].points = parseFloat(bpPoints.toFixed(1));
  details[3].points = parseFloat(seoPoints.toFixed(1));

  return details;
}

/**
 * Conversion Readiness (0–15)
 * Combines crawl signals and intake form answers.
 */
function scoreConversionReadiness(
  result: CrawlResult,
  intake: IntakeSubmission
): ScoringDetail[] {
  const { hasClearCTA, hasContactMethod, hasLandingPage } = result.signals;

  // Offer clarity: assessed from services selected (more specific = clearer offer)
  const hasOfferClarity =
    intake.services_selected.length >= 1 &&
    !intake.services_selected.includes('Full-Service Growth');

  const details: ScoringDetail[] = [
    {
      label: 'Clear CTA on homepage',
      points: 4,
      earned: hasClearCTA,
      explanation: hasClearCTA
        ? 'Compelling call-to-action detected on the homepage — visitors know what to do next.'
        : 'No clear CTA found on homepage. Adding a strong primary CTA is the highest-leverage conversion fix.',
    },
    {
      label: 'Contact method present',
      points: 3,
      earned: hasContactMethod,
      explanation: hasContactMethod
        ? 'A contact mechanism is visible — removing friction from inbound enquiries.'
        : 'No clear contact method found. Every website needs a visible way for prospects to reach you.',
    },
    {
      label: 'Landing pages detected',
      points: 4,
      earned: hasLandingPage,
      explanation: hasLandingPage
        ? 'Dedicated landing pages found — good signal for campaign-specific conversion optimisation.'
        : 'No dedicated landing pages detected. Landing pages isolate intent and dramatically improve paid media ROI.',
    },
    {
      label: 'Offer clarity',
      points: 4,
      earned: hasOfferClarity,
      explanation: hasOfferClarity
        ? `Specific service focus identified (${intake.services_selected.slice(0, 2).join(', ')}) — clear value proposition is in place.`
        : 'Offer is broad or undefined. Narrowing your positioning to a specific outcome improves close rates.',
    },
  ];

  return details;
}

/**
 * Execution Fit (0–10)
 * Based entirely on intake form answers.
 */
function scoreExecutionFit(intake: IntakeSubmission): ScoringDetail[] {
  const over5k = budgetOver5k(intake.budget);
  const dm = isDecisionMaker(intake.role);
  const under90 = timelineUnder90Days(intake.timeline);
  const strategic = hasStrategicPriority(intake.services_selected);

  const details: ScoringDetail[] = [
    {
      label: 'Budget aligned for growth ($5k+/mo)',
      points: 4,
      earned: over5k,
      explanation: over5k
        ? `Budget of "${intake.budget}" supports meaningful growth investment.`
        : `Budget of "${intake.budget}" may constrain speed of execution. Higher investment unlocks faster compound returns.`,
    },
    {
      label: 'Decision maker engaged',
      points: 2,
      earned: dm,
      explanation: dm
        ? `${intake.role} is engaged — decisions can move without additional approval gates.`
        : 'Decision maker not identified. Projects with executive sponsorship have 3× higher success rates.',
    },
    {
      label: 'Urgent timeline (<90 days)',
      points: 2,
      earned: under90,
      explanation: under90
        ? `Timeline of "${intake.timeline}" indicates readiness to execute — momentum will be a competitive advantage.`
        : `Timeline of "${intake.timeline}" allows for proper planning but delays compounding growth.`,
    },
    {
      label: 'Strategic growth priority',
      points: 2,
      earned: strategic,
      explanation: strategic
        ? `${intake.services_selected.length} service areas selected — growth is clearly a strategic priority.`
        : 'Focus on 1–2 high-leverage service areas before expanding scope.',
    },
  ];

  return details;
}

// ─── Tier Assignment ──────────────────────────────────────────

function assignTier(total: number): GrowthTier {
  if (total >= 70) return 'Scale';
  if (total >= 45) return 'Acceleration';
  return 'Foundation';
}

// ─── Priority Actions ─────────────────────────────────────────

function buildPriorityActions(
  details: Record<keyof Subscores, ScoringDetail[]>
): string[] {
  const missed: { label: string; pillar: keyof Subscores; points: number }[] = [];

  for (const [pillar, items] of Object.entries(details) as [
    keyof Subscores,
    ScoringDetail[],
  ][]) {
    for (const d of items) {
      if (!d.earned) {
        missed.push({ label: d.label, pillar, points: d.points });
      }
    }
  }

  // Sort by missed points (highest impact first)
  missed.sort((a, b) => b.points - a.points);

  return missed.slice(0, 5).map((m) => {
    const pillarLabel: Record<keyof Subscores, string> = {
      measurement_maturity: 'Measurement',
      search_opportunity: 'SEO',
      performance_ux: 'Performance',
      conversion_readiness: 'Conversion',
      execution_fit: 'Execution',
    };
    return `[${pillarLabel[m.pillar]}] ${m.label} (+${m.points} pts potential)`;
  });
}

// ─── Main Scorer ──────────────────────────────────────────────

/**
 * Run the AC-GIE-v1.0 scoring model against crawl data and intake form answers.
 */
export function calculateScore(
  result: CrawlResult,
  intake: IntakeSubmission
): GrowthScore {
  const measurementDetails = scoreMeasurementMaturity(result, intake);
  const searchDetails       = scoreSearchOpportunity(result);
  const performanceDetails  = scorePerformanceUX(result);
  const conversionDetails   = scoreConversionReadiness(result, intake);
  const executionDetails    = scoreExecutionFit(intake);

  function sumEarned(details: ScoringDetail[]): number {
    return details.reduce((acc, d) => acc + (d.earned ? d.points : 0), 0);
  }

  const measurement_maturity = Math.min(30, sumEarned(measurementDetails));
  const search_opportunity   = Math.min(25, sumEarned(searchDetails));
  const performance_ux       = Math.min(20, sumEarned(performanceDetails));
  const conversion_readiness = Math.min(15, sumEarned(conversionDetails));
  const execution_fit        = Math.min(10, sumEarned(executionDetails));

  const total = Math.round(
    measurement_maturity +
    search_opportunity +
    performance_ux +
    conversion_readiness +
    execution_fit
  );

  const subscores: Subscores = {
    measurement_maturity,
    search_opportunity,
    performance_ux,
    conversion_readiness,
    execution_fit,
  };

  const detailsMap: Record<keyof Subscores, ScoringDetail[]> = {
    measurement_maturity: measurementDetails,
    search_opportunity:   searchDetails,
    performance_ux:       performanceDetails,
    conversion_readiness: conversionDetails,
    execution_fit:        executionDetails,
  };

  const priority_actions = buildPriorityActions(detailsMap);
  const tier = assignTier(total);

  return {
    model: 'AC-GIE-v1.0',
    total,
    subscores,
    tier,
    priority_actions,
    details: detailsMap,
    scored_at: new Date().toISOString(),
  };
}

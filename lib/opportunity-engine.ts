/**
 * AlphaCreative Growth Scanner – Opportunity Detection Engine
 *
 * Identifies specific growth gaps and optimization opportunities
 * with supporting evidence from signals.
 */

import type { ScanSignals, Opportunity } from '@/types';

// ─── Opportunity Builders ─────────────────────────────────

function createOpportunity(
  type: string,
  severity: 'critical' | 'high' | 'medium' | 'low',
  message: string,
  evidence: Record<string, unknown>
): Opportunity {
  return { type, severity, message, evidence };
}

// ─── Measurement Opportunities ────────────────────────────

function detectMeasurementGaps(signals: ScanSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // Missing GA4
  if (signals.measurement.ga4_detected !== true) {
    opportunities.push(
      createOpportunity(
        'missing_ga4',
        'critical',
        'Google Analytics 4 not detected. Without GA4, you cannot measure traffic behavior, conversion funnels, or ROI.',
        {
          current: signals.measurement.ga4_detected,
          impact: 'No traffic attribution',
          effort: 'Low (1 hour implementation)',
        }
      )
    );
  }

  // Missing GTM
  if (signals.measurement.gtm_detected !== true) {
    opportunities.push(
      createOpportunity(
        'missing_gtm',
        'high',
        'Google Tag Manager not detected. GTM enables sophisticated event tracking without code changes.',
        {
          current: signals.measurement.gtm_detected,
          impact: 'Limited event tracking flexibility',
          effort: 'Low (2-3 hours)',
        }
      )
    );
  }

  // No ad pixel tracking
  const hasAdPixels =
    signals.measurement.meta_pixel_detected === true ||
    signals.measurement.linkedin_pixel_detected === true ||
    signals.measurement.google_ads_tag_detected === true ||
    signals.measurement.tiktok_pixel_detected === true;
  if (!hasAdPixels) {
    opportunities.push(
      createOpportunity(
        'no_ad_tracking',
        'high',
        'No advertising pixels detected. Without pixel tracking, paid campaigns cannot measure ROI or remarket.',
        {
          current: 'no_pixels_detected',
          impact: 'Cannot measure paid campaign performance',
          effort: 'Low (30 mins per platform)',
        }
      )
    );
  }

  // No event tracking
  if (
    signals.measurement.datalayer_detected !== true &&
    signals.measurement.gtag_events_detected !== true &&
    signals.measurement.custom_events_detected !== true
  ) {
    opportunities.push(
      createOpportunity(
        'no_events',
        'high',
        'No event tracking detected. Events are essential for measuring user actions beyond pageviews.',
        {
          current: 'no_events_detected',
          impact: 'Cannot measure conversions or engagement',
          effort: 'Medium (4-6 hours)',
        }
      )
    );
  }

  return opportunities;
}

// ─── Search Opportunities ─────────────────────────────────

function detectSearchGaps(signals: ScanSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // Missing sitemap
  if (signals.search.sitemap_detected !== true) {
    opportunities.push(
      createOpportunity(
        'missing_sitemap',
        'medium',
        'sitemap.xml not detected. A sitemap helps search engines discover all your pages faster.',
        {
          current: signals.search.sitemap_detected,
          impact: 'Slower indexation of new pages',
          effort: 'Low (30 mins)',
        }
      )
    );
  }

  // Poor metadata coverage
  if (
    signals.search.pages_with_title !== null &&
    signals.search.pages_with_title < signals.search.pages_with_title * 0.8
  ) {
    opportunities.push(
      createOpportunity(
        'poor_title_coverage',
        'high',
        `Only ${signals.search.pages_with_title} pages have optimized title tags. Titles are critical for click-through rates.`,
        {
          current: signals.search.pages_with_title,
          total_pages: signals.search.pages_with_title,
          impact: 'Lower organic click-through rates',
          effort: 'Medium (2-4 hours)',
        }
      )
    );
  }

  // No schema markup
  if (signals.search.schema_detected !== true) {
    opportunities.push(
      createOpportunity(
        'missing_schema',
        'medium',
        'Structured data (schema.org) not detected. Schema markup helps search engines understand your content.',
        {
          current: signals.search.schema_detected,
          impact: 'Missing rich snippets in search results',
          effort: 'Medium (4-6 hours)',
        }
      )
    );
  }

  // Weak internal linking
  if (
    signals.search.avg_internal_links_per_page !== null &&
    signals.search.avg_internal_links_per_page < 3
  ) {
    opportunities.push(
      createOpportunity(
        'weak_internal_linking',
        'medium',
        `Average ${signals.search.avg_internal_links_per_page} internal links per page. Strong internal linking distributes authority and improves crawlability.`,
        {
          current: signals.search.avg_internal_links_per_page,
          target: '5-8 internal links per page',
          impact: 'Weaker link equity distribution',
          effort: 'Medium (8-10 hours)',
        }
      )
    );
  }

  return opportunities;
}

// ─── Performance Opportunities ────────────────────────────

function detectPerformanceGaps(signals: ScanSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // Slow LCP (Largest Contentful Paint)
  if (signals.performance.lcp_avg !== null && signals.performance.lcp_avg > 4000) {
    opportunities.push(
      createOpportunity(
        'slow_lcp',
        'critical',
        `LCP of ${(signals.performance.lcp_avg / 1000).toFixed(1)}s exceeds Google's good threshold (2.5s). Slow pages lose traffic to competitors.`,
        {
          current_lcp: `${(signals.performance.lcp_avg / 1000).toFixed(1)}s`,
          target: '2.5s',
          impact: 'Higher bounce rate, lower rankings',
          effort: 'High (varies by cause)',
        }
      )
    );
  }

  // Poor Lighthouse performance
  if (
    signals.performance.lighthouse_performance !== null &&
    signals.performance.lighthouse_performance < 50
  ) {
    opportunities.push(
      createOpportunity(
        'poor_performance_score',
        'high',
        `Lighthouse performance score: ${signals.performance.lighthouse_performance}/100. This impacts SEO rankings and user experience.`,
        {
          current_score: signals.performance.lighthouse_performance,
          target: '90+',
          impact: 'Reduced organic traffic and conversions',
          effort: 'High (varies by cause)',
        }
      )
    );
  }

  // Not mobile friendly
  if (signals.performance.mobile_friendly !== true) {
    opportunities.push(
      createOpportunity(
        'not_mobile_friendly',
        'critical',
        'Website is not mobile friendly. 70%+ of traffic is mobile—this is a major ranking and conversion issue.',
        {
          current: signals.performance.mobile_friendly,
          impact: 'Lost mobile traffic and rankings',
          effort: 'High (redesign/restructure)',
        }
      )
    );
  }

  return opportunities;
}

// ─── Conversion Opportunities ─────────────────────────────

function detectConversionGaps(signals: ScanSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // No lead capture
  if (signals.conversion.forms_detected === null || signals.conversion.forms_detected === 0) {
    opportunities.push(
      createOpportunity(
        'no_lead_capture',
        'critical',
        'No forms detected on the site. Without lead capture, traffic is worthless—you cannot follow up.',
        {
          current: signals.conversion.forms_detected,
          impact: 'Zero lead generation',
          effort: 'Low (4-8 hours)',
        }
      )
    );
  }

  // No CTAs
  if (
    signals.conversion.cta_buttons_detected === null ||
    signals.conversion.cta_buttons_detected < 2
  ) {
    opportunities.push(
      createOpportunity(
        'weak_cta_presence',
        'high',
        'Few or no clear call-to-action buttons. Visitors need clear guidance on what to do next.',
        {
          current: signals.conversion.cta_buttons_detected || 0,
          target: '3-5 CTAs',
          impact: 'Lower conversion rate',
          effort: 'Low (2-4 hours)',
        }
      )
    );
  }

  // No booking integration
  if (
    signals.conversion.calendly_detected !== true &&
    signals.conversion.cal_com_detected !== true &&
    signals.conversion.hubspot_meetings_detected !== true
  ) {
    opportunities.push(
      createOpportunity(
        'no_booking_automation',
        'high',
        'No booking/scheduling tool detected. Without automated scheduling, you miss qualified leads.',
        {
          current: 'no_booking_detected',
          impact: 'Manual scheduling overhead, lost leads',
          effort: 'Low (1-2 hours)',
        }
      )
    );
  }

  // No social proof
  if (signals.conversion.testimonials_present !== true) {
    opportunities.push(
      createOpportunity(
        'no_social_proof',
        'medium',
        'No testimonials or case studies detected. Social proof increases conversion rates by 30-40%.',
        {
          current: signals.conversion.testimonials_present,
          impact: 'Lower buyer confidence and conversion',
          effort: 'Medium (4-8 hours)',
        }
      )
    );
  }

  return opportunities;
}

// ─── Execution Opportunities ─────────────────────────────

function detectExecutionGaps(signals: ScanSignals): Opportunity[] {
  const opportunities: Opportunity[] = [];

  // No team visibility
  if (signals.execution.team_page_present !== true) {
    opportunities.push(
      createOpportunity(
        'no_team_page',
        'medium',
        'No team page detected. Buyers want to know who they are buying from.',
        {
          current: signals.execution.team_page_present,
          impact: 'Lower trust and credibility',
          effort: 'Medium (4-6 hours)',
        }
      )
    );
  }

  // No pricing clarity
  if (signals.execution.pricing_page_present !== true) {
    opportunities.push(
      createOpportunity(
        'no_pricing_page',
        'high',
        'No pricing page detected. Lack of pricing transparency kills deals before they start.',
        {
          current: signals.execution.pricing_page_present,
          impact: 'High sales cycle friction',
          effort: 'Medium (6-10 hours)',
        }
      )
    );
  }

  // No content engine
  if (signals.execution.blog_detected !== true) {
    opportunities.push(
      createOpportunity(
        'no_content_strategy',
        'high',
        'No blog detected. Content is the #1 way to attract organic traffic at scale.',
        {
          current: signals.execution.blog_detected,
          impact: 'Stagnant organic growth',
          effort: 'High (ongoing: 4-8 hrs/month)',
        }
      )
    );
  }

  // No knowledge base
  const docsPresent =
    signals.execution.docs_present === true ||
    signals.execution.help_center_present === true;
  if (!docsPresent) {
    opportunities.push(
      createOpportunity(
        'no_knowledge_base',
        'medium',
        'No knowledge base detected. Documentation reduces support burden and improves customer success.',
        {
          current: docsPresent,
          impact: 'Higher support load, customer friction',
          effort: 'Medium (20-30 hours)',
        }
      )
    );
  }

  return opportunities;
}

// ─── Main Opportunity Detector ────────────────────────────

/**
 * Detect all growth opportunities from signals
 * Ordered by severity (critical → low)
 */
export function detectOpportunities(signals: ScanSignals): Opportunity[] {
  const all = [
    ...detectMeasurementGaps(signals),
    ...detectPerformanceGaps(signals),
    ...detectConversionGaps(signals),
    ...detectSearchGaps(signals),
    ...detectExecutionGaps(signals),
  ];

  // Sort by severity: critical > high > medium > low
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  all.sort(
    (a, b) =>
      severityOrder[a.severity as keyof typeof severityOrder] -
      severityOrder[b.severity as keyof typeof severityOrder]
  );

  return all;
}

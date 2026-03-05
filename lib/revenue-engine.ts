/**
 * AlphaCreative Growth Scanner – Revenue Opportunity Engine
 *
 * Calculates implementation upside based on measured signals.
 * High confidence: user provides actual metrics
 * Medium confidence: strong signal pattern detected
 * Low confidence: limited data, assumptions needed
 */

import type { ScanSignals, RevenueOpportunity, ConfidenceTier } from '@/types';

/**
 * Score signal coverage: how many pillars did we actually measure?
 * Signals we can't measure = we can't score improvements on them
 */
function assessSignalCoverage(signals: ScanSignals): {
  measured_pillars: number;
  total_pillars: number;
  coverage_percent: number;
} {
  let measured = 0;
  
  // Measurement: have we detected analytics/tracking?
  if (signals.measurement.ga4_detected !== null || signals.measurement.gtm_detected !== null) {
    measured++;
  }
  
  // Search: have we analyzed SEO signals?
  if (signals.search.pages_with_title !== null || signals.search.pages_with_meta_description !== null) {
    measured++;
  }
  
  // Performance: have we tested speed?
  if (signals.performance.lighthouse_performance !== null || signals.performance.lcp_avg !== null) {
    measured++;
  }
  
  // Conversion: have we analyzed conversion elements?
  if (signals.conversion.forms_detected !== null || signals.conversion.cta_buttons_detected !== null) {
    measured++;
  }
  
  // Execution: have we identified team/content infrastructure?
  if (signals.execution.team_page_present !== null || signals.execution.blog_detected !== null) {
    measured++;
  }
  
  return {
    measured_pillars: measured,
    total_pillars: 5,
    coverage_percent: (measured / 5) * 100,
  };
}

/**
 * Determine confidence tier based on what we know
 */
function calculateConfidenceTier(
  signals: ScanSignals,
  coverage: { measured_pillars: number; coverage_percent: number },
  userProvidedMetrics: boolean
): { tier: ConfidenceTier; explanation: string } {
  // High confidence: user gave us actual metrics (we can do real math)
  if (userProvidedMetrics) {
    return {
      tier: 'high',
      explanation: 'Based on your actual traffic and conversion data',
    };
  }
  
  // Medium confidence: we measured most pillars and have strong signals
  if (coverage.measured_pillars >= 4) {
    return {
      tier: 'medium',
      explanation: `Based on measured signals across ${coverage.measured_pillars}/5 growth pillars`,
    };
  }
  
  // Low confidence: we measured some pillars but have gaps
  if (coverage.measured_pillars >= 2) {
    return {
      tier: 'low',
      explanation: `Based on partial analysis (${coverage.measured_pillars}/5 pillars measured). Provide your traffic/lead data for accuracy.`,
    };
  }
  
  // Very low: we barely know anything
  return {
    tier: 'low',
    explanation: 'Limited measurement data. Share your current traffic and conversion metrics for realistic estimates.',
  };
}

/**
 * Calculate implementation upside: what could be gained by fixing issues we found
 */
function calculateUpside(
  pagesAnalyzed: number,
  signals: ScanSignals,
  acv: number
): { traffic: number; leads: number; revenue: number } {
  // Base assumption: 1 lead per 100 visits, if conversion is optimized
  const baseLeadRate = 0.01;
  let trafficUpside = 0;
  let leadUpside = 0;
  
  // Upside from fixing performance issues
  if (signals.performance.lighthouse_performance !== null && signals.performance.lighthouse_performance < 70) {
    // Assuming performance improvement yields 15-20% more organic traffic
    trafficUpside += Math.floor(pagesAnalyzed * 50 * 0.15);
  }
  
  // Upside from fixing SEO fundamentals
  if (
    signals.search.pages_with_title === 0 ||
    signals.search.pages_with_meta_description === 0 ||
    signals.search.avg_internal_links_per_page === 0
  ) {
    // Missing SEO basics = likely 30-50% uplift if fixed
    trafficUpside += Math.floor(pagesAnalyzed * 50 * 0.3);
  } else if (signals.search.pages_with_title !== null && signals.search.pages_with_title < (pagesAnalyzed * 0.5)) {
    // Low keyword coverage = moderate upside
    trafficUpside += Math.floor(pagesAnalyzed * 50 * 0.15);
  }
  
  // Upside from adding/improving conversion elements
  let conversionGaps = 0;
  if (!signals.conversion.forms_detected || signals.conversion.forms_detected === 0) conversionGaps++;
  if (!signals.conversion.cta_buttons_detected || signals.conversion.cta_buttons_detected === 0) conversionGaps++;
  if (signals.conversion.calendly_detected === false && signals.conversion.cal_com_detected === false) conversionGaps++;
  
  if (conversionGaps >= 2) {
    // Major conversion gaps = could double conversion rate (0.5% → 1.5%)
    leadUpside = Math.floor((trafficUpside || pagesAnalyzed * 50) * 0.015) - Math.floor((trafficUpside || pagesAnalyzed * 50) * baseLeadRate);
  }
  
  // If no upside detected from traffic, assume minimal improvement
  if (trafficUpside === 0) {
    trafficUpside = Math.floor(pagesAnalyzed * 30); // 30 visits/page conservative
  }
  
  // Convert traffic to leads if not already calculated
  if (leadUpside === 0) {
    leadUpside = Math.floor(trafficUpside * baseLeadRate);
  }
  
  const revenueUpside = Math.floor(leadUpside * acv);
  
  return {
    traffic: trafficUpside,
    leads: leadUpside,
    revenue: revenueUpside,
  };
}

/**
 * Main: Calculate revenue opportunity with honest confidence assessment
 */
export function estimateRevenueOpportunity(
  pagesAnalyzed: number,
  signals: ScanSignals,
  avgCustomerValue?: number,
  userCurrentTraffic?: number,
  userCurrentLeads?: number
): RevenueOpportunity {
  const acv = avgCustomerValue ?? 1000;
  const coverage = assessSignalCoverage(signals);
  const userProvidedMetrics = !!(userCurrentTraffic !== undefined && userCurrentLeads !== undefined);
  
  const { tier, explanation } = calculateConfidenceTier(signals, coverage, userProvidedMetrics);
  
  let upside;
  
  if (userProvidedMetrics && userCurrentTraffic && userCurrentLeads) {
    // Real calculation: compare current to potential
    const potentialTraffic = Math.floor(pagesAnalyzed * 80); // 80 visits/page if optimized
    const potentialLeadRate = 0.01; // 1% if conversion optimized
    const potentialLeads = Math.floor(potentialTraffic * potentialLeadRate);
    
    upside = {
      traffic: Math.max(0, potentialTraffic - userCurrentTraffic),
      leads: Math.max(0, potentialLeads - userCurrentLeads),
      revenue: Math.max(0, (potentialLeads - userCurrentLeads) * acv),
    };
  } else {
    // Estimate based on measured issues
    upside = calculateUpside(pagesAnalyzed, signals, acv);
  }
  
  return {
    upside_traffic_per_month: upside.traffic,
    upside_leads_per_month: upside.leads,
    upside_revenue_per_month: upside.revenue,
    confidence_tier: tier,
    confidence_explanation: explanation,
    user_current_traffic: userCurrentTraffic,
    user_current_leads: userCurrentLeads,
    user_acv: avgCustomerValue,
  };
}

/**
 * Format upside potential as human-readable string
 */
export function formatRevenueUpside(opportunity: RevenueOpportunity): string {
  const monthly = opportunity.upside_revenue_per_month;
  const annual = monthly * 12;
  
  if (monthly === 0) {
    return 'No measurable upside (strong foundation)';
  }
  
  return `$${monthly.toLocaleString()}/month ($${annual.toLocaleString()}/year)`;
}

/**
 * Format confidence as human-friendly explanation
 */
export function formatConfidence(opportunity: RevenueOpportunity): string {
  const tier = opportunity.confidence_tier;
  const base = opportunity.confidence_explanation;
  
  if (tier === 'high') {
    return `✓ ${base}`;
  }
  if (tier === 'medium') {
    return `~ ${base}`;
  }
  return `? ${base}`;
}

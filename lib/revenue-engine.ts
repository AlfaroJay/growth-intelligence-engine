/**
 * AlphaCreative Growth Scanner – Revenue Opportunity Engine
 *
 * Estimates lost traffic, leads, and revenue from signal analysis
 */

import type { ScanSignals, RevenueOpportunity } from '@/types';

/**
 * Estimate traffic potential based on indexed pages
 * Typical range: 40–120 visits per page per month
 */
function estimateTrafficPotential(
  pagesAnalyzed: number,
  signals: ScanSignals
): { min: number; max: number } {
  // Conservative estimate: 40 visits/page (organic + referral)
  const minPerPage = 40;
  // Optimistic estimate: 120 visits/page
  const maxPerPage = 120;

  // Adjust based on measured performance
  let adjustedMin = minPerPage;
  let adjustedMax = maxPerPage;

  // If performance is poor, reduce potential
  if (signals.performance.lighthouse_performance !== null) {
    if (signals.performance.lighthouse_performance < 30) {
      // Slow sites get 50% of potential
      adjustedMin = Math.floor(minPerPage * 0.5);
      adjustedMax = Math.floor(maxPerPage * 0.5);
    } else if (signals.performance.lighthouse_performance < 50) {
      // Below average sites get 75% of potential
      adjustedMin = Math.floor(minPerPage * 0.75);
      adjustedMax = Math.floor(maxPerPage * 0.75);
    }
  }

  // If mobile isn't friendly, reduce by 40% (lost mobile traffic)
  if (signals.performance.mobile_friendly === false) {
    adjustedMin = Math.floor(adjustedMin * 0.6);
    adjustedMax = Math.floor(adjustedMax * 0.6);
  }

  // If SEO fundamentals missing (no title/meta), reduce by 50%
  if (
    signals.search.pages_with_title === 0 ||
    signals.search.pages_with_meta_description === 0
  ) {
    adjustedMin = Math.floor(adjustedMin * 0.5);
    adjustedMax = Math.floor(adjustedMax * 0.5);
  }

  return {
    min: Math.max(0, Math.floor(pagesAnalyzed * adjustedMin)),
    max: Math.max(0, Math.floor(pagesAnalyzed * adjustedMax)),
  };
}

/**
 * Estimate lead conversion rate based on conversion signals
 * Default: 1% of traffic converts to leads
 * Range: 0.5% (weak) → 2% (strong)
 */
function estimateLeadRate(signals: ScanSignals): number {
  let leadRate = 0.01; // Default 1%

  // Weak conversion signals → lower rate (0.5%)
  if (
    signals.conversion.forms_detected === null ||
    signals.conversion.forms_detected === 0
  ) {
    leadRate = 0.005;
  }

  // Strong conversion signals → higher rate (1.5%)
  let conversionSignals = 0;
  if (signals.conversion.forms_detected !== null && signals.conversion.forms_detected > 0) {
    conversionSignals++;
  }
  if (signals.conversion.cta_buttons_detected !== null && signals.conversion.cta_buttons_detected >= 2) {
    conversionSignals++;
  }
  if (
    signals.conversion.calendly_detected === true ||
    signals.conversion.cal_com_detected === true
  ) {
    conversionSignals++;
  }
  if (signals.conversion.testimonials_present === true) {
    conversionSignals++;
  }

  if (conversionSignals >= 3) {
    leadRate = 0.015; // 1.5%
  }

  return leadRate;
}

/**
 * Estimate lost revenue based on:
 * - Lost traffic (estimated potential vs. implied current)
 * - Lead rate (estimated from signals)
 * - Average customer value (provided or default)
 */
export function estimateRevenueOpportunity(
  pagesAnalyzed: number,
  signals: ScanSignals,
  avgCustomerValue?: number
): RevenueOpportunity {
  // Default to $1000 average customer value if not provided
  const acv = avgCustomerValue ?? 1000;

  // Estimate traffic potential
  const trafficPotential = estimateTrafficPotential(pagesAnalyzed, signals);

  // Estimate lead rate
  const leadRate = estimateLeadRate(signals);

  // Calculate lost leads per month (assume current traffic is near zero or minimal for new sites)
  // For simplicity: use average of potential range
  const avgPotentialTraffic = (trafficPotential.min + trafficPotential.max) / 2;
  const potentialLeads = Math.floor(avgPotentialTraffic * leadRate);

  // Assume current traffic is minimal (for new/unoptimized sites)
  // Lost leads = potential - current (assume current ≈ 0 for most cases)
  const lostLeadsPerMonth = Math.max(0, potentialLeads);

  // Lost revenue
  const lostRevenueMin = Math.floor(trafficPotential.min * leadRate * acv * 0.1); // 10% of potential (conservative)
  const lostRevenueMax = Math.floor(trafficPotential.max * leadRate * acv);

  return {
    lost_traffic_range: trafficPotential,
    lost_leads_per_month: lostLeadsPerMonth,
    lost_revenue_range: {
      min: lostRevenueMin,
      max: lostRevenueMax,
    },
    confidence: calculateRevenueConfidence(signals),
  };
}

/**
 * Confidence in revenue estimates
 * Higher if we have more signals (especially conversion data)
 */
function calculateRevenueConfidence(signals: ScanSignals): number {
  let confidence = signals.confidence; // Start with overall signal confidence

  // Boost if we have conversion signals
  let conversionSignalsPresent = 0;
  if (signals.conversion.forms_detected !== null) conversionSignalsPresent++;
  if (signals.conversion.cta_buttons_detected !== null) conversionSignalsPresent++;
  if (signals.performance.lighthouse_performance !== null) conversionSignalsPresent++;
  if (signals.search.pages_with_title !== null) conversionSignalsPresent++;

  if (conversionSignalsPresent >= 3) {
    confidence = Math.min(100, confidence + 10);
  }

  return confidence;
}

/**
 * Format revenue range as human-readable string
 */
export function formatRevenueRange(range: { min: number; max: number }): string {
  return `$${range.min.toLocaleString()} – $${range.max.toLocaleString()}`;
}

/**
 * Format monthly lost leads
 */
export function formatLeadCount(count: number): string {
  if (count === 0) return 'No measurable opportunity (strong signals)';
  if (count < 5) return `${count} potential leads/month`;
  if (count < 50) return `${count} potential leads/month`;
  return `${count}+ potential leads/month`;
}

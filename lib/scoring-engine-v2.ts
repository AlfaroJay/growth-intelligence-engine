/**
 * AlphaCreative Growth Scanner – Signal-Based Scoring Engine v2
 *
 * PRINCIPLE: Never score what you didn't measure.
 *
 * Signals that are null (unmeasured) never reduce a score.
 * Only true/false signals contribute to scoring.
 *
 * Total: 100 points across 5 pillars
 */

import type { ScanSignals, ScoreBreakdown } from '@/types';

// ─── Measurement Infrastructure (0–25) ─────────────────────

/**
 * Score: GA4, GTM, ad pixels, behavior tracking, CRM, event infrastructure
 */
export function scoreMeasurement(signals: ScanSignals): number {
  let score = 0;
  const weights = {
    ga4_detected: 6,
    gtm_detected: 5,
    ad_pixels_detected: 4,
    behavior_tracking_detected: 4,
    crm_detected: 3,
    events_detected: 3,
  };

  // GA4
  if (signals.measurement.ga4_detected === true) {
    score += weights.ga4_detected;
  }

  // GTM (implies more sophisticated tracking)
  if (signals.measurement.gtm_detected === true) {
    score += weights.gtm_detected;
  }

  // Ad pixels (multi-channel tracking capability)
  const adPixelsDetected =
    signals.measurement.meta_pixel_detected === true ||
    signals.measurement.linkedin_pixel_detected === true ||
    signals.measurement.google_ads_tag_detected === true ||
    signals.measurement.tiktok_pixel_detected === true ||
    signals.measurement.pinterest_tag_detected === true ||
    signals.measurement.snap_pixel_detected === true;
  if (adPixelsDetected) {
    score += weights.ad_pixels_detected;
  }

  // Behavior tracking (Hotjar, Clarity, etc.)
  const behaviorTracking =
    signals.measurement.hotjar_detected === true ||
    signals.measurement.clarity_detected === true ||
    signals.measurement.crazyegg_detected === true ||
    signals.measurement.fullstory_detected === true ||
    signals.measurement.logrocket_detected === true;
  if (behaviorTracking) {
    score += weights.behavior_tracking_detected;
  }

  // CRM detection (HubSpot, Marketo, etc.)
  const crmDetected =
    signals.measurement.hubspot_detected === true ||
    signals.measurement.marketo_detected === true ||
    signals.measurement.pardot_detected === true ||
    signals.measurement.activecampaign_detected === true ||
    signals.measurement.klaviyo_detected === true ||
    signals.measurement.mailchimp_detected === true;
  if (crmDetected) {
    score += weights.crm_detected;
  }

  // Event infrastructure (dataLayer, gtag events, custom events)
  const eventsDetected =
    signals.measurement.datalayer_detected === true ||
    signals.measurement.gtag_events_detected === true ||
    signals.measurement.custom_events_detected === true;
  if (eventsDetected) {
    score += weights.events_detected;
  }

  return Math.min(25, score);
}

// ─── Search Opportunity (0–25) ───────────────────────────────

/**
 * Score: Metadata, headers, indexation, linking, schema
 */
export function scoreSearch(signals: ScanSignals): number {
  let score = 0;

  // Metadata: title tags
  if (
    signals.search.pages_with_title !== null &&
    signals.search.pages_with_title > 0
  ) {
    score += 4;
  }

  // Metadata: meta descriptions
  if (
    signals.search.pages_with_meta_description !== null &&
    signals.search.pages_with_meta_description > 0
  ) {
    score += 4;
  }

  // Header structure: H1
  if (signals.search.pages_with_h1 !== null && signals.search.pages_with_h1 > 0) {
    score += 4;
  }

  // Structured data
  if (signals.search.schema_detected === true) {
    score += 5;
  }

  // Indexation: sitemap
  if (signals.search.sitemap_detected === true) {
    score += 4;
  }

  // Internal linking quality
  if (
    signals.search.avg_internal_links_per_page !== null &&
    signals.search.avg_internal_links_per_page >= 3
  ) {
    score += 4;
  }

  // Canonical usage
  if (
    signals.search.canonical_usage_ratio !== null &&
    signals.search.canonical_usage_ratio >= 0.5
  ) {
    score += 2;
  }

  // Image SEO
  if (
    signals.search.alt_coverage_ratio !== null &&
    signals.search.alt_coverage_ratio >= 0.5
  ) {
    score += 2;
  }

  return Math.min(25, score);
}

// ─── Performance & UX (0–20) ──────────────────────────────

/**
 * Score: Lighthouse scores, Core Web Vitals, mobile friendliness
 */
export function scorePerformance(signals: ScanSignals): number {
  let score = 0;

  // Lighthouse performance (0–100 scale, contribute proportionally)
  if (signals.performance.lighthouse_performance !== null) {
    score += Math.floor(signals.performance.lighthouse_performance * 0.1);
  }

  // Lighthouse accessibility
  if (signals.performance.lighthouse_accessibility !== null) {
    score += Math.floor(signals.performance.lighthouse_accessibility * 0.05);
  }

  // Mobile friendliness
  if (signals.performance.mobile_friendly === true) {
    score += 3;
  }

  // Core Web Vitals: LCP (Largest Contentful Paint)
  // Good: < 2.5s
  if (signals.performance.lcp_avg !== null && signals.performance.lcp_avg < 2500) {
    score += 4;
  }

  // Core Web Vitals: CLS (Cumulative Layout Shift)
  // Good: < 0.1
  if (signals.performance.cls_avg !== null && signals.performance.cls_avg < 0.1) {
    score += 3;
  }

  // Responsive layout
  if (signals.performance.responsive_layout === true) {
    score += 2;
  }

  return Math.min(20, score);
}

// ─── Conversion Readiness (0–20) ──────────────────────────

/**
 * Score: Lead capture, CTAs, booking tools, testimonials, product infrastructure
 */
export function scoreConversion(signals: ScanSignals): number {
  let score = 0;

  // Forms present
  if (signals.conversion.forms_detected !== null && signals.conversion.forms_detected > 0) {
    score += 5;
  }

  // CTA buttons (2+ indicates clear conversion focus)
  if (
    signals.conversion.cta_buttons_detected !== null &&
    signals.conversion.cta_buttons_detected >= 2
  ) {
    score += 4;
  }

  // Booking tools (Calendly, Cal.com, etc.)
  const bookingDetected =
    signals.conversion.calendly_detected === true ||
    signals.conversion.cal_com_detected === true ||
    signals.conversion.hubspot_meetings_detected === true;
  if (bookingDetected) {
    score += 4;
  }

  // Testimonials / social proof
  if (signals.conversion.testimonials_present === true) {
    score += 3;
  }

  // Product pages (e-commerce or SaaS product presence)
  if (
    signals.conversion.product_pages_detected !== null &&
    signals.conversion.product_pages_detected > 0
  ) {
    score += 4;
  }

  // Email capture
  if (signals.conversion.email_capture_present === true) {
    score += 2;
  }

  // Ecommerce readiness
  const ecommerceReady =
    signals.conversion.shopify_detected === true ||
    signals.conversion.woocommerce_detected === true ||
    (signals.conversion.checkout_pages_detected !== null &&
      signals.conversion.checkout_pages_detected > 0);
  if (ecommerceReady) {
    score += 3;
  }

  return Math.min(20, score);
}

// ─── Execution Maturity (0–10) ────────────────────────────

/**
 * Score: Team presence, pricing clarity, content depth, documentation
 */
export function scoreExecution(signals: ScanSignals): number {
  let score = 0;

  // Team infrastructure
  if (signals.execution.team_page_present === true) {
    score += 2;
  }

  // Pricing transparency
  if (signals.execution.pricing_page_present === true) {
    score += 2;
  }

  // Content strategy (blog presence)
  if (signals.execution.blog_detected === true) {
    score += 2;
  }

  // Documentation / knowledge base
  const docsPresent =
    signals.execution.docs_present === true ||
    signals.execution.help_center_present === true ||
    signals.execution.knowledge_base_present === true;
  if (docsPresent) {
    score += 2;
  }

  // Community presence
  const communityPresent =
    signals.execution.forum_detected === true ||
    signals.execution.slack_community_detected === true ||
    signals.execution.discord_detected === true ||
    signals.execution.github_detected === true;
  if (communityPresent) {
    score += 2;
  }

  return Math.min(10, score);
}

// ─── Confidence Score ─────────────────────────────────────

/**
 * Confidence: Ratio of measured signals to theoretical maximum
 * Range: 0–100 (percent)
 */
export function calculateConfidence(signals: ScanSignals): number {
  return signals.confidence;
}

// ─── Main Scoring Function ────────────────────────────────

/**
 * Calculate complete score breakdown from signals
 */
export function scoreFromSignals(signals: ScanSignals): {
  breakdown: ScoreBreakdown;
  total: number;
  confidence: number;
} {
  const measurement_infrastructure = scoreMeasurement(signals);
  const search_opportunity = scoreSearch(signals);
  const performance_ux = scorePerformance(signals);
  const conversion_readiness = scoreConversion(signals);
  const execution_maturity = scoreExecution(signals);

  const breakdown: ScoreBreakdown = {
    measurement_infrastructure,
    search_opportunity,
    performance_ux,
    conversion_readiness,
    execution_maturity,
  };

  const total = Math.round(
    measurement_infrastructure +
      search_opportunity +
      performance_ux +
      conversion_readiness +
      execution_maturity
  );

  const confidence = calculateConfidence(signals);

  return {
    breakdown,
    total,
    confidence,
  };
}

/**
 * AlphaCreative Growth Scanner – Signal Extraction Layer
 * Extracts ~75 structured signals from crawl data
 * Source-of-truth for what was actually measured
 */

import type {
  CrawlResult,
  ScanSignals,
  MeasurementSignals,
  SearchSignals,
  PerformanceSignals,
  ConversionSignals,
  ExecutionSignals,
  PageData,
  SiteSignals,
  PageSpeedResult,
} from '@/types';

// ─── Helper: Script Detection ─────────────────────────────────

function hasScript(
  html: string | undefined,
  scriptPatterns: string[]
): boolean {
  if (!html) return false;
  return scriptPatterns.some((pattern) =>
    new RegExp(pattern, 'i').test(html)
  );
}

// Note: Since CrawlResult doesn't store page HTML content, 
// we'll rely on URL patterns and existing signals for now.
// In production, update crawler to store page content for deeper analysis.

// ─── Measurement Infrastructure Signals ──────────────────────

function extractMeasurementSignals(
  result: CrawlResult
): MeasurementSignals {
  // For now, rely on existing signals already detected by crawler
  // In production: update crawler to capture script detection
  // and pass them via result.signals
  
  return {
    // Analytics platforms (detected via GA4/GTM flags in result.signals)
    ga4_detected: result.signals.hasGA4,
    universal_analytics_detected: null,  // Would need script inspection
    gtm_detected: result.signals.hasGTM,
    matomo_detected: null,
    adobe_analytics_detected: null,
    segment_detected: null,
    rudderstack_detected: null,

    // Advertising pixels (would need script inspection)
    meta_pixel_detected: null,
    linkedin_pixel_detected: null,
    google_ads_tag_detected: null,
    tiktok_pixel_detected: null,
    pinterest_tag_detected: null,
    snap_pixel_detected: null,

    // Behavior analytics (would need script inspection)
    hotjar_detected: null,
    clarity_detected: null,
    crazyegg_detected: null,
    fullstory_detected: null,
    logrocket_detected: null,

    // Marketing automation (would need script inspection)
    hubspot_detected: null,
    marketo_detected: null,
    pardot_detected: null,
    activecampaign_detected: null,
    klaviyo_detected: null,
    mailchimp_detected: null,

    // Event infrastructure (would need script inspection)
    datalayer_detected: null,
    gtag_events_detected: null,
    custom_events_detected: null,
  };
}

// ─── Search Opportunity Signals ───────────────────────────────

function extractSearchSignals(result: CrawlResult): SearchSignals {
  const pages = result.pages;
  const totalPages = pages.length;

  if (totalPages === 0) {
    return {
      pages_with_title: null,
      pages_with_meta_description: null,
      avg_title_length: null,
      avg_meta_description_length: null,
      pages_with_h1: null,
      pages_with_multiple_h1: null,
      pages_with_h2_structure: null,
      pages_with_h3_structure: null,
      sitemap_detected: null,
      robots_txt_detected: null,
      canonical_usage_ratio: null,
      noindex_pages_count: null,
      avg_internal_links_per_page: null,
      max_site_depth: null,
      orphan_pages_count: null,
      schema_detected: null,
      schema_types: null,
      total_images: null,
      images_with_alt: null,
      alt_coverage_ratio: null,
    };
  }

  // Metadata
  const pagesWithTitle = pages.filter(
    (p) => p.title && p.title.length >= 20 && p.title.length <= 60
  ).length;
  const pagesWithMeta = pages.filter(
    (p) => p.metaDescription && p.metaDescription.length >= 50
  ).length;
  const avgTitleLen =
    pages.reduce((sum, p) => sum + (p.title?.length || 0), 0) / totalPages;
  const avgMetaLen =
    pages.reduce((sum, p) => sum + (p.metaDescription?.length || 0), 0) /
    totalPages;

  // Headers (from h1Present flag)
  const pagesWithH1 = pages.filter((p) => p.h1Present).length;

  // Internal links
  const avgInternalLinks =
    pages.reduce((sum, p) => sum + p.internalLinks, 0) / totalPages;

  return {
    pages_with_title: pagesWithTitle,
    pages_with_meta_description: pagesWithMeta,
    avg_title_length: Math.round(avgTitleLen),
    avg_meta_description_length: Math.round(avgMetaLen),
    pages_with_h1: pagesWithH1,
    pages_with_multiple_h1: null,  // Not currently tracked
    pages_with_h2_structure: null, // Not currently tracked
    pages_with_h3_structure: null, // Not currently tracked
    sitemap_detected: result.signals.hasSitemap,
    robots_txt_detected: result.signals.hasRobotsTxt,
    canonical_usage_ratio: pages.filter((p) => p.canonical).length / totalPages,
    noindex_pages_count: null, // Not currently tracked
    avg_internal_links_per_page: Math.round(avgInternalLinks),
    max_site_depth: null, // Not currently tracked
    orphan_pages_count: null, // Not currently tracked
    schema_detected: null,  // Not currently tracked
    schema_types: null,
    total_images: null,     // Not currently tracked
    images_with_alt: null,  // Not currently tracked
    alt_coverage_ratio: null,
  };
}

// ─── Performance & UX Signals ─────────────────────────────────

function extractPerformanceSignals(
  result: CrawlResult
): PerformanceSignals {
  const ps = result.pagespeed;

  return {
    // Core Web Vitals (not directly available from PageSpeed, would need Real User Monitoring)
    lcp_avg: null,
    cls_avg: null,
    inp_avg: null,
    fcp_avg: null,
    ttfb_avg: null,
    speed_index_avg: null,

    // Lighthouse scores
    lighthouse_performance: ps.performance,
    lighthouse_accessibility: ps.accessibility,
    lighthouse_best_practices: ps.bestPractices,
    lighthouse_seo: ps.seo,

    // Mobile usability (would need additional detection)
    viewport_meta_present: null,
    mobile_friendly: null,
    responsive_layout: null,

    // Asset optimization (would need deeper crawl)
    avg_image_size: null,
    webp_usage_ratio: null,
    lazy_loading_detected: null,
    js_bundle_size: null,
    css_bundle_size: null,
  };
}

// ─── Conversion Readiness Signals ────────────────────────────

function extractConversionSignals(
  result: CrawlResult
): ConversionSignals {
  // URL pattern matching (available without page content)
  const pages = result.pages.map((p) => p.url.toLowerCase());

  // Detect forms - would need page content inspection
  const formsDetected = null;

  // Detect CTAs - would need page content inspection
  const ctasDetected = null;

  return {
    // Lead capture (would need page content)
    forms_detected: formsDetected,
    email_capture_present: null,
    newsletter_signup_present: null,
    multi_step_forms_detected: null,

    // CTAs (would need page content)
    cta_buttons_detected: ctasDetected,
    cta_above_fold: result.signals.hasClearCTA,
    cta_density: null,

    // Sales infrastructure (URL pattern based)
    calendly_detected: pages.some((p) => p.includes('calendly')),
    cal_com_detected: pages.some((p) => p.includes('cal.com')),
    hubspot_meetings_detected: pages.some((p) => p.includes('meetings')),
    other_booking_widget_detected: null,

    // Ecommerce (URL pattern based)
    shopify_detected: pages.some((p) => p.includes('myshopify')) || result.signals.hasContactMethod,
    woocommerce_detected: pages.some((p) => p.includes('shop')),
    stripe_detected: null,  // Would need script inspection
    checkout_pages_detected: pages.filter((p) =>
      p.includes('checkout')
    ).length || null,
    product_pages_detected: pages.filter((p) =>
      p.includes('product')
    ).length || null,

    // Trust signals (would need page content)
    testimonials_present: null,
    case_studies_present: null,
    reviews_present: null,
    trust_badges_detected: null,
    client_logos_present: null,
  };
}

// ─── Execution Maturity Signals ──────────────────────────────

function extractExecutionSignals(result: CrawlResult): ExecutionSignals {
  const pages = result.pages.map((p) => p.url.toLowerCase());

  return {
    // Team infrastructure
    team_page_present: pages.some((p) => p.includes('/team')),
    about_page_present: pages.some((p) => p.includes('/about')),
    careers_page_present: pages.some((p) => p.includes('/careers')),
    jobs_page_present: pages.some((p) => p.includes('/jobs')),

    // Pricing transparency
    pricing_page_present: pages.some((p) => p.includes('/pricing')),
    pricing_tables_detected: pages.filter((p) => p.includes('/pricing')).length || null,

    // Content publishing
    blog_detected: pages.some((p) => p.includes('/blog')),
    blog_post_count: pages.filter((p) => p.includes('/blog')).length || null,
    articles_detected: pages.filter((p) => p.includes('/article')).length || null,
    resources_page_present: pages.some((p) => p.includes('/resources')),
    news_page_present: pages.some((p) => p.includes('/news')),

    // Knowledge base
    docs_present: pages.some((p) => p.includes('/docs')),
    help_center_present: pages.some((p) => p.includes('/help')),
    knowledge_base_present: pages.some((p) => p.includes('/kb') || p.includes('/knowledge')),

    // Community signals
    forum_detected: pages.some((p) => p.includes('/forum')),
    slack_community_detected: pages.some((p) => p.includes('/slack')),
    discord_detected: pages.some((p) => p.includes('/discord')),
    github_detected: pages.some((p) => p.includes('/github')),
  };
}

// ─── Main Signal Extractor ────────────────────────────────────

/**
 * Extract all ~75 signals from crawl data
 * Signals that couldn't be measured return null (never 0)
 */
export function extractSignals(
  pages: PageData[],
  signals: SiteSignals,
  pagespeed: PageSpeedResult
): ScanSignals {
  // Create minimal CrawlResult for extraction
  const tempResult: CrawlResult = {
    pages,
    signals,
    pagespeed,
    scan_signals: {} as ScanSignals, // Placeholder, will be set below
    crawledAt: new Date().toISOString(),
    durationMs: 0,
  };

  const measurement = extractMeasurementSignals(tempResult);
  const search = extractSearchSignals(tempResult);
  const performance = extractPerformanceSignals(tempResult);
  const conversion = extractConversionSignals(tempResult);
  const execution = extractExecutionSignals(tempResult);

  // Count non-null signals
  const countNonNull = (obj: unknown): number => {
    if (typeof obj !== 'object' || obj === null) return 0;
    let count = 0;
    for (const v of Object.values(obj)) {
      if (v !== null && v !== undefined) {
        if (Array.isArray(v)) {
          count += v.length > 0 ? 1 : 0;
        } else {
          count += 1;
        }
      }
    }
    return count;
  };

  const totalSignals =
    countNonNull(measurement) +
    countNonNull(search) +
    countNonNull(performance) +
    countNonNull(conversion) +
    countNonNull(execution);

  // Theoretical maximum signals (rough estimate)
  // This would be calculated more precisely in a real system
  const maxPossibleSignals = 75;

  return {
    measurement,
    search,
    performance,
    conversion,
    execution,
    signal_count: totalSignals,
    confidence: Math.min(100, Math.round((totalSignals / maxPossibleSignals) * 100)),
    extracted_at: new Date().toISOString(),
  };
}

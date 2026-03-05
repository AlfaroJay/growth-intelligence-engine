// ============================================================
// AlphaCreative Growth Intelligence Engine – Shared Types
// AC-GIE-v1.0
// ============================================================

// ─── Intake Form ─────────────────────────────────────────────

export type ServiceOption =
  | 'SEO'
  | 'Paid Search (PPC)'
  | 'Paid Social'
  | 'Email Marketing'
  | 'Content Strategy'
  | 'Analytics & Tracking'
  | 'Website Optimization'
  | 'Full-Service Growth';

export type AdSpendOption =
  | 'Not currently spending on ads'
  | 'Under $1,000/month'
  | '$1,000 – $5,000/month'
  | '$5,000 – $10,000/month'
  | '$10,000+/month';

export type ImplementationTimelineOption =
  | 'Exploring (researching options)'
  | 'Next quarter'
  | 'Next 3–6 months'
  | 'Already actively implementing';

export type TrackingMaturity =
  | 'No tracking set up'
  | 'Google Analytics (basic)'
  | 'GA4 + some events'
  | 'GA4 + GTM + conversions configured'
  | 'Advanced: attribution, custom events, full funnel';

export type MarketingChannel =
  | 'SEO / Organic Search'
  | 'Google Ads (PPC)'
  | 'Facebook / Instagram Ads'
  | 'LinkedIn Ads'
  | 'Email Marketing'
  | 'Content / Blog'
  | 'Referral / Word of Mouth'
  | 'Other';

export type RoleOption =
  | 'Founder / CEO'
  | 'Marketing Director / VP'
  | 'Marketing Manager'
  | 'Agency Partner'
  | 'Other';

export interface IntakeFormData {
  // Step 1 – Contact
  name: string;
  email: string;
  company: string;
  website: string;
  role: RoleOption | '';
  // Step 2 – Goals
  services_selected: ServiceOption[];
  ad_spend: AdSpendOption | '';
  implementation_timeline: ImplementationTimelineOption | '';
  // Step 3 – Marketing maturity
  tracking_maturity: TrackingMaturity | '';
  marketing_channels: MarketingChannel[];
  // Honeypot (must be empty on valid submission)
  website_confirm?: string;
}

// ─── Database Row Types ───────────────────────────────────────

export interface IntakeSubmission {
  id: string;
  created_at: string;
  name: string;
  email: string;
  company: string;
  website: string;
  role: string | null;
  services_selected: string[];
  ad_spend: string;
  implementation_timeline: string;
  tracking_maturity: string;
  marketing_channels: string[];
  raw_payload: Record<string, unknown>;
}

export type AuditJobStatus = 'queued' | 'running' | 'complete' | 'failed';

export interface AuditJob {
  id: string;
  submission_id: string;
  domain: string;
  status: AuditJobStatus;
  started_at: string | null;
  finished_at: string | null;
  result: CrawlResult | null;
  score: GrowthScore | null;
  report_html: string | null;
  share_token: string;
  error_message: string | null;
}

export interface CrawledPage {
  id: number;
  job_id: string;
  url: string;
  status_code: number | null;
  title: string | null;
  meta_description: string | null;
  h1_present: boolean;
  canonical: string | null;
  word_count: number;
  internal_links: number;
  crawled_at: string;
}

// ─── Crawler ─────────────────────────────────────────────────

export interface PageData {
  url: string;
  statusCode: number;
  title: string;
  metaDescription: string;
  h1Present: boolean;
  canonical: string;
  wordCount: number;
  internalLinks: number;
}

export interface SiteSignals {
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasHttps: boolean;
  hasGA4: boolean;
  hasGTM: boolean;
  hasClearCTA: boolean;
  hasContactMethod: boolean;
  hasLandingPage: boolean;
  homepageUrl: string;
}

export interface PageSpeedResult {
  performance: number;   // 0–100
  accessibility: number; // 0–100
  bestPractices: number; // 0–100
  seo: number;           // 0–100
  fetchedOk: boolean;
}

export interface CrawlResult {
  pages: PageData[];
  signals: SiteSignals;
  pagespeed: PageSpeedResult;
  scan_signals: ScanSignals;
  crawledAt: string;
  durationMs: number;
}

// ─── Scoring Engine ──────────────────────────────────────────

export type GrowthTier = 'Foundation' | 'Acceleration' | 'Scale';

export interface Subscores {
  measurement_maturity: number; // 0–30
  search_opportunity: number;   // 0–25
  performance_ux: number;       // 0–20
  conversion_readiness: number; // 0–15
  execution_fit: number;        // 0–10
}

export interface ScoringDetail {
  label: string;
  points: number;
  earned: boolean;
  explanation: string;
}

// ─── Signal Extraction ──────────────────────────────────────

/**
 * Measurement Infrastructure Signals (≈25 points)
 * Analytics, tracking, event infrastructure, marketing automation
 */
export interface MeasurementSignals {
  // Analytics platforms
  ga4_detected: boolean | null;
  universal_analytics_detected: boolean | null;
  gtm_detected: boolean | null;
  matomo_detected: boolean | null;
  adobe_analytics_detected: boolean | null;
  segment_detected: boolean | null;
  rudderstack_detected: boolean | null;
  
  // Advertising pixels
  meta_pixel_detected: boolean | null;
  linkedin_pixel_detected: boolean | null;
  google_ads_tag_detected: boolean | null;
  tiktok_pixel_detected: boolean | null;
  pinterest_tag_detected: boolean | null;
  snap_pixel_detected: boolean | null;
  
  // Behavior analytics
  hotjar_detected: boolean | null;
  clarity_detected: boolean | null;
  crazyegg_detected: boolean | null;
  fullstory_detected: boolean | null;
  logrocket_detected: boolean | null;
  
  // Marketing automation
  hubspot_detected: boolean | null;
  marketo_detected: boolean | null;
  pardot_detected: boolean | null;
  activecampaign_detected: boolean | null;
  klaviyo_detected: boolean | null;
  mailchimp_detected: boolean | null;
  
  // Event infrastructure
  datalayer_detected: boolean | null;
  gtag_events_detected: boolean | null;
  custom_events_detected: boolean | null;
}

/**
 * Search Opportunity Signals (≈25 points)
 * SEO structural health: metadata, headers, indexation, linking, schema
 */
export interface SearchSignals {
  // Metadata (aggregated per page)
  pages_with_title: number | null;
  pages_with_meta_description: number | null;
  avg_title_length: number | null;
  avg_meta_description_length: number | null;
  
  // Header structure
  pages_with_h1: number | null;
  pages_with_multiple_h1: number | null;
  pages_with_h2_structure: number | null;
  pages_with_h3_structure: number | null;
  
  // Indexation
  sitemap_detected: boolean | null;
  robots_txt_detected: boolean | null;
  canonical_usage_ratio: number | null;
  noindex_pages_count: number | null;
  
  // Internal linking
  avg_internal_links_per_page: number | null;
  max_site_depth: number | null;
  orphan_pages_count: number | null;
  
  // Structured data
  schema_detected: boolean | null;
  schema_types: string[] | null;
  
  // Image SEO
  total_images: number | null;
  images_with_alt: number | null;
  alt_coverage_ratio: number | null;
}

/**
 * Performance & UX Signals (≈20 points)
 * PageSpeed Insights, mobile usability, accessibility, asset optimization
 */
export interface PerformanceSignals {
  // Core Web Vitals
  lcp_avg: number | null;  // ms
  cls_avg: number | null;  // score
  inp_avg: number | null;  // ms
  fcp_avg: number | null;  // ms
  ttfb_avg: number | null; // ms
  speed_index_avg: number | null; // ms
  
  // Lighthouse scores
  lighthouse_performance: number | null;
  lighthouse_accessibility: number | null;
  lighthouse_best_practices: number | null;
  lighthouse_seo: number | null;
  
  // Mobile usability
  viewport_meta_present: boolean | null;
  mobile_friendly: boolean | null;
  responsive_layout: boolean | null;
  
  // Asset optimization
  avg_image_size: number | null;  // bytes
  webp_usage_ratio: number | null;
  lazy_loading_detected: boolean | null;
  js_bundle_size: number | null;  // bytes
  css_bundle_size: number | null; // bytes
}

/**
 * Conversion Readiness Signals (≈20 points)
 * Lead capture, CTAs, sales infrastructure, ecommerce, trust signals
 */
export interface ConversionSignals {
  // Lead capture
  forms_detected: number | null;
  email_capture_present: boolean | null;
  newsletter_signup_present: boolean | null;
  multi_step_forms_detected: number | null;
  
  // CTAs
  cta_buttons_detected: number | null;
  cta_above_fold: boolean | null;
  cta_density: number | null;  // CTAs per 100 words
  
  // Sales infrastructure
  calendly_detected: boolean | null;
  cal_com_detected: boolean | null;
  hubspot_meetings_detected: boolean | null;
  other_booking_widget_detected: boolean | null;
  
  // Ecommerce
  shopify_detected: boolean | null;
  woocommerce_detected: boolean | null;
  stripe_detected: boolean | null;
  checkout_pages_detected: number | null;
  product_pages_detected: number | null;
  
  // Trust signals
  testimonials_present: boolean | null;
  case_studies_present: boolean | null;
  reviews_present: boolean | null;
  trust_badges_detected: number | null;
  client_logos_present: boolean | null;
}

/**
 * Execution Maturity Signals (≈10 points)
 * Team, pricing, content, knowledge base, community
 */
export interface ExecutionSignals {
  // Team infrastructure
  team_page_present: boolean | null;
  about_page_present: boolean | null;
  careers_page_present: boolean | null;
  jobs_page_present: boolean | null;
  
  // Pricing transparency
  pricing_page_present: boolean | null;
  pricing_tables_detected: number | null;
  
  // Content publishing
  blog_detected: boolean | null;
  blog_post_count: number | null;
  articles_detected: number | null;
  resources_page_present: boolean | null;
  news_page_present: boolean | null;
  
  // Knowledge base
  docs_present: boolean | null;
  help_center_present: boolean | null;
  knowledge_base_present: boolean | null;
  
  // Community signals
  forum_detected: boolean | null;
  slack_community_detected: boolean | null;
  discord_detected: boolean | null;
  github_detected: boolean | null;
}

/**
 * Complete signal collection for a crawl
 */
export interface ScanSignals {
  measurement: MeasurementSignals;
  search: SearchSignals;
  performance: PerformanceSignals;
  conversion: ConversionSignals;
  execution: ExecutionSignals;
  signal_count: number;  // Total non-null signals
  confidence: number;    // 0-100, % of attempted measurements that succeeded
  extracted_at: string;
}

export interface GrowthScore {
  model: string;           // 'AC-GIE-v1.0'
  total: number;           // 0–100
  subscores: Subscores;
  tier: GrowthTier;
  priority_actions: string[];
  details: Record<keyof Subscores, ScoringDetail[]>;
  scored_at: string;
}

// ─── Email / Report ──────────────────────────────────────────

export interface ReportEmailData {
  submission: IntakeSubmission;
  score: GrowthScore;
  reportUrl: string;
}

export interface AdminEmailData {
  submission: IntakeSubmission;
  score: GrowthScore;
  jobId: string;
  reportUrl: string;
}

// ─── Signal-Based Scoring (v2) ───────────────────────────────

export interface ScoreBreakdown {
  measurement_infrastructure: number;
  search_opportunity: number;
  performance_ux: number;
  conversion_readiness: number;
  execution_maturity: number;
}

export type OpportunitySeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Opportunity {
  type: string;
  severity: OpportunitySeverity;
  message: string;
  evidence: Record<string, unknown>;
}

export interface RevenueOpportunity {
  lost_traffic_range: { min: number; max: number };
  lost_leads_per_month: number;
  lost_revenue_range: { min: number; max: number };
  confidence: number;
}

export interface SignalBasedScore {
  domain: string;
  pages_analyzed: number;
  signals_detected: number;
  growth_score: number;
  breakdown: ScoreBreakdown;
  opportunities: Opportunity[];
  revenue_opportunity: RevenueOpportunity;
  confidence: number;
  scored_at: string;
}

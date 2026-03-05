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

export type BudgetOption =
  | 'Under $2,000/month'
  | '$2,000 – $5,000/month'
  | '$5,000 – $10,000/month'
  | '$10,000+/month';

export type TimelineOption =
  | 'ASAP (within 30 days)'
  | '1–3 months'
  | '3–6 months'
  | '6+ months';

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
  budget: BudgetOption | '';
  timeline: TimelineOption | '';
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
  budget: string;
  timeline: string;
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

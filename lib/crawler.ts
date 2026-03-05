/**
 * AlphaCreative Growth Intelligence Engine – Web Crawler
 * AC-GIE-v1.0
 *
 * Crawls up to MAX_PAGES internal pages of a domain, collects on-page signals,
 * and detects analytics tags. Also checks auxiliary signals (sitemap, robots.txt,
 * HTTPS) and optionally calls Google PageSpeed Insights.
 */

import * as cheerio from 'cheerio';
import type {
  PageData,
  SiteSignals,
  PageSpeedResult,
  CrawlResult,
} from '@/types';

// ─── Constants ────────────────────────────────────────────────

const MAX_PAGES = 25;
const PAGE_TIMEOUT_MS = 8_000;   // per-page fetch timeout
const TOTAL_TIMEOUT_MS = 55_000; // overall crawl budget (just under Vercel's 60s)
const USER_AGENT =
  'Mozilla/5.0 (compatible; AlphaCreativeGIE/1.0; +https://thealphacreative.com)';

// ─── Helpers ──────────────────────────────────────────────────

function normalizeUrl(href: string, base: string): string | null {
  try {
    const url = new URL(href, base);
    // Strip fragment and trailing slash
    url.hash = '';
    let normalized = url.toString();
    if (normalized.endsWith('/') && url.pathname !== '/') {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return null;
  }
}

function isSameOrigin(href: string, origin: string): boolean {
  try {
    return new URL(href).origin === origin;
  } catch {
    return false;
  }
}

function countWords(text: string): number {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter((w) => w.length > 0).length;
}

function extractInternalLinks($: cheerio.CheerioAPI, base: string): string[] {
  const origin = new URL(base).origin;
  const links: string[] = [];
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    const absolute = normalizeUrl(href, base);
    if (absolute && isSameOrigin(absolute, origin)) {
      links.push(absolute);
    }
  });
  return [...new Set(links)];
}

/**
 * Fetch a single page with timeout and return status + html.
 */
async function fetchPage(
  url: string
): Promise<{ statusCode: number; html: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PAGE_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html',
      },
      redirect: 'follow',
    });
    clearTimeout(timer);
    const html = await response.text();
    return { statusCode: response.status, html };
  } catch {
    clearTimeout(timer);
    return { statusCode: 0, html: '' };
  }
}

/**
 * Parse a single page's HTML into structured PageData.
 */
function parsePage(url: string, statusCode: number, html: string): PageData {
  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ?? '';
  const h1Present = $('h1').length > 0;
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() ?? '';
  const bodyText = $('body').text();
  const wordCount = countWords(bodyText);
  const internalLinks = extractInternalLinks($, url).length;

  return {
    url,
    statusCode,
    title,
    metaDescription,
    h1Present,
    canonical,
    wordCount,
    internalLinks,
  };
}

/**
 * Detect analytics tags in the raw HTML.
 */
function detectAnalyticsTags(html: string): {
  hasGA4: boolean;
  hasGTM: boolean;
} {
  const hasGA4 =
    /gtag\(['"]config['"],\s*['"]G-/i.test(html) ||
    /googletagmanager\.com\/gtag\/js\?id=G-/i.test(html);

  const hasGTM =
    /googletagmanager\.com\/gtm\.js/i.test(html) ||
    /GTM-[A-Z0-9]+/i.test(html);

  return { hasGA4, hasGTM };
}

/**
 * Detect whether the homepage has a clear CTA and a contact method.
 */
function detectConversionSignals(html: string): {
  hasClearCTA: boolean;
  hasContactMethod: boolean;
} {
  const ctaPatterns =
    /\b(get started|book a call|schedule|contact us|request a quote|free consultation|let['']s talk|start now|get in touch|work with us)\b/i;
  const contactPatterns = /tel:|mailto:|\/contact|#contact|contact us/i;

  return {
    hasClearCTA: ctaPatterns.test(html),
    hasContactMethod: contactPatterns.test(html),
  };
}

/**
 * Check for sitemap.xml and robots.txt.
 */
async function checkAuxiliaryFiles(origin: string): Promise<{
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
}> {
  const [sitemapRes, robotsRes] = await Promise.allSettled([
    fetch(`${origin}/sitemap.xml`, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5_000),
    }),
    fetch(`${origin}/robots.txt`, {
      method: 'HEAD',
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(5_000),
    }),
  ]);

  const hasSitemap =
    sitemapRes.status === 'fulfilled' &&
    sitemapRes.value.ok;

  const hasRobotsTxt =
    robotsRes.status === 'fulfilled' &&
    robotsRes.value.ok;

  return { hasSitemap, hasRobotsTxt };
}

/**
 * Check for landing pages in the crawled URL set.
 */
function detectLandingPages(urls: string[]): boolean {
  const lpPattern = /\/(lp|landing|offer|promo|campaign|start|get)\b/i;
  return urls.some((url) => lpPattern.test(url));
}

// ─── PageSpeed Insights ───────────────────────────────────────

/**
 * Call Google PageSpeed Insights API (mobile strategy).
 * Returns scores in the 0–100 range.
 */
export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    console.warn('[PageSpeed] No API key set – skipping PageSpeed audit.');
    return {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      fetchedOk: false,
    };
  }

  try {
    const endpoint = new URL(
      'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    );
    endpoint.searchParams.set('url', url);
    endpoint.searchParams.set('key', apiKey);
    endpoint.searchParams.set('strategy', 'mobile');

    const response = await fetch(endpoint.toString(), {
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error('[PageSpeed] API error:', response.status);
      return {
        performance: 0,
        accessibility: 0,
        bestPractices: 0,
        seo: 0,
        fetchedOk: false,
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    const cats = data?.lighthouseResult?.categories ?? {};

    const score = (key: string): number =>
      Math.round((cats[key]?.score ?? 0) * 100);

    return {
      performance: score('performance'),
      accessibility: score('accessibility'),
      bestPractices: score('best-practices'),
      seo: score('seo'),
      fetchedOk: true,
    };
  } catch (err) {
    console.error('[PageSpeed] Fetch failed:', err);
    return {
      performance: 0,
      accessibility: 0,
      bestPractices: 0,
      seo: 0,
      fetchedOk: false,
    };
  }
}

// ─── Main Crawler ─────────────────────────────────────────────

/**
 * Crawl a website and return structured audit data.
 *
 * @param websiteUrl - The homepage URL to start crawling from.
 */
export async function crawlWebsite(websiteUrl: string): Promise<CrawlResult> {
  const startTime = Date.now();

  // Normalise the starting URL
  let origin: string;
  let homepageUrl: string;
  try {
    const parsed = new URL(websiteUrl);
    origin = parsed.origin;
    homepageUrl = parsed.href;
  } catch {
    throw new Error(`Invalid website URL: ${websiteUrl}`);
  }

  const hasHttps = origin.startsWith('https://');

  // BFS crawl queue
  const queue: string[] = [homepageUrl];
  const visited = new Set<string>();
  const pages: PageData[] = [];

  // Keep the homepage HTML for signal detection
  let homepageHtml = '';
  let homepageAnalyzed = false;
  let hasClearCTA = false;
  let hasContactMethod = false;
  let hasGA4 = false;
  let hasGTM = false;

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    // Respect overall timeout
    if (Date.now() - startTime > TOTAL_TIMEOUT_MS) {
      console.warn('[Crawler] Total timeout reached – stopping early.');
      break;
    }

    const url = queue.shift()!;
    if (visited.has(url)) continue;
    visited.add(url);

    const { statusCode, html } = await fetchPage(url);

    // Skip non-HTML or failed pages (but still record them)
    if (statusCode === 0 && html === '') {
      pages.push({
        url,
        statusCode: 0,
        title: '',
        metaDescription: '',
        h1Present: false,
        canonical: '',
        wordCount: 0,
        internalLinks: 0,
      });
      continue;
    }

    const pageData = parsePage(url, statusCode, html);
    pages.push(pageData);

    // First successfully fetched page = homepage
    if (!homepageAnalyzed && html) {
      homepageHtml = html;
      homepageAnalyzed = true;

      const analytics = detectAnalyticsTags(html);
      hasGA4 = analytics.hasGA4;
      hasGTM = analytics.hasGTM;

      const conversion = detectConversionSignals(html);
      hasClearCTA = conversion.hasClearCTA;
      hasContactMethod = conversion.hasContactMethod;
    }

    // Discover more internal links (only follow 200-range pages)
    if (statusCode >= 200 && statusCode < 300 && pages.length < MAX_PAGES) {
      const $ = cheerio.load(html);
      const newLinks = extractInternalLinks($, url);
      for (const link of newLinks) {
        if (!visited.has(link) && !queue.includes(link)) {
          // Skip common non-content paths
          if (/\.(pdf|jpg|jpeg|png|gif|svg|webp|css|js|ico|xml|json|txt|zip)$/i.test(link)) continue;
          if (/\/(wp-admin|wp-login|admin|login|logout|cart|checkout|account)\b/i.test(link)) continue;
          queue.push(link);
        }
      }
    }
  }

  // Auxiliary checks (parallel)
  const [aux] = await Promise.allSettled([checkAuxiliaryFiles(origin)]);
  const { hasSitemap, hasRobotsTxt } =
    aux.status === 'fulfilled' ? aux.value : { hasSitemap: false, hasRobotsTxt: false };

  // PageSpeed (can run in parallel with crawl in production)
  const pagespeed = await fetchPageSpeed(homepageUrl);

  const allCrawledUrls = pages.map((p) => p.url);
  const hasLandingPage = detectLandingPages(allCrawledUrls);

  const signals: SiteSignals = {
    hasSitemap,
    hasRobotsTxt,
    hasHttps,
    hasGA4,
    hasGTM,
    hasClearCTA,
    hasContactMethod,
    hasLandingPage,
    homepageUrl,
  };

  return {
    pages,
    signals,
    pagespeed,
    crawledAt: new Date().toISOString(),
    durationMs: Date.now() - startTime,
  };
}

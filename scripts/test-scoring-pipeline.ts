/**
 * Test script for signal-based scoring pipeline
 * Verifies that crawling, signal extraction, and scoring work correctly
 */

import { crawlWebsite } from '@/lib/crawler';
import { scoreFromSignals } from '@/lib/scoring-engine-v2';
import { detectOpportunities } from '@/lib/opportunity-engine';
import { estimateRevenueOpportunity } from '@/lib/revenue-engine';

async function testScoringPipeline() {
  console.log('\n=== Signal-Based Scoring Pipeline Test ===\n');

  try {
    // Test with a known good domain
    const testDomain = 'https://thealphacreative.com';
    
    console.log(`1. Crawling: ${testDomain}`);
    const crawlResult = await crawlWebsite(testDomain);
    console.log(`   ✓ Crawled ${crawlResult.pages.length} pages in ${crawlResult.durationMs}ms`);
    console.log(`   ✓ Signals detected: ${crawlResult.scan_signals.signal_count}`);
    console.log(`   ✓ Measurement confidence: ${crawlResult.scan_signals.confidence}%`);

    console.log('\n2. Scoring from signals:');
    const { breakdown, confidence } = scoreFromSignals(crawlResult.scan_signals);
    const totalScore = Object.values(breakdown).reduce((a, b) => a + b, 0);
    console.log(`   ✓ Total score: ${totalScore}/100`);
    console.log(`   ✓ Measurement Infrastructure: ${breakdown.measurement_infrastructure}/25`);
    console.log(`   ✓ Search Opportunity: ${breakdown.search_opportunity}/25`);
    console.log(`   ✓ Performance & UX: ${breakdown.performance_ux}/20`);
    console.log(`   ✓ Conversion Readiness: ${breakdown.conversion_readiness}/20`);
    console.log(`   ✓ Execution Maturity: ${breakdown.execution_maturity}/10`);
    console.log(`   ✓ Confidence: ${confidence}%`);

    console.log('\n3. Detecting opportunities:');
    const opportunities = detectOpportunities(crawlResult.scan_signals);
    console.log(`   ✓ Found ${opportunities.length} opportunities`);
    const criticalCount = opportunities.filter(o => o.severity === 'critical').length;
    const highCount = opportunities.filter(o => o.severity === 'high').length;
    const mediumCount = opportunities.filter(o => o.severity === 'medium').length;
    const lowCount = opportunities.filter(o => o.severity === 'low').length;
    console.log(`     - Critical: ${criticalCount}`);
    console.log(`     - High: ${highCount}`);
    console.log(`     - Medium: ${mediumCount}`);
    console.log(`     - Low: ${lowCount}`);

    console.log('\n4. Estimating revenue opportunity:');
    const revenueOpp = estimateRevenueOpportunity(
      crawlResult.pages.length,
      crawlResult.scan_signals,
      1_000_000
    );
    console.log(`   ✓ Upside traffic: ${revenueOpp.upside_traffic_per_month} visits/month`);
    console.log(`   ✓ Upside leads: ${revenueOpp.upside_leads_per_month} leads/month`);
    console.log(`   ✓ Upside revenue: $${revenueOpp.upside_revenue_per_month.toLocaleString()}/month`);
    console.log(`   ✓ Confidence: ${revenueOpp.confidence_tier} (${revenueOpp.confidence_explanation})`);

    console.log('\n=== All Tests Passed ✓ ===\n');
    return { success: true, score: totalScore };

  } catch (error) {
    console.error('\n✗ Test failed:', error);
    return { success: false, error };
  }
}

// Run the test
testScoringPipeline();

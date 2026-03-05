'use client';

import { useEffect, useState, use } from 'react';
import type { GrowthScore } from '@/types';

// ─── Types ─────────────────────────────────────────────────────

interface ReportData {
  id: string;
  status: string;
  domain: string;
  share_token: string;
  score: GrowthScore | null;
  report_html: string | null;
  finished_at: string | null;
  intake_submissions: {
    name: string;
    company: string;
    website: string;
  };
}

// ─── Polling hook ─────────────────────────────────────────────

function useReportPolling(token: string) {
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const fetchReport = async () => {
      try {
        const res = await fetch(`/api/report/${token}`);
        if (!res.ok) {
          const d = await res.json();
          setError(d.error ?? 'Report not found.');
          setLoading(false);
          return;
        }
        const d: ReportData = await res.json();
        setData(d);

        // Stop polling once complete or failed
        if (d.status === 'complete' || d.status === 'failed') {
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        setError('Failed to load report.');
        setLoading(false);
      }
    };

    fetchReport();
    // Poll every 5 seconds while audit is running
    interval = setInterval(fetchReport, 5_000);

    return () => clearInterval(interval);
  }, [token]);

  return { data, error, loading };
}

// ─── Score badge ──────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const color =
    score >= 70 ? 'text-green-600' : score >= 45 ? 'text-amber-600' : 'text-red-600';
  const bg =
    score >= 70 ? 'bg-green-50 border-green-200' : score >= 45 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
  const tierColor =
    score >= 70 ? 'bg-green-600' : score >= 45 ? 'bg-amber-600' : 'bg-red-600';

  return (
    <div className={`inline-flex flex-col items-center justify-center rounded-2xl border-2 px-8 py-6 ${bg}`}>
      <div className={`text-6xl font-extrabold leading-none ${color}`}>{score}</div>
      <div className="text-gray-500 text-sm mt-1">out of 100</div>
      <div className={`${tierColor} text-white text-xs font-bold px-3 py-1 rounded-full mt-3`}>
        {tier} Tier
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, error, loading } = useReportPolling(token);

  // ── Error ───────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Report not found</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <a href="/growth-score" className="text-brand-600 hover:underline text-sm">
            ← Get your own Growth Score
          </a>
        </div>
      </div>
    );
  }

  // ── Loading / queued / running ──────────────────────────────
  if (loading || !data || data.status === 'queued' || data.status === 'running') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="w-16 h-16 rounded-full border-4 border-brand-100" />
            <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">Generating your Growth Score…</h2>
          <p className="text-gray-500 text-sm">
            {data?.status === 'running'
              ? 'Crawling your website and running the audit. Usually takes 30–60 seconds.'
              : 'Your audit is queued. This should start in a few seconds.'}
          </p>
          {data && (
            <div className="mt-4 text-xs text-gray-400">Auditing: {data.domain}</div>
          )}
        </div>
      </div>
    );
  }

  // ── Failed ──────────────────────────────────────────────────
  if (data.status === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-gray-800 mb-2">Audit encountered an error</h1>
          <p className="text-gray-500 mb-6">
            We weren&apos;t able to complete the audit for <strong>{data.domain}</strong>.
            This can happen if the site is unreachable or blocks automated access.
            We&apos;ll reach out via email to discuss results manually.
          </p>
          <a href="/growth-score" className="text-brand-600 hover:underline text-sm">
            ← Try again
          </a>
        </div>
      </div>
    );
  }

  // ── Complete: render report ─────────────────────────────────
  const score = data.score!;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="https://thealphacreative.com" className="text-sm font-bold text-brand-700 hover:text-brand-900">
            AlphaCreative
          </a>
          <a
            href="https://alphacreative.as.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            Book Strategy Call
          </a>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="text-xs text-gray-400 uppercase tracking-widest mb-2">Growth Intelligence Report</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">
            {data.intake_submissions.company}
          </h1>
          <div className="text-sm text-gray-500">{data.domain}</div>
        </div>

        {/* Score hero */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-8">
          <ScoreBadge score={score.total} tier={score.tier} />
          <div className="flex-1 space-y-3 w-full">
            <h2 className="font-bold text-gray-900 text-lg">Score Breakdown</h2>
            {[
              { label: '📊 Measurement Maturity', val: score.subscores.measurement_maturity, max: 30 },
              { label: '🔍 Search Opportunity',   val: score.subscores.search_opportunity,   max: 25 },
              { label: '⚡ Performance & UX',     val: score.subscores.performance_ux,       max: 20 },
              { label: '🎯 Conversion Readiness', val: score.subscores.conversion_readiness, max: 15 },
              { label: '🚀 Execution Fit',        val: score.subscores.execution_fit,        max: 10 },
            ].map(({ label, val, max }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{label}</span>
                  <span className="font-semibold text-gray-900">
                    {Math.round(val)}/{max}
                  </span>
                </div>
                <ProgressBar value={Math.round(val)} max={max} />
              </div>
            ))}
          </div>
        </div>

        {/* Priority actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="font-bold text-gray-900 text-lg mb-4">🎯 Priority Actions</h2>
          <p className="text-sm text-gray-500 mb-4">
            Ranked by impact. Addressing these in order maximises your growth potential.
          </p>
          <div className="space-y-3">
            {score.priority_actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-gray-50 rounded-lg px-4 py-3"
              >
                <div className="bg-brand-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="text-sm text-gray-700">{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full HTML report */}
        {data.report_html && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div
              className="p-2"
              dangerouslySetInnerHTML={{ __html: data.report_html }}
            />
          </div>
        )}

        {/* CTA */}
        <div className="bg-gradient-to-br from-brand-700 to-brand-900 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">
            Ready to turn this into a growth plan?
          </h2>
          <p className="text-brand-200 text-sm mb-6 max-w-md mx-auto">
            Book a 30-minute strategy call. We&apos;ll walk through your score, prioritise
            your highest-leverage opportunities, and outline what a partnership looks like.
          </p>
          <a
            href="https://alphacreative.as.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-brand-700 font-bold px-8 py-3 rounded-xl hover:bg-brand-50 transition"
          >
            Book Your Strategy Call →
          </a>
        </div>

      </main>
    </div>
  );
}

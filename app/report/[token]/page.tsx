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

// ─── Brand constants ────────────────────────────────────────────
const NAVY      = '#001D3D';
const DEEP_NAVY = '#000F1F';
const GOLD      = '#FCBA12';
const NUNITO    = '"Nunito", "Inter", system-ui, sans-serif';

// ─── AlphaCreative Logo ─────────────────────────────────────────

function AlphaLogo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isLight = variant === 'light';
  return (
    <div className="flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{
          background: isLight ? GOLD : NAVY,
          boxShadow: isLight ? `0 0 20px rgba(252,186,18,0.35)` : `0 2px 8px rgba(0,29,61,0.25)`,
        }}
      >
        <span
          style={{
            fontFamily: NUNITO,
            fontSize: '15px',
            lineHeight: 1,
            color: isLight ? NAVY : GOLD,
            fontWeight: 900,
            letterSpacing: '-0.03em',
          }}
        >
          aC
        </span>
      </div>
      <div className="flex flex-col leading-none" style={{ fontFamily: NUNITO }}>
        <span
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: isLight ? GOLD : NAVY,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          alpha
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: isLight ? '#ffffff' : NAVY,
            letterSpacing: '0.12em',
            lineHeight: 1.2,
          }}
        >
          CREATIVE
        </span>
      </div>
    </div>
  );
}

// ─── Polling hook ───────────────────────────────────────────────

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
    interval = setInterval(fetchReport, 5_000);
    return () => clearInterval(interval);
  }, [token]);

  return { data, error, loading };
}

// ─── Score badge ────────────────────────────────────────────────

function ScoreBadge({ score, tier }: { score: number; tier: string }) {
  const isScale        = score >= 70;
  const isAcceleration = score >= 45 && score < 70;

  const colors = isScale
    ? { ring: '#16a34a', bg: '#f0fdf4', text: '#15803d', pill: '#16a34a' }
    : isAcceleration
    ? { ring: '#d97706', bg: '#fffbeb', text: '#b45309', pill: '#d97706' }
    : { ring: '#dc2626', bg: '#fef2f2', text: '#b91c1c', pill: '#dc2626' };

  return (
    <div
      className="inline-flex flex-col items-center justify-center rounded-2xl px-10 py-7"
      style={{
        background: colors.bg,
        border: `2px solid ${colors.ring}33`,
        boxShadow: `0 0 0 8px ${colors.ring}0d`,
      }}
    >
      <div
        className="text-6xl font-extrabold leading-none tabular-nums"
        style={{ color: colors.text, fontFamily: NUNITO }}
      >
        {score}
      </div>
      <div className="text-gray-400 text-xs mt-1 font-medium uppercase tracking-wider">out of 100</div>
      <div
        className="text-white text-xs font-bold px-3 py-1.5 rounded-full mt-3"
        style={{ background: colors.pill }}
      >
        {tier} Tier
      </div>
    </div>
  );
}

// ─── Progress bar ───────────────────────────────────────────────

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
      <div
        className="h-2 rounded-full transition-all"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

// ─── Spinner ────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="relative w-16 h-16 mx-auto mb-6">
      <div className="w-16 h-16 rounded-full border-4 border-gray-100" />
      <div
        className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: `${NAVY} transparent transparent transparent` }}
      />
    </div>
  );
}

// ─── Shared shell with branded nav ─────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <a href="https://thealphacreative.com">
            <AlphaLogo variant="dark" />
          </a>
          <a
            href="https://alphacreative.as.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-bold px-4 py-2 rounded-xl transition hover:opacity-90 shadow-sm"
            style={{ background: GOLD, color: NAVY, fontFamily: NUNITO }}
          >
            Book Strategy Call
          </a>
        </div>
      </nav>
      {children}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────

export default function ReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const { data, error, loading } = useReportPolling(token);

  // ── Error ────────────────────────────────────────────────────
  if (error) {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24 px-4">
          <div className="text-center">
            <div className="text-5xl mb-4">😕</div>
            <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Report not found</h1>
            <p className="text-gray-500 mb-6 text-sm">{error}</p>
            <a href="/growth-score" className="text-sm font-semibold hover:underline" style={{ color: NAVY }}>
              ← Get your own Growth Score
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Loading / queued / running ───────────────────────────────
  if (loading || !data || data.status === 'queued' || data.status === 'running') {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-sm">
            <Spinner />
            <h2
              className="text-lg font-extrabold mb-2"
              style={{ fontFamily: NUNITO, color: NAVY }}
            >
              Generating your Growth Score…
            </h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              {data?.status === 'running'
                ? 'Crawling your website and running the audit. Usually takes 30–60 seconds.'
                : 'Your audit is queued. This should start in a few seconds.'}
            </p>
            {data && (
              <div
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(252,186,18,0.1)', color: '#a07800' }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                  style={{ background: GOLD }}
                />
                Auditing: {data.domain}
              </div>
            )}
          </div>
        </div>
      </Shell>
    );
  }

  // ── Failed ───────────────────────────────────────────────────
  if (data.status === 'failed') {
    return (
      <Shell>
        <div className="flex items-center justify-center py-24 px-4">
          <div className="text-center max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold mb-2" style={{ color: NAVY }}>Audit encountered an error</h1>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              We weren&apos;t able to complete the audit for{' '}
              <strong style={{ color: NAVY }}>{data.domain}</strong>.
              This can happen if the site is unreachable or blocks automated access.
              We&apos;ll reach out via email to discuss results manually.
            </p>
            <a
              href="/growth-score"
              className="text-sm font-semibold hover:underline"
              style={{ color: NAVY }}
            >
              ← Try again
            </a>
          </div>
        </div>
      </Shell>
    );
  }

  // ── Complete: render report ──────────────────────────────────
  const score = data.score!;

  return (
    <Shell>
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">

        {/* Header */}
        <div className="text-center">
          <div
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: 'rgba(252,186,18,0.12)', color: '#a07800' }}
          >
            Growth Intelligence Report
          </div>
          <h1
            className="text-2xl font-extrabold mb-1"
            style={{ fontFamily: NUNITO, color: NAVY, letterSpacing: '-0.025em' }}
          >
            {data.intake_submissions.company}
          </h1>
          <div className="text-sm text-gray-400 font-medium">{data.domain}</div>
        </div>

        {/* Score hero card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col sm:flex-row items-center gap-8">
          <ScoreBadge score={score.total} tier={score.tier} />
          <div className="flex-1 space-y-3 w-full">
            <h2
              className="font-extrabold text-lg"
              style={{ fontFamily: NUNITO, color: NAVY }}
            >
              Score Breakdown
            </h2>
            {[
              { label: '📊 Measurement Maturity', val: score.subscores.measurement_maturity, max: 30 },
              { label: '🔍 Search Opportunity',   val: score.subscores.search_opportunity,   max: 25 },
              { label: '⚡ Performance & UX',     val: score.subscores.performance_ux,       max: 20 },
              { label: '🎯 Conversion Readiness', val: score.subscores.conversion_readiness, max: 15 },
              { label: '🚀 Execution Fit',        val: score.subscores.execution_fit,        max: 10 },
            ].map(({ label, val, max }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 font-medium">{label}</span>
                  <span className="font-bold tabular-nums" style={{ color: NAVY }}>
                    {Math.round(val)}<span className="text-gray-400 font-medium">/{max}</span>
                  </span>
                </div>
                <ProgressBar value={Math.round(val)} max={max} />
              </div>
            ))}
          </div>
        </div>

        {/* Priority actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2
            className="font-extrabold text-lg mb-1"
            style={{ fontFamily: NUNITO, color: NAVY }}
          >
            🎯 Priority Actions
          </h2>
          <p className="text-sm text-gray-400 mb-5 font-medium">
            Ranked by impact. Addressing these in order maximises your growth potential.
          </p>
          <div className="space-y-3">
            {score.priority_actions.map((action, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-xl px-4 py-3 border transition-colors"
                style={{ background: '#faf8f3', borderColor: '#f0ece0' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = 'rgba(252,186,18,0.08)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(252,186,18,0.25)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background = '#faf8f3';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#f0ece0';
                }}
              >
                <div
                  className="text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: NAVY, color: GOLD }}
                >
                  {i + 1}
                </div>
                <div className="text-sm font-medium leading-snug" style={{ color: '#374151' }}>{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Full HTML report */}
        {data.report_html && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-2" dangerouslySetInnerHTML={{ __html: data.report_html }} />
          </div>
        )}

        {/* CTA — Navy + Gold */}
        <div
          className="rounded-2xl p-10 text-center relative overflow-hidden"
          style={{ background: DEEP_NAVY }}
        >
          {/* Gold orb */}
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(252,186,18,0.15) 0%, transparent 70%)',
              transform: 'translate(30%, -30%)',
            }}
          />
          <div className="relative z-10">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
              style={{
                background: 'rgba(252,186,18,0.12)',
                border: '1px solid rgba(252,186,18,0.3)',
                color: GOLD,
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Free 30-minute call · No obligation
            </div>
            <h2
              className="text-2xl font-extrabold text-white mb-3"
              style={{ fontFamily: NUNITO, letterSpacing: '-0.025em' }}
            >
              Ready to turn this into a growth plan?
            </h2>
            <p className="text-sm mb-8 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Book a 30-minute strategy call. We&apos;ll walk through your score, prioritise
              your highest-leverage opportunities, and outline what a partnership looks like.
            </p>
            <a
              href="https://alphacreative.as.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block font-bold px-8 py-3 rounded-xl hover:opacity-90 transition shadow-lg"
              style={{ background: GOLD, color: NAVY, fontFamily: NUNITO }}
            >
              Book Your Strategy Call →
            </a>
          </div>
        </div>

      </main>
    </Shell>
  );
}

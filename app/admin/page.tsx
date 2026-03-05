'use client';

import { useState, useEffect, useCallback } from 'react';
import type { GrowthScore } from '@/types';

// ─── Types ─────────────────────────────────────────────────────

interface AdminJob {
  job_id: string;
  created_at: string;
  domain: string;
  status: string;
  finished_at: string | null;
  share_token: string;
  score: GrowthScore | null;
  error_message: string | null;
  name: string;
  email: string;
  company: string;
  website: string;
  services_selected: string[];
  budget: string;
  timeline: string;
  tracking_maturity: string;
  marketing_channels: string[];
  role: string | null;
}

// ─── Status badge ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    queued:   'bg-gray-100 text-gray-600',
    running:  'bg-blue-100 text-blue-700',
    complete: 'bg-green-100 text-green-700',
    failed:   'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config[status] ?? 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

// ─── Tier badge ───────────────────────────────────────────────

function TierBadge({ tier }: { tier: string }) {
  const config: Record<string, string> = {
    Foundation:   'bg-red-100 text-red-700',
    Acceleration: 'bg-amber-100 text-amber-700',
    Scale:        'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config[tier] ?? 'bg-gray-100'}`}>
      {tier}
    </span>
  );
}

// ─── Job detail panel ─────────────────────────────────────────

function JobDetail({
  job,
  password,
  onClose,
}: {
  job: AdminJob;
  password: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<{ job: AdminJob; pages: unknown[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/jobs/${job.job_id}`, {
      headers: { 'x-admin-password': password },
    })
      .then((r) => r.json())
      .then((d) => {
        setDetail(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [job.job_id, password]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-bold text-gray-900">{job.company}</div>
            <div className="text-sm text-gray-500">{job.domain}</div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading details…</div>
          ) : (
            <>
              {/* Contact */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Info</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  {[
                    ['Name', job.name],
                    ['Email', job.email],
                    ['Company', job.company],
                    ['Role', job.role ?? '—'],
                    ['Budget', job.budget],
                    ['Timeline', job.timeline],
                    ['Tracking', job.tracking_maturity],
                    ['Services', job.services_selected.join(', ')],
                  ].map(([k, v]) => (
                    <div key={k} className="flex flex-col">
                      <dt className="text-gray-400 text-xs">{k}</dt>
                      <dd className="text-gray-800 font-medium">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Score */}
              {job.score && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Score Summary</h3>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="text-4xl font-extrabold text-brand-600">
                      {job.score.total}
                      <span className="text-lg text-gray-400">/100</span>
                    </div>
                    <TierBadge tier={job.score.tier} />
                  </div>
                  <div className="space-y-1 text-sm">
                    {Object.entries(job.score.subscores).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{Math.round(v as number)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crawled pages summary */}
              {detail?.pages && (detail.pages as unknown[]).length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Crawled Pages ({(detail.pages as unknown[]).length})
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          {['URL', 'Status', 'Title', 'H1', 'Words'].map((h) => (
                            <th key={h} className="text-left text-gray-500 font-medium px-3 py-2 border-b border-gray-100">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(detail.pages as Record<string, unknown>[]).slice(0, 25).map((p, i) => (
                          <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="px-3 py-2 max-w-xs truncate text-brand-600">
                              <a href={p.url as string} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                {(p.url as string).replace(/^https?:\/\/[^/]+/, '')}
                              </a>
                            </td>
                            <td className="px-3 py-2">
                              <span className={`font-mono ${(p.status_code as number) === 200 ? 'text-green-600' : 'text-red-500'}`}>
                                {p.status_code as number}
                              </span>
                            </td>
                            <td className="px-3 py-2 max-w-xs truncate text-gray-700">
                              {(p.title as string) ?? '—'}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {(p.h1_present as boolean) ? '✅' : '❌'}
                            </td>
                            <td className="px-3 py-2 text-gray-500">
                              {p.word_count as number}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Quick links */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`/report/${job.share_token}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-brand-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-700 transition"
                >
                  View Report →
                </a>
                <a
                  href={`mailto:${job.email}`}
                  className="bg-gray-100 text-gray-700 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                >
                  Email {job.name.split(' ')[0]}
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Admin page ───────────────────────────────────────────────

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState('');
  const [jobs, setJobs] = useState<AdminJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<AdminJob | null>(null);
  const [search, setSearch] = useState('');

  const fetchJobs = useCallback(async (pw: string) => {
    setLoading(true);
    const res = await fetch('/api/admin/jobs', {
      headers: { 'x-admin-password': pw },
    });
    if (res.status === 401) {
      setAuthError('Incorrect password.');
      setAuthed(false);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setAuthed(true);
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    fetchJobs(password);
  };

  // ── Login screen ───────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
          <div className="text-center mb-6">
            <div className="text-2xl mb-2">🔐</div>
            <h1 className="text-xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500 text-sm">AlphaCreative GIE</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            {authError && (
              <p className="text-red-600 text-sm">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────
  const filtered = jobs.filter(
    (j) =>
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.email.toLowerCase().includes(search.toLowerCase()) ||
      j.domain.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: jobs.length,
    complete: jobs.filter((j) => j.status === 'complete').length,
    running: jobs.filter((j) => j.status === 'running' || j.status === 'queued').length,
    avgScore:
      jobs.filter((j) => j.score).length > 0
        ? Math.round(
            jobs
              .filter((j) => j.score)
              .reduce((a, j) => a + (j.score?.total ?? 0), 0) /
              jobs.filter((j) => j.score).length
          )
        : null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">AlphaCreative</div>
            <h1 className="text-xl font-bold">Growth Intelligence Admin</h1>
          </div>
          <button
            onClick={() => { setAuthed(false); setJobs([]); }}
            className="text-gray-400 hover:text-white text-sm"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Audits', value: stats.total },
            { label: 'Completed', value: stats.complete },
            { label: 'In Progress', value: stats.running },
            { label: 'Avg Score', value: stats.avgScore !== null ? `${stats.avgScore}/100` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="text-2xl font-extrabold text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Jobs table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
            <h2 className="font-bold text-gray-900">Audit Jobs</h2>
            <div className="flex items-center gap-3">
              <input
                type="search"
                placeholder="Search company, email, domain…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
              />
              <button
                onClick={() => fetchJobs(password)}
                className="text-sm text-brand-600 hover:text-brand-800 font-medium"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">No audits found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Date', 'Company', 'Domain', 'Status', 'Score', 'Tier', 'Budget', ''].map((h) => (
                      <th key={h} className="text-left text-xs text-gray-500 font-semibold px-4 py-3 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((job) => (
                    <tr
                      key={job.job_id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setSelectedJob(job)}
                    >
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(job.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{job.company}</td>
                      <td className="px-4 py-3 text-gray-500">{job.domain}</td>
                      <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                      <td className="px-4 py-3 font-bold text-brand-600">
                        {job.score ? `${job.score.total}/100` : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {job.score ? <TierBadge tier={job.score.tier} /> : '—'}
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{job.budget}</td>
                      <td className="px-4 py-3">
                        <button className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                          View →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail panel */}
      {selectedJob && (
        <JobDetail
          job={selectedJob}
          password={password}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}

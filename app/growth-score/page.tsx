'use client';

import { useState, useEffect, FormEvent } from 'react';

// ─── Constants ─────────────────────────────────────────────────

const SERVICES = [
  'SEO',
  'Paid Search (PPC)',
  'Paid Social',
  'Email Marketing',
  'Content Strategy',
  'Analytics & Tracking',
  'Website Optimization',
  'Full-Service Growth',
];

const BUDGETS = [
  'Under $2,000/month',
  '$2,000 – $5,000/month',
  '$5,000 – $10,000/month',
  '$10,000+/month',
];

const TIMELINES = [
  'ASAP (within 30 days)',
  '1–3 months',
  '3–6 months',
  '6+ months',
];

const TRACKING_OPTIONS = [
  'No tracking set up',
  'Google Analytics (basic)',
  'GA4 + some events',
  'GA4 + GTM + conversions configured',
  'Advanced: attribution, custom events, full funnel',
];

const CHANNELS = [
  'SEO / Organic Search',
  'Google Ads (PPC)',
  'Facebook / Instagram Ads',
  'LinkedIn Ads',
  'Email Marketing',
  'Content / Blog',
  'Referral / Word of Mouth',
  'Other',
];

const ROLES = [
  'Founder / CEO',
  'Marketing Director / VP',
  'Marketing Manager',
  'Agency Partner',
  'Other',
];

// ─── Step indicator ───────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              i + 1 < current
                ? 'bg-brand-600 text-white'
                : i + 1 === current
                ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1 < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`h-0.5 w-12 transition-all ${
                i + 1 < current ? 'bg-brand-600' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Form field components ────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition placeholder:text-gray-400';

const selectClass = inputClass + ' bg-white';

function MultiSelect({
  options,
  value,
  onChange,
  cols = 2,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  cols?: number;
}) {
  const toggle = (opt: string) => {
    onChange(
      value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]
    );
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${cols} gap-2`}>
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => toggle(opt)}
          className={`text-left text-sm px-3.5 py-2.5 rounded-lg border transition-all ${
            value.includes(opt)
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`text-left text-sm px-3.5 py-2.5 rounded-lg border transition-all ${
            value === opt
              ? 'bg-brand-600 text-white border-brand-600'
              : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── Success screen ───────────────────────────────────────────

function SuccessScreen({ shareToken }: { shareToken: string }) {
  const [secondsLeft, setSecondsLeft] = useState(5);

  // Auto-close window after 5 seconds
  useEffect(() => {
    if (secondsLeft <= 0) {
      window.close();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-6">✅</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">
        Your Growth Score is being generated!
      </h2>
      <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
        We&apos;re auditing your website right now. Check your inbox — your personalized
        Growth Score report and actionable insights will arrive within the next few minutes.
      </p>

      <div className="flex flex-col gap-3 items-center max-w-sm mx-auto">
        <a
          href="https://alphacreative.as.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          Book Your Strategy Call →
        </a>
        <button
          onClick={() => window.close()}
          className="text-sm text-gray-400 hover:text-gray-600 transition"
        >
          Close this window
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Window closes automatically in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}...
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

export default function GrowthScorePage() {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [website, setWebsite] = useState('');
  const [role, setRole] = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [budget, setBudget] = useState('');
  const [timeline, setTimeline] = useState('');
  const [tracking, setTracking] = useState('');
  const [channels, setChannels] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shareToken, setShareToken] = useState('');

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!name.trim() || !email.trim() || !company.trim() || !website.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return;
      }
    }
    if (step === 2) {
      if (services.length === 0 || !budget || !timeline) {
        setError('Please complete all selections before continuing.');
        return;
      }
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!tracking) {
      setError('Please select your tracking maturity level.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company,
          website,
          role,
          services_selected: services,
          budget,
          timeline,
          tracking_maturity: tracking,
          marketing_channels: channels,
          // Honeypot field (intentionally empty for real users)
          website_confirm: '',
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }

      setShareToken(data.shareToken);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────

  if (shareToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8">
          <SuccessScreen shareToken={shareToken} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800">
      {/* Header */}
      <div className="text-center pt-12 pb-8 px-4">
        <div className="text-brand-300 text-xs tracking-widest uppercase mb-3">
          AlphaCreative
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Growth Intelligence Engine
        </h1>
        <p className="text-brand-200 text-base max-w-xl mx-auto">
          Get your free Digital Growth Score — a diagnostic audit of your website,
          search presence, and measurement maturity. Takes 2 minutes.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {/* Step labels */}
            <div className="text-center mb-8">
              <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">
                Step {step} of {TOTAL_STEPS}
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {step === 1 && 'Tell us about yourself'}
                {step === 2 && 'What are your growth goals?'}
                {step === 3 && 'Where are you today?'}
              </h2>
            </div>

            <form onSubmit={handleSubmit}>

              {/* ── Step 1: Contact ─────────────────────────── */}
              {step === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Full Name" required>
                      <input
                        type="text"
                        className={inputClass}
                        placeholder="Jane Smith"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </Field>
                    <Field label="Work Email" required>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="jane@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Field>
                  </div>
                  <Field label="Company Name" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="Acme Inc."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Website URL" required>
                    <input
                      type="text"
                      className={inputClass}
                      placeholder="https://yourwebsite.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Your Role">
                    <select
                      className={selectClass}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="">Select your role…</option>
                      {ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </Field>

                  {/* Honeypot – hidden from real users */}
                  <div className="hidden" aria-hidden="true">
                    <input
                      type="text"
                      name="website_confirm"
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {/* ── Step 2: Goals ───────────────────────────── */}
              {step === 2 && (
                <div className="space-y-6">
                  <Field label="Which services are you interested in?" required>
                    <MultiSelect
                      options={SERVICES}
                      value={services}
                      onChange={setServices}
                      cols={2}
                    />
                  </Field>
                  <Field label="Monthly budget for growth?" required>
                    <SingleSelect
                      options={BUDGETS}
                      value={budget}
                      onChange={setBudget}
                    />
                  </Field>
                  <Field label="When do you want to start seeing results?" required>
                    <SingleSelect
                      options={TIMELINES}
                      value={timeline}
                      onChange={setTimeline}
                    />
                  </Field>
                </div>
              )}

              {/* ── Step 3: Maturity ────────────────────────── */}
              {step === 3 && (
                <div className="space-y-6">
                  <Field label="How would you describe your current tracking setup?" required>
                    <SingleSelect
                      options={TRACKING_OPTIONS}
                      value={tracking}
                      onChange={setTracking}
                    />
                  </Field>
                  <Field label="Which marketing channels are you currently using?">
                    <MultiSelect
                      options={CHANNELS}
                      value={channels}
                      onChange={setChannels}
                      cols={2}
                    />
                  </Field>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition"
                  >
                    ← Back
                  </button>
                ) : (
                  <div />
                )}

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm"
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-brand-600 hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition text-sm flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Generating Report…
                      </>
                    ) : (
                      'Email Me My Results! →'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-100 px-8 py-4 text-center">
            <p className="text-xs text-gray-400">
              🔒 Your information is private and never sold.
              By submitting you agree to receive your Growth Score report by email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

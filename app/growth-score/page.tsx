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

// ─── Brand constants ────────────────────────────────────────────
const NAVY      = '#001D3D';
const DEEP_NAVY = '#000F1F';
const GOLD      = '#FCBA12';
const NUNITO    = '"Nunito", "Inter", system-ui, sans-serif';

// ─── AlphaCreative Logo ─────────────────────────────────────────
// Matches brand guide: aC monogram mark + "alpha CREATIVE" wordmark

function AlphaLogo({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
  const isLight = variant === 'light'; // light = on dark background
  return (
    <div className="flex items-center gap-3">
      {/* aC monogram icon */}
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
      {/* Wordmark: "alpha" + "CREATIVE" */}
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

// ─── Step indicator ─────────────────────────────────────────────

const STEP_LABELS = ['Your Info', 'Growth Goals', 'Where You Are'];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {Array.from({ length: total }).map((_, i) => {
        const stepNum = i + 1;
        const isPast   = stepNum < current;
        const isActive = stepNum === current;
        const isFuture = stepNum > current;

        return (
          <div key={i} className="flex items-center">
            {i > 0 && (
              <div
                className="h-px w-10 sm:w-16 transition-all"
                style={{ background: isPast ? NAVY : '#e5e7eb' }}
              />
            )}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                style={{
                  background: isPast || isActive ? NAVY : '#f3f4f6',
                  color:      isPast || isActive ? '#ffffff' : '#9ca3af',
                  boxShadow:  isActive ? `0 0 0 4px rgba(252,186,18,0.3)` : 'none',
                  outline:    isActive ? `2px solid ${GOLD}` : 'none',
                  outlineOffset: '2px',
                }}
              >
                {isPast ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  stepNum
                )}
              </div>
              <span
                className="text-xs font-medium hidden sm:block transition-all"
                style={{ color: isFuture ? '#9ca3af' : NAVY }}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Form field components ──────────────────────────────────────

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
      <label className="text-sm font-semibold" style={{ color: NAVY }}>
        {label}
        {required && <span style={{ color: GOLD }} className="ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  'w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none transition placeholder:text-gray-400 bg-white shadow-sm hover:border-gray-400';

const selectClass = inputClass;

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
      {options.map((opt) => {
        const isSelected = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className="text-left text-sm px-3.5 py-2.5 rounded-xl border transition-all font-medium shadow-sm"
            style={{
              background:   isSelected ? NAVY : '#ffffff',
              color:        isSelected ? GOLD : '#374151',
              borderColor:  isSelected ? NAVY : '#e5e7eb',
              fontWeight:   isSelected ? 700 : 500,
            }}
          >
            {opt}
          </button>
        );
      })}
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
      {options.map((opt) => {
        const isSelected = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className="text-left text-sm px-3.5 py-2.5 rounded-xl border transition-all shadow-sm"
            style={{
              background:  isSelected ? NAVY : '#ffffff',
              color:       isSelected ? GOLD : '#374151',
              borderColor: isSelected ? NAVY : '#e5e7eb',
              fontWeight:  isSelected ? 700 : 500,
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

// ─── Success screen ─────────────────────────────────────────────

function SuccessScreen({ shareToken }: { shareToken: string }) {
  const [secondsLeft, setSecondsLeft] = useState(5);

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

  void shareToken;

  return (
    <div className="text-center py-6 px-2">
      {/* Gold checkmark circle with shadow */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 flex-shrink-0"
        style={{ 
          background: GOLD,
          boxShadow: `0 8px 24px rgba(252, 186, 18, 0.25)`,
        }}
      >
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke={NAVY} strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2
        className="text-3xl font-extrabold mb-4 leading-tight"
        style={{ fontFamily: NUNITO, color: NAVY, letterSpacing: '-0.02em' }}
      >
        Score Generated!
      </h2>
      <p className="text-gray-600 text-base max-w-sm mx-auto mb-10 leading-relaxed font-medium">
        Check your inbox for your personalized Growth Score report and actionable insights.
      </p>

      <div className="flex flex-col gap-3 items-center max-w-xs mx-auto">
        <a
          href="https://alphacreative.as.me/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-2 font-bold px-6 py-4 rounded-xl transition shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95"
          style={{ 
            background: GOLD, 
            color: NAVY, 
            fontFamily: NUNITO,
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          Book Your Strategy Call →
        </a>
        <button
          onClick={() => window.close()}
          className="text-sm text-gray-500 hover:text-gray-700 transition font-medium"
        >
          Close this window
        </button>
        <p className="text-xs text-gray-400 mt-2">
          Closes automatically in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}…
        </p>
      </div>
    </div>
  );
}

// ─── Decorative gold orbs (subtle) ─────────────────────────────

function HeroOrbs() {
  return (
    <>
      <div
        className="absolute top-0 right-0 w-[480px] h-[480px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(252,186,18,0.12) 0%, transparent 65%)',
          transform: 'translate(30%, -25%)',
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-72 h-72 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(252,186,18,0.07) 0%, transparent 70%)',
          transform: 'translate(-30%, 30%)',
        }}
      />
    </>
  );
}

// ─── Trust pill ─────────────────────────────────────────────────

function TrustPill() {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-6"
      style={{
        background: 'rgba(252,186,18,0.12)',
        border: '1px solid rgba(252,186,18,0.3)',
        color: GOLD,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
      Free 2-minute assessment · No credit card required
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────

export default function GrowthScorePage() {
  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 3;

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [company,  setCompany]  = useState('');
  const [website,  setWebsite]  = useState('');
  const [role,     setRole]     = useState('');
  const [services, setServices] = useState<string[]>([]);
  const [budget,   setBudget]   = useState('');
  const [timeline, setTimeline] = useState('');
  const [tracking, setTracking] = useState('');
  const [channels, setChannels] = useState<string[]>([]);

  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [shareToken, setShareToken] = useState('');
  const [emailError, setEmailError] = useState('');

  // Real-time email validation
  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setEmailError('');
      return;
    }
    
    // Basic pattern check
    const isValidPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
    if (!isValidPattern) {
      setEmailError('Please enter a valid email (e.g., jane@company.com)');
      return;
    }

    // Check for disposable email domains
    const disposableDomains = [
      'tempmail.com',
      'throwaway.email',
      '10minutemail.com',
      'mailinator.com',
      'guerrillamail.com',
      'yopmail.com',
      'temp-mail.org',
      'trashmail.com',
      'fakeinbox.com',
    ];

    const domain = trimmed.split('@')[1]?.toLowerCase() || '';
    if (disposableDomains.includes(domain)) {
      setEmailError('Please use your work email address (temporary emails not allowed)');
      return;
    }

    setEmailError('');
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      if (!name.trim() || !email.trim() || !company.trim() || !website.trim()) {
        setError('Please fill in all required fields.');
        return;
      }
      // Check if email has validation errors
      if (emailError) {
        setError('Please fix the email address error before continuing.');
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

  // ── Success state ──────────────────────────────────────────────

  if (shareToken) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 relative hero-navy"
        style={{ background: DEEP_NAVY }}
      >
        <HeroOrbs />
        <div className="relative z-10 bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 sm:p-12 border border-gray-100">
          <div className="flex justify-center mb-8">
            <AlphaLogo variant="dark" />
          </div>
          <SuccessScreen shareToken={shareToken} />
        </div>
      </div>
    );
  }

  // ── Render form ────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen relative hero-navy"
      style={{ background: DEEP_NAVY }}
    >
      <HeroOrbs />

      {/* Hero header */}
      <div className="relative z-10 text-center pt-12 pb-8 px-4">
        <div className="flex justify-center mb-6">
          <AlphaLogo variant="light" />
        </div>

        <TrustPill />

        <h1
          className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-white mb-4 leading-tight"
          style={{
            fontFamily: NUNITO,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
          }}
        >
          Growth Intelligence Engine
        </h1>
        <p className="text-base max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Get your free Digital Growth Score — a diagnostic audit of your website,
          search presence, and measurement maturity.
        </p>
      </div>

      {/* Form card */}
      <div className="relative z-10 max-w-xl mx-auto px-4 pb-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8 sm:p-10">
            <StepIndicator current={step} total={TOTAL_STEPS} />

            {/* Step header */}
            <div className="text-center mb-8">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
                style={{ background: 'rgba(252,186,18,0.12)', color: '#a07800' }}
              >
                Step {step} of {TOTAL_STEPS}
              </div>
              <h2
                className="text-xl font-extrabold"
                style={{ fontFamily: NUNITO, color: NAVY, letterSpacing: '-0.02em' }}
              >
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
                        style={{ '--tw-ring-color': NAVY } as React.CSSProperties}
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
                        onChange={(e) => {
                          setEmail(e.target.value);
                          validateEmail(e.target.value);
                        }}
                        onBlur={() => validateEmail(email)}
                        required
                      />
                      {emailError && (
                        <div className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {emailError}
                        </div>
                      )}
                      {email && !emailError && (
                        <div className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Email looks good
                        </div>
                      )}
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

                  {/* Honeypot */}
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

              {/* Error */}
              {error && (
                <div className="mt-4 bg-red-50 text-red-700 text-sm rounded-xl px-4 py-3 border border-red-100 font-medium">
                  {error}
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s - 1)}
                    className="text-sm font-semibold transition flex items-center gap-1 hover:text-opacity-70 duration-200"
                    style={{ color: NAVY }}
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
                    className="font-bold px-8 py-3 rounded-xl transition text-sm shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95"
                    style={{ 
                      background: GOLD, 
                      color: NAVY, 
                      fontFamily: NUNITO,
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Continue →
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="font-bold px-8 py-3 rounded-xl transition text-sm shadow-lg hover:shadow-xl hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{ 
                      background: loading ? '#daa510' : GOLD, 
                      color: NAVY, 
                      fontFamily: NUNITO,
                      fontWeight: 800,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                        </svg>
                        Generating…
                      </>
                    ) : (
                      'Get My Results! →'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Footer strip */}
          <div
            className="px-8 py-4 text-center border-t"
            style={{ background: '#faf8f3', borderColor: '#f0ece0' }}
          >
            <p className="text-xs text-gray-400">
              🔒 Your information is private and never sold.{' '}
              By submitting you agree to receive your Growth Score report by email.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

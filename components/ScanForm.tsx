"use client";

import { useState, useRef, useEffect } from "react";

const LOADING_PHASES = [
  "Fetching your website…",
  "Reading your homepage…",
  "Running conversion checks…",
  "Almost there…",
];

interface RuleResult {
  rule: number;
  finding: string;
}

interface ScanAnalysis {
  score: number;
  out_of: number;
  grade: string;
  headline: string;
  passes: RuleResult[];
  fails: RuleResult[];
  biggest_win: string;
}

interface ScanResult {
  url: string;
  analysis: ScanAnalysis;
  og_image: string | null;
}

const RULE_NAMES: Record<number, string> = {
  1: "Google can tell what your page is about",
  3: "You use real numbers, not vague claims",
  4: "There's one clear thing for visitors to do",
  7: "At least one real customer quote on your homepage",
  13: "Contact details are visible the moment the page loads",
};

function GradeBadge({ grade, score, outOf }: { grade: string; score: number; outOf: number }) {
  const colours: Record<string, string> = {
    A: "bg-green",
    B: "bg-blue-500",
    C: "bg-amber-500",
    D: "bg-amber-500",
    F: "bg-red",
  };
  const bg = colours[grade] ?? "bg-slate-500";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${bg} text-[white] rounded-[8px] w-20 h-20 flex items-center justify-center text-4xl font-extrabold shadow-lg tracking-[-0.04em]`}
      >
        {grade}
      </div>
      <div>
        <p className="text-3xl font-black text-ink">
          {score}
          <span className="text-lg font-normal text-muted">/{outOf}</span>
        </p>
        <p className="text-sm text-muted">quick scan rules passed</p>
      </div>
    </div>
  );
}

function RuleRow({ rule, pass }: { rule: RuleResult; pass: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          pass
            ? "bg-green/20 text-green"
            : "bg-red-light text-red"
        }`}
      >
        {pass ? "✓" : "✗"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">
          {RULE_NAMES[rule.rule] ?? `Rule ${rule.rule}`}
        </p>
        <p className="text-sm text-muted mt-0.5">{rule.finding}</p>
      </div>
    </div>
  );
}

export default function ScanForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<"report" | "html" | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paywallEmailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) {
      setLoadingPhase(0);
      return;
    }
    // Phase 0→1 after 2s, 1→2 after 5s, 2→3 after 10s
    const delays = [2000, 5000, 10000];
    const timers = delays.map((delay, i) =>
      setTimeout(() => setLoadingPhase(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    let normalised = url.trim();
    if (!/^https?:\/\//i.test(normalised)) normalised = `https://${normalised}`;

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: normalised, email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setResult(data);
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch {
      setError("Network error — please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckout(tier: "report" | "html") {
    if (!email) {
      paywallEmailRef.current?.focus();
      setCheckoutError("Enter your email so we can deliver your report.");
      return;
    }
    setCheckoutLoading(tier);
    setCheckoutError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          url: result!.url,
          email,
          scanResults: result!.analysis,
          og_image: result!.og_image,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCheckoutError(data.error ?? "Could not start checkout. Please try again.");
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setCheckoutError("Network error — please try again.");
    } finally {
      setCheckoutLoading(null);
    }
  }

  return (
    <div className="w-full">
      {/* Scan form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="yourwebsite.co.uk"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-white text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent dm-input"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-[7px] bg-blue hover:bg-blue-dark text-[white] font-bold text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Scanning…" : "Get My Free Score →"}
          </button>
        </div>
        <p className="text-xs text-muted text-center">
          Free scan — no account needed. Results in ~30 seconds. Questions?{" "}
          <a href="mailto:hello@grademy.site" className="text-blue hover:underline">hello@grademy.site</a>
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-light border border-red-light text-red text-sm">
          {error}
        </div>
      )}

      {/* Loading — phased indicator */}
      {loading && (
        <div className="mt-8 animate-fade-in">
          <div className="rounded-2xl border border-border bg-surface p-6">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-border rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-blue rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((loadingPhase + 1) / LOADING_PHASES.length) * 100}%` }}
              />
            </div>
            {/* Phase steps */}
            <div className="space-y-3">
              {LOADING_PHASES.map((label, i) => {
                const done = i < loadingPhase;
                const active = i === loadingPhase;
                return (
                  <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i > loadingPhase ? "opacity-30" : "opacity-100"}`}>
                    <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${done ? "bg-green/20 text-green" : active ? "bg-blue/20 text-blue" : "bg-border text-muted"}`}>
                      {done ? "✓" : active ? (
                        <span className="w-2 h-2 rounded-full bg-blue animate-pulse block" />
                      ) : ""}
                    </span>
                    <span className={`text-sm font-medium ${active ? "text-ink" : done ? "text-muted" : "text-muted"}`}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="mt-10 animate-fade-in">
          {/* Score header */}
          <div className="rounded-2xl border border-border bg-white shadow-sm p-6 mb-4 dm-card">
            <GradeBadge
              grade={result.analysis.grade}
              score={result.analysis.score}
              outOf={result.analysis.out_of}
            />
            <p className="mt-4 text-ink font-medium">{result.analysis.headline}</p>
          </div>

          {/* Social preview card */}
          <div className="rounded-2xl border border-border bg-white shadow-sm p-4 mb-4 dm-card">
            <p className="eyebrow mb-3">
              Social preview
            </p>
            {result.og_image ? (
              <div className="rounded-xl overflow-hidden border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.og_image}
                  alt="OG image preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).innerHTML =
                      `<div class="h-20 flex items-center justify-center text-xs text-muted">Image failed to load</div>`;
                  }}
                />
                <div className="px-3 py-2 bg-surface border-t border-border">
                  <p className="text-xs text-muted truncate">
                    {new URL(result.url).hostname}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-border h-24 flex flex-col items-center justify-center gap-1 text-muted">
                <span className="text-lg">🔗</span>
                <p className="text-xs font-medium">No preview image set</p>
                <p className="text-xs">Your link shows a blank box when shared</p>
              </div>
            )}
          </div>

          {/* Rule breakdown */}
          <div className="rounded-2xl border border-border bg-white shadow-sm p-6 mb-4 dm-card">
            <h3 className="eyebrow mb-2">
              5-Rule Quick Scan
            </h3>
            {result.analysis.passes.map((r) => (
              <RuleRow key={r.rule} rule={r} pass={true} />
            ))}
            {result.analysis.fails.map((r) => (
              <RuleRow key={r.rule} rule={r} pass={false} />
            ))}
          </div>

          {/* Biggest win */}
          <div className="rounded-2xl bg-blue-light border border-blue-light p-6 mb-6">
            <p className="eyebrow mb-1">
              Biggest Quick Win
            </p>
            <p className="text-ink font-medium">{result.analysis.biggest_win}</p>
          </div>

          {/* Paywall teaser */}
          <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-[white] p-6 dm-section-surface">
            <p className="eyebrow mb-2">
              Want the full picture?
            </p>
            <h3 className="text-xl font-bold mb-1">
              This was 5 of 22 rules — and the lighter half.
            </h3>
            <p className="text-slate-300 text-sm mb-5">
              The full report checks all 22 conversion principles and tells you
              exactly what to rewrite — with new headlines, button text, and words
              already written for your business.
            </p>
            <input
              ref={paywallEmailRef}
              type="email"
              placeholder="your@email.com — for report delivery"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setCheckoutError(null); }}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-[white] placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent mb-3 dm-input"
            />
            {checkoutError && (
              <p className="text-red text-xs mb-3">{checkoutError}</p>
            )}
            <button
              onClick={() => handleCheckout("report")}
              disabled={checkoutLoading !== null}
              className="w-full py-3.5 rounded-[7px] bg-blue hover:bg-blue-dark text-[white] font-bold text-center text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {checkoutLoading === "report" ? "Redirecting…" : "Get the Full Report — £49"}
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">
              One-time payment. Delivered by email within 24 hours. Work begins immediately on payment.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

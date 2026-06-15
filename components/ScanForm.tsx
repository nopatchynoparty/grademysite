"use client";

import { useState, useRef } from "react";

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
  1: "Headline states a customer outcome",
  3: "Single primary CTA",
  4: "CTA describes what happens next",
  6: "At least one testimonial",
  9: "Homepage leads with primary service",
};

function GradeBadge({ grade, score, outOf }: { grade: string; score: number; outOf: number }) {
  const colours: Record<string, string> = {
    A: "bg-emerald-500",
    B: "bg-blue-500",
    C: "bg-amber-500",
    D: "bg-orange-500",
    F: "bg-red-500",
  };
  const bg = colours[grade] ?? "bg-slate-500";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`${bg} text-white rounded-2xl w-20 h-20 flex items-center justify-center text-4xl font-black shadow-lg`}
      >
        {grade}
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900">
          {score}
          <span className="text-lg font-normal text-slate-400">/{outOf}</span>
        </p>
        <p className="text-sm text-slate-500">quick scan rules passed</p>
      </div>
    </div>
  );
}

function RuleRow({ rule, pass }: { rule: RuleResult; pass: boolean }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          pass
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-600"
        }`}
      >
        {pass ? "✓" : "✗"}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700">
          {RULE_NAMES[rule.rule] ?? `Rule ${rule.rule}`}
        </p>
        <p className="text-sm text-slate-500 mt-0.5">{rule.finding}</p>
      </div>
    </div>
  );
}

export default function ScanForm() {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<"report" | "html" | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const paywallEmailRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, email }),
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
            type="url"
            required
            placeholder="yourwebsite.co.uk"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? "Scanning…" : "Get My Free Score →"}
          </button>
        </div>
        <p className="text-xs text-slate-400 text-center">
          Free scan — no account needed. Results in ~30 seconds.
        </p>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Loading pulse */}
      {loading && (
        <div className="mt-8 animate-fade-in">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />
                <div className="flex-1 h-4 rounded bg-slate-200 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div ref={resultsRef} className="mt-10 animate-fade-in">
          {/* Score header */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 mb-4">
            <GradeBadge
              grade={result.analysis.grade}
              score={result.analysis.score}
              outOf={result.analysis.out_of}
            />
            <p className="mt-4 text-slate-700 font-medium">{result.analysis.headline}</p>
          </div>

          {/* Social preview card */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-4 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Social preview
            </p>
            {result.og_image ? (
              <div className="rounded-xl overflow-hidden border border-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.og_image}
                  alt="OG image preview"
                  className="w-full max-h-48 object-cover"
                  onError={(e) => {
                    (e.currentTarget.parentElement as HTMLElement).innerHTML =
                      `<div class="h-20 flex items-center justify-center text-xs text-slate-400">Image failed to load</div>`;
                  }}
                />
                <div className="px-3 py-2 bg-slate-50 border-t border-slate-100">
                  <p className="text-xs text-slate-400 truncate">
                    {new URL(result.url).hostname}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border-2 border-dashed border-slate-200 h-24 flex flex-col items-center justify-center gap-1 text-slate-400">
                <span className="text-lg">🔗</span>
                <p className="text-xs font-medium">No preview image set</p>
                <p className="text-xs">Your link shows a blank box when shared</p>
              </div>
            )}
          </div>

          {/* Rule breakdown */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-6 mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">
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
          <div className="rounded-2xl bg-orange-50 border border-orange-100 p-6 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
              Biggest Quick Win
            </p>
            <p className="text-slate-800 font-medium">{result.analysis.biggest_win}</p>
          </div>

          {/* Paywall teaser */}
          <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Want the full picture?
            </p>
            <h3 className="text-xl font-bold mb-1">
              This was 5 of 20 rules — and the lighter half.
            </h3>
            <p className="text-slate-300 text-sm mb-4">
              The full report checks all 20 conversion principles and tells you
              exactly what to rewrite — with new headlines, CTAs, and copy
              already written for your business.
            </p>
            <input
              ref={paywallEmailRef}
              type="email"
              placeholder="your@email.com — for report delivery"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setCheckoutError(null); }}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent mb-3"
            />
            {checkoutError && (
              <p className="text-red-400 text-xs mb-3">{checkoutError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleCheckout("report")}
                disabled={checkoutLoading !== null}
                className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-semibold text-center text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoading === "report" ? "Redirecting…" : "Full Report — £49"}
              </button>
              <button
                onClick={() => handleCheckout("html")}
                disabled={checkoutLoading !== null}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-center text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {checkoutLoading === "html" ? "Redirecting…" : "Report + HTML — £149"}
              </button>
            </div>
            <p className="text-xs text-slate-500 text-center mt-3">
              One-time payment. Delivered by email within 24 hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

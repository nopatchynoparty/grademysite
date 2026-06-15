"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RuleResult {
  rule: number;
  finding: string;
}

interface RewrittenCopy {
  headline: string;
  subheadline: string;
  problem_section: string[];
  primary_cta: string;
  testimonial_suggestions: string[];
}

interface FullAnalysis {
  score: number;
  out_of: number;
  grade: string;
  headline: string;
  passes: RuleResult[];
  fails: RuleResult[];
  unable_to_assess: RuleResult[];
  biggest_win: string;
  rewritten_copy: RewrittenCopy;
}

interface Job {
  id: string;
  url: string;
  email: string;
  tier: "report" | "html";
  status: "pending_payment" | "pending" | "analysing" | "review" | "sent" | "error";
  scan_results: unknown;
  full_analysis: FullAnalysis | null;
  stripe_session_id: string | null;
  og_image: string | null;
  screenshot_url: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_LABELS: Record<string, { label: string; colour: string }> = {
  pending_payment: { label: "Awaiting payment", colour: "bg-slate-700 text-slate-300" },
  pending:         { label: "Pending analysis", colour: "bg-amber-900/50 text-amber-300" },
  analysing:       { label: "Analysing…",       colour: "bg-blue-900/50 text-blue-300" },
  review:          { label: "Ready to review",  colour: "bg-violet-900/50 text-violet-300" },
  sent:            { label: "Report sent",       colour: "bg-emerald-900/50 text-emerald-300" },
  error:           { label: "Error",             colour: "bg-red-900/50 text-red-300" },
};

const GRADE_COLOURS: Record<string, string> = {
  A: "bg-emerald-500", B: "bg-blue-500", C: "bg-amber-500", D: "bg-orange-500", F: "bg-red-500",
};

const RULE_NAMES: Record<number, string> = {
  1: "Headline states a customer outcome",
  2: "At least one specific number",
  3: "Single primary CTA",
  4: "CTA describes what happens next",
  5: "Problem acknowledged before solution",
  6: "At least one testimonial",
  7: "Testimonials are specific",
  8: "Geographic service area explicit",
  9: "Homepage leads with primary service",
  10: "Real work shown",
  11: "Pricing or price indication",
  12: "Contact immediately accessible",
  13: "Copy specific to this business",
  14: "Differentiator explicitly stated",
  15: "Contact form friction is low",
  16: "Best proof is above the fold",
  17: "No weak placeholder words",
  18: "Site appears current",
  19: "Headline specific enough to challenge",
  20: "Next step after contact is clear",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, colour: "bg-slate-700 text-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.colour}`}>
      {cfg.label}
    </span>
  );
}

function AnalysisPanel({ analysis }: { analysis: FullAnalysis }) {
  const gradeColour = GRADE_COLOURS[analysis.grade] ?? "bg-slate-500";
  const copy = analysis.rewritten_copy;

  return (
    <div className="border-t border-white/10 pt-5 mt-2 space-y-5">
      {/* Score */}
      <div className="flex items-center gap-4">
        <div className={`${gradeColour} w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-white`}>
          {analysis.grade}
        </div>
        <div>
          <p className="text-2xl font-black text-white">
            {analysis.score}<span className="text-base font-normal text-slate-400">/{analysis.out_of}</span>
          </p>
          <p className="text-sm text-slate-400">{analysis.headline}</p>
        </div>
      </div>

      {/* Biggest win */}
      <div className="rounded-xl bg-orange-500/10 border border-orange-500/20 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Biggest Win</p>
        <p className="text-sm text-slate-200">{analysis.biggest_win}</p>
      </div>

      {/* Rule results */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">20-Rule Scorecard</span>
        </div>
        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
          {analysis.passes.map((r) => (
            <div key={`p-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
              <div>
                <p className="text-xs font-semibold text-slate-300">{RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
              </div>
            </div>
          ))}
          {analysis.fails.map((r) => (
            <div key={`f-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center text-xs font-bold">✗</span>
              <div>
                <p className="text-xs font-semibold text-slate-300">{RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
              </div>
            </div>
          ))}
          {(analysis.unable_to_assess ?? []).map((r) => (
            <div key={`u-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5 opacity-50">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">–</span>
              <div>
                <p className="text-xs font-semibold text-slate-400">{RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
                <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewritten copy */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Rewritten Copy</span>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Headline</p>
            <p className="text-sm font-bold text-white">{copy.headline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Subheadline</p>
            <p className="text-sm text-slate-300">{copy.subheadline}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Problem Section</p>
            <ul className="space-y-1">
              {copy.problem_section.map((pt, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-orange-400 font-bold">•</span>{pt}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Primary CTA</p>
            <span className="inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">{copy.primary_cta}</span>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Testimonial Suggestions</p>
            <div className="space-y-2">
              {copy.testimonial_suggestions.map((s, i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <p className="text-xs text-slate-500 mb-0.5">Suggestion {i + 1}</p>
                  <p className="text-xs text-slate-300 italic">"{s}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function JobCard({
  job,
  expanded,
  onToggle,
  onAnalyse,
  onApprove,
  analysingId,
  approvingId,
}: {
  job: Job;
  expanded: boolean;
  onToggle: () => void;
  onAnalyse: (id: string) => void;
  onApprove: (id: string) => void;
  analysingId: string | null;
  approvingId: string | null;
}) {
  const isAnalysing = analysingId === job.id || job.status === "analysing";
  const isApproving = approvingId === job.id;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Card header */}
      <div
        className="flex items-start justify-between gap-4 p-5 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10">
          {job.og_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={job.og_image}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              No img
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <StatusBadge status={job.status} />
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${job.tier === "html" ? "bg-violet-900/50 text-violet-300" : "bg-slate-700 text-slate-300"}`}>
              {job.tier === "html" ? "Report + HTML — £149" : "Full Report — £49"}
            </span>
          </div>
          <p className="font-semibold text-white text-sm truncate">{job.url}</p>
          <p className="text-xs text-slate-500 mt-0.5">{job.email} · {new Date(job.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Action buttons */}
          {(job.status === "pending" || job.status === "error") && (
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyse(job.id); }}
              disabled={isAnalysing}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isAnalysing ? "Running…" : "Run Analysis"}
            </button>
          )}
          {job.status === "review" && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(job.id); }}
              disabled={isApproving}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isApproving ? "Sending…" : "Approve & Send"}
            </button>
          )}
          <span className="text-slate-500 text-sm">{expanded ? "▲" : "▼"}</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div className="px-5 pb-5">
          {isAnalysing && !job.full_analysis && (
            <div className="border-t border-white/10 pt-5">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <div className="w-4 h-4 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 h-3 rounded bg-white/10 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
                  </div>
                ))}
                <p className="text-xs text-slate-500 pt-1">Running full 20-rule analysis with Claude Opus — this takes 1–2 minutes…</p>
              </div>
            </div>
          )}
          {job.full_analysis && !isAnalysing && (
            <AnalysisPanel analysis={job.full_analysis} />
          )}
          {!job.full_analysis && !isAnalysing && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm text-slate-500">No analysis yet.</p>
            </div>
          )}
          {/* Re-approve for sent jobs */}
          {job.status === "sent" && job.full_analysis && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={(e) => { e.stopPropagation(); onApprove(job.id); }}
                disabled={isApproving}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-slate-400 hover:text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {isApproving ? "Resending…" : "Resend email"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);
  const [analysingId, setAnalysingId] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "review" | "sent">("all");

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jobs");
      if (res.status === 401) { router.replace("/admin/login"); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setJobs(data);
      setFetchError(null);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function handleAnalyse(jobId: string) {
    setAnalysingId(jobId);
    setActionError(null);
    setExpandedJob(jobId);

    // Optimistically mark as analysing in UI
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "analysing" } : j))
    );

    try {
      const res = await fetch("/api/admin/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Analysis failed");
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "error" } : j))
        );
      } else {
        // Refresh to get full job with analysis stored
        await fetchJobs();
      }
    } catch {
      setActionError("Network error during analysis");
    } finally {
      setAnalysingId(null);
    }
  }

  async function handleApprove(jobId: string) {
    setApprovingId(jobId);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Approval failed");
      } else {
        await fetchJobs();
      }
    } catch {
      setActionError("Network error while sending report");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  const filteredJobs = jobs.filter((j) => {
    if (filter === "all") return true;
    if (filter === "pending") return ["pending", "analysing", "error"].includes(j.status);
    if (filter === "review") return j.status === "review";
    if (filter === "sent") return j.status === "sent";
    return true;
  });

  const pendingCount = jobs.filter((j) => j.status === "pending").length;
  const reviewCount = jobs.filter((j) => j.status === "review").length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-black tracking-tight">
              Grade<span className="text-orange-500">My</span>Site
              <span className="text-slate-500 font-normal text-sm ml-1.5">Admin</span>
            </span>
            {reviewCount > 0 && (
              <span className="bg-violet-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {reviewCount} to review
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchJobs}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "review", "sent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-white text-slate-900"
                  : "bg-white/5 text-slate-400 hover:text-white"
              }`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5">{pendingCount}</span>
              )}
              {f === "review" && reviewCount > 0 && (
                <span className="ml-1.5 bg-violet-500 text-white text-xs rounded-full px-1.5">{reviewCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* Action error */}
        {actionError && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
            {actionError}
            <button className="ml-3 underline text-xs" onClick={() => setActionError(null)}>Dismiss</button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        )}

        {/* Fetch error */}
        {fetchError && !loading && (
          <div className="px-4 py-3 rounded-xl bg-red-900/30 border border-red-500/30 text-red-400 text-sm">
            {fetchError}
          </div>
        )}

        {/* Empty state */}
        {!loading && !fetchError && filteredJobs.length === 0 && (
          <div className="text-center py-20 text-slate-500">
            <p className="text-lg font-semibold mb-1">No jobs yet</p>
            <p className="text-sm">Jobs appear here once a customer pays.</p>
          </div>
        )}

        {/* Job list */}
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              expanded={expandedJob === job.id}
              onToggle={() => setExpandedJob(expandedJob === job.id ? null : job.id)}
              onAnalyse={handleAnalyse}
              onApprove={handleApprove}
              analysingId={analysingId}
              approvingId={approvingId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

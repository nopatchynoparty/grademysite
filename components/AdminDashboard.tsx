"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface RuleResult {
  rule: number;
  rule_name?: string;
  finding: string;
  rationale?: string;
}

interface TopWin {
  rule: number;
  rule_name?: string;
  impact: string;
  fix: string;
}

interface RewrittenCopy {
  headline: string;
  subheadline: string;
  problem_section: string[];
  primary_cta: string;
  testimonial_suggestions: string[];
  sound_familiar?: string[];
  section_headings?: Record<string, string>;
  solution_bullets?: string[];
}

interface FullAnalysis {
  score: number;
  out_of: number;
  grade: string;
  headline: string;
  passes: RuleResult[];
  fails: RuleResult[];
  unable_to_assess: RuleResult[];
  top_3_wins?: TopWin[];
  biggest_win: string;
  rewritten_copy: RewrittenCopy;
  company_name?: string;
  phone?: string | null;
  has_pricing?: boolean;
}

interface Job {
  id: string;
  url: string;
  email: string;
  tier: "report" | "html";
  status: "pending_payment" | "pending" | "analysing" | "review" | "sent" | "error";
  scan_results: unknown;
  full_analysis: FullAnalysis | null;
  analysis_history?: FullAnalysis[];
  html_output: string | null;
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
  review:          { label: "Ready to review",  colour: "bg-blue/20 text-blue" },
  sent:            { label: "Report sent",       colour: "bg-emerald-900/50 text-emerald-300" },
  error:           { label: "Error",             colour: "bg-red-900/50 text-red-300" },
};

const GRADE_COLOURS: Record<string, string> = {
  A: "bg-green", B: "bg-blue-500", C: "bg-amber-500", D: "bg-amber-500", F: "bg-red",
};

const RULE_NAMES: Record<number, string> = {
  1: "Google can tell what your page is about",
  2: "Your opening line tells visitors what they'll get",
  3: "You use real numbers, not vague claims",
  4: "There's one clear thing for visitors to do",
  5: "Your main button tells people what happens when they click it",
  6: "You acknowledge the customer's problem before pitching",
  7: "At least one real customer quote on your homepage",
  8: "Your customer quotes are specific",
  9: "You clearly state where you work",
  10: "Your main service is front and centre",
  11: "You show photos of your actual work",
  12: "You give at least a rough idea of your prices",
  13: "Contact details are visible the moment the page loads",
  14: "Your page sounds like it was written for your specific business",
  15: "You say what makes you different",
  16: "Getting in touch doesn't require filling in an essay",
  17: "Your strongest proof is the first thing people see",
  18: "You avoid meaningless filler words",
  19: "Your site looks like you're still in business",
  20: "Your opening line makes a claim someone could actually disagree with",
  21: "You tell people what happens after they get in touch",
  22: "Your page title and description in Google look professional",
};

const HEADING_ORDER = ["hero", "problem", "solution", "social_proof", "cta"];

const EDIT_INPUT = "w-full px-2 py-1 rounded bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue resize-none";
const EDIT_LABEL = "text-xs font-semibold uppercase tracking-wider text-blue mb-1";

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABELS[status] ?? { label: status, colour: "bg-slate-700 text-slate-300" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.colour}`}>
      {cfg.label}
    </span>
  );
}

function HtmlPreviewPanel({ htmlOutput }: { htmlOutput: string }) {
  return (
    <div className="rounded-xl border border-blue-500/30 overflow-hidden">
      <div className="px-4 py-2 border-b border-blue-500/20 bg-blue-900/20 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">HTML Page Preview</span>
        <button
          onClick={() => {
            const blob = new Blob([htmlOutput], { type: "text/html" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank");
          }}
          className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Open in new tab ↗
        </button>
      </div>
      <div className="bg-[white] rounded-b-xl overflow-hidden" style={{ height: "360px" }}>
        <iframe
          srcDoc={htmlOutput}
          sandbox="allow-scripts allow-same-origin"
          title="HTML Page Preview"
          className="w-full border-0"
          style={{ height: "600px", transform: "scale(0.6)", transformOrigin: "top left", width: "167%" }}
        />
      </div>
    </div>
  );
}

function AnalysisPanel({
  analysis,
  jobId,
  isHtmlTier,
  onSave,
  savingAnalysis,
}: {
  analysis: FullAnalysis;
  jobId: string;
  isHtmlTier: boolean;
  onSave: (updated: FullAnalysis) => Promise<void>;
  savingAnalysis: boolean;
}) {
  const gradeColour = GRADE_COLOURS[analysis.grade] ?? "bg-slate-500";
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<FullAnalysis>(analysis);

  useEffect(() => {
    if (!editing) setDraft(analysis);
  }, [analysis, editing]);

  async function handleSave() {
    try {
      await onSave(draft);
      setEditing(false);
    } catch {
      // parent surfaces error via actionError; stay in edit mode
    }
  }

  function updateCopy(field: keyof RewrittenCopy, value: unknown) {
    setDraft((prev) => ({ ...prev, rewritten_copy: { ...prev.rewritten_copy, [field]: value } }));
  }

  function updateCopyArray(field: keyof RewrittenCopy, index: number, value: string) {
    setDraft((prev) => {
      const arr = [...((prev.rewritten_copy[field] as string[]) ?? [])];
      arr[index] = value;
      return { ...prev, rewritten_copy: { ...prev.rewritten_copy, [field]: arr } };
    });
  }

  function updateSectionHeading(key: string, value: string) {
    setDraft((prev) => ({
      ...prev,
      rewritten_copy: {
        ...prev.rewritten_copy,
        section_headings: { ...(prev.rewritten_copy.section_headings ?? {}), [key]: value },
      },
    }));
  }

  function updateRuleResult(
    bucket: "passes" | "fails" | "unable_to_assess",
    index: number,
    field: "finding" | "rationale",
    value: string
  ) {
    setDraft((prev) => {
      const arr = structuredClone(prev[bucket]);
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, [bucket]: arr };
    });
  }

  function updateTopWin(index: number, field: "impact" | "fix", value: string) {
    setDraft((prev) => {
      const arr = structuredClone(prev.top_3_wins ?? []);
      arr[index] = { ...arr[index], [field]: value };
      return { ...prev, top_3_wins: arr };
    });
  }

  const copy = editing ? draft.rewritten_copy : analysis.rewritten_copy;
  const displayAnalysis = editing ? draft : analysis;
  const top3 = displayAnalysis.top_3_wins?.filter(Boolean) ?? [];

  return (
    <div className="border-t border-white/10 pt-5 mt-2 space-y-5">
      {/* Edit toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">
          {editing ? (
            <span className="text-amber-400">
              Editing…{isHtmlTier ? " (editing does not update the HTML file — re-run to regenerate)" : ""}
            </span>
          ) : null}
        </span>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button
                onClick={() => { setEditing(false); setDraft(analysis); }}
                className="px-3 py-1 rounded-lg border border-white/20 text-xs text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={savingAnalysis}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {savingAnalysis ? "Saving…" : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-3 py-1 rounded-lg border border-white/20 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-4">
        {editing ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Grade</span>
              <select
                value={draft.grade}
                onChange={(e) => setDraft((p) => ({ ...p, grade: e.target.value }))}
                className="bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue"
              >
                {["A", "B", "C", "D", "F"].map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-500">Score / Out of</span>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={draft.score}
                  onChange={(e) => setDraft((p) => ({ ...p, score: Number(e.target.value) }))}
                  className="w-14 bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue"
                />
                <span className="text-slate-400">/</span>
                <input
                  type="number"
                  value={draft.out_of}
                  onChange={(e) => setDraft((p) => ({ ...p, out_of: Number(e.target.value) }))}
                  className="w-14 bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue"
                />
              </div>
            </div>
            <div className="flex-1">
              <span className="text-xs text-slate-500">Headline</span>
              <textarea
                value={draft.headline}
                onChange={(e) => setDraft((p) => ({ ...p, headline: e.target.value }))}
                rows={2}
                className={EDIT_INPUT}
              />
            </div>
          </>
        ) : (
          <>
            <div className={`${gradeColour} w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black text-[white]`}>
              {displayAnalysis.grade}
            </div>
            <div>
              <p className="text-2xl font-black text-[white]">
                {displayAnalysis.score}<span className="text-base font-normal text-slate-400">/{displayAnalysis.out_of}</span>
              </p>
              <p className="text-sm text-slate-400">{displayAnalysis.headline}</p>
            </div>
          </>
        )}
      </div>

      {/* Metadata strip */}
      {(displayAnalysis.company_name || displayAnalysis.phone || displayAnalysis.has_pricing !== undefined) && (
        <div className="flex flex-wrap items-center gap-3">
          {editing ? (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Company name</span>
                <input
                  type="text"
                  value={draft.company_name ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, company_name: e.target.value }))}
                  className="px-2 py-1 rounded bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-500">Phone</span>
                <input
                  type="text"
                  value={draft.phone ?? ""}
                  onChange={(e) => setDraft((p) => ({ ...p, phone: e.target.value || null }))}
                  className="px-2 py-1 rounded bg-white/10 border border-white/20 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue"
                />
              </div>
              <div className="flex items-center gap-2 mt-4">
                <input
                  type="checkbox"
                  id="has_pricing"
                  checked={draft.has_pricing ?? false}
                  onChange={(e) => setDraft((p) => ({ ...p, has_pricing: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="has_pricing" className="text-xs text-slate-400">Has pricing</label>
              </div>
            </>
          ) : (
            <>
              {displayAnalysis.company_name && (
                <span className="text-xs text-slate-400 font-semibold">{displayAnalysis.company_name}</span>
              )}
              {displayAnalysis.phone && (
                <a href={`tel:${displayAnalysis.phone}`} className="text-xs text-blue hover:underline">{displayAnalysis.phone}</a>
              )}
              {displayAnalysis.has_pricing !== undefined && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${displayAnalysis.has_pricing ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400"}`}>
                  {displayAnalysis.has_pricing ? "Pricing shown" : "No pricing found"}
                </span>
              )}
            </>
          )}
        </div>
      )}

      {/* Top 3 Wins / Biggest Win */}
      {top3.length > 0 ? (
        <div className="rounded-xl bg-slate-900 border border-white/10 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Your 3 Biggest Wins</p>
          <p className="text-xs text-slate-500 mb-4">These are the three issues most likely to be costing this business enquiries right now.</p>
          <div className="space-y-4">
            {top3.map((win, i) => (
              <div key={i} className={i < top3.length - 1 ? "pb-4 border-b border-white/8" : ""}>
                <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">
                  Win {i + 1} — {win.rule_name ?? `Rule ${win.rule}`}
                </p>
                {editing ? (
                  <div className="space-y-1 mt-1">
                    <textarea
                      value={win.impact}
                      onChange={(e) => updateTopWin(i, "impact", e.target.value)}
                      rows={2}
                      className={EDIT_INPUT}
                      placeholder="Impact"
                    />
                    <textarea
                      value={win.fix}
                      onChange={(e) => updateTopWin(i, "fix", e.target.value)}
                      rows={2}
                      className={EDIT_INPUT}
                      placeholder="Fix"
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-200 font-semibold">{win.impact}</p>
                    <p className="text-xs text-slate-400 mt-1"><span className="text-slate-300 font-semibold">Fix:</span> {win.fix}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-blue/10 border border-blue/20 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue mb-1">Biggest Win</p>
          {editing ? (
            <textarea
              value={draft.biggest_win}
              onChange={(e) => setDraft((p) => ({ ...p, biggest_win: e.target.value }))}
              rows={2}
              className={EDIT_INPUT}
            />
          ) : (
            <p className="text-sm text-slate-200">{displayAnalysis.biggest_win}</p>
          )}
        </div>
      )}

      {/* Rule results */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">22-Rule Scorecard</span>
          <button
            onClick={() => window.open(`/api/admin/preview-pdf?jobId=${jobId}`, "_blank")}
            className="text-xs text-blue hover:text-blue-dark transition-colors"
          >
            Preview PDF ↗
          </button>
        </div>
        <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
          {(editing ? draft : analysis).passes.map((r, i) => (
            <div key={`p-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center text-xs font-bold">✓</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">{r.rule_name ?? RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
                {editing ? (
                  <div className="space-y-1 mt-0.5">
                    <textarea rows={2} value={draft.passes[i]?.finding ?? ""} onChange={(e) => updateRuleResult("passes", i, "finding", e.target.value)} className={EDIT_INPUT} placeholder="Finding" />
                    <textarea rows={1} value={draft.passes[i]?.rationale ?? ""} onChange={(e) => updateRuleResult("passes", i, "rationale", e.target.value)} className={EDIT_INPUT} placeholder="Rationale" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
                    {r.rationale && <p className="text-xs text-slate-600 mt-0.5 italic">{r.rationale}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
          {(editing ? draft : analysis).fails.map((r, i) => (
            <div key={`f-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-red-900/50 text-red-400 flex items-center justify-center text-xs font-bold">✗</span>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300">{r.rule_name ?? RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
                {editing ? (
                  <div className="space-y-1 mt-0.5">
                    <textarea rows={2} value={draft.fails[i]?.finding ?? ""} onChange={(e) => updateRuleResult("fails", i, "finding", e.target.value)} className={EDIT_INPUT} placeholder="Finding" />
                    <textarea rows={1} value={draft.fails[i]?.rationale ?? ""} onChange={(e) => updateRuleResult("fails", i, "rationale", e.target.value)} className={EDIT_INPUT} placeholder="Rationale" />
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
                    {r.rationale && <p className="text-xs text-slate-600 mt-0.5 italic">{r.rationale}</p>}
                  </>
                )}
              </div>
            </div>
          ))}
          {((editing ? draft : analysis).unable_to_assess ?? []).map((r) => (
            <div key={`u-${r.rule}`} className="flex items-start gap-3 px-4 py-2.5 opacity-50">
              <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold">–</span>
              <div>
                <p className="text-xs font-semibold text-slate-400">{r.rule_name ?? RULE_NAMES[r.rule] ?? `Rule ${r.rule}`}</p>
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
            <p className={EDIT_LABEL}>Headline</p>
            {editing ? (
              <input type="text" value={draft.rewritten_copy.headline} onChange={(e) => updateCopy("headline", e.target.value)} className={EDIT_INPUT} />
            ) : (
              <p className="text-sm font-bold text-[white]">{copy.headline}</p>
            )}
          </div>
          <div>
            <p className={EDIT_LABEL}>Subheadline</p>
            {editing ? (
              <textarea rows={2} value={draft.rewritten_copy.subheadline} onChange={(e) => updateCopy("subheadline", e.target.value)} className={EDIT_INPUT} />
            ) : (
              <p className="text-sm text-slate-300">{copy.subheadline}</p>
            )}
          </div>
          {/* problem_section = external/factual problem (situational events)
              sound_familiar  = internal/emotional problem (how it feels) — must NOT restate problem_section */}
          <div>
            <p className={EDIT_LABEL}>Problem Section</p>
            <ul className="space-y-1">
              {copy.problem_section.map((pt, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <span className="text-blue font-bold flex-shrink-0">•</span>
                  {editing ? (
                    <textarea rows={1} value={draft.rewritten_copy.problem_section[i] ?? ""} onChange={(e) => updateCopyArray("problem_section", i, e.target.value)} className={EDIT_INPUT} />
                  ) : pt}
                </li>
              ))}
            </ul>
          </div>

          {copy.sound_familiar && copy.sound_familiar.length > 0 && (
            <div>
              <p className={EDIT_LABEL}>Sound Familiar?</p>
              <ul className="space-y-1">
                {copy.sound_familiar.map((pt, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-400">
                    <span className="text-slate-500 font-bold flex-shrink-0">→</span>
                    {editing ? (
                      <textarea rows={1} value={draft.rewritten_copy.sound_familiar?.[i] ?? ""} onChange={(e) => updateCopyArray("sound_familiar", i, e.target.value)} className={EDIT_INPUT} />
                    ) : (
                      <span className="italic">"{pt}"</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <p className={EDIT_LABEL}>Primary CTA</p>
            {editing ? (
              <input type="text" value={draft.rewritten_copy.primary_cta} onChange={(e) => updateCopy("primary_cta", e.target.value)} className={EDIT_INPUT} />
            ) : (
              <span className="inline-block bg-blue text-[white] text-xs font-bold px-3 py-1.5 rounded-lg">{copy.primary_cta}</span>
            )}
          </div>

          {copy.section_headings && Object.keys(copy.section_headings).length > 0 && (
            <div>
              <p className={EDIT_LABEL}>Suggested Section Headings</p>
              <div className="space-y-1">
                {HEADING_ORDER.filter(k => copy.section_headings?.[k]).map(k => (
                  <div key={k} className="flex items-start gap-2">
                    <span className="text-xs text-slate-500 capitalize w-20 flex-shrink-0 pt-1">{k.replace("_", " ")}:</span>
                    {editing ? (
                      <input type="text" value={draft.rewritten_copy.section_headings?.[k] ?? ""} onChange={(e) => updateSectionHeading(k, e.target.value)} className={EDIT_INPUT} />
                    ) : (
                      <span className="text-sm text-slate-300">{copy.section_headings![k]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {copy.solution_bullets && copy.solution_bullets.length > 0 && (
            <div>
              <p className={EDIT_LABEL}>Solution Bullets</p>
              <ol className="space-y-1 list-decimal list-inside">
                {copy.solution_bullets.map((bullet, i) => (
                  <li key={i} className="text-sm text-slate-300">
                    {editing ? (
                      <textarea rows={1} value={draft.rewritten_copy.solution_bullets?.[i] ?? ""} onChange={(e) => updateCopyArray("solution_bullets", i, e.target.value)} className={EDIT_INPUT} />
                    ) : bullet}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div>
            <p className={EDIT_LABEL}>Testimonial Suggestions</p>
            <div className="space-y-2">
              {copy.testimonial_suggestions.map((s, i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/10 px-3 py-2">
                  <p className="text-xs text-slate-500 mb-0.5">Suggestion {i + 1}</p>
                  {editing ? (
                    <textarea rows={2} value={draft.rewritten_copy.testimonial_suggestions[i] ?? ""} onChange={(e) => updateCopyArray("testimonial_suggestions", i, e.target.value)} className={EDIT_INPUT} />
                  ) : (
                    <p className="text-xs text-slate-300 italic">"{s}"</p>
                  )}
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
  onGenerateHtml,
  onRerun,
  onSaveAnalysis,
  analysingId,
  approvingId,
  generatingHtmlId,
  savingAnalysisId,
}: {
  job: Job;
  expanded: boolean;
  onToggle: () => void;
  onAnalyse: (id: string) => void;
  onApprove: (id: string) => void;
  onGenerateHtml: (id: string) => void;
  onRerun: (id: string, notes: string) => void;
  onSaveAnalysis: (id: string, analysis: FullAnalysis) => Promise<void>;
  analysingId: string | null;
  approvingId: string | null;
  generatingHtmlId: string | null;
  savingAnalysisId: string | null;
}) {
  const isAnalysing = analysingId === job.id || job.status === "analysing";
  const isApproving = approvingId === job.id;
  const isGeneratingHtml = generatingHtmlId === job.id;
  const [notes, setNotes] = useState("");

  const isUpgradeJob =
    job.tier === "html" &&
    !!job.full_analysis &&
    (job.status === "pending" || job.status === "error");

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
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${job.tier === "html" ? "bg-blue/20 text-blue" : "bg-slate-700 text-slate-300"}`}>
              {job.tier === "html" ? "Report + Homepage — £99" : "Full Report — £49"}
            </span>
          </div>
          <p className="font-semibold text-[white] text-sm truncate">{job.url}</p>
          <p className="text-xs text-slate-500 mt-0.5">{job.email} · {new Date(job.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isUpgradeJob ? (
            <button
              onClick={(e) => { e.stopPropagation(); onGenerateHtml(job.id); }}
              disabled={isGeneratingHtml}
              className="px-3 py-1.5 rounded-lg bg-blue hover:bg-blue-dark text-[white] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isGeneratingHtml ? "Sending…" : "Generate & Send HTML"}
            </button>
          ) : (job.status === "pending" || job.status === "error") ? (
            <button
              onClick={(e) => { e.stopPropagation(); onAnalyse(job.id); }}
              disabled={isAnalysing}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[white] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {isAnalysing ? "Running…" : "Run Analysis"}
            </button>
          ) : null}
          {job.status === "review" && (
            <button
              onClick={(e) => { e.stopPropagation(); onApprove(job.id); }}
              disabled={isApproving}
              className={`px-3 py-1.5 rounded-lg text-[white] text-xs font-semibold transition-colors disabled:opacity-50 ${job.tier === "html" ? "bg-blue-600 hover:bg-blue-500" : "bg-emerald-600 hover:bg-emerald-500"}`}
            >
              {isApproving ? "Sending…" : job.tier === "html" ? "Approve & Send HTML" : "Approve & Send"}
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
                <p className="text-xs text-slate-500 pt-1">Running full 22-rule analysis with Claude Opus — this takes 1–2 minutes…</p>
              </div>
            </div>
          )}
          {job.full_analysis && !isAnalysing && (
            <>
              <AnalysisPanel
                analysis={job.full_analysis}
                jobId={job.id}
                isHtmlTier={job.tier === "html"}
                onSave={(updated) => onSaveAnalysis(job.id, updated)}
                savingAnalysis={savingAnalysisId === job.id}
              />
              {job.tier === "html" && job.html_output && (
                <div className="mt-5">
                  <HtmlPreviewPanel htmlOutput={job.html_output} />
                </div>
              )}
              {job.tier === "html" && !job.html_output && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-amber-900/20 border border-amber-500/20 text-amber-400 text-xs">
                  HTML not generated yet — re-run analysis to generate it.
                </div>
              )}

              {/* Re-run section */}
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Re-run Analysis</p>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional reviewer notes — e.g. 'The testimonials were missed, there are two on the page. Make the tone less formal.'"
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[white] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue resize-none"
                />
                <button
                  onClick={() => { onRerun(job.id, notes); setNotes(""); }}
                  disabled={isAnalysing}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-[white] text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isAnalysing ? "Running…" : "Re-run Analysis"}
                </button>
              </div>

              {/* Version history */}
              {job.analysis_history && job.analysis_history.length > 0 && (
                <details className="mt-4 pt-4 border-t border-white/10">
                  <summary className="text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer select-none">
                    Previous versions ({job.analysis_history.length})
                  </summary>
                  <div className="mt-3 space-y-2">
                    {job.analysis_history.map((prev, i) => (
                      <details key={i} className="rounded-lg border border-white/10 overflow-hidden">
                        <summary className="px-3 py-2 bg-white/5 text-xs text-slate-400 cursor-pointer select-none">
                          Version {i + 1} — {prev.grade} {prev.score}/{prev.out_of}
                          {prev.company_name ? ` — ${prev.company_name}` : ""}
                        </summary>
                        <pre className="p-3 text-xs text-slate-500 overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap break-words">
                          {JSON.stringify(prev, null, 2)}
                        </pre>
                      </details>
                    ))}
                  </div>
                </details>
              )}
            </>
          )}
          {!job.full_analysis && !isAnalysing && (
            <div className="border-t border-white/10 pt-5">
              <p className="text-sm text-slate-500">No analysis yet.</p>
            </div>
          )}
          {/* Resend for sent jobs */}
          {job.status === "sent" && job.full_analysis && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (job.tier === "html") {
                    onGenerateHtml(job.id);
                  } else {
                    onApprove(job.id);
                  }
                }}
                disabled={isApproving || isGeneratingHtml}
                className="px-3 py-1.5 rounded-lg border border-white/20 text-slate-400 hover:text-[white] text-xs font-semibold transition-colors disabled:opacity-50"
              >
                {(isApproving || isGeneratingHtml) ? "Resending…" : "Resend email"}
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
  const [generatingHtmlId, setGeneratingHtmlId] = useState<string | null>(null);
  const [savingAnalysisId, setSavingAnalysisId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "review" | "sent">("all");
  const [testJobOpen, setTestJobOpen] = useState(false);
  const [testUrl, setTestUrl] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testTier, setTestTier] = useState<"report" | "html">("html");
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

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
    const interval = setInterval(fetchJobs, 15000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function handleRerun(jobId: string, notes: string) {
    setAnalysingId(jobId);
    setActionError(null);
    setExpandedJob(jobId);
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: "analysing" } : j))
    );
    try {
      const res = await fetch("/api/admin/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, notes: notes || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Analysis failed");
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, status: "error" } : j))
        );
      } else {
        await fetchJobs();
      }
    } catch {
      setActionError("Network error during analysis");
    } finally {
      setAnalysingId(null);
    }
  }

  async function handleAnalyse(jobId: string) {
    return handleRerun(jobId, "");
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

  async function handleGenerateHtml(jobId: string) {
    setGeneratingHtmlId(jobId);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/generate-html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Generate & send failed");
      } else {
        await fetchJobs();
      }
    } catch {
      setActionError("Network error while generating HTML");
    } finally {
      setGeneratingHtmlId(null);
    }
  }

  async function handleUpdateAnalysis(jobId: string, analysis: FullAnalysis) {
    setSavingAnalysisId(jobId);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/update-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, analysis }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error ?? "Save failed");
        throw new Error(data.error);
      }
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, full_analysis: analysis } : j))
      );
    } finally {
      setSavingAnalysisId(null);
    }
  }

  async function handleCreateTestJob(e: React.FormEvent) {
    e.preventDefault();
    setTestLoading(true);
    setTestError(null);
    try {
      const res = await fetch("/api/admin/create-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: testUrl, email: testEmail, tier: testTier }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTestUrl("");
      setTestEmail("");
      setTestJobOpen(false);
      setFilter("pending");
      await fetchJobs();
      setExpandedJob(data.jobId);
    } catch (err) {
      setTestError(err instanceof Error ? err.message : "Failed to create job");
    } finally {
      setTestLoading(false);
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
    <div className="admin-panel min-h-screen bg-slate-950 text-[white]">
      {/* Header */}
      <header className="border-b border-white/10 sticky top-0 bg-slate-950/95 backdrop-blur-sm z-10">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-base font-black tracking-tight">
              Grade<span className="text-blue">My</span>Site
              <span className="text-slate-500 font-normal text-sm ml-1.5">Admin</span>
            </span>
            {reviewCount > 0 && (
              <span className="bg-blue text-[white] text-xs font-bold px-2 py-0.5 rounded-full">
                {reviewCount} to review
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchJobs}
              className="text-xs text-slate-400 hover:text-[white] transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-[white] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8">
        {/* Test job creator */}
        <div className="mb-6 rounded-xl border border-dashed border-white/20 overflow-hidden">
          <button
            onClick={() => setTestJobOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-slate-400 hover:text-[white] transition-colors"
          >
            <span>⚙ Create test job (bypass payment)</span>
            <span>{testJobOpen ? "▲" : "▼"}</span>
          </button>
          {testJobOpen && (
            <form onSubmit={handleCreateTestJob} className="px-4 pb-4 flex flex-col sm:flex-row gap-2">
              <input
                required
                type="text"
                placeholder="URL (e.g. grademy.site)"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[white] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue"
              />
              <input
                required
                type="email"
                placeholder="Email for delivery"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[white] placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue"
              />
              <select
                value={testTier}
                onChange={(e) => setTestTier(e.target.value as "report" | "html")}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-[white] focus:outline-none focus:ring-1 focus:ring-blue"
              >
                <option value="report">£49 report</option>
                <option value="html">£99 Homepage</option>
              </select>
              <button
                type="submit"
                disabled={testLoading}
                className="px-4 py-2 rounded-lg bg-blue hover:bg-blue-dark text-[white] text-sm font-semibold transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {testLoading ? "Creating…" : "Create & open"}
              </button>
              {testError && <p className="text-red-400 text-xs mt-1 w-full">{testError}</p>}
            </form>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "review", "sent"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                filter === f
                  ? "bg-[white] text-slate-900"
                  : "bg-white/5 text-slate-400 hover:text-[white]"
              }`}
            >
              {f}
              {f === "pending" && pendingCount > 0 && (
                <span className="ml-1.5 bg-amber-500 text-[white] text-xs rounded-full px-1.5">{pendingCount}</span>
              )}
              {f === "review" && reviewCount > 0 && (
                <span className="ml-1.5 bg-blue text-[white] text-xs rounded-full px-1.5">{reviewCount}</span>
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
              onGenerateHtml={handleGenerateHtml}
              onRerun={handleRerun}
              onSaveAnalysis={handleUpdateAnalysis}
              analysingId={analysingId}
              approvingId={approvingId}
              generatingHtmlId={generatingHtmlId}
              savingAnalysisId={savingAnalysisId}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

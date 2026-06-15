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

const GRADE_COLOURS: Record<string, string> = {
  A: "#10b981",
  B: "#3b82f6",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

function ruleRow(r: RuleResult, pass: boolean): string {
  const icon = pass ? "✓" : "✗";
  const colour = pass ? "#10b981" : "#ef4444";
  const name = RULE_NAMES[r.rule] ?? `Rule ${r.rule}`;
  return `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:24px;">
        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${pass ? "#dcfce7" : "#fee2e2"};color:${colour};font-weight:700;font-size:11px;text-align:center;line-height:20px;">${icon}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <div style="font-size:13px;font-weight:600;color:#374151;margin-bottom:2px;">Rule ${r.rule} — ${name}</div>
        <div style="font-size:13px;color:#6b7280;">${r.finding}</div>
      </td>
    </tr>`;
}

export function buildReportEmail(
  url: string,
  tier: "report" | "html",
  analysis: FullAnalysis,
  screenshotUrl?: string | null
): { subject: string; html: string } {
  const gradeColour = GRADE_COLOURS[analysis.grade] ?? "#64748b";
  const copy = analysis.rewritten_copy;

  const passRows = analysis.passes.map((r) => ruleRow(r, true)).join("");
  const failRows = analysis.fails.map((r) => ruleRow(r, false)).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="margin-bottom:24px;">
    <span style="font-size:18px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">
      Grade<span style="color:#f97316;">My</span>Site
    </span>
  </div>

  <!-- Score card -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:16px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="vertical-align:top;padding-right:${screenshotUrl ? "16px" : "0"};">
          <table style="border-collapse:collapse;margin-bottom:16px;">
            <tr>
              <td style="vertical-align:middle;padding-right:16px;">
                <div style="width:72px;height:72px;border-radius:16px;background:${gradeColour};font-size:36px;font-weight:900;color:#ffffff;text-align:center;line-height:72px;">
                  ${analysis.grade}
                </div>
              </td>
              <td style="vertical-align:middle;">
                <div style="font-size:28px;font-weight:900;color:#0f172a;">${analysis.score}<span style="font-size:16px;font-weight:400;color:#94a3b8;">/${analysis.out_of}</span></div>
                <div style="font-size:13px;color:#64748b;">conversion rules passed</div>
              </td>
            </tr>
          </table>
          <p style="margin:0;font-size:15px;color:#374151;font-weight:500;">${analysis.headline}</p>
        </td>
        ${screenshotUrl ? `
        <td style="vertical-align:top;width:160px;">
          <img src="${screenshotUrl}" width="160" alt="Homepage screenshot" style="display:block;border-radius:8px;border:1px solid #e2e8f0;width:160px;">
          <div style="font-size:10px;color:#94a3b8;margin-top:4px;text-align:center;">Homepage at time of scan</div>
        </td>` : ""}
      </tr>
    </table>
  </div>

  <!-- Biggest win -->
  <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#f97316;margin-bottom:6px;">Biggest Quick Win</div>
    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${analysis.biggest_win}</p>
  </div>

  <!-- Rule scorecard -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:16px;">
    <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">20-Rule Scorecard</span>
    </div>
    <table style="width:100%;border-collapse:collapse;">
      ${passRows}
      ${failRows}
    </table>
  </div>

  <!-- Rewritten copy -->
  <div style="background:#0f172a;border-radius:16px;padding:28px;margin-bottom:16px;color:#ffffff;">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:16px;">Rewritten Copy — Ready to Use</div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#f97316;margin-bottom:6px;">New Headline</div>
      <div style="font-size:20px;font-weight:800;color:#ffffff;">${copy.headline}</div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#f97316;margin-bottom:6px;">Subheadline</div>
      <div style="font-size:15px;color:#cbd5e1;">${copy.subheadline}</div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#f97316;margin-bottom:8px;">Problem Section (3 Pain Points)</div>
      ${copy.problem_section
        .map(
          (pt) => `<div style="display:flex;gap:8px;margin-bottom:6px;">
        <span style="color:#f97316;font-weight:700;flex-shrink:0;">•</span>
        <span style="font-size:14px;color:#cbd5e1;">${pt}</span>
      </div>`
        )
        .join("")}
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#f97316;margin-bottom:6px;">Primary CTA</div>
      <div style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;">${copy.primary_cta}</div>
    </div>

    <div>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#f97316;margin-bottom:8px;">Testimonial Suggestions (ask your customers)</div>
      ${copy.testimonial_suggestions
        .map(
          (s, i) => `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px 14px;margin-bottom:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Suggestion ${i + 1}</div>
        <div style="font-size:13px;color:#e2e8f0;font-style:italic;">"${s}"</div>
      </div>`
        )
        .join("")}
    </div>
  </div>

  ${
    tier === "html"
      ? `<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#3b82f6;margin-bottom:6px;">HTML Page</div>
    <p style="margin:0;font-size:14px;color:#1e40af;">Your ready-to-build HTML homepage is being prepared and will be sent in a follow-up email shortly.</p>
  </div>`
      : ""
  }

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      GradeMysite &middot; One-time report for <strong>${url}</strong><br>
      Questions? Reply to this email.
    </p>
  </div>

</div>
</body>
</html>`;

  return {
    subject: `Your Grade My Site Report — ${analysis.score}/${analysis.out_of} rules passed`,
    html,
  };
}

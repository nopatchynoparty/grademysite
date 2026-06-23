import {
  type RuleResult,
  type TopWin,
  type RewrittenCopy,
  type FullAnalysis,
  GRADE_COLOURS,
  getRuleName,
} from "@/lib/rules";

const HEADING_ORDER = ["hero", "problem", "solution", "social_proof", "cta"];

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ruleCell(r: RuleResult, pass: boolean): string {
  const icon = pass ? "✓" : "✗";
  const colour = pass ? "#10b981" : "#ef4444";
  const bg = pass ? "#dcfce7" : "#fee2e2";
  const name = getRuleName(r);
  return `<div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <span style="display:inline-flex;flex-shrink:0;width:18px;height:18px;border-radius:50%;background:${bg};color:${colour};font-weight:700;font-size:10px;align-items:center;justify-content:center;margin-top:1px;">${icon}</span>
      <div>
        <div style="font-size:12px;font-weight:600;color:#374151;margin-bottom:2px;">${esc(name)}</div>
        <div style="font-size:12px;color:#6b7280;">${esc(r.finding)}</div>
        ${r.rationale ? `<div style="font-size:11px;color:#9ca3af;margin-top:3px;font-style:italic;">${esc(r.rationale)}</div>` : ""}
      </div>
    </div>
  </div>`;
}

function unableCell(r: RuleResult): string {
  const name = getRuleName(r);
  return `<div style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
    <div style="display:flex;align-items:flex-start;gap:10px;">
      <span style="display:inline-flex;flex-shrink:0;width:18px;height:18px;border-radius:50%;background:#f1f5f9;color:#9ca3af;font-weight:700;font-size:10px;align-items:center;justify-content:center;margin-top:1px;">–</span>
      <div>
        <div style="font-size:12px;font-weight:600;color:#9ca3af;margin-bottom:2px;">${esc(name)}</div>
        <div style="font-size:12px;color:#9ca3af;">${esc(r.finding)}</div>
      </div>
    </div>
  </div>`;
}

export function buildHtmlDeliveryEmail(
  url: string,
  analysis: FullAnalysis,
  screenshotUrl?: string | null
): { subject: string; html: string } {
  const copy = analysis.rewritten_copy;
  const displayUrl = url.replace(/^https?:\/\//, "");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="margin-bottom:24px;display:flex;align-items:center;gap:8px;">
    <img src="https://grademy.site/logo.svg" alt="" width="28" height="28" style="display:block;flex-shrink:0;">
    <span style="font-size:18px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">
      Grade<span style="color:#3B6CF4;">My</span>Site
    </span>
  </div>

  <!-- URL label -->
  <div style="margin-bottom:16px;">
    <p style="margin:0;font-size:13px;color:#64748b;">Your report for: <strong style="color:#0f172a;">${esc(displayUrl)}</strong></p>
  </div>

  <!-- Main delivery block -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#3B6CF4;margin-bottom:10px;">Your report and new homepage are attached</div>
    <p style="margin:0 0 12px;font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;">Your full report and HTML homepage are ready.</p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">Two files are attached to this email:</p>
    <ul style="margin:0 0 20px;padding:0 0 0 20px;">
      <li style="font-size:14px;color:#374151;margin-bottom:6px;"><strong>Your full report</strong> — all 22 rules checked, with rewritten copy ready to use</li>
      <li style="font-size:14px;color:#374151;"><strong>Your new homepage</strong> — a complete HTML file for your developer to drop straight in</li>
    </ul>
    <div style="background:#f1f5f9;border-radius:10px;padding:16px 18px;margin-bottom:0;">
      <p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.06em;">Note for your developer</p>
      <p style="margin:0;font-size:14px;color:#1e293b;line-height:1.6;font-style:italic;">"Please replace my current homepage with the attached HTML file. The copy is already written — just add a real photo in the hero section, replace the testimonial placeholders with real quotes, and update the pricing tiers and contact links before going live."</p>
    </div>
  </div>

  ${screenshotUrl ? `
  <!-- Screenshot of current site -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:12px;">Your current homepage</div>
    <img src="${screenshotUrl}" alt="Current homepage screenshot" style="display:block;width:100%;max-width:100%;border-radius:8px;border:1px solid #e2e8f0;">
    <div style="font-size:10px;color:#94a3b8;margin-top:6px;text-align:center;">${esc(displayUrl)} at time of scan</div>
  </div>` : ""}

  <!-- Copy reminder -->
  <div style="background:#0f172a;border-radius:16px;padding:24px;margin-bottom:16px;color:#ffffff;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:14px;">Key copy in the HTML file</div>
    <div style="margin-bottom:14px;">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:4px;">Headline</div>
      <div style="font-size:16px;font-weight:800;color:#ffffff;">${esc(copy.headline)}</div>
    </div>
    <div style="margin-bottom:14px;">
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:4px;">Subheadline</div>
      <div style="font-size:13px;color:#cbd5e1;">${esc(copy.subheadline)}</div>
    </div>
    <div>
      <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:4px;">Primary button</div>
      <div style="display:inline-block;background:#3B6CF4;color:#ffffff;font-weight:700;font-size:13px;padding:8px 16px;border-radius:7px;">${esc(copy.primary_cta)}</div>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      GradeMysite &middot; Delivered for <strong>${esc(displayUrl)}</strong><br>
      Questions? Reply to this email.
    </p>
  </div>

</div>
</body>
</html>`;

  return {
    subject: `Your Grade My Site report + new homepage are ready — ${displayUrl}`,
    html,
  };
}

export function buildReportEmail(
  url: string,
  tier: "report" | "html",
  analysis: FullAnalysis,
  screenshotUrl?: string | null,
  options?: { jobId?: string; baseUrl?: string }
): { subject: string; html: string } {
  const gradeColour = GRADE_COLOURS[analysis.grade] ?? "#64748b";
  const copy = analysis.rewritten_copy;
  const jobId = options?.jobId;
  const baseUrl = options?.baseUrl ?? "https://grademy.site";
  const displayUrl = url.replace(/^https?:\/\//, "");

  const passCells = analysis.passes.map((r) => ruleCell(r, true)).join("");
  const failCells = analysis.fails.map((r) => ruleCell(r, false)).join("");
  const unableCells = (analysis.unable_to_assess ?? []).map((r) => unableCell(r)).join("");

  const top3 = (analysis.top_3_wins ?? []).filter(Boolean);

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<div style="max-width:600px;margin:0 auto;padding:32px 16px;">

  <!-- Header -->
  <div style="margin-bottom:20px;display:flex;align-items:center;gap:8px;">
    <img src="${baseUrl}/logo.svg" alt="" width="28" height="28" style="display:block;flex-shrink:0;">
    <span style="font-size:18px;font-weight:900;color:#0f172a;letter-spacing:-0.5px;">
      Grade<span style="color:#3B6CF4;">My</span>Site
    </span>
  </div>

  <!-- URL label -->
  <div style="margin-bottom:16px;">
    <p style="margin:0;font-size:13px;color:#64748b;">Your report for: <strong style="color:#0f172a;">${esc(displayUrl)}</strong></p>
  </div>

  ${
    tier === "html"
      ? `<!-- HTML file explanation block -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#3B6CF4;margin-bottom:8px;">Your new homepage is attached</div>
    <p style="margin:0 0 8px;font-size:14px;color:#1e40af;font-weight:600;">Attached to this email is your new homepage as an HTML file.</p>
    <p style="margin:0;font-size:14px;color:#1e40af;">Send it to your web developer with this note: <em>"Please replace my current homepage with this file. All the copy is already written — just update the prices, add a photo, and add real customer testimonials before going live."</em></p>
  </div>`
      : ""
  }

  <!-- Score card -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;margin-bottom:16px;">
    <!-- Grade and score -->
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;">
      <div style="width:72px;height:72px;border-radius:16px;background:${gradeColour};font-size:36px;font-weight:900;color:#ffffff;text-align:center;line-height:72px;flex-shrink:0;">
        ${analysis.grade}
      </div>
      <div>
        <div style="font-size:28px;font-weight:900;color:#0f172a;">${analysis.score}<span style="font-size:16px;font-weight:400;color:#94a3b8;">/${analysis.out_of}</span></div>
        <div style="font-size:13px;color:#64748b;">rules passed</div>
      </div>
    </div>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;font-weight:500;">${esc(analysis.headline)}</p>
    ${screenshotUrl ? `
    <!-- Screenshot below grade on mobile-friendly layout -->
    <div style="margin-top:8px;">
      <img src="${screenshotUrl}" alt="Homepage screenshot" style="display:block;width:100%;max-width:100%;border-radius:8px;border:1px solid #e2e8f0;">
      <div style="font-size:10px;color:#94a3b8;margin-top:4px;text-align:center;">${esc(displayUrl)} at time of scan</div>
    </div>` : ""}
  </div>

  ${top3.length > 0 ? `
  <!-- 3 Biggest Wins -->
  <div style="background:#0f172a;border-radius:16px;padding:24px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:14px;">Your 3 Biggest Wins</div>
    <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;">${["C", "D", "F"].includes(analysis.grade) ? "These are the three issues most likely to be costing you enquiries right now — and the fastest way to a better grade." : "These are the three issues most likely to be costing you enquiries right now."}</p>
    ${top3.map((win, i) => `
    <div style="margin-bottom:${i < top3.length - 1 ? "16px" : "0"};padding-bottom:${i < top3.length - 1 ? "16px" : "0"};border-bottom:${i < top3.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none"};">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:6px;">Win ${i + 1} — ${esc(win.rule_name ?? `Rule ${win.rule}`)}</div>
      <p style="margin:0 0 6px;font-size:14px;color:#f1f5f9;font-weight:600;">${esc(win.impact)}</p>
      <p style="margin:0;font-size:13px;color:#94a3b8;"><strong style="color:#cbd5e1;">Fix:</strong> ${esc(win.fix)}</p>
    </div>`).join("")}
  </div>` : `
  <!-- Biggest win (fallback when top_3_wins not present) -->
  <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:20px;margin-bottom:16px;">
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#3B6CF4;margin-bottom:6px;">Biggest Quick Win</div>
    <p style="margin:0;font-size:14px;color:#1e293b;font-weight:500;">${esc(analysis.biggest_win)}</p>
  </div>`}

  <!-- Rule scorecard — single column -->
  <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;margin-bottom:16px;">
    <div style="padding:16px 20px;border-bottom:1px solid #f1f5f9;">
      <span style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;">22-Rule Scorecard</span>
      <div style="font-size:12px;color:#94a3b8;margin-top:4px;">We checked your site against 22 rules. <a href="https://grademy.site/rules" style="color:#3B6CF4;text-decoration:none;">See what each rule checks and why it matters →</a></div>
    </div>
    <div style="padding:16px 20px;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#10b981;margin-bottom:10px;">What's working ✓</div>
      ${passCells || '<p style="font-size:12px;color:#9ca3af;margin:0;">No rules passed</p>'}
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#ef4444;margin-top:20px;margin-bottom:10px;">What needs fixing ✗</div>
      ${failCells || '<p style="font-size:12px;color:#9ca3af;margin:0;">No issues found</p>'}
      ${unableCells ? `
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9ca3af;margin-top:20px;margin-bottom:10px;">What we couldn't check –</div>
      ${unableCells}` : ""}
    </div>
  </div>

  <!-- Rewritten copy -->
  <div style="background:#0f172a;border-radius:16px;padding:28px;margin-bottom:16px;color:#ffffff;">
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#64748b;margin-bottom:16px;">Rewritten Copy — Ready to Use</div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:6px;">New Headline</div>
      <div style="font-size:10px;color:#9ca3af;margin-top:2px;margin-bottom:6px;">The main text at the top of your page — what visitors read first</div>
      <div style="font-size:20px;font-weight:800;color:#ffffff;">${esc(copy.headline)}</div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:6px;">Subheadline</div>
      <div style="font-size:15px;color:#cbd5e1;">${esc(copy.subheadline)}</div>
    </div>

    <!-- problem_section = external/factual problem (situational events) -->
    <!-- sound_familiar  = internal/emotional problem (how it feels) — must NOT restate problem_section -->
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:8px;">Problem section (3 pain points)</div>
      ${copy.problem_section
        .map(
          (pt) => `<div style="display:flex;gap:8px;margin-bottom:6px;">
        <span style="color:#3B6CF4;font-weight:700;flex-shrink:0;">•</span>
        <span style="font-size:14px;color:#cbd5e1;">${esc(pt)}</span>
      </div>`
        )
        .join("")}
    </div>

    ${copy.sound_familiar && copy.sound_familiar.length > 0 ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:8px;">Sound familiar? (website visitors are thinking this)</div>
      ${copy.sound_familiar
        .map(
          (pt) => `<div style="display:flex;gap:8px;margin-bottom:6px;">
        <span style="color:#64748b;font-weight:700;flex-shrink:0;">→</span>
        <span style="font-size:14px;color:#94a3b8;font-style:italic;">"${esc(pt)}"</span>
      </div>`
        )
        .join("")}
    </div>` : ""}

    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:6px;">Primary button text</div>
      <div style="display:inline-block;background:#3B6CF4;color:#ffffff;font-weight:700;font-size:14px;padding:10px 20px;border-radius:8px;">${esc(copy.primary_cta)}</div>
    </div>

    ${copy.section_headings ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:8px;">Suggested section headings</div>
      ${HEADING_ORDER.filter(k => copy.section_headings?.[k]).map(k =>
        `<div style="display:flex;gap:8px;margin-bottom:6px;">
        <span style="font-size:11px;font-weight:600;color:#475569;flex-shrink:0;width:80px;text-transform:capitalize;">${esc(k.replace("_", " "))}:</span>
        <span style="font-size:13px;color:#e2e8f0;">${esc(copy.section_headings![k] ?? "")}</span>
      </div>`
      ).join("")}
    </div>` : ""}

    ${copy.solution_bullets && copy.solution_bullets.length > 0 ? `
    <div style="margin-bottom:20px;">
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:8px;">Why customers choose you</div>
      <div style="font-size:12px;color:#64748b;margin-bottom:8px;">Three specific reasons a customer should pick you over a competitor — pulled from what's already on your page.</div>
      ${copy.solution_bullets.map((bullet, i) => `
      <div style="display:flex;gap:8px;margin-bottom:6px;">
        <span style="color:#3B6CF4;font-weight:700;flex-shrink:0;font-size:11px;">${i + 1}.</span>
        <span style="font-size:14px;color:#cbd5e1;">${esc(bullet)}</span>
      </div>`).join("")}
    </div>` : ""}

    <div>
      <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;color:#3B6CF4;margin-bottom:8px;">Testimonial prompts (ask your customers)</div>
      ${copy.testimonial_suggestions
        .map(
          (s, i) => `<div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;padding:12px 14px;margin-bottom:8px;">
        <div style="font-size:11px;color:#64748b;margin-bottom:4px;">Prompt ${i + 1}</div>
        <div style="font-size:13px;color:#e2e8f0;font-style:italic;">"${esc(s)}"</div>
      </div>`
        )
        .join("")}
    </div>
  </div>

  ${
    tier === "report"
      ? `<!-- Coming soon note — report tier only -->
  <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;">Like the rewritten copy above? We can turn it into a complete, ready-to-build homepage file — styled in your colours, your fonts, your logo. Reply to this email to be first to know when we launch.</p>`
      : ""
  }

  <!-- PDF note -->
  <p style="margin:0 0 16px;font-size:13px;color:#64748b;line-height:1.6;text-align:center;">A printable PDF version of this report is attached — perfect for handing to a developer.</p>

  <!-- Footer -->
  <div style="text-align:center;padding:16px 0;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">
      GradeMysite &middot; Report for <strong>${esc(displayUrl)}</strong><br>
      Questions? Reply to this email.
    </p>
  </div>

</div>
</body>
</html>`;

  return {
    subject: `Your Grade My Site report — ${analysis.grade} grade (${analysis.score}/${analysis.out_of} rules passed) — ${displayUrl}`,
    html,
  };
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildReportEmail } from "@/lib/reportEmail";
import { generateReportPdf } from "@/lib/pdfReport";
import { isAuthed } from "@/lib/adminAuth";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const { data: job, error: fetchError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (fetchError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "review") {
    return NextResponse.json(
      { error: `Job must be in 'review' status to approve (currently '${job.status}')` },
      { status: 409 }
    );
  }

  if (!job.full_analysis) {
    return NextResponse.json(
      { error: "No analysis found on this job — run analysis first" },
      { status: 400 }
    );
  }

  if (job.tier === "html" && !job.html_output) {
    return NextResponse.json(
      { error: "HTML output not yet generated — re-run analysis to generate it" },
      { status: 400 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://grademy.site";

  const { subject, html } = buildReportEmail(
    job.url,
    job.tier,
    job.full_analysis,
    job.screenshot_url ?? null,
    { jobId: job.id, baseUrl }
  );

  // Build domain-safe filename for HTML attachment
  let domain = "homepage";
  try {
    domain = new URL(job.url).hostname.replace(/\./g, "-");
  } catch {
    /* leave default */
  }

  const from = process.env.RESEND_FROM_EMAIL ?? "GradeMysite <reports@grademy.site>";

  const pdfBuffer = await generateReportPdf(job.url, job.full_analysis, job.tier, job.screenshot_url ?? null);
  const attachments: { filename: string; content: Buffer }[] = [
    { filename: `grademysite-report-${domain}.pdf`, content: pdfBuffer },
  ];
  if (job.tier === "html" && job.html_output) {
    attachments.push({
      filename: `grademysite-${domain}-homepage.html`,
      content: Buffer.from(job.html_output),
    });
  }

  const { error: emailError } = await resend.emails.send({
    from,
    to: job.email,
    subject,
    html,
    attachments,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json(
      { error: "Email delivery failed — check Resend logs." },
      { status: 500 }
    );
  }

  await supabase
    .from("jobs")
    .update({ status: "sent", updated_at: new Date().toISOString() })
    .eq("id", jobId);

  return NextResponse.json({ success: true });
}

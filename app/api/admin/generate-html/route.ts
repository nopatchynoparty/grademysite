import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateHtmlTemplate } from "@/lib/htmlTemplate";
import { buildHtmlDeliveryEmail } from "@/lib/reportEmail";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === process.env.ADMIN_PASSWORD;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

// Used when a job already has full_analysis (upgrade path) and just needs
// HTML generated and sent — skips Opus re-run and admin review step.
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
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

  if (!job.full_analysis) {
    return NextResponse.json(
      { error: "No analysis on this job — run analysis first" },
      { status: 400 }
    );
  }

  let htmlOutput: string;
  try {
    htmlOutput = generateHtmlTemplate(job.url, job.full_analysis);
  } catch (err) {
    console.error("HTML generation failed:", err);
    return NextResponse.json({ error: "HTML generation failed" }, { status: 500 });
  }

  let domain = "homepage";
  try { domain = new URL(job.url).hostname.replace(/\./g, "-"); } catch { /* leave default */ }

  const { subject, html } = buildHtmlDeliveryEmail(job.url, job.full_analysis);
  const from = process.env.RESEND_FROM_EMAIL ?? "GradeMysite <reports@grademy.site>";

  const { error: emailError } = await resend.emails.send({
    from,
    to: job.email,
    subject,
    html,
    attachments: [
      {
        filename: `grademysite-${domain}-homepage.html`,
        content: Buffer.from(htmlOutput),
      },
    ],
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
    .update({
      tier: "html",
      html_output: htmlOutput,
      status: "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", jobId);

  return NextResponse.json({ success: true });
}

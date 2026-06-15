import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { buildReportEmail } from "@/lib/reportEmail";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === process.env.ADMIN_PASSWORD;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

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

  const { subject, html } = buildReportEmail(job.url, job.tier, job.full_analysis, job.screenshot_url ?? null);

  const { error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "GradeMysite <reports@grademy.site>",
    to: job.email,
    subject,
    html,
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

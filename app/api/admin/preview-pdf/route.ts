import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateReportPdf } from "@/lib/pdfReport";
import { isAuthed } from "@/lib/adminAuth";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select("url, full_analysis, tier, screenshot_url")
    .eq("id", jobId)
    .single();

  if (error || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!job.full_analysis) {
    return NextResponse.json({ error: "No analysis on this job yet" }, { status: 400 });
  }

  try {
    const pdfBuffer = await generateReportPdf(job.url, job.full_analysis, job.tier, job.screenshot_url ?? null);
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=\"preview-report.pdf\"",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? `${e.message}\n${e.stack}` : String(e);
    console.error("PDF generation failed:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

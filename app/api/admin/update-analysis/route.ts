import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthed } from "@/lib/adminAuth";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId, analysis } = await req.json();

  if (!jobId || !analysis) {
    return NextResponse.json({ error: "jobId and analysis required" }, { status: 400 });
  }

  const { data: job } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", jobId)
    .single();

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from("jobs")
    .update({ full_analysis: analysis, updated_at: new Date().toISOString() })
    .eq("id", jobId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

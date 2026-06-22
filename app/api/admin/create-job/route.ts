import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAuthed } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { url, email, tier } = await req.json();
  if (!url || !email || !["report", "html"].includes(tier)) {
    return NextResponse.json({ error: "url, email, and tier (report|html) required" }, { status: 400 });
  }

  let normalised = url.trim();
  if (!/^https?:\/\//i.test(normalised)) normalised = `https://${normalised}`;

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("jobs")
    .insert({ url: normalised, email, tier, status: "pending", created_at: now, updated_at: now })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Insert failed" }, { status: 500 });
  }

  return NextResponse.json({ jobId: data.id });
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === process.env.ADMIN_PASSWORD;
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Supabase fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }

  return NextResponse.json(data);
}

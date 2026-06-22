import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const LAUNCH_SLOTS = parseInt(process.env.LAUNCH_SLOTS ?? "10", 10);
const LAUNCH_PRICE_PENCE = 2500;
const FULL_PRICE_PENCE = 4900;

export async function GET() {
  const { count, error } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("tier", "report")
    .neq("status", "pending_payment");

  if (error) {
    return NextResponse.json({ active: false, spotsLeft: 0, launchPrice: FULL_PRICE_PENCE, fullPrice: FULL_PRICE_PENCE });
  }

  const sold = count ?? 0;
  const spotsLeft = Math.max(0, LAUNCH_SLOTS - sold);
  const active = spotsLeft > 0;

  return NextResponse.json({
    active,
    spotsLeft,
    launchPrice: LAUNCH_PRICE_PENCE,
    fullPrice: FULL_PRICE_PENCE,
  });
}

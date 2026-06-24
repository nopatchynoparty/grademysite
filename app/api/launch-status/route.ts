import { NextResponse } from "next/server";

const LAUNCH_PRICE_PENCE = 2500;
const FULL_PRICE_PENCE = 4900;

export async function GET() {
  const active = process.env.LAUNCH_ACTIVE !== "false";

  return NextResponse.json({
    active,
    launchPrice: LAUNCH_PRICE_PENCE,
    fullPrice: FULL_PRICE_PENCE,
  });
}

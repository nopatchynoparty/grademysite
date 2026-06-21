import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TIERS = {
  report: {
    amountPence: 4900,
    label: "Full Conversion Report",
    description: "22-rule analysis + rewritten copy for your business",
  },
  html: {
    amountPence: 9900,
    label: "Full Report + Homepage",
    description: "Full report plus a branded HTML homepage file ready for your developer — styled in your colours, fonts, and logo",
  },
} as const;

export async function POST(req: NextRequest) {
  try {
    const { tier, url, email, scanResults, og_image } = await req.json();

    if (!tier || !TIERS[tier as keyof typeof TIERS]) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required to receive your report" },
        { status: 400 }
      );
    }

    const tierConfig = TIERS[tier as keyof typeof TIERS];
    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

    // Create job record first so we have an ID to reference in Stripe
    const { data: job, error: dbError } = await supabase
      .from("jobs")
      .insert({
        url,
        email,
        tier,
        status: "pending_payment",
        scan_results: scanResults ?? null,
        og_image: og_image ?? null,
      })
      .select("id")
      .single();

    if (dbError || !job) {
      console.error("Supabase insert error:", dbError);
      return NextResponse.json(
        { error: "Could not create job record" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "gbp",
            unit_amount: tierConfig.amountPence,
            product_data: {
              name: `Grade My Site — ${tierConfig.label}`,
              description: tierConfig.description,
            },
          },
        },
      ],
      customer_email: email,
      client_reference_id: job.id,
      metadata: { jobId: job.id, tier, url },
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
    });

    // Store session ID against the job
    await supabase
      .from("jobs")
      .update({ stripe_session_id: session.id })
      .eq("id", job.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Could not create checkout session" },
      { status: 500 }
    );
  }
}

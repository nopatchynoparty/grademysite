import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // client_reference_id is the most reliable — set explicitly when creating session
    const jobId = session.client_reference_id ?? session.metadata?.jobId;

    if (!jobId) {
      console.error("No jobId found on completed session:", session.id);
      return NextResponse.json({ error: "No jobId" }, { status: 400 });
    }

    const { error } = await supabase
      .from("jobs")
      .update({
        status: "pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (error) {
      console.error("Failed to update job status:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`Job ${jobId} marked as pending after payment`);
  }

  return NextResponse.json({ received: true });
}

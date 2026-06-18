import { redirect } from "next/navigation";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export default async function UpgradePage({
  searchParams,
}: {
  searchParams: Promise<{ jobId?: string }>;
}) {
  const { jobId } = await searchParams;

  if (!jobId) {
    redirect("/");
  }

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: job } = await supabase
    .from("jobs")
    .select("id, email, url, full_analysis, tier, status")
    .eq("id", jobId)
    .single();

  // Only allow upgrade if job exists, has analysis, and is a report tier
  if (!job || !job.full_analysis || job.tier !== "report") {
    redirect("/");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://grademy.site";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: 5000, // £50 — upgrade delta (£99 full bundle minus £49 already paid)
          product_data: {
            name: "Grade My Site — Homepage Add-on",
            description:
              "Add the branded HTML homepage to your existing report — styled in your colours, fonts, and logo, ready for your developer to drop straight in.",
          },
        },
      },
    ],
    customer_email: job.email,
    client_reference_id: job.id,
    metadata: { upgrade: "true", jobId: job.id },
    success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/cancel`,
  });

  redirect(session.url!);
}

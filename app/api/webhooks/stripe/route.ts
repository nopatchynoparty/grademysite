import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { generateHtmlTemplate } from "@/lib/htmlTemplate";
import { buildHtmlDeliveryEmail } from "@/lib/reportEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY!);

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
    const jobId = session.client_reference_id ?? session.metadata?.jobId;

    if (!jobId) {
      console.error("No jobId found on completed session:", session.id);
      return NextResponse.json({ error: "No jobId" }, { status: 400 });
    }

    const isUpgrade = session.metadata?.upgrade === "true";

    if (isUpgrade) {
      // £100 upgrade: use existing full_analysis to generate HTML + send delivery email.
      // No Opus re-run. The £49 report was already sent.
      const { data: job, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

      if (fetchError || !job) {
        console.error("Upgrade: job not found:", jobId);
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }

      if (!job.full_analysis) {
        console.error("Upgrade: job has no analysis — cannot generate HTML:", jobId);
        return NextResponse.json({ error: "No analysis on job" }, { status: 400 });
      }

      // If brand_data was never fetched (original job ran without tier="html"), fetch it now.
      let brandDataForHtml: Record<string, unknown> | null = job.brand_data ?? null;

      if (!brandDataForHtml && process.env.CONTEXT_DEV_API_KEY) {
        const contextApiKey = process.env.CONTEXT_DEV_API_KEY;
        const contextBase = `https://api.context.dev/v1`;
        const timeoutMs = 10000;

        const withTimeout = <T>(promise: Promise<T>): Promise<T | null> =>
          Promise.race([
            promise,
            new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
          ]);

        const contextCalls = {
          retrieve:   () => fetch(`${contextBase}/brand/retrieve?domain=${encodeURIComponent(new URL(job.url).hostname)}`, { headers: { Authorization: `Bearer ${contextApiKey}` } }),
          styleguide: () => fetch(`${contextBase}/brand/styleguide?directUrl=${encodeURIComponent(job.url)}`, { headers: { Authorization: `Bearer ${contextApiKey}` } }),
          images:     () => fetch(`${contextBase}/web/scrape/images?url=${encodeURIComponent(job.url)}`, { headers: { Authorization: `Bearer ${contextApiKey}` } }),
        } as const;

        try {
          const contextResults = await Promise.allSettled(
            (Object.entries(contextCalls) as [string, () => Promise<Response>][]).map(([, fn]) =>
              withTimeout(fn().then((r) => (r.ok ? r.json() : null)))
            )
          );

          const fetched: Record<string, unknown> = {};
          (Object.keys(contextCalls) as (keyof typeof contextCalls)[]).forEach((key, i) => {
            const r = contextResults[i];
            if (r.status === "fulfilled" && r.value) fetched[key] = r.value;
          });

          if (Object.keys(fetched).length > 0) {
            brandDataForHtml = fetched;
            await supabase
              .from("jobs")
              .update({ brand_data: brandDataForHtml, updated_at: new Date().toISOString() })
              .eq("id", jobId);
          }
        } catch (brandErr) {
          console.error("Upgrade: brand fetch failed:", brandErr);
        }
      }

      let htmlOutput: string | null = null;
      try {
        htmlOutput = generateHtmlTemplate(job.url, job.full_analysis, brandDataForHtml ?? undefined);
      } catch (htmlErr) {
        console.error("Upgrade: HTML generation failed:", htmlErr);
        return NextResponse.json({ error: "HTML generation failed" }, { status: 500 });
      }

      // Atomic claim: only update the row if it is still tier='report'.
      // If two webhook deliveries race (e.g. Stripe CLI + production endpoint both
      // firing), only one UPDATE will match — the other sees 0 rows and bails out.
      const { data: claimed, error: claimError } = await supabase
        .from("jobs")
        .update({
          tier: "html",
          html_output: htmlOutput,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId)
        .eq("tier", "report")   // the race guard — only one concurrent request wins
        .select("id");

      if (claimError) {
        console.error("Upgrade: failed to claim job:", claimError);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      if (!claimed || claimed.length === 0) {
        console.log(`Upgrade: job ${jobId} already claimed — duplicate webhook ignored`);
        return NextResponse.json({ received: true });
      }

      // Send HTML delivery email (not the full report — that already went out)
      let domain = "homepage";
      try { domain = new URL(job.url).hostname.replace(/\./g, "-"); } catch { /* leave default */ }

      const { subject, html } = buildHtmlDeliveryEmail(job.url, job.full_analysis);
      const from = process.env.RESEND_FROM_EMAIL ?? "GradeMysite <reports@grademy.site>";

      const { error: emailError } = await resend.emails.send({
        from,
        to: job.email,
        subject,
        html,
        attachments: [
          {
            filename: `grademysite-${domain}-homepage.html`,
            content: Buffer.from(htmlOutput),
          },
        ],
      });

      if (emailError) {
        console.error("Upgrade: email send failed:", emailError);
      }

      // Update status based on email outcome (best-effort — idempotency is already
      // guaranteed by the tier claim above, so a failure here isn't critical)
      await supabase
        .from("jobs")
        .update({
          status: emailError ? "error" : "sent",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      console.log(`Job ${jobId} upgraded to html tier — HTML sent to ${job.email}`);
    } else {
      // Standard new payment — mark job as pending for admin to analyse
      const { error } = await supabase
        .from("jobs")
        .update({
          status: "pending",
          tier: "html",
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      if (error) {
        console.error("Failed to update job status:", error);
        return NextResponse.json({ error: "DB update failed" }, { status: 500 });
      }

      console.log(`Job ${jobId} marked as pending after payment`);
    }
  }

  return NextResponse.json({ received: true });
}

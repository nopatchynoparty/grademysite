import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import FirecrawlApp from "@mendable/firecrawl-js";
import { FULL_ANALYSIS_SYSTEM_PROMPT } from "@/lib/fullAnalysisPrompt";
import { generateHtmlTemplate } from "@/lib/htmlTemplate";
import { calculateGrade } from "@/lib/grading";
import { isAuthed } from "@/lib/adminAuth";

export const maxDuration = 300;

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("[analyse] Supabase URL present:", !!url);
  console.log("[analyse] Service role key present:", !!key, "starts with:", key?.slice(0, 20));
  return createClient(url!, key!);
}


export async function POST(req: NextRequest) {
  if (!(await isAuthed(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId, notes } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  const supabase = getSupabase();

  // Fetch job
  const { data: job, error: fetchError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  console.log("[analyse] Fetch job result — id:", jobId, "error:", fetchError, "found:", !!job);

  if (fetchError || !job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (!["pending", "review", "error"].includes(job.status)) {
    return NextResponse.json(
      { error: `Job is in '${job.status}' status — can only analyse pending/error jobs` },
      { status: 409 }
    );
  }

  // Archive current analysis to history before overwriting
  try {
    if (job.full_analysis) {
      const currentHistory = Array.isArray(job.analysis_history) ? job.analysis_history : [];
      await supabase
        .from("jobs")
        .update({ analysis_history: [...currentHistory, job.full_analysis] })
        .eq("id", jobId);
    }
  } catch (historyErr) {
    console.warn("[analyse] Could not save analysis history:", historyErr);
  }

  // Mark as analysing
  const { error: analysingErr } = await supabase
    .from("jobs")
    .update({ status: "analysing", updated_at: new Date().toISOString() })
    .eq("id", jobId);
  console.log("[analyse] Set status=analysing error:", analysingErr);

  try {
    // Scrape the site — request screenshot too so we have a fallback if no og:image
    const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY! });
    let pageContent = "";
    let resolvedOgImage: string | null = job.og_image ?? null;
    let screenshotUrl: string | null = job.screenshot_url ?? null;
    try {
      const scrapeResult = await firecrawl.scrapeUrl(job.url, {
        formats: ["markdown", "screenshot"],
      });
      pageContent = scrapeResult.markdown ?? "";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const meta = (scrapeResult as any).metadata ?? {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const freshScreenshot: string | null = (scrapeResult as any).screenshot ?? null;

      // Always replace with the freshest Firecrawl screenshot — old URLs expire
      if (freshScreenshot) screenshotUrl = freshScreenshot;

      // og_image: prefer actual og:image meta, fall back to screenshot
      if (!resolvedOgImage) {
        const metaOg: string | undefined = meta.ogImage ?? meta["og:image"];
        resolvedOgImage = metaOg ?? freshScreenshot ?? null;
      }
    } catch (scrapeErr) {
      console.error("Firecrawl error:", scrapeErr);
    }

    if (!pageContent || pageContent.length < 50) {
      await supabase
        .from("jobs")
        .update({ status: "error", updated_at: new Date().toISOString() })
        .eq("id", jobId);
      return NextResponse.json(
        { error: "Could not scrape the site — it may block automated requests." },
        { status: 422 }
      );
    }

    // For html tier jobs, fetch brand data from context.dev in parallel with Claude
    let brandData: Record<string, unknown> | null = null;
    const CONTEXT_DEV_ENABLED = process.env.CONTEXT_DEV_ENABLED === "true";
    if (CONTEXT_DEV_ENABLED && job.tier === "html" && process.env.CONTEXT_DEV_API_KEY) {
      const contextApiKey = process.env.CONTEXT_DEV_API_KEY;
      const contextBase = `https://api.context.dev/v1`;
      const timeoutMs = 10000;

      const withTimeout = <T>(promise: Promise<T>): Promise<T | null> =>
        Promise.race([
          promise,
          new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
        ]);

      // /brand/retrieve   — company name, logo, colours (10 credits)
      // /brand/styleguide — full design system: typography, fontLinks, components (10 credits)
      // /web/scrape/images — page images for hero (1–5 credits)
      const contextCalls = {
        retrieve:   () => fetch(`${contextBase}/brand/retrieve?domain=${encodeURIComponent(new URL(job.url).hostname)}`, { headers: { Authorization: `Bearer ${contextApiKey}` } }),
        styleguide: () => fetch(`${contextBase}/brand/styleguide?directUrl=${encodeURIComponent(job.url)}`, { headers: { Authorization: `Bearer ${contextApiKey}` } }),
        images:     () => fetch(`${contextBase}/web/scrape/images?url=${encodeURIComponent(job.url)}`,      { headers: { Authorization: `Bearer ${contextApiKey}` } }),
      } as const;

      const contextResults = await Promise.allSettled(
        (Object.entries(contextCalls) as [string, () => Promise<Response>][]).map(([, fn]) =>
          withTimeout(fn().then((r) => (r.ok ? r.json() : r.json().then((body: unknown) => { console.log(`[analyse] context.dev error body:`, JSON.stringify(body)); return null; }))))
        )
      );

      brandData = {};
      (Object.keys(contextCalls) as (keyof typeof contextCalls)[]).forEach((key, i) => {
        const r = contextResults[i];
        if (r.status === "fulfilled" && r.value) {
          brandData![key] = r.value;
          if (key === "images") {
            console.log(`[analyse] context.dev /images response:`, JSON.stringify(r.value, null, 2));
          } else if (key === "styleguide") {
            const sgColors = (r.value as Record<string, unknown>)?.styleguide as Record<string, unknown>;
            console.log(`[analyse] context.dev /styleguide colors:`, JSON.stringify(sgColors?.colors));
            console.log(`[analyse] context.dev /styleguide button:`, JSON.stringify((sgColors?.components as Record<string, unknown>)?.button));
          } else if (key === "retrieve") {
            const brand = (r.value as Record<string, unknown>)?.brand as Record<string, unknown>;
            console.log(`[analyse] context.dev /retrieve brand.colors:`, JSON.stringify(brand?.colors));
            console.log(`[analyse] context.dev /retrieve brand.logos:`, JSON.stringify(brand?.logos));
          } else {
            console.log(`[analyse] context.dev /${key} ok`);
          }
        } else {
          console.log(`[analyse] context.dev /${key} failed or timed out`);
        }
      });
      console.log(`[analyse] brandData keys:`, Object.keys(brandData));
    }

    // Build user message — include Stage 1 context if available
    const stage1Context = job.scan_results
      ? `\n\n---\nSTAGE 1 QUICK SCAN RESULTS (for context — rules 1, 3, 4, 7, 13 only):\n${JSON.stringify(job.scan_results, null, 2)}\n---`
      : "";

    const industryContext = brandData?.retrieve
      ? (() => {
          const eic = ((brandData.retrieve as Record<string, unknown>)?.brand as Record<string, unknown>)?.industries as Record<string, unknown>;
          const eicArr = eic?.eic;
          if (Array.isArray(eicArr) && eicArr.length > 0) {
            return `\n\nBUSINESS INDUSTRY (from context.dev): ${(eicArr as Array<Record<string, string>>).map((e) => `${e.industry} / ${e.subindustry}`).join(", ")}`;
          }
          return "";
        })()
      : "";

    const notesAppend = notes
      ? `\n\nIMPORTANT — REVIEWER FEEDBACK ON PREVIOUS ATTEMPT: ${notes}\nIncorporate this feedback directly when generating this analysis.`
      : "";

    const userMessage = `URL: ${job.url}${stage1Context}${industryContext}\n\nScraped homepage content:\n\n${pageContent.slice(0, 12000)}${notesAppend}`;

    // Claude Opus full analysis
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
    const message = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 4096,
      system: FULL_ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    console.log("[analyse] Raw Opus response (first 500 chars):", rawText.slice(0, 500));
    console.log("[analyse] Stop reason:", message.stop_reason, "— output tokens:", message.usage.output_tokens);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("[analyse] No JSON object found in Opus response. Full response:", rawText);
      throw new Error("Claude did not return valid JSON");
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
    } catch (parseErr) {
      console.error("[analyse] JSON.parse failed:", parseErr);
      console.error("[analyse] Matched JSON string (first 500):", jsonMatch[0].slice(0, 500));
      throw parseErr;
    }

    console.log("[analyse] Parsed analysis — score:", analysis.score, "grade:", analysis.grade, "keys:", Object.keys(analysis));
    console.log("[analyse] rewritten_copy.solution_bullets:", analysis?.rewritten_copy?.solution_bullets);

    analysis.grade = calculateGrade(analysis.score, analysis.out_of);

    // Generate HTML page for html tier jobs
    let htmlOutput: string | null = null;
    if (job.tier === "html") {
      try {
        htmlOutput = generateHtmlTemplate(job.url, analysis, brandData ?? undefined, analysis.company_name ?? undefined);
      } catch (htmlErr) {
        console.error("[analyse] HTML generation failed:", htmlErr);
      }
    }

    // Store and mark as review
    const { data: updateData, error: updateError } = await supabase
      .from("jobs")
      .update({
        full_analysis: analysis,
        status: "review",
        updated_at: new Date().toISOString(),
        ...(resolvedOgImage ? { og_image: resolvedOgImage } : {}),
        ...(screenshotUrl ? { screenshot_url: screenshotUrl } : {}),
        ...(htmlOutput ? { html_output: htmlOutput } : {}),
        ...(brandData && Object.keys(brandData).length > 0 ? { brand_data: brandData } : {}),
      })
      .eq("id", jobId)
      .select();

    console.log("[analyse] Supabase update result — data:", JSON.stringify(updateData), "error:", JSON.stringify(updateError));

    if (updateError) {
      throw new Error(`Supabase update failed: ${updateError.message} (code: ${updateError.code})`);
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Analysis error:", err);
    await supabase
      .from("jobs")
      .update({ status: "error", updated_at: new Date().toISOString() })
      .eq("id", jobId);
    return NextResponse.json(
      { error: "Analysis failed — check logs for details." },
      { status: 500 }
    );
  }
}

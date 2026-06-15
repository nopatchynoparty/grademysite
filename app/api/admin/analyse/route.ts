import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import FirecrawlApp from "@mendable/firecrawl-js";
import { FULL_ANALYSIS_SYSTEM_PROMPT } from "@/lib/fullAnalysisPrompt";

export const maxDuration = 300;

function isAuthed(req: NextRequest) {
  return req.cookies.get("admin-auth")?.value === process.env.ADMIN_PASSWORD;
}

function getSupabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log("[analyse] Supabase URL present:", !!url);
  console.log("[analyse] Service role key present:", !!key, "starts with:", key?.slice(0, 20));
  return createClient(url!, key!);
}

function gradeFromScore(score: number, outOf: number): string {
  const pct = score / outOf;
  if (pct >= 0.9) return "A";
  if (pct >= 0.8) return "B";
  if (pct >= 0.6) return "C";
  if (pct >= 0.4) return "D";
  return "F";
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
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

      // Always capture screenshot URL for the report
      if (!screenshotUrl && freshScreenshot) screenshotUrl = freshScreenshot;

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

    // Build user message — include Stage 1 context if available
    const stage1Context = job.scan_results
      ? `\n\n---\nSTAGE 1 QUICK SCAN RESULTS (for context — rules 1, 3, 4, 6, 9 only):\n${JSON.stringify(job.scan_results, null, 2)}\n---`
      : "";

    const userMessage = `URL: ${job.url}${stage1Context}\n\nScraped homepage content:\n\n${pageContent.slice(0, 12000)}`;

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

    if (!analysis.grade) {
      analysis.grade = gradeFromScore(analysis.score, analysis.out_of);
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

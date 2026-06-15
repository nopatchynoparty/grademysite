import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import Anthropic from "@anthropic-ai/sdk";

const STAGE1_SYSTEM_PROMPT = `You are a conversion rate expert evaluating a local business website homepage.

Evaluate the scraped page content against these 5 rules only. Be strict and specific — reference actual copy from the page where possible.

RULES:
Rule 1 — Headline states a customer outcome: PASS if the main headline describes a result the customer receives (e.g. "Get Your Boiler Fixed Today", "Clean Carpets in 3 Hours"). FAIL if it describes the business, its name, or a service category (e.g. "Expert Plumbers in Surrey", "ABC Building Services").

Rule 3 — Single primary CTA: PASS if there is one dominant call-to-action button or link in the hero/above the fold. FAIL if two or more CTAs compete at equal visual weight.

Rule 4 — CTA describes what happens next: PASS if the primary CTA uses specific language about the next step ("Get a Free Quote", "Book Your Survey", "See Our Prices"). FAIL if it uses generic phrases ("Contact Us", "Learn More", "Find Out More", "Get in Touch").

Rule 6 — At least one testimonial on the homepage: PASS if there is one or more customer quotes with a name anywhere on the homepage. FAIL if there are none, or only star ratings without quotes.

Rule 9 — Homepage leads with primary service: PASS if one service is clearly the main offer with visual hierarchy. FAIL if four or more services are listed at equal prominence with no clear primary.

Return ONLY this exact JSON (no markdown, no explanation):
{
  "score": <integer 0-5>,
  "out_of": 5,
  "grade": "<A|B|C|D|F>",
  "headline": "<one sentence about the site's biggest strength or problem>",
  "passes": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "fails": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "biggest_win": "<one specific, actionable change that would most improve enquiries>"
}

Grade mapping: 5=A, 4=B, 3=C, 2=D, 0-1=F

If a rule truly cannot be assessed from the scraped content (e.g. the page returned no meaningful text), mark it as a fail with finding "Unable to assess — page content too limited".`;

function gradeLabel(score: number, outOf: number): string {
  const pct = score / outOf;
  if (pct >= 0.9) return "A";
  if (pct >= 0.8) return "B";
  if (pct >= 0.6) return "C";
  if (pct >= 0.4) return "D";
  return "F";
}

export async function POST(req: NextRequest) {
  try {
    const { url, email } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalise URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Validate it looks like a real URL
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Scrape with Firecrawl
    const firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY ?? "",
    });

    let scrapeResult;
    try {
      scrapeResult = await firecrawl.scrapeUrl(targetUrl, {
        formats: ["markdown"],
      });
    } catch {
      return NextResponse.json(
        { error: "Could not fetch that URL. Please check it and try again." },
        { status: 422 }
      );
    }

    const pageContent = scrapeResult.markdown ?? "";

    // Extract og:image from metadata (present even without requesting html format)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (scrapeResult as any).metadata ?? {};
    const ogImage: string | null =
      meta.ogImage ?? meta["og:image"] ?? null;

    if (!pageContent || pageContent.length < 50) {
      return NextResponse.json(
        {
          error:
            "The page returned very little content — it may be behind a login or block scrapers.",
        },
        { status: 422 }
      );
    }

    // Truncate to keep tokens manageable for the free scan
    const truncated = pageContent.slice(0, 8000);

    // Claude Sonnet — 5-rule free scan
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: STAGE1_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Here is the scraped homepage content for ${targetUrl}:\n\n${truncated}`,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON from Claude's response (strip any accidental markdown fences)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Claude response was not JSON:", rawText);
      return NextResponse.json(
        { error: "Analysis failed — please try again." },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Ensure grade is present
    if (!analysis.grade) {
      analysis.grade = gradeLabel(analysis.score, analysis.out_of);
    }


    return NextResponse.json({
      url: targetUrl,
      email: email ?? null,
      analysis,
      og_image: ogImage,
    });
  } catch (err) {
    console.error("Scan error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import Anthropic from "@anthropic-ai/sdk";
import { calculateGrade } from "@/lib/grading";

const STAGE1_SYSTEM_PROMPT = `You are a conversion rate expert evaluating a local business website homepage.

Evaluate the scraped page content against these 5 rules only. Be strict and specific — reference actual copy from the page where possible.

RULES:

Rule 1 — Google can tell what your page is about
PASS: H1 tag is present and contains a service description and/or location — not just the business name.
FAIL: H1 tag is missing, contains only the business name, or contains a generic phrase like "Home" or "Welcome".

Rule 3 — You use real numbers, not vague claims
PASS: Page contains at least one measurable claim — years trading, jobs completed, response time, price, rating.
FAIL: Page contains only adjectives — experienced, professional, high quality, trusted — with no supporting numbers.

Rule 4 — There's one clear thing for visitors to do
PASS: One button or link is visually dominant in the top section of the page.
FAIL: Two or more buttons or links compete at equal prominence in the top section.

Rule 7 — At least one real customer quote is on your homepage
PASS: At least one customer quote with a name attached appears on the homepage.
FAIL: No customer quotes appear on the homepage.

Rule 13 — Contact details are visible the moment the page loads
Before assessing, classify the business into one of these contact expectation categories:
  URGENT/TRADE (plumber, electrician, roofer, locksmith, drainage, boiler, pest control, glazier, skip hire): phone number in the header required. Email alone fails.
  APPOINTMENT-BASED (solicitor, accountant, architect, therapist, physio, dentist, consultant, financial advisor): phone or email in the header both pass.
  RETAIL/HOSPITALITY (restaurant, café, shop, salon, gym, hotel): phone, email, or booking link in the header all pass.
  If unclear, default to APPOINTMENT-BASED.

Apply accordingly:
  URGENT/TRADE — PASS: phone in header. FAIL: no phone visible above the fold.
  APPOINTMENT-BASED — PASS: phone or email in header. FAIL: neither present.
  RETAIL/HOSPITALITY — PASS: phone, email, or booking link in header. FAIL: none present.
Finding must reference the business type and the specific contact method that is missing or present.

Return ONLY this exact JSON (no markdown, no explanation):
{
  "score": <integer 0-5>,
  "out_of": 5,
  "grade": "<A|B|C|D|F>",
  "headline": "<one sentence about the site's biggest strength or problem — specific to this site>",
  "passes": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "fails": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "biggest_win": "<one specific, actionable change that would most improve enquiries>"
}

Grade mapping: 5=A, 4=B, 3=C, 2=D, 0-1=F

If a rule truly cannot be assessed from the scraped content (e.g. the page returned no meaningful text), mark it as a fail with finding "Unable to assess — page content too limited".`;


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

    analysis.grade = calculateGrade(analysis.score, analysis.out_of);


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

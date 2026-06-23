import { NextRequest, NextResponse } from "next/server";
import FirecrawlApp from "@mendable/firecrawl-js";
import Anthropic from "@anthropic-ai/sdk";
import { calculateGrade } from "@/lib/grading";
import { scanRatelimit } from "@/lib/rateLimit";
import { isPrivateUrl } from "@/lib/validateUrl";

const STAGE1_SYSTEM_PROMPT = `You are a conversion rate expert evaluating a local business website homepage.

Evaluate the scraped page content against these 5 rules only. Be strict and specific — reference actual copy from the page where possible.

RULES:

Rule 1 — Google can tell what your page is about
If PAGE HEAD TAGS are provided above, look for an <h1> or the first heading tag. Also check for a <title> tag.
PASS: H1 tag (or page title) is present and describes what the business does, who it helps, or what outcome the customer receives — not just the business name or a generic greeting.
FAIL: H1 tag is missing, contains only the business name, or contains a generic phrase like "Home" or "Welcome".
If neither head tags nor clear heading content is findable in the scraped content, mark as unable_to_assess.

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
Before assessing, classify the business into one of these categories (use BUSINESS INDUSTRY if provided above, otherwise infer from content):
  URGENT/TRADE (plumber, electrician, roofer, locksmith, drainage, boiler, pest control, glazier, skip hire, emergency services): phone number in the header required. Email alone fails.
  APPOINTMENT-BASED PROFESSIONAL (solicitor, accountant, therapist, physio, dentist, financial advisor, consultant, surveyor): phone or email in the header both pass.
  LOCAL RETAIL WITH PHYSICAL PREMISES (clothes shop, florist, jeweller, hardware store, garden centre): address, opening hours, map link, phone, or email in the top section passes.
  HOSPITALITY AND FOOD SERVICE (restaurant, café, pub, hotel, takeaway, wedding venue): booking link, phone, address, or opening hours in the top section passes.
  E-COMMERCE / ONLINE RETAIL (pure online shop, no physical premises): contact page link, email, or live chat passes. Fail only if no contact route exists.
  PORTFOLIO / CREATIVE SERVICES (photographer, videographer, designer, artist): email or contact form link in the header passes. Phone not required.
  CONSUMER WEB APP / SAAS (web app, software tool, subscription service): support email, help link, or contact page passes. No phone required. Fail only if no contact route of any kind exists.
  If unclear, default to APPOINTMENT-BASED PROFESSIONAL.
Apply the appropriate contact standard for the detected business type. Finding must reference the business type and what is or isn't present.

Return ONLY this exact JSON (no markdown, no explanation):
{
  "score": <integer — count of passes only, excluding unable_to_assess>,
  "out_of": <integer — rules assessed only, excluding unable_to_assess>,
  "grade": "<A|B|C|D|F>",
  "headline": "<one sentence about the site's biggest strength or problem — specific to this site>",
  "passes": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "fails": [{ "rule": <rule number>, "finding": "<specific evidence from the page copy>" }],
  "unable_to_assess": [{ "rule": <rule number>, "finding": "<why it couldn't be checked>" }],
  "biggest_win": "<one specific, actionable change that would most improve enquiries>"
}

Grade mapping: 5=A, 4=B, 3=C, 2=D, 0-1=F

If a rule truly cannot be assessed from the scraped content, do not mark it as a pass or fail. Add it to the unable_to_assess array and exclude it from score and out_of.`;


export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    if (scanRatelimit) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "anonymous";
      const { success, reset } = await scanRatelimit.limit(ip);
      if (!success) {
        const retryAfter = Math.ceil((reset - Date.now()) / 1000);
        return NextResponse.json(
          { error: "Too many scans — please wait before trying again." },
          { status: 429, headers: { "Retry-After": String(retryAfter) } }
        );
      }
    }

    const { url, email } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Normalise URL
    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    // Validate it looks like a real URL and isn't a private/internal host
    try {
      new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }
    if (isPrivateUrl(targetUrl)) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Scrape with Firecrawl
    const firecrawl = new FirecrawlApp({
      apiKey: process.env.FIRECRAWL_API_KEY ?? "",
    });

    let scrapeResult;
    try {
      scrapeResult = await firecrawl.scrapeUrl(targetUrl, {
        formats: ["markdown", "html", "screenshot"],
      });
    } catch {
      return NextResponse.json(
        { error: "Could not fetch that URL. Please check it and try again." },
        { status: 422 }
      );
    }

    const pageContent = scrapeResult.markdown ?? "";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const scanScreenshotUrl: string | null = (scrapeResult as any).screenshot ?? null;

    // Extract og:image from metadata (present even without requesting html format)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const meta = (scrapeResult as any).metadata ?? {};
    let ogImage: string | null = meta.ogImage ?? meta["og:image"] ?? null;

    // Firecrawl sometimes misses og:image — fall back to a plain HTML fetch
    if (!ogImage) {
      try {
        const htmlRes = await fetch(targetUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; GradeMyBot/1.0)" },
          signal: AbortSignal.timeout(5000),
        });
        const html = await htmlRes.text();
        const match =
          html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
          html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
        if (match?.[1]) ogImage = match[1];
      } catch {
        // silent — og:image is cosmetic, not worth failing the scan
      }
    }

    if (!pageContent || pageContent.length < 50) {
      return NextResponse.json(
        {
          error:
            "The page returned very little content — it may be behind a login or block scrapers.",
        },
        { status: 422 }
      );
    }

    // Extract <head> for H1/title assessment — full HTML too large, head is enough
    let headContent = "";
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawHtml: string = (scrapeResult as any).html as string ?? "";
      const headMatch = rawHtml.match(/<head[\s\S]*?<\/head>/i);
      if (headMatch?.[0]) {
        headContent = headMatch[0]
          .replace(/<script[\s\S]*?<\/script>/gi, "")
          .replace(/<style[\s\S]*?<\/style>/gi, "")
          .replace(/<link[^>]*>/gi, "")
          .trim()
          .slice(0, 1500);
      }
    } catch {
      // best-effort
    }
    const headSection = headContent
      ? `\n\nPAGE HEAD TAGS (title, meta description, and other metadata):\n${headContent}`
      : "";

    // Truncate to keep tokens manageable for the free scan
    const truncated = pageContent.slice(0, 8000);

    // Fetch screenshot as base64 for vision input
    let scanScreenshotBase64: string | null = null;
    let scanScreenshotMediaType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg";
    if (scanScreenshotUrl) {
      try {
        const imgRes = await fetch(scanScreenshotUrl, { signal: AbortSignal.timeout(8000) });
        if (imgRes.ok) {
          const ct = imgRes.headers.get("content-type") ?? "image/jpeg";
          if (ct.includes("png")) scanScreenshotMediaType = "image/png";
          else if (ct.includes("webp")) scanScreenshotMediaType = "image/webp";
          scanScreenshotBase64 = Buffer.from(await imgRes.arrayBuffer()).toString("base64");
        }
      } catch {
        console.warn("[scan] Could not fetch screenshot for vision — continuing without");
      }
    }

    // Claude Sonnet — 5-rule free scan
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    });

    const scanUserText = `Here is the scraped homepage content for ${targetUrl}:${headSection}\n\n${truncated}`;
    const scanMessageContent: Anthropic.MessageParam["content"] = scanScreenshotBase64
      ? [
          {
            type: "image",
            source: { type: "base64", media_type: scanScreenshotMediaType, data: scanScreenshotBase64 },
          },
          {
            type: "text",
            text: `The image above is a screenshot of the homepage. Use it to verify header content — phone numbers, CTAs, nav items — that may not appear in the markdown below.\n\n${scanUserText}`,
          },
        ]
      : scanUserText;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: STAGE1_SYSTEM_PROMPT,
      messages: [{ role: "user", content: scanMessageContent }],
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

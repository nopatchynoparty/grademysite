interface RewrittenCopy {
  headline: string;
  subheadline: string;
  problem_section: string[];
  primary_cta: string;
  testimonial_suggestions: string[];
  sound_familiar?: string[];
  section_headings?: Record<string, string>;
  solution_bullets?: string[];
}

interface Top3Win {
  rule: number;
  rule_name: string;
  impact: string;
  fix: string;
}

interface FullAnalysis {
  rewritten_copy: RewrittenCopy;
  company_name?: string;
  score?: number;
  out_of?: number;
  grade?: string;
  biggest_win?: string;
  top_3_wins?: Top3Win[];
  headline?: string;
  phone?: string | null;
  has_pricing?: boolean;
  passes?: Array<{ rule: number; finding: string }>;
}

// context.dev API response shapes (actual, from /brand/fonts and /brand/styleguide)
interface FontLink {
  type: "google" | "custom" | string;
  files: Record<string, string>; // weight -> URL
  displayName: string;
  googleFontId?: string;
}

interface TypographyEntry {
  fontFamily?: string;
}

interface StyleguideData {
  mode?: string;
  colors?: { accent?: string; background?: string; text?: string; primary?: string };
  typography?: {
    headings?: { h1?: TypographyEntry; h2?: TypographyEntry };
    p?: TypographyEntry;
  };
  components?: {
    button?: {
      primary?: { backgroundColor?: string; color?: string; borderColor?: string };
    };
  };
  fontLinks?: Record<string, FontLink>;
}

// brandData is keyed by endpoint name: colors, fonts, logo, styleguide
// Each value is the full API response object from that endpoint
type BrandData = Record<string, unknown>;

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeUrl(url: string): string {
  if (url.startsWith("//")) return `https:${url}`;
  return url;
}

function extractBrand(brand?: BrandData) {
  // Actual response shapes from context.dev:
  //   brand.styleguide = { styleguide: { colors, typography, components, fontLinks } }
  //   brand.fonts      = { fonts: [...], fontLinks: { name: { type, files, ... } } }
  //   brand.colors     = { colors: { primary, accent, ... } }  (if present)
  //   brand.logo       = { url, light, dark, ... }             (if present)
  const sg = ((brand?.styleguide as Record<string, unknown>)?.styleguide ?? {}) as StyleguideData;
  const colorsResp = (brand?.colors ?? {}) as { colors?: { primary?: string; accent?: string }; primary?: string };
  // /brand/retrieve response — data is nested under .brand
  const retrieveResp = ((brand?.retrieve ?? {}) as { brand?: {
    title?: string;
    description?: string;
    slogan?: string;
    logos?: Array<{ url?: string; type?: string; mode?: string }>;
    backdrops?: Array<{ url?: string }>;
    colors?: Array<{ hex?: string; name?: string }>;
    email?: string;
    phone?: string;
    address?: { city?: string; country?: string };
  } }).brand ?? {};
  // kept for any legacy data
  const logoResp = (brand?.logo ?? {}) as { url?: string; light?: string; dark?: string };

  // Primary colour: button background is the most reliable CTA brand color for filled buttons;
  // fall back to border, text color, styleguide accent/primary, then retrieve palette, then default blue
  const btn = sg?.components?.button?.primary;
  const retrievePrimaryColor = retrieveResp.colors?.[0]?.hex ?? null;

  const btnColor =
    (btn?.backgroundColor && btn.backgroundColor !== "transparent" && isValidAccent(btn.backgroundColor) ? btn.backgroundColor : null) ??
    (btn?.borderColor && btn.borderColor !== "transparent" && isValidAccent(btn.borderColor) ? btn.borderColor : null) ??
    (btn?.color && btn.color !== "transparent" && btn.color !== "#ffffff" && isValidAccent(btn.color) ? btn.color : null);

  // Pick the first candidate that passes the accent validity check (not near-black, not near-white)
  const primaryCandidates = [
    btnColor,
    sg?.colors?.accent,
    sg?.colors?.primary,
    colorsResp?.colors?.primary,
    colorsResp?.primary,
    retrievePrimaryColor,
  ].filter((c): c is string => !!c && isValidAccent(c));

  const primaryColour = primaryCandidates[0] ?? "#2563eb";

  console.log("[brand] sg.colors:", JSON.stringify(sg?.colors));
  console.log("[brand] btn:", JSON.stringify(btn));
  console.log("[brand] retrieve.colors:", JSON.stringify(retrieveResp.colors?.slice(0, 5)));
  console.log("[brand] primaryCandidates:", primaryCandidates, "→ primaryColour:", primaryColour);

  const primaryDark = darken(primaryColour);

  // Font names from styleguide typography (most reliable source)
  const headingFontName = sg?.typography?.headings?.h1?.fontFamily ?? null;
  const bodyFontName = sg?.typography?.p?.fontFamily ?? null;

  // Merge fontLinks from both endpoints (styleguide takes precedence)
  const allFontLinks: Record<string, FontLink> = { ...(sg?.fontLinks ?? {}) };

  const fontsToLoad = [...new Set([headingFontName, bodyFontName].filter(Boolean) as string[])];

  // Build Google Fonts link — use googleFontId if present, fall back to displayName
  const googleIds = fontsToLoad
    .map((n) => allFontLinks[n])
    .filter((l) => l?.type === "google")
    .map((l) => l.googleFontId ?? l.displayName)
    .filter(Boolean) as string[];

  const googleFontLink =
    googleIds.length > 0
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${googleIds.map((id) => `family=${encodeURIComponent(id)}:wght@400;600;700;800;900`).join("&")}&display=swap" rel="stylesheet">`
      : "";

  // Build @font-face declarations for custom fonts — detect woff vs woff2 from extension.
  // Skip Typekit/Adobe and Squarespace CDN fonts — they require site-specific auth and fail cross-origin.
  const fontFaceDeclarations = fontsToLoad
    .flatMap((name) => {
      const link = allFontLinks[name];
      if (!link?.files || link.type === "google") return [];
      return Object.entries(link.files).map(([weight, url]) => {
        if (url.includes("typekit.net") || url.includes("squarespace.com") || url.includes("squarespace-cdn.com")) return "";
        const fmt = url.toLowerCase().endsWith(".woff2") ? "woff2" : "woff";
        return `  @font-face { font-family: '${name}'; src: url('${url}') format('${fmt}'); font-weight: ${weight}; font-style: normal; font-display: swap; }`;
      }).filter(Boolean);
    })
    .join("\n");

  const fontFamily = bodyFontName ? `'${bodyFontName}', sans-serif` : "system-ui, -apple-system, sans-serif";
  const headingFontCss = headingFontName ? `'${headingFontName}', sans-serif` : fontFamily;

  const brandCompanyName = retrieveResp.title ?? null;

  // Determine light vs dark mode first — needed for correct logo selection
  const bgHex = sg?.colors?.background ?? "#ffffff";
  const isDark = sg?.mode === "dark" || luma(bgHex) < 80;

  // Logos — pick the variant appropriate for the header background.
  // context.dev: l.type = "logo" | "icon" (shape), l.mode = "light" | "dark" | "has_opaque_background" (background suitability).
  const logos = retrieveResp.logos ?? [];
  const retrieveLogo = (() => {
    // Prefer full logos over icons
    const fullLogos = logos.filter((l) => l.type === "logo");
    const pool = fullLogos.length > 0 ? fullLogos : logos;
    if (isDark) {
      return pool.find((l) => l.mode === "dark" || l.mode === "has_opaque_background")?.url
        ?? pool[0]?.url ?? null;
    }
    return pool.find((l) => l.mode === "light" || l.mode === "has_opaque_background")?.url
      ?? pool.find((l) => l.mode !== "dark")?.url
      ?? pool[0]?.url ?? null;
  })();

  const scrapedLogo = pickLogoImage((brand as Record<string, unknown>)?.images);
  const rawLogoUrl = retrieveLogo ?? logoResp?.url ?? logoResp?.light ?? logoResp?.dark ?? scrapedLogo ?? null;
  const logoUrl = rawLogoUrl ? normalizeUrl(rawLogoUrl) : null;

  // Secondary dark: used for solution / CTA / footer sections — must support white text.
  // Cascade: retrieve brand palette → styleguide text colour → two steps darker than primary.
  // Never fall back to a generic hard-coded navy.
  const retrieveSecondary = (retrieveResp.colors ?? [])
    .filter((c): c is { hex: string; name?: string } => !!c.hex && luma(c.hex) < 130)
    .sort((a, b) => luma(a.hex) - luma(b.hex))[0]?.hex ?? null;
  const sgTextDark = sg?.colors?.text && luma(sg.colors.text) < 130 ? sg.colors.text : null;
  const secondaryDark = retrieveSecondary ?? sgTextDark ?? darken(darken(primaryColour));
  const footerBg = darken(secondaryDark);

  console.log("[brand] retrieveSecondary:", retrieveSecondary, "sgTextDark:", sgTextDark, "secondaryDark:", secondaryDark);
  console.log("[brand] logoUrl:", logoUrl, "brandCompanyName:", brandCompanyName);

  return { primaryColour, primaryDark, fontFamily, headingFontCss, googleFontLink, fontFaceDeclarations, logoUrl, isDark, brandCompanyName, secondaryDark, footerBg };
}

function luma(hex: string): number {
  try {
    const n = parseInt(hex.replace("#", ""), 16);
    return 0.299 * ((n >> 16) & 0xff) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff);
  } catch { return 255; }
}

// Returns true if the colour is usable as a brand accent — not near-black or near-white
function isValidAccent(hex: string): boolean {
  const l = luma(hex);
  return l > 25 && l < 225;
}

// Returns a text colour (#000 or #fff) that contrasts against the given background
function contrastText(hex: string): string {
  return luma(hex) > 160 ? "#0f172a" : "#ffffff";
}

function pickLogoImage(imagesData: unknown): string | null {
  const d = imagesData as Record<string, unknown> | null;
  const raw = Array.isArray(d) ? d : Array.isArray(d?.images) ? (d.images as unknown[]) : null;
  if (!raw || raw.length === 0) return null;

  const items = raw
    .map((img) => {
      const rec = img as Record<string, unknown>;
      const raw = (rec.src ?? "") as string;
      return { src: normalizeUrl(raw), element: (rec.element ?? "") as string };
    })
    .filter(({ src }) => src.startsWith("http"));

  // 1. Explicit logo image files (img elements with "logo" in path)
  const logoImg = items.find(({ src, element }) =>
    element === "img" && src.toLowerCase().includes("logo")
  );
  if (logoImg) return logoImg.src;

  // 2. Large apple-touch or android icons (192px or 180px — good enough for a header)
  const largeIcon = items.find(({ src, element }) =>
    element === "link" && (src.includes("192x192") || src.includes("180x180") || src.includes("apple-touch-icon"))
  );
  if (largeIcon) return largeIcon.src;

  // 3. Medium icons (144px, 152px)
  const medIcon = items.find(({ src, element }) =>
    element === "link" && (src.includes("144x144") || src.includes("152x152"))
  );
  if (medIcon) return medIcon.src;

  return null;
}

function pickHeroImage(imagesData: unknown, backdropUrls?: string[]): string | null {
  const d = imagesData as Record<string, unknown> | null;
  const raw = Array.isArray(d) ? d : Array.isArray(d?.images) ? (d.images as unknown[]) : null;
  if (!raw || raw.length === 0) {
    if (backdropUrls && backdropUrls.length > 0) {
      console.log(`[htmlTemplate] pickHeroImage — no page images, using backdrop: ${backdropUrls[0]}`);
      return backdropUrls[0];
    }
    return null;
  }

  const candidates = raw
    .map((img) => {
      const rec = img as Record<string, unknown>;
      const rawSrc = (rec.src ?? rec.url ?? rec.href ?? "") as string;
      const src = normalizeUrl(rawSrc);
      const element = (rec.element ?? "") as string;
      const w = Number(rec.width ?? rec.naturalWidth ?? 0);
      const h = Number(rec.height ?? rec.naturalHeight ?? 0);
      return { src, element, w, h };
    })
    .filter(({ src, element }) => {
      // Skip inline SVGs and <link> elements (favicons/apple-icons)
      if (element === "svg" || element === "link") return false;
      if (!src.startsWith("http")) return false;
      const lower = src.toLowerCase();
      // Skip icons, favicons, sprites, nav/UI images
      if (lower.includes("/favicon") || lower.endsWith(".ico")) return false;
      if (lower.includes("/icon") && !lower.includes("hero")) return false;
      if (lower.endsWith(".svg")) return false;
      if (lower.includes("sprite") || lower.includes("nav-") || lower.includes("select-drop") || lower.includes("button-arrow")) return false;
      // Skip video sizing/placeholder images (1px black boxes)
      if (lower.includes("sizing") || lower.includes("video-placeholder") || lower.includes("video-bg")) return false;
      // Skip logos unless they're in a banner context
      if (lower.includes("/logo") && !lower.includes("banner")) return false;
      return true;
    });

  const scored = candidates.map((c) => {
    const lower = c.src.toLowerCase();
    let score = c.w * c.h;
    // Reward URL keywords that indicate full-width visuals
    if (lower.includes("hero") || lower.includes("banner") || lower.includes("background") || lower.includes("slide")) score += 2_000_000;
    if (lower.includes("bg") || lower.includes("cover")) score += 1_000_000;
    // CSS/background-image elements tend to be full-width decorative images
    if (c.element === "css" || c.element === "background") score += 800_000;
    // Uploaded content images (wp-content/uploads pattern) preferred over theme assets
    if (lower.includes("/uploads/")) score += 300_000;
    return { ...c, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const picked = scored[0]?.src ?? null;
  if (picked) {
    console.log(`[htmlTemplate] pickHeroImage — ${raw.length} total, ${candidates.length} after filter, picked: ${picked}`);
    return picked;
  }
  // Fall back to brand backdrops if no suitable page image found
  if (backdropUrls && backdropUrls.length > 0) {
    console.log(`[htmlTemplate] pickHeroImage — no page image found, using backdrop: ${backdropUrls[0]}`);
    return backdropUrls[0];
  }
  console.log(`[htmlTemplate] pickHeroImage — ${raw.length} total, ${candidates.length} after filter, picked: null`);
  return null;
}

function darken(hex: string): string {
  try {
    const n = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (n >> 16) - 30);
    const g = Math.max(0, ((n >> 8) & 0xff) - 30);
    const b = Math.max(0, (n & 0xff) - 30);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  } catch {
    return "#1d4ed8";
  }
}

export function generateHtmlTemplate(
  url: string,
  analysis: FullAnalysis,
  brand?: BrandData | Record<string, unknown>,
  companyName?: string
): string {
  const copy = analysis.rewritten_copy;

  const BULLET_RULES = new Set([3, 14, 15]);
  const solutionBullets: string[] =
    copy.solution_bullets && copy.solution_bullets.length > 0
      ? copy.solution_bullets.slice(0, 3)
      : (analysis.passes ?? [])
          .filter((p) => BULLET_RULES.has(p.rule))
          .slice(0, 3)
          .map((p) => p.finding.split(/\s+/).slice(0, 12).join(" "));

  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { primaryColour, primaryDark, fontFamily, headingFontCss, googleFontLink, fontFaceDeclarations, logoUrl, isDark, brandCompanyName, secondaryDark, footerBg } =
    extractBrand(brand as BrandData | undefined);

  // /brand meta name takes precedence; Claude-extracted name is the fallback
  const businessName = brandCompanyName ?? companyName ?? analysis.company_name ?? null;

  // Extract available brand context from /retrieve for pre-filling placeholders
  const retrieveBrand = ((brand as Record<string, unknown>)?.retrieve as { brand?: {
    slogan?: string; email?: string; phone?: string; address?: { city?: string };
  } })?.brand ?? {};
  const brandEmail = retrieveBrand.email ?? null;
  const brandCity = retrieveBrand.address?.city ?? null;
  const brandSlogan = retrieveBrand.slogan ?? null;
  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // Phone: Claude extraction → context.dev retrieve → null.
  // Guard against Claude returning the literal string "null" (which is truthy).
  const rawPhone: string | null = (analysis.phone && analysis.phone !== "null") ? analysis.phone : null;
  const brandPhone: string | null = rawPhone ?? retrieveBrand.phone ?? null;

  const backdropsRaw = ((brand as Record<string, unknown>)?.retrieve as { brand?: { backdrops?: Array<{ url?: string }> } })?.brand?.backdrops;
  const backdropUrls = Array.isArray(backdropsRaw)
    ? (backdropsRaw as Array<{ url?: string }>).map((b) => b.url).filter((u): u is string => !!u)
    : undefined;
  const heroImage = pickHeroImage((brand as Record<string, unknown>)?.images, backdropUrls);

  // Adaptive theme — header and hero adapt to site's light/dark mode;
  // solution and CTA sections stay dark for visual contrast/rhythm
  const headerBg    = isDark ? "#0f172a" : "#ffffff";
  const headerBorder = isDark ? "" : "border-bottom:1px solid #e2e8f0;";
  const headerNav   = isDark ? "#94a3b8" : "#374151";
  const heroBg      = isDark ? "#0f172a" : "#f8fafc";
  const heroText    = isDark ? "#ffffff" : "#0f172a";
  const heroSub     = isDark ? "#94a3b8" : "#64748b";
  const heroImgBg   = isDark ? "#1e293b" : "#e2e8f0";
  const heroImgBorder = isDark ? "#334155" : "#cbd5e1";
  const heroImgText = isDark ? "#475569" : "#64748b";
  const ctaOnPrimary = contrastText(primaryColour);

  const problemCards = copy.problem_section
    .map(
      (pain, i) => `
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:24px;">
        <div style="width:40px;height:40px;border-radius:12px;background:${primaryColour}20;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
          <span style="color:${primaryColour};font-weight:900;font-size:18px;">${i + 1}</span>
        </div>
        <p style="color:#334155;font-weight:500;line-height:1.6;margin:0;">${esc(pain)}</p>
      </div>`
    )
    .join("\n");

  // problem_section = external/factual problem (situational events) — used in the Problem section below
  // sound_familiar  = internal/emotional problem (how it feels) — report/email-only, not rendered in the homepage template

  const testimonialCards = copy.testimonial_suggestions
    .map(
      (suggestion, i) => `
      <!--
        TESTIMONIAL ${i + 1} — REPLACE BEFORE GOING LIVE
        Ask a real customer: "${suggestion}"
        Then paste their exact words below.
      -->
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
        <div style="color:${primaryColour};font-size:18px;margin-bottom:16px;">★★★★★</div>
        <p style="color:#334155;font-style:italic;line-height:1.6;margin:0 0 20px;font-size:14px;">
          <!-- REPLACE: Paste your customer's actual words here (ask them: "${esc(suggestion)}") -->
          "REPLACE: Paste the customer's answer here."
        </p>
        <div>
          <p style="font-weight:700;color:#0f172a;font-size:14px;margin:0 0 2px;">REPLACE: Customer Name</p>
          <p style="color:#94a3b8;font-size:12px;margin:0;">REPLACE: Town or project type</p>
        </div>
      </div>`
    )
    .join("\n");

  const logoText = businessName ?? "Your Business Name";
  const logoTextColor = isDark ? "#ffffff" : "#0f172a";
  const logoHtml = logoUrl
    ? `<img src="${esc(logoUrl)}" alt="${esc(logoText)}" style="height:36px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:20px;font-weight:900;color:${logoTextColor};letter-spacing:-0.5px;">${esc(logoText)}</span>`;

  return `<!DOCTYPE html>
<!--
  Grade My Site — Homepage Template
  Generated for: ${esc(displayUrl)}
  Website: ${esc(url)}
  Generated: ${dateStr}

  DEVELOPER NOTES:
  - Replace placeholder images with real photos of your work
  - Add your Google Maps embed to the contact section
  - Connect the contact form to your preferred form handler
  - All colours${brand ? " and fonts match your current branding" : " use defaults — update to match your brand"}
  - This file uses Tailwind CSS via CDN — no build step required
  - Replace all "REPLACE:" placeholders before going live
  - Business name auto-detected: ${businessName ? `"${esc(businessName)}"` : "not found — update manually"}
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName ? `${esc(businessName)} — ` : "REPLACE: Your Business Name — "}${esc(copy.headline)}</title>
  <meta name="description" content="${esc(copy.subheadline)}">
  ${googleFontLink}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    ${fontFaceDeclarations}
    html { scroll-behavior: smooth; }
    body { font-family: ${fontFamily}; }
    h1, h2, h3 { font-family: ${headingFontCss}; }
    .btn-primary {
      background: ${primaryColour};
      color: #ffffff;
      font-weight: 700;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .btn-primary:hover { background: ${primaryDark}; }
    .accent { color: ${primaryColour}; }
  </style>
</head>
<body class="antialiased text-slate-900 bg-white">

<!-- ============================================================
     HEADER — sticky navigation bar
     REPLACE: Update the phone number and CTA link
     ============================================================ -->
<header class="sticky top-0 z-50 shadow-sm" style="background:${headerBg};${headerBorder}">
  <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

    <!-- Logo / business name -->
    <!-- REPLACE: Swap for your logo image if you have one -->
    ${logoUrl
      ? `<a href="#" style="display:inline-block;">${logoHtml}</a>`
      : `<a href="#" style="text-decoration:none;">${logoHtml}</a>`
    }

    <nav style="display:flex;align-items:center;gap:24px;">
      ${brandPhone
        ? `<a href="tel:${esc(brandPhone.replace(/\s+/g, ""))}" style="color:${headerNav};font-size:14px;font-weight:600;text-decoration:none;display:none;" class="sm:block">${esc(brandPhone)}</a>`
        : `<!-- REPLACE: Phone number -->
      <a href="tel:REPLACE" style="color:${headerNav};font-size:14px;font-weight:600;text-decoration:none;display:none;" class="sm:block">REPLACE: 01234 567 890</a>`
      }
      <!-- REPLACE: Update href to your contact page, phone, or booking form -->
      <a href="#contact" class="btn-primary" style="font-size:14px;padding:10px 20px;text-decoration:none;">
        ${esc(copy.primary_cta)}
      </a>
    </nav>

  </div>
</header>


<!-- ============================================================
     HERO — the most important section
     Headline and subheadline were written for your business.
     REPLACE: The hero image placeholder (see comment below)
     REPLACE: The CTA button href
     ============================================================ -->
<section style="background:${heroBg};color:${heroText};padding:80px 24px;" id="hero">
  <div style="max-width:800px;margin:0 auto;text-align:center;">

    <h1 style="font-size:clamp(28px,5vw,52px);font-weight:900;line-height:1.15;letter-spacing:-0.02em;margin:0 0 24px;color:${heroText};overflow-wrap:break-word;word-break:break-word;">
      ${esc(copy.headline)}
    </h1>

    <p style="font-size:clamp(17px,2.5vw,22px);color:${heroSub};line-height:1.6;margin:0 0 40px;max-width:600px;margin-left:auto;margin-right:auto;">
      ${esc(copy.subheadline)}
    </p>

    <!-- REPLACE: Update href to your phone or booking form -->
    <a href="#contact" class="btn-primary" style="display:inline-block;font-size:18px;padding:18px 40px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
      ${esc(copy.primary_cta)}
    </a>

    ${heroImage
      ? `<!--
      HERO IMAGE — sourced from your current site. Replace with your best completed-work photo if this isn't ideal.
    -->
    <img
      src="${esc(heroImage)}"
      alt="REPLACE: Description of the project shown"
      style="margin-top:48px;width:100%;border-radius:16px;object-fit:cover;max-height:480px;display:block;"
    >`
      : `<!--
      HERO IMAGE — REPLACE THIS BEFORE GOING LIVE
      Delete the placeholder block below and replace with:
      <img src="your-hero-photo.jpg" alt="REPLACE: Description" style="margin-top:48px;width:100%;border-radius:16px;object-fit:cover;max-height:480px;display:block;">
    -->
    <div style="margin-top:48px;border-radius:16px;border:2px dashed ${heroImgBorder};background:${heroImgBg};height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:${heroImgText};">
      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" opacity="0.4">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p style="font-weight:600;font-size:14px;margin:0;">REPLACE: Add your best completed-work photo here</p>
      <p style="font-size:12px;margin:0;color:${heroImgText};">Real photos convert far better than stock images</p>
    </div>`
    }

  </div>
</section>


<!-- ============================================================
     PROBLEM SECTION — "Sound familiar?"
     These were written based on your type of business.
     Keep them specific — that's what makes them work.
     ============================================================ -->
<section style="background:#ffffff;padding:80px 24px;">
  <div style="max-width:800px;margin:0 auto;">

    <div style="text-align:center;margin-bottom:48px;">
      <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Sound familiar?</p>
      <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#0f172a;line-height:1.2;margin:0;">
        ${esc(copy.section_headings?.problem ?? "You know your work is good. Your website doesn't show it.")}
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
      ${problemCards}
    </div>

  </div>
</section>


<!-- ============================================================
     SOLUTION SECTION
     REPLACE: The three checklist items with your key benefits
     ============================================================ -->
<section style="background:${secondaryDark};color:#ffffff;padding:80px 24px;">
  <div style="max-width:800px;margin:0 auto;">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">

      <div>
        <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">The solution</p>
        <h2 style="font-size:clamp(24px,3.5vw,36px);font-weight:900;color:#ffffff;line-height:1.2;margin:0 0 20px;">
          ${esc(copy.section_headings?.solution ?? copy.headline)}
        </h2>
        <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 32px;">
          ${esc(copy.subheadline)}
        </p>
        <!-- REPLACE: Update href -->
        <a href="#contact" class="btn-primary" style="display:inline-block;font-size:15px;padding:14px 28px;text-decoration:none;">
          ${esc(copy.primary_cta)}
        </a>
      </div>

      <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:32px;">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#475569;margin:0 0 20px;">Why customers choose us</p>
        <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:16px;">
          ${(solutionBullets.length > 0
            ? solutionBullets
            : ["REPLACE: Your first key benefit", "REPLACE: Your second key benefit", "REPLACE: What happens after you get in touch"]
          ).map((bullet) => `
          <li style="display:flex;gap:12px;align-items:flex-start;color:#cbd5e1;font-size:14px;">
            <span style="color:${primaryColour};font-weight:700;flex-shrink:0;margin-top:1px;">✓</span>
            ${esc(bullet)}
          </li>`).join("\n          ")}
        </ul>
      </div>

    </div>
  </div>
</section>


<!-- ============================================================
     SOCIAL PROOF — REPLACE ALL THREE TESTIMONIALS
     For each: contact a happy customer and ask them the
     question shown in the HTML comment above their slot.
     Copy their exact words — do not paraphrase.
     ============================================================ -->
<section style="background:#f8fafc;padding:80px 24px;">
  <div style="max-width:800px;margin:0 auto;">

    <div style="text-align:center;margin-bottom:48px;">
      <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">What customers say</p>
      <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#0f172a;line-height:1.2;margin:0;">
        ${esc(copy.section_headings?.social_proof ?? "Real results, real people")}
      </h2>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:20px;">
      ${testimonialCards}
    </div>

    <!--
      BEST GOOGLE REVIEW — ADD THIS
      Copy your single best Google review here and display it prominently.
      This is often more trusted than unnamed quotes.
    -->
    <div style="margin-top:32px;background:#ffffff;border:2px dashed #e2e8f0;border-radius:16px;padding:24px;text-align:center;">
      <p style="color:#94a3b8;font-size:13px;margin:0;">
        REPLACE: Add your best Google review here — customers trust Google reviews because they're verified.
        Copy the review text and reviewer name from your Google Business Profile.
      </p>
    </div>

  </div>
</section>


${analysis.has_pricing === false
  ? `<!-- ============================================================
     PRICING — no pricing found on the original site
     The section below replaces the three-tier table with a simple
     enquiry prompt. Add real prices when you have them.
     ============================================================ -->
<section id="pricing" style="background:#ffffff;padding:80px 24px;">
  <div style="max-width:640px;margin:0 auto;text-align:center;">
    <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Pricing</p>
    <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#0f172a;margin:0 0 16px;">Every project is different</h2>
    <p style="color:#64748b;font-size:17px;line-height:1.7;margin:0 0 40px;max-width:480px;margin-left:auto;margin-right:auto;">
      We give fixed-price quotes — no surprises, no hidden extras. Get in touch and we'll put together a quote tailored to your requirements.
    </p>
    <a href="#contact" class="btn-primary" style="display:inline-block;font-size:16px;padding:16px 36px;text-decoration:none;">
      ${esc(copy.primary_cta)}
    </a>
    ${brandSlogan ? `<p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">${esc(brandSlogan)}</p>` : ""}
  </div>
</section>`
  : `<!-- ============================================================
     PRICING — pricing WAS found on the original site.
     Add it here — check the original site for their actual
     pricing structure and copy it across. Do not guess.
     ============================================================ -->
<section id="pricing" style="background:#ffffff;padding:80px 24px;">
  <div style="max-width:640px;margin:0 auto;text-align:center;">
    <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Pricing</p>
    <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#0f172a;margin:0 0 16px;">Every project is different</h2>
    <p style="color:#64748b;font-size:17px;line-height:1.7;margin:0 0 40px;max-width:480px;margin-left:auto;margin-right:auto;">
      We give fixed-price quotes — no surprises, no hidden extras. Get in touch and we'll put together a quote tailored to your requirements.
    </p>
    <a href="#contact" class="btn-primary" style="display:inline-block;font-size:16px;padding:16px 36px;text-decoration:none;">
      ${esc(copy.primary_cta)}
    </a>
    ${brandSlogan ? `<p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">${esc(brandSlogan)}</p>` : ""}
  </div>
</section>`
}


<!-- ============================================================
     FOOTER CTA — one last push before they leave
     REPLACE: The CTA button href and contact details
     ============================================================ -->
<section id="contact" style="background:${secondaryDark};color:#ffffff;padding:80px 24px;text-align:center;">
  <div style="max-width:560px;margin:0 auto;">

    <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#ffffff;margin:0 0 20px;">
      ${esc(copy.section_headings?.cta ?? "Ready to get started?")}
    </h2>
    <p style="color:#94a3b8;font-size:17px;line-height:1.6;margin:0 0 40px;">
      ${esc(copy.subheadline)}
    </p>

    <!-- REPLACE: href to your phone (tel:01234567890), email (mailto:), or booking page -->
    <a href="#" class="btn-primary" style="display:inline-block;font-size:20px;padding:20px 48px;text-decoration:none;box-shadow:0 12px 32px rgba(0,0,0,0.25);">
      ${esc(copy.primary_cta)}
    </a>

    <p style="color:#475569;font-size:13px;margin:40px 0 0;">
      ${brandPhone
        ? `<a href="tel:${esc(brandPhone.replace(/\s+/g, ""))}" style="color:#475569;text-decoration:none;">${esc(brandPhone)}</a>`
        : "REPLACE: 01234 567 890"
      } &nbsp;·&nbsp; ${brandEmail ? `<a href="mailto:${esc(brandEmail)}" style="color:#475569;">${esc(brandEmail)}</a>` : "REPLACE: hello@yourbusiness.co.uk"}
    </p>

    <p style="color:#334155;font-size:13px;margin:8px 0 0;">
      ${brandCity ? `Serving ${esc(brandCity)} and surrounding areas` : "REPLACE: Serving [your towns/area]"}
    </p>

  </div>
</section>

<!-- FOOTER -->
<footer style="background:${footerBg};padding:32px 24px;">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;">
    <span style="font-weight:700;color:#e2e8f0;font-size:14px;">${businessName ? esc(businessName) : "REPLACE: Your Business Name"}</span>
    <div style="display:flex;gap:24px;font-size:12px;color:#475569;flex-wrap:wrap;justify-content:center;">
      <span>${esc(displayUrl)}</span>
      ${brandEmail ? `<span>${esc(brandEmail)}</span>` : "<span>REPLACE: hello@yoursite.co.uk</span>"}
      <span>© ${year}</span>
    </div>
  </div>
</footer>

</body>
</html>`;
}

interface RewrittenCopy {
  headline: string;
  subheadline: string;
  problem_section: string[];
  primary_cta: string;
  testimonial_suggestions: string[];
  sound_familiar?: string[];
  section_headings?: Record<string, string>;
}

interface FullAnalysis {
  rewritten_copy: RewrittenCopy;
}

interface BrandData {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    palette?: string[];
  };
  fonts?: {
    primary?: string;
    secondary?: string;
    googleFont?: string;
  };
  logo?: {
    url?: string;
    light?: string;
    dark?: string;
  };
  styleguide?: Record<string, unknown>;
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractBrand(brand?: BrandData) {
  const primaryColour = brand?.colors?.primary ?? "#2563eb";
  const primaryDark = darken(primaryColour);

  const rawFont = brand?.fonts?.googleFont ?? brand?.fonts?.primary ?? null;
  const fontFamily = rawFont
    ? `'${rawFont}', system-ui, sans-serif`
    : "system-ui, -apple-system, sans-serif";
  const googleFontLink = rawFont
    ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(rawFont)}:wght@400;600;700;800;900&display=swap" rel="stylesheet">`
    : "";

  const logoUrl =
    brand?.logo?.url ?? brand?.logo?.light ?? brand?.logo?.dark ?? null;

  return { primaryColour, primaryDark, fontFamily, googleFontLink, logoUrl };
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
  brand?: BrandData | Record<string, unknown>
): string {
  const copy = analysis.rewritten_copy;
  const year = new Date().getFullYear();
  const dateStr = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const { primaryColour, primaryDark, fontFamily, googleFontLink, logoUrl } =
    extractBrand(brand as BrandData | undefined);

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

  const soundFamiliarBullets = (copy.sound_familiar ?? copy.problem_section)
    .map(
      (pt) => `<li style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#475569;line-height:1.6;">"${esc(pt)}"</li>`
    )
    .join("\n");

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

  const logoHtml = logoUrl
    ? `<img src="${esc(logoUrl)}" alt="Logo" style="height:36px;max-width:160px;object-fit:contain;">`
    : `<span style="font-size:20px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Your Business Name</span>`;

  const displayUrl = url.replace(/^https?:\/\//, "");

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
-->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>REPLACE: Your Business Name — ${esc(copy.headline)}</title>
  <meta name="description" content="${esc(copy.subheadline)}">
  ${googleFontLink}
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    html { scroll-behavior: smooth; }
    body { font-family: ${fontFamily}; }
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
<header class="sticky top-0 z-50 shadow-sm" style="background:#0f172a;">
  <div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">

    <!-- Logo / business name -->
    <!-- REPLACE: Swap for your logo image if you have one -->
    ${logoUrl
      ? `<a href="#" style="display:inline-block;">${logoHtml}</a>`
      : `<a href="#" style="text-decoration:none;">${logoHtml}</a>`
    }

    <nav style="display:flex;align-items:center;gap:24px;">
      <!-- REPLACE: Phone number (use tel: link so mobile users can tap to call) -->
      <a href="tel:REPLACE" style="color:#94a3b8;font-size:14px;font-weight:600;text-decoration:none;display:none;" class="sm:block">
        REPLACE: 01234 567 890
      </a>
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
<section style="background:#0f172a;color:#ffffff;padding:80px 24px;" id="hero">
  <div style="max-width:800px;margin:0 auto;text-align:center;">

    <h1 style="font-size:clamp(32px,5vw,56px);font-weight:900;line-height:1.1;letter-spacing:-0.03em;margin:0 0 24px;color:#ffffff;">
      ${esc(copy.headline)}
    </h1>

    <p style="font-size:clamp(17px,2.5vw,22px);color:#94a3b8;line-height:1.6;margin:0 0 40px;max-width:600px;margin-left:auto;margin-right:auto;">
      ${esc(copy.subheadline)}
    </p>

    <!-- REPLACE: Update href to your phone or booking form -->
    <a href="#contact" class="btn-primary" style="display:inline-block;font-size:18px;padding:18px 40px;text-decoration:none;box-shadow:0 8px 24px rgba(0,0,0,0.2);">
      ${esc(copy.primary_cta)}
    </a>

    <!--
      HERO IMAGE — REPLACE THIS BEFORE GOING LIVE
      Delete the placeholder block below and replace with:

      <img
        src="your-hero-photo.jpg"
        alt="REPLACE: Description of the project shown"
        style="margin-top:48px;width:100%;border-radius:16px;object-fit:cover;max-height:480px;display:block;"
      >
    -->
    <div style="margin-top:48px;border-radius:16px;border:2px dashed #334155;background:#1e293b;height:280px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;color:#475569;">
      <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" opacity="0.4">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p style="font-weight:600;font-size:14px;margin:0;">REPLACE: Add your best completed-work photo here</p>
      <p style="font-size:12px;margin:0;color:#334155;">Real photos convert far better than stock images</p>
    </div>

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
<section style="background:#0f172a;color:#ffffff;padding:80px 24px;">
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
          <!-- REPLACE: Your three key benefits or differentiators -->
          <li style="display:flex;gap:12px;align-items:flex-start;color:#cbd5e1;font-size:14px;">
            <span style="color:${primaryColour};font-weight:700;flex-shrink:0;margin-top:1px;">✓</span>
            REPLACE: Your first key benefit (e.g. "Fixed-price quotes — what we quote is what you pay")
          </li>
          <li style="display:flex;gap:12px;align-items:flex-start;color:#cbd5e1;font-size:14px;">
            <span style="color:${primaryColour};font-weight:700;flex-shrink:0;margin-top:1px;">✓</span>
            REPLACE: Your second key benefit (something specific to your business)
          </li>
          <li style="display:flex;gap:12px;align-items:flex-start;color:#cbd5e1;font-size:14px;">
            <span style="color:${primaryColour};font-weight:700;flex-shrink:0;margin-top:1px;">✓</span>
            REPLACE: What happens next (e.g. "Free site visit within 48 hours")
          </li>
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


<!-- ============================================================
     PRICING — REPLACE with your actual prices
     The three-tier structure is intentional — it anchors value.
     Most customers will choose the middle option.
     ============================================================ -->
<section id="pricing" style="background:#ffffff;padding:80px 24px;">
  <div style="max-width:800px;margin:0 auto;">

    <div style="text-align:center;margin-bottom:48px;">
      <p style="color:${primaryColour};font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 12px;">Pricing</p>
      <h2 style="font-size:clamp(26px,4vw,40px);font-weight:900;color:#0f172a;margin:0 0 12px;">Simple, transparent pricing</h2>
      <!-- REPLACE: Your pricing model in one line -->
      <p style="color:#64748b;max-width:400px;margin:0 auto;font-size:14px;">REPLACE: e.g. "Fixed price. Written quote before any work starts."</p>
    </div>

    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;">

      <!-- TIER 1 — REPLACE name and price -->
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:28px;display:flex;flex-direction:column;">
        <p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#0f172a;">Good</p>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px;">REPLACE: Ideal for...</p>
        <p style="font-size:36px;font-weight:900;color:#0f172a;margin:0 0 20px;">£0 <span style="font-size:13px;font-weight:400;color:#94a3b8;">REPLACE</span></p>
        <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;flex:1;">
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Feature 1</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Feature 2</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Feature 3</li>
        </ul>
        <a href="#contact" style="display:block;text-align:center;padding:12px;border:1px solid #e2e8f0;border-radius:10px;color:#374151;font-weight:600;font-size:13px;text-decoration:none;">${esc(copy.primary_cta)}</a>
      </div>

      <!-- TIER 2 (MOST POPULAR) — REPLACE name and price -->
      <div style="border:2px solid ${primaryColour};border-radius:16px;padding:28px;display:flex;flex-direction:column;position:relative;margin-top:-8px;">
        <div style="position:absolute;top:-16px;left:50%;transform:translateX(-50%);background:${primaryColour};color:#ffffff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:999px;white-space:nowrap;">MOST POPULAR</div>
        <p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#0f172a;">Better</p>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px;">REPLACE: Ideal for...</p>
        <p style="font-size:36px;font-weight:900;color:#0f172a;margin:0 0 20px;">£0 <span style="font-size:13px;font-weight:400;color:#94a3b8;">REPLACE</span></p>
        <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;flex:1;">
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Everything in Good</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Key extra 1</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Key extra 2</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Key extra 3</li>
        </ul>
        <a href="#contact" class="btn-primary" style="display:block;text-align:center;padding:12px;font-size:13px;text-decoration:none;">${esc(copy.primary_cta)}</a>
      </div>

      <!-- TIER 3 — REPLACE name and price -->
      <div style="border:1px solid #e2e8f0;border-radius:16px;padding:28px;display:flex;flex-direction:column;">
        <p style="font-weight:700;font-size:15px;margin:0 0 4px;color:#0f172a;">Best</p>
        <p style="color:#64748b;font-size:13px;margin:0 0 20px;">REPLACE: Ideal for...</p>
        <p style="font-size:36px;font-weight:900;color:#0f172a;margin:0 0 20px;">£0 <span style="font-size:13px;font-weight:400;color:#94a3b8;">REPLACE</span></p>
        <ul style="list-style:none;padding:0;margin:0 0 24px;display:flex;flex-direction:column;gap:10px;flex:1;">
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Everything in Better</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Premium extra 1</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Premium extra 2</li>
          <li style="display:flex;gap:8px;font-size:13px;color:#475569;"><span style="color:#10b981;font-weight:700;">✓</span> REPLACE: Premium extra 3</li>
        </ul>
        <a href="#contact" style="display:block;text-align:center;padding:12px;border:1px solid #e2e8f0;border-radius:10px;color:#374151;font-weight:600;font-size:13px;text-decoration:none;">${esc(copy.primary_cta)}</a>
      </div>

    </div>

    <!-- REPLACE: Pricing guarantee or trust note -->
    <p style="text-align:center;color:#94a3b8;font-size:13px;margin:24px 0 0;">REPLACE: e.g. "Fixed price. Written quote before any work begins."</p>

  </div>
</section>


<!-- ============================================================
     FOOTER CTA — one last push before they leave
     REPLACE: The CTA button href and contact details
     ============================================================ -->
<section id="contact" style="background:#0f172a;color:#ffffff;padding:80px 24px;text-align:center;">
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

    <!-- REPLACE: Your phone number and email -->
    <p style="color:#475569;font-size:13px;margin:40px 0 0;">
      REPLACE: 01234 567 890 &nbsp;·&nbsp; REPLACE: hello@yourbusiness.co.uk
    </p>

    <!-- REPLACE: Your service area -->
    <p style="color:#334155;font-size:13px;margin:8px 0 0;">
      REPLACE: Serving [your towns/area]
    </p>

  </div>
</section>

<!-- FOOTER -->
<footer style="background:#020617;padding:32px 24px;">
  <div style="max-width:960px;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;">
    <!-- REPLACE: Your business name -->
    <span style="font-weight:700;color:#e2e8f0;font-size:14px;">Your Business Name</span>
    <div style="display:flex;gap:24px;font-size:12px;color:#475569;flex-wrap:wrap;justify-content:center;">
      <!-- REPLACE: Your website and email -->
      <span>REPLACE: yoursite.co.uk</span>
      <span>REPLACE: hello@yoursite.co.uk</span>
      <span>© ${year}</span>
    </div>
  </div>
</footer>

</body>
</html>`;
}

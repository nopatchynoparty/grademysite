import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What We Check — 22 Website Rules | Grade My Site",
  description:
    "The 22 things most local business websites get wrong — explained in plain English with examples of what good looks like.",
};

const TOOLTIP_TERMS: Record<string, string> = {
  "H1 tag": "A hidden label at the top of your page that tells Google what it's about",
  "main heading": "The largest, most prominent text on your page — usually the first line visitors read. Also called an H1 in web design.",
  "opening line": "The main text at the top of your page that visitors read first — sometimes called a headline.",
  "page title": "The heading that appears when your business shows up on Google",
  "meta description": "The short summary that appears under your link in Google search results",
  "above the fold": "The part of the page visible before you scroll",
  "CTA": "The main button that tells visitors what to do next",
};

interface Rule {
  number: number;
  name: string;
  whyItMatters: string;
  whatGoodLooksLike: string;
  tooltipTerm?: string;
}

const RULES: Rule[] = [
  {
    number: 1,
    name: "Google can tell what your page is about",
    whyItMatters: "The main heading on your page — the largest piece of text visitors read first — is also the strongest signal you send Google about what your business does. If it just says your business name, or something generic like 'Welcome', Google can't tell whether you're a plumber, a solicitor, or a florist — and it won't show you to the right people.",
    whatGoodLooksLike: '"Emergency Plumber in Bristol — Same Day Call-Outs"',
    tooltipTerm: "main heading",
  },
  {
    number: 2,
    name: "Your opening line tells visitors what they'll get",
    whyItMatters: "Most business websites open with \"Welcome to ABC Builders\" or \"Quality You Can Trust.\" These tell a visitor nothing useful. The first thing someone reads on your page has about three seconds to answer the question they're silently asking: \"Can these people help me?\"",
    whatGoodLooksLike: '"We fit kitchens in South London. Most jobs done in a week."',
    tooltipTerm: "opening line",
  },
  {
    number: 3,
    name: "You use real numbers, not vague claims",
    whyItMatters: "Anyone can say they're experienced or professional — those words are free. Numbers are harder to fake and immediately more convincing. \"200 bathrooms fitted\" or \"12 years trading\" tells a visitor something real about you.",
    whatGoodLooksLike: '"Over 500 happy customers across West Sussex since 2009."',
  },
  {
    number: 4,
    name: "There's one clear thing for visitors to do",
    whyItMatters: "If someone lands on your page and sees three different buttons — Call Us, Get a Quote, Learn More — they'll often click none of them. Give people one obvious next step and more of them will take it. If your page has only one button anywhere, that's fine — this rule is about competing options, not button count.",
    whatGoodLooksLike: 'One prominent "Get a Free Quote" button, nothing else competing with it.',
  },
  {
    number: 5,
    name: "Your main button tells people what happens when they click it",
    whyItMatters: "\"Contact Us\" tells someone nothing about what they're signing up for. Will someone call them? Do they have to fill in a long form? Will they wait three weeks for a response? A specific button removes that uncertainty and makes clicking feel safe.",
    whatGoodLooksLike: '"Get a Free Quote — We\'ll Call You Within 2 Hours"',
    tooltipTerm: "CTA",
  },
  {
    number: 6,
    name: "You acknowledge the customer's problem before pitching your services",
    whyItMatters: "Visitors arrive with a problem, not a shopping list. If your page goes straight into listing what you offer, you've skipped the part where they feel understood. A sentence or two that names their frustration before you describe your solution makes everything else land harder.",
    whatGoodLooksLike: '"Finding a reliable electrician shouldn\'t be this hard. We turn up when we say we will."',
  },
  {
    number: 7,
    name: "At least one real customer quote is on your homepage",
    whyItMatters: "You saying you're good means very little. A customer saying it means everything. People trust other people's experiences more than any amount of marketing — especially for a business they've never used before.",
    whatGoodLooksLike: "Any named customer quote visible without scrolling.",
  },
  {
    number: 8,
    name: "Your customer quotes are specific",
    whyItMatters: "\"Great service, highly recommend\" is so generic it washes over people. A quote that names a specific job, result, or experience is far more believable — because it sounds like a real person talking about a real job. We only check this if Rule 7 passes — if there are no customer quotes on your page at all, this rule is skipped.",
    whatGoodLooksLike: '"They refitted our entire bathroom in four days and left the place spotless." — Sarah T., Brighton',
  },
  {
    number: 9,
    name: "You clearly state where you work",
    whyItMatters: "If someone searches for a roofer in Chichester and lands on your site but can't immediately see that you cover Chichester, they'll leave. Stating your area clearly also helps Google show you to the right people. If you serve customers nationally or online rather than locally, clearly stating who you serve ('for UK tradespeople', 'serving businesses across the UK') also passes this rule.",
    whatGoodLooksLike: '"Covering Chichester, Bognor Regis, and the surrounding villages."',
  },
  {
    number: 10,
    name: "Your main service is front and centre",
    whyItMatters: "If you offer five services at equal prominence, visitors have to work out what you actually do. A page that leads with one clear main offer is easier to understand — and easier to act on.",
    whatGoodLooksLike: "One dominant service at the top of the page, others listed further down.",
  },
  {
    number: 11,
    name: "You show photos of your actual work",
    whyItMatters: "Stock photos of smiling tradespeople or generic tools look fake and signal low effort. Photos of your actual work — even taken on a phone — are more convincing because they're real proof of what you deliver. Note: we can't always tell from a scan whether photos are real or stock — if we can't confirm either way, we'll flag it as something to check manually.",
    whatGoodLooksLike: "At least one photo of a completed job, ideally with a short caption.",
  },
  {
    number: 12,
    name: "You give at least a rough idea of your prices",
    whyItMatters: "Most people want to know if you're roughly in their budget before they bother getting in touch. Even a \"from £X\" figure filters out bad fits and reassures good ones — and stops you wasting time on enquiries that were never going to go anywhere.",
    whatGoodLooksLike: '"Loft conversions from £18,000. Full quote after free site visit."',
  },
  {
    number: 13,
    name: "Contact details are visible the moment the page loads",
    whyItMatters: "How people expect to contact you depends on what you do. If you're a plumber or electrician, someone in a crisis needs to call you immediately — a phone number at the top of the page is non-negotiable. If you're a solicitor or therapist, an email address is enough. If you have a shop, your address and opening hours matter more than a phone number. If you're an online tool or app, a support link or contact page is sufficient. Whatever category you're in, visitors should never have to hunt to find how to reach you.",
    whatGoodLooksLike: "Trade: phone number at the top, tap-to-call on mobile. Professional services: phone or email in the header. Local shop: address, hours, or map link visible immediately. Online retail or app: contact page link or support email clearly accessible.",
  },
  {
    number: 14,
    name: "Your page sounds like it was written for your specific business",
    whyItMatters: "If every sentence on your page could have been written for any business in your industry, it's doing very little work. Specific details — your name, your process, your town, your team — build trust and make you memorable.",
    whatGoodLooksLike: '"I\'m Dan, and I\'ve been rewiring homes in East Sussex for 14 years. Every job is quoted and completed by me personally."',
  },
  {
    number: 15,
    name: "You say what makes you different",
    whyItMatters: "Every local business claims quality, reliability, and professionalism. If that's all your page says, you look identical to every competitor. What do you actually do differently? Say it plainly — don't make people guess.",
    whatGoodLooksLike: '"We\'re the only firm in the area offering a fixed-price guarantee — what we quote is what you pay."',
  },
  {
    number: 16,
    name: "Getting in touch doesn't require filling in an essay",
    whyItMatters: "Every extra field on an enquiry form reduces the number of people who complete it. Name, email or phone, and a brief message is enough to start a conversation. Save the detailed questions for when you speak to them. We only check this if you have an enquiry form on your homepage — if there's no form, this rule is skipped.",
    whatGoodLooksLike: "Three fields maximum. Name, contact details, message. Done.",
  },
  {
    number: 17,
    name: "Your strongest proof is the first thing people see",
    whyItMatters: "Most visitors don't scroll very far. If your most impressive customer quote, your strongest number, or your best credential is halfway down the page, most people will never reach it. Note: listing your features at the top doesn't count — this rule is specifically about proof from outside your business: customer quotes, verified ratings, user numbers, or named case studies. Note: we assess this from the order content appears on your page — if we can't determine what's visible without scrolling, we'll flag it as unable to check rather than guess.",
    whatGoodLooksLike: "Your best quote or most impressive number visible without scrolling at all.",
    tooltipTerm: "above the fold",
  },
  {
    number: 18,
    name: "You avoid meaningless filler words",
    whyItMatters: "Words like \"wide range,\" \"various,\" \"bespoke,\" \"solutions,\" and \"high quality\" have been used so often they've stopped meaning anything. Visitors skip straight past them. Every one of them is a missed opportunity to say something real.",
    whatGoodLooksLike: '"We build oak-framed garden rooms, single-storey extensions, and garage conversions." Not "a wide range of building solutions."',
  },
  {
    number: 19,
    name: "Your site looks like you're still in business",
    whyItMatters: "An old date at the bottom of your page, a news section with posts from three years ago, or obviously outdated photos sends a quiet signal that you might not still be trading. It's a small thing that has a real impact on whether people trust you enough to get in touch. If we can't find a date in the scanned content, we'll flag this as unable to check rather than mark it as a fail.",
    whatGoodLooksLike: "Current year at the bottom of the page, no obviously stale content.",
  },
  {
    number: 20,
    name: "Your opening line makes a claim someone could actually disagree with",
    whyItMatters: "\"Quality you can trust\" and \"your vision, our passion\" cannot be disputed — which also means they cannot be believed. If your opening line is so vague that nobody could argue with it, it's also so vague that nobody will remember it.",
    whatGoodLooksLike: '"Same-day boiler repairs in Manchester — or your call-out fee back."',
  },
  {
    number: 21,
    name: "You tell people what happens after they get in touch",
    whyItMatters: "\"We'll be in touch\" tells a customer nothing. Will someone call in an hour or a week? Will they get a visit or just an email? If the process feels uncertain, people hesitate. Tell them exactly what to expect and when.",
    whatGoodLooksLike: '"Send us your details and we\'ll call you back within two hours to arrange a free no-obligation quote."',
  },
  {
    number: 22,
    name: "Your page title and description in Google look professional",
    whyItMatters: "When your business appears in Google search results, two things show up: a title (the blue clickable heading) and a description (the short summary underneath). Most businesses never set these deliberately, so Google picks random text from the page — which is rarely your best line. If these are missing or messy, it's free advertising in the search results that most local businesses ignore completely.",
    whatGoodLooksLike: '"Dan\'s Electrical Services | Electrician in East Sussex | Free Quotes" followed by a one-sentence description of exactly what you do and where.',
    tooltipTerm: "page title",
  },
];

function RuleCard({ rule }: { rule: Rule }) {
  const tooltip = rule.tooltipTerm ? TOOLTIP_TERMS[rule.tooltipTerm] : undefined;

  return (
    <div className="rounded-2xl border border-border bg-white p-6 dm-card">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-blue-light flex items-center justify-center text-sm font-black text-blue">
          {rule.number}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-ink leading-snug">
            {rule.name}
            {tooltip && (
              <span className="relative inline-flex group ml-1.5 align-middle">
                <button
                  type="button"
                  aria-label={`What is ${rule.tooltipTerm}?`}
                  className="inline-flex w-4 h-4 rounded-full bg-slate-100 text-muted text-xs items-center justify-center font-semibold focus:outline-none"
                >ⓘ</button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-slate-900 text-[white] text-xs rounded-lg px-3 py-2 invisible group-hover:visible group-focus-within:visible z-10 leading-relaxed shadow-xl pointer-events-none">
                  <strong className="block text-blue mb-0.5">{rule.tooltipTerm}</strong>
                  {tooltip}
                </span>
              </span>
            )}
          </h2>
        </div>
      </div>

      <p className="text-sm text-muted leading-relaxed mb-4">{rule.whyItMatters}</p>

      <div className="rounded-xl bg-surface border border-border px-4 py-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">What good looks like</p>
        <p className="text-sm text-ink font-medium leading-relaxed">{rule.whatGoodLooksLike}</p>
      </div>
    </div>
  );
}

export default function RulesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-white/95 backdrop-blur-sm z-50 dm-nav">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-7 w-7" aria-hidden="true" />
            <span className="text-lg font-black tracking-tight">
              <span className="text-ink">Grade</span>
              <span className="text-blue">My</span>
              <span className="text-ink">Site</span>
            </span>
          </Link>
          <nav className="flex items-center gap-5">
            <Link href="/#how-it-works" className="text-sm font-medium text-muted hover:text-ink transition-colors hidden sm:block">
              How it works
            </Link>
            <Link href="/#pricing" className="text-sm font-medium text-muted hover:text-ink transition-colors hidden sm:block">
              Pricing
            </Link>
            <Link
              href="mailto:hello@grademy.site"
              className="text-sm font-semibold text-blue hover:text-blue-dark transition-colors"
            >
              hello@grademy.site
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* Hero */}
        <section className="bg-surface px-5 pt-10 pb-12 border-b border-border">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-light border border-blue-light mb-5">
              <span className="eyebrow">22 rules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-[1.08] mb-4">
              What we check — and why it matters
            </h1>
            <p className="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
              These are the 22 things most local business websites get wrong. Each one is a reason a potential customer leaves without getting in touch.
            </p>
          </div>
        </section>

        {/* Rules grid */}
        <section className="px-5 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="grid sm:grid-cols-2 gap-4">
              {RULES.map((rule) => (
                <RuleCard key={rule.number} rule={rule} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 pb-16 pt-4">
          <div className="max-w-2xl mx-auto rounded-2xl border-2 border-slate-900 bg-slate-900 text-[white] p-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-black mb-3 text-[white]">
              How does your site score against these?
            </h2>
            <p className="text-slate-300 text-sm mb-6 leading-relaxed">
              Find out free in 30 seconds. No account, no signup — paste your URL and we'll show you exactly which rules you pass and fail.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3.5 rounded-[7px] bg-blue hover:bg-blue-dark text-[white] font-bold text-sm transition-colors"
            >
              Get My Free Score →
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-5 dm-footer">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="flex items-center gap-2 text-sm font-black tracking-tight">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-6 w-6" aria-hidden="true" />
            <span>
              <span className="text-ink">Grade</span>
              <span className="text-blue">My</span>
              <span className="text-ink">Site</span>
            </span>
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-muted">
            <Link href="mailto:hello@grademy.site" className="hover:text-ink transition-colors">
              hello@grademy.site
            </Link>
            <span className="hidden sm:block">·</span>
            <span>grademy.site</span>
            <span className="hidden sm:block">·</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

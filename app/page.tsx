import Link from "next/link";
import ScanForm from "@/components/ScanForm";

/* ─── Static example data (example free scan — Acorn Plumbing) ───── */
const EXAMPLE = {
  url: "acornplumbing.co.uk",
  grade: "D",
  score: 2,
  outOf: 5,
  headline:
    "Contact details are missing and there's no reason for a visitor to pick you over the next plumber on the list",
  passes: [
    {
      rule: 3,
      name: "You use real numbers, not vague claims",
      finding: "Page states '18 years in business' and 'over 400 jobs completed in Bristol'.",
      rationale: "Numbers beat adjectives. '400+ jobs' is something a visitor can weigh. 'Experienced team' isn't.",
    },
    {
      rule: 4,
      name: "There's one clear thing for visitors to do",
      finding: "A single 'Request a Quote' button sits at the top of the page with no competing buttons.",
      rationale: "When there's one button, visitors know exactly what to do. When there are five, they leave.",
    },
  ],
  fails: [
    {
      rule: 1,
      name: "Google can tell what your page is about",
      finding:
        "The main heading reads 'Welcome to Acorn Plumbing' — tells Google nothing about what the business does or where it works.",
      rationale: "Google reads your H1 to decide what searches to show you for. A generic welcome heading means invisible rankings.",
    },
    {
      rule: 7,
      name: "At least one real customer quote on your homepage",
      finding: "No customer quotes appear on the page — only a '5 stars' badge with no supporting text.",
      rationale: "A specific quote from a named person is worth more than any badge or star rating.",
    },
    {
      rule: 13,
      name: "Your phone number is visible the moment the page loads",
      finding:
        "No phone number in the header. The only contact option is a form on a separate 'Contact' page.",
      rationale: "Most visitors are on a phone. If they can't tap to call from the top of the page, they'll call the next plumber.",
    },
  ],
  biggestWin:
    "Add your phone number to the top of every page so mobile visitors can tap to call immediately. Change 'Welcome to Acorn Plumbing' to something like 'Emergency Plumber in Bristol — We Pick Up 7 Days a Week'. These two changes alone would get more calls within days.",
};

export default function Home() {
  return (
    <div id="top" className="flex flex-col min-h-screen bg-white">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="border-b border-border sticky top-0 bg-white/95 backdrop-blur-sm z-50 dm-nav">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-7 w-7" aria-hidden="true" />
            <span className="text-lg font-black tracking-tight">
              <span className="text-ink">Grade</span>
              <span className="text-blue">My</span>
              <span className="text-ink">Site</span>
            </span>
          </a>
          <nav className="flex items-center gap-5">
            <a href="#how-it-works" className="text-sm font-medium text-muted hover:text-ink transition-colors hidden sm:block">
              How it works
            </a>
            <Link href="/rules" className="text-sm font-medium text-muted hover:text-ink transition-colors hidden sm:block">
              What we check
            </Link>
            <a href="#pricing" className="text-sm font-medium text-muted hover:text-ink transition-colors hidden sm:block">
              Pricing
            </a>
            <a
              href="mailto:hello@grademy.site"
              className="text-sm font-semibold text-blue hover:text-blue-dark transition-colors"
            >
              hello@grademy.site
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="bg-surface px-5 pt-10 pb-14">
          <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-light border border-blue-light mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue animate-pulse" />
            <span className="eyebrow">Free scan — results in 30 seconds</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-ink tracking-tight leading-[1.08] mb-4">
            Free website audit for local businesses —
            <br />
            <span className="text-blue">find out why visitors aren&apos;t calling</span>
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-lg mx-auto mb-8 leading-relaxed">
            Paste your URL below. We check your homepage against 22 rules and
            show you exactly what&apos;s stopping people from getting in touch — free,
            in about 30 seconds, no account needed.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <ScanForm />
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-10 pt-8 border-t border-border">
            {[
              { stat: "22", label: "rules checked" },
              { stat: "~30s", label: "free scan" },
              { stat: "£49", label: "full report" },
              { stat: "<24h", label: "delivery time" },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-ink">{stat}</p>
                <p className="text-xs text-muted mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ── Problem ──────────────────────────────────────────────────── */}
        <section className="bg-slate-900 text-[white] py-16 sm:py-20 px-5 dm-section-base">
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow text-center mb-3">
              Sound familiar?
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-10 leading-tight">
              Your website looks fine to you.
              <br />
              Visitors see something else.
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                {
                  icon: "📞",
                  heading: "The phone doesn't ring",
                  body: "You get traffic — Google Analytics proves it. But visitors look around and leave without making contact.",
                },
                {
                  icon: "🤷",
                  heading: "You can't tell what's wrong",
                  body: "The site went live a few years ago and seemed fine. Now you're not sure if it's the design, the copy, or something else entirely.",
                },
                {
                  icon: "💸",
                  heading: "Competitors win the work",
                  body: "Customers who found you and your competitors chose them. The difference is almost never the service — it's the website.",
                },
              ].map((item) => (
                <div key={item.heading} className="rounded-2xl bg-white/5 border border-white/10 p-5 dm-card-raised">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-[white] mb-1.5 text-sm">{item.heading}</h3>
                  <p className="text-[rgba(255,255,255,0.65)] text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 sm:py-20 px-5 bg-surface">
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow text-center mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center text-ink mb-12">
              A free score in 30 seconds.<br className="hidden sm:block" /> A full report in 24 hours.
            </h2>
            <div className="grid sm:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  heading: "Enter your URL",
                  body: "Paste your homepage address. No account, no login.",
                },
                {
                  step: "02",
                  heading: "We scan your site",
                  body: "We fetch your homepage and check it against 5 key checks in about 30 seconds.",
                },
                {
                  step: "03",
                  heading: "Get your free score",
                  body: "See exactly which rules pass and fail, plus your single biggest quick win.",
                },
                {
                  step: "04",
                  heading: "Upgrade for the full report",
                  body: "All 22 rules checked, copy rewritten for your business — delivered to your inbox within 24 hours.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <p className="text-blue font-bold text-sm mb-3">{item.step}</p>
                  <h3 className="font-bold text-ink mb-1.5 text-sm">{item.heading}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Rules reference ──────────────────────────────────────────── */}
        <div className="text-center py-5 border-b border-border bg-surface">
          <p className="text-sm text-muted">
            We check 22 things most local business websites get wrong.{" "}
            <Link href="/rules" className="text-blue font-medium hover:underline">
              See the full list →
            </Link>
          </p>
        </div>

        {/* ── Example free scan demo ───────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-border">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface text-muted text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-muted" />
                Example — example scan output
              </span>
            </div>

            {/* Score header */}
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6 mb-3 dm-card">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-amber-500 text-[white] rounded-[8px] w-16 h-16 flex items-center justify-center text-3xl font-extrabold shadow-sm flex-shrink-0 tracking-[-0.04em]">
                  {EXAMPLE.grade}
                </div>
                <div>
                  <p className="text-2xl font-black text-ink">
                    {EXAMPLE.score}
                    <span className="text-base font-normal text-muted">/{EXAMPLE.outOf}</span>
                  </p>
                  <p className="text-sm text-muted">quick scan rules passed</p>
                </div>
              </div>
              <p className="text-ink font-medium text-sm">{EXAMPLE.headline}</p>
              <p className="text-xs text-muted mt-1">{EXAMPLE.url}</p>
            </div>

            {/* Rule breakdown */}
            <div className="rounded-2xl border border-border bg-white shadow-sm p-5 mb-3 dm-card">
              <h3 className="eyebrow mb-3">
                5-Rule Quick Scan
              </h3>
              {EXAMPLE.passes.map((r) => (
                <div key={r.rule} className="flex items-start gap-3 py-2.5 border-b border-border">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-green/20 text-green flex items-center justify-center text-xs font-bold">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">Rule {r.rule} — {r.name}</p>
                    <p className="text-xs text-muted mt-0.5">{r.finding}</p>
                    {r.rationale && <p className="text-xs text-muted mt-0.5 italic opacity-75">{r.rationale}</p>}
                  </div>
                </div>
              ))}
              {EXAMPLE.fails.map((r, i) => (
                <div key={r.rule} className={`flex items-start gap-3 py-2.5 ${i < EXAMPLE.fails.length - 1 ? "border-b border-border" : ""}`}>
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-light text-red flex items-center justify-center text-xs font-bold">✗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink">Rule {r.rule} — {r.name}</p>
                    <p className="text-xs text-muted mt-0.5">{r.finding}</p>
                    {r.rationale && <p className="text-xs text-muted mt-0.5 italic opacity-75">{r.rationale}</p>}
                  </div>
                </div>
              ))}
            </div>

            {/* Biggest win */}
            <div className="rounded-2xl bg-blue-light border border-blue-light p-5 mb-4">
              <p className="eyebrow mb-1">
                Biggest Quick Win
              </p>
              <p className="text-sm text-ink">{EXAMPLE.biggestWin}</p>
            </div>

            {/* Upgrade nudge */}
            <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-[white] p-5 dm-section-surface">
              <p className="eyebrow mb-1">
                This was 5 of 22 rules — and the lighter half.
              </p>
              <p className="text-base font-bold mb-1">The full report checks all 22 and rewrites the words for you.</p>
              <p className="text-slate-400 text-xs">Scroll down to see exactly what&apos;s in the paid report ↓</p>
            </div>
          </div>
        </section>

        {/* ── What you get (email report mockup) ───────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-surface border-t border-border">
          <div className="max-w-2xl mx-auto">
            <p className="eyebrow text-center mb-3">
              What you get
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-center text-ink mb-2">
              The full report, in your inbox
            </h2>
            <p className="text-muted text-center text-sm mb-8">
              Example output from a fictional plumbing business scan. Delivered within 24 hours.
            </p>

            {/* Email frame */}
            <div className="rounded-2xl border border-border bg-white shadow-xl overflow-hidden dm-card">
              {/* Mail chrome */}
              <div className="bg-surface border-b border-border px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 ml-3 bg-white border border-border rounded px-3 py-1 text-xs text-muted truncate">
                  Your GradeMysite Report — D grade (7/22 rules passed) · acornplumbing.co.uk
                </div>
              </div>

              {/* Email body */}
              <div className="p-6">
                <p className="text-base font-black tracking-tight mb-1">
                  <span className="text-ink">Grade</span>
                  <span className="text-blue">My</span>
                  <span className="text-ink">Site</span>
                </p>
                <p className="text-xs text-muted mb-5">Your report for: acornplumbing.co.uk</p>

                {/* Score card */}
                <div className="border border-border rounded-2xl p-5 mb-3">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-[8px] bg-amber-500 flex items-center justify-center text-2xl font-extrabold text-[white] flex-shrink-0 tracking-[-0.04em]">
                      D
                    </div>
                    <div>
                      <p className="text-2xl font-black text-ink">
                        7<span className="text-sm font-normal text-muted">/22</span>
                      </p>
                      <p className="text-xs text-muted">rules passed</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-ink">
                    Acorn Plumbing has a solid track record buried behind a homepage that hides the phone number, has no customer quotes, and gives Google nothing to work with.
                  </p>
                </div>

                {/* 3 biggest wins */}
                <div className="bg-slate-900 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Your 3 Biggest Wins</p>
                  {[
                    {
                      rule: "Rule 13 — Your phone number is visible the moment the page loads",
                      impact: "Most of your visitors are on a phone. If your number isn't at the top of the page, they'll call the next plumber on the list.",
                      fix: "Add your mobile number to the header — it takes 10 minutes and will get you calls this week."
                    },
                    {
                      rule: "Rule 1 — Google can tell what your page is about",
                      impact: "Your main heading says 'Welcome to Acorn Plumbing' — Google reads this and doesn't know you fix boilers in Bristol, so it shows you to the wrong people.",
                      fix: "Change the main heading to something like 'Emergency Plumber in Bristol — 18 Years, 400+ Jobs'."
                    },
                    {
                      rule: "Rule 7 — At least one real customer quote on your homepage",
                      impact: "You have a 5-star badge but no actual words from a customer. Anyone can buy a badge — a specific quote from a named person is what makes people trust you.",
                      fix: "Ask your last three customers for a short sentence. One good quote on the homepage is worth more than any badge."
                    }
                  ].map((win, i) => (
                    <div key={i} className={`${i > 0 ? "mt-3 pt-3 border-t border-white/10" : ""}`}>
                      <p className="text-xs font-semibold text-blue mb-1">{win.rule}</p>
                      <p className="text-xs text-[white] mb-1 font-medium">{win.impact}</p>
                      <p className="text-xs text-slate-400"><span className="text-slate-300 font-medium">Fix:</span> {win.fix}</p>
                    </div>
                  ))}
                </div>

                {/* Scorecard rows — sample */}
                <div className="border border-border rounded-xl overflow-hidden mb-3">
                  <div className="px-4 py-2 border-b border-border bg-surface">
                    <span className="eyebrow">22-Rule Scorecard (sample)</span>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border">
                    <div className="p-3">
                      <p className="text-xs font-semibold text-green mb-2">What&apos;s working ✓</p>
                      {[
                        { rule: 3, label: "You use real numbers, not vague claims", finding: "'18 years in business and 400+ jobs completed in Bristol' — specific and credible.", rationale: "Numbers beat adjectives. '400+ jobs' is something a visitor can weigh. 'Experienced team' isn't." },
                        { rule: 4, label: "There's one clear thing for visitors to do", finding: "'Request a Quote' is the only button in the header — no competing options.", rationale: "When there's one button, visitors know exactly what to do. When there are five, they leave." },
                        { rule: 9, label: "You clearly state where you work", finding: "Bristol is mentioned four times on the page, plus Clifton, Redland, and Westbury.", rationale: "Local searchers need to know you cover their area before they'll read anything else." },
                      ].map((row, i) => (
                        <div key={i} className="mb-3 last:mb-0">
                          <p className="text-xs font-semibold text-ink leading-snug">Rule {row.rule} — {row.label}</p>
                          <p className="text-xs text-muted mt-0.5 leading-snug">{row.finding}</p>
                          <p className="text-xs text-muted mt-0.5 leading-snug italic opacity-75">{row.rationale}</p>
                        </div>
                      ))}
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-semibold text-red mb-2">What needs fixing ✗</p>
                      {[
                        { rule: 1, label: "Google can tell what your page is about", finding: "Main heading reads 'Welcome to Acorn Plumbing' — no service or location mentioned.", rationale: "Google reads your H1 to decide what searches to show you for. A generic welcome heading means poor rankings." },
                        { rule: 13, label: "Your phone number is visible the moment the page loads", finding: "No number in the header. Contact is a form on a separate page.", rationale: "Most visitors are on a phone. If they can't tap to call from the top of the page, they'll call the next plumber." },
                        { rule: 7, label: "At least one real customer quote on your homepage", finding: "No testimonials anywhere. A 5-star badge with no words is meaningless.", rationale: "A specific quote from a named person is worth more than any badge or star rating." },
                        { rule: 12, label: "You give at least a rough idea of your prices", finding: "Nothing to indicate what a call-out costs. Many visitors will assume the worst and move on.", rationale: "Visitors who can't see a rough price don't know if they can afford you — many just leave." },
                      ].map((row, i) => (
                        <div key={i} className="mb-3 last:mb-0">
                          <p className="text-xs font-semibold text-ink leading-snug">Rule {row.rule} — {row.label}</p>
                          <p className="text-xs text-muted mt-0.5 leading-snug">{row.finding}</p>
                          <p className="text-xs text-muted mt-0.5 leading-snug italic opacity-75">{row.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rewritten copy */}
                <div className="bg-slate-900 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                    Rewritten words — ready to use
                  </p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue mb-1">New Headline</p>
                    <p className="text-lg font-black text-[white] leading-tight">
                      Bristol&apos;s Emergency Plumber — We Pick Up 7 Days a Week
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue mb-1">Subheadline</p>
                    <p className="text-sm text-slate-300">
                      18 years fixing boilers, burst pipes, and blocked drains across Bristol and South Gloucestershire. Over 400 jobs. We arrive the same day.
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue mb-2">Problem section</p>
                    <ul className="space-y-1.5">
                      {[
                        "You called three companies and only one called back — three days later.",
                        "The last plumber said the job would take an afternoon and was gone by lunchtime, unfinished.",
                        "You just want someone reliable who turns up when they say they will.",
                      ].map((pt) => (
                        <li key={pt} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-blue flex-shrink-0">•</span>{pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue mb-2">Button text</p>
                    <span className="inline-block bg-blue text-[white] text-sm font-bold px-4 py-2 rounded-lg">
                      Call Us Now — We Pick Up 7 Days
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-muted mt-4">
              Fictional example scan — representative of the kind of output delivered within 24 hours of payment.
            </p>
          </div>
        </section>

        {/* ── Why us ───────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-border">
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow text-center mb-3">
              Why GradeMysite
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-center text-ink mb-10">
              Not an automated tool. Every report is human-reviewed.
            </h2>
            <div className="grid sm:grid-cols-3 gap-5 mb-10">
              {[
                {
                  heading: "Specific to your site",
                  body: "Every finding references your actual website — not a generic checklist. If your headline says 'Quality Plumbers in Kent', the report says so.",
                },
                {
                  heading: "Reviewed before it's sent",
                  body: "Unlike automated graders, every paid report is personally read and approved before delivery. You get a quality check, not a raw AI dump.",
                },
                {
                  heading: "Copy you can use immediately",
                  body: "The full report includes a new headline, subheadline, button text, and problem section — based on your business, ready to hand to a developer.",
                },
              ].map((item) => (
                <div key={item.heading} className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="font-bold text-ink mb-2 text-sm">{item.heading}</h3>
                  <p className="text-muted text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="py-16 sm:py-20 px-5 bg-surface border-t border-border">
          <div className="max-w-4xl mx-auto">
            <p className="eyebrow text-center mb-3">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center text-ink mb-3">
              One-time. No subscription.
            </h2>
            <p className="text-muted text-center mb-10 max-w-md mx-auto text-sm">
              Start with the free scan. Upgrade to the full report when you&apos;re ready.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">

              {/* Free */}
              <div className="rounded-2xl border border-border bg-white p-6 flex flex-col dm-card">
                <div className="mb-4">
                  <p className="font-bold text-ink text-base mb-0.5">Quick Scan</p>
                  <p className="text-muted text-xs">See where you stand</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black text-ink">Free</span>
                </div>
                <ul className="space-y-2 text-sm text-muted flex-1 mb-5">
                  {[
                    "5 of the 22 rules",
                    "Pass/fail with specific findings",
                    "Your single biggest quick win",
                    "Results in ~30 seconds",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-green font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-xl border border-border text-ink font-semibold text-sm text-center hover:bg-surface transition-colors"
                >
                  Get My Free Score
                </a>
              </div>

              {/* Full Report */}
              <div className="rounded-2xl border border-blue bg-white p-6 flex flex-col relative mt-4 sm:mt-0 dm-card-raised">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-blue text-[white] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
                <div className="mb-4">
                  <p className="font-bold text-ink text-base mb-0.5">Full Report</p>
                  <p className="text-muted text-xs">Know exactly what to fix</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black text-ink">£49</span>
                  <span className="text-muted text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 text-sm text-muted flex-1 mb-5">
                  {[
                    "Full 22-rule audit with specific findings from your actual website",
                    "New headline, subheadline and button text — ready to hand to your developer",
                    "Problem section rewritten in plain language your customers recognise",
                    "Testimonial prompts — exact questions to ask your best customers",
                    "Human-reviewed and delivered by email within 24 hours",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-green font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-[7px] bg-blue hover:bg-blue-dark text-[white] font-bold text-sm text-center transition-colors"
                >
                  Get My Free Score — £49
                </a>
              </div>

              {/* HTML Package */}
              <div className="rounded-2xl border border-border bg-slate-900 p-6 flex flex-col text-[white] dm-card">
                <div className="mb-4">
                  <p className="font-bold text-base mb-0.5">Report + Homepage</p>
                  <p className="text-slate-400 text-xs">Everything in the full report, plus a branded homepage file ready to hand to your developer — styled in your colours, your fonts, your logo. One payment, no briefing required.</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black">£99</span>
                  <span className="text-slate-400 text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-300 flex-1 mb-5">
                  {[
                    "Everything in Full Report",
                    "Complete HTML homepage file — ready to hand to your developer",
                    "Styled in your existing colours and fonts — looks like your business, not a template",
                    "Your logo included in the header",
                    "Developer handoff notes — no briefing required",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-green font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-[7px] bg-blue hover:bg-blue-dark text-[white] font-bold text-sm text-center transition-colors"
                >
                  Get My Free Score — Upgrade for £99
                </a>
              </div>
            </div>

            <p className="text-center text-muted text-xs mt-6">
              Every paid report is reviewed before delivery. Typical turnaround: under 24 hours.
            </p>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-border">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-ink mb-3">
              See your score in 30 seconds
            </h2>
            <p className="text-muted text-sm mb-8">
              Free. No account. Paste your URL and we&apos;ll show you exactly what&apos;s stopping visitors from calling.
            </p>
            <div className="text-left">
              <ScanForm />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
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
            <a href="mailto:hello@grademy.site" className="hover:text-ink transition-colors">
              hello@grademy.site
            </a>
            <span className="hidden sm:block">·</span>
            <Link href="/rules" className="hover:text-ink transition-colors">
              What we check
            </Link>
            <span className="hidden sm:block">·</span>
            <span>grademy.site</span>
            <span className="hidden sm:block">·</span>
            <span>© {new Date().getFullYear()}</span>
            <span className="hidden sm:block">·</span>
            <span>One-time payments. No subscription.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

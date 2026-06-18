import ScanForm from "@/components/ScanForm";

/* ─── Static example data (Tidal Bespoke free scan) ─────────────────── */
const EXAMPLE = {
  url: "tidalbespoke.com",
  grade: "F",
  score: 1,
  outOf: 5,
  headline:
    "Strong design, but nothing here would make a visitor pick up the phone",
  passes: [
    {
      rule: 9,
      name: "Homepage leads with primary service",
      finding:
        "The hero clearly focuses on one thing: bespoke bathroom creation.",
    },
  ],
  fails: [
    {
      rule: 1,
      name: "Headline states a customer outcome",
      finding:
        "Headline reads 'We specialise in creating beautifully handcrafted homes' — describes the business, not a result the customer gets.",
    },
    {
      rule: 3,
      name: "Single primary CTA",
      finding:
        "Two CTAs compete above the fold at equal weight: 'Our Designs' and 'Contact Us'.",
    },
    {
      rule: 4,
      name: "CTA describes what happens next",
      finding:
        "Primary CTA reads 'Contact Us' — no indication of what happens when you click it.",
    },
    {
      rule: 6,
      name: "At least one testimonial",
      finding: "No customer quotes visible anywhere on the homepage.",
    },
  ],
  biggestWin:
    "Replace 'We specialise in creating beautifully handcrafted homes' with an outcome headline — e.g. 'Your Dream Bathroom, Built to Spec and Installed in 6 Weeks'. Then make one CTA dominant: 'Get a Free Design Consultation'.",
};

export default function Home() {
  return (
    <div id="top" className="flex flex-col min-h-screen bg-white">

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header className="border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center">
            <span className="text-lg font-black tracking-tight">
              <span className="text-slate-900">Grade</span>
              <span className="text-orange-500">My</span>
              <span className="text-slate-900">Site</span>
            </span>
          </a>
          <nav className="flex items-center gap-5">
            <a href="#how-it-works" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              How it works
            </a>
            <a href="#pricing" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors hidden sm:block">
              Pricing
            </a>
            <a
              href="mailto:hello@grademy.site"
              className="text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors"
            >
              hello@grademy.site
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="max-w-3xl mx-auto px-5 pt-10 pb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Free scan — results in 30 seconds
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.08] mb-4">
            Find out why your website
            <br />
            <span className="text-orange-500">isn&apos;t getting calls</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-500 max-w-lg mx-auto mb-8 leading-relaxed">
            Paste your URL below. We check your homepage against 20 conversion
            principles and show you the 5 most critical in 30 seconds — free,
            with no account needed.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <ScanForm />
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-10 mt-10 pt-8 border-t border-slate-100">
            {[
              { stat: "20", label: "conversion rules" },
              { stat: "~30s", label: "free scan" },
              { stat: "£49", label: "full report" },
              { stat: "Human", label: "reviewed" },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-black text-slate-900">{stat}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Problem ──────────────────────────────────────────────────── */}
        <section className="bg-slate-900 text-white py-16 sm:py-20 px-5">
          <div className="max-w-4xl mx-auto">
            <p className="text-orange-400 font-semibold text-sm uppercase tracking-wider text-center mb-3">
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
                <div key={item.heading} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <span className="text-2xl mb-3 block">{item.icon}</span>
                  <h3 className="font-bold text-white mb-1.5 text-sm">{item.heading}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────── */}
        <section id="how-it-works" className="py-16 sm:py-20 px-5 bg-slate-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider text-center mb-3">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center text-slate-900 mb-12">
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
                  body: "We fetch your homepage and check it against 5 key conversion rules in about 30 seconds.",
                },
                {
                  step: "03",
                  heading: "Get your free score",
                  body: "See exactly which rules pass and fail, plus your single biggest quick win.",
                },
                {
                  step: "04",
                  heading: "Upgrade for the full report",
                  body: "All 20 rules, rewritten copy ready to hand to your developer — delivered by email within 24 hours.",
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-orange-100 text-orange-600 font-black text-sm mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1.5 text-sm">{item.heading}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Example free scan demo ───────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-slate-100">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-8">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                Example — real scan output
              </span>
            </div>

            {/* Score header */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 mb-3">
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-red-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center text-3xl font-black shadow-sm flex-shrink-0">
                  {EXAMPLE.grade}
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-900">
                    {EXAMPLE.score}
                    <span className="text-base font-normal text-slate-400">/{EXAMPLE.outOf}</span>
                  </p>
                  <p className="text-sm text-slate-500">quick scan rules passed</p>
                </div>
              </div>
              <p className="text-slate-700 font-medium text-sm">{EXAMPLE.headline}</p>
              <p className="text-xs text-slate-400 mt-1">{EXAMPLE.url}</p>
            </div>

            {/* Rule breakdown */}
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                5-Rule Quick Scan
              </h3>
              {EXAMPLE.passes.map((r) => (
                <div key={r.rule} className="flex items-start gap-3 py-2.5 border-b border-slate-100">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">✓</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Rule {r.rule} — {r.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
                  </div>
                </div>
              ))}
              {EXAMPLE.fails.map((r, i) => (
                <div key={r.rule} className={`flex items-start gap-3 py-2.5 ${i < EXAMPLE.fails.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold">✗</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Rule {r.rule} — {r.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{r.finding}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Biggest win */}
            <div className="rounded-2xl bg-orange-50 border border-orange-100 p-5 mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
                Biggest Quick Win
              </p>
              <p className="text-sm text-slate-800">{EXAMPLE.biggestWin}</p>
            </div>

            {/* Upgrade nudge */}
            <div className="rounded-2xl border-2 border-slate-900 bg-slate-900 text-white p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                This was 5 of 20 rules — and the lighter half.
              </p>
              <p className="text-base font-bold mb-1">The full report checks all 20 and rewrites the copy for you.</p>
              <p className="text-slate-400 text-xs">Scroll down to see exactly what&apos;s in the paid report ↓</p>
            </div>
          </div>
        </section>

        {/* ── What you get (email report mockup) ───────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-slate-50 border-t border-slate-100">
          <div className="max-w-2xl mx-auto">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider text-center mb-3">
              What you get
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 mb-2">
              The full report, in your inbox
            </h2>
            <p className="text-slate-500 text-center text-sm mb-8">
              Real output from a real scan. Delivered within 24 hours.
            </p>

            {/* Email frame */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
              {/* Mail chrome */}
              <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 ml-3 bg-white border border-slate-200 rounded px-3 py-1 text-xs text-slate-400 truncate">
                  Your GradeMysite Report — 3/20 rules passed · tidalbespoke.com
                </div>
              </div>

              {/* Email body */}
              <div className="p-6">
                <p className="text-base font-black tracking-tight mb-5">
                  <span className="text-slate-900">Grade</span>
                  <span className="text-orange-500">My</span>
                  <span className="text-slate-900">Site</span>
                </p>

                {/* Score card */}
                <div className="border border-slate-200 rounded-2xl p-5 mb-3">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 rounded-xl bg-red-500 flex items-center justify-center text-2xl font-black text-white flex-shrink-0">
                      F
                    </div>
                    <div>
                      <p className="text-2xl font-black text-slate-900">
                        3<span className="text-sm font-normal text-slate-400">/20</span>
                      </p>
                      <p className="text-xs text-slate-500">conversion rules passed</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-slate-700">
                    A beautiful but skeletal homepage that hides its phone number, prices, location, and proof — leaving visitors no clear reason or way to act.
                  </p>
                </div>

                {/* Biggest win */}
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">Biggest Quick Win</p>
                  <p className="text-sm text-slate-800">
                    Replace &apos;We specialise in creating beautifully handcrafted homes&apos; with an outcome headline — e.g. &apos;Your Dream Bathroom, Built to Spec and Installed in 6 Weeks&apos;. This single change addresses Rule 1, the most critical failing on the page.
                  </p>
                </div>

                {/* Scorecard rows */}
                <div className="border border-slate-200 rounded-xl overflow-hidden mb-3">
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">20-Rule Scorecard (sample)</span>
                  </div>
                  {[
                    { pass: true,  label: "Rule 2 — At least one specific number",       finding: "'Over 10 years of experience' gives a measurable claim." },
                    { pass: true,  label: "Rule 9 — Homepage leads with primary service", finding: "The hero clearly positions bespoke bathroom creation as the main offer." },
                    { pass: false, label: "Rule 1 — Headline states a customer outcome",  finding: "Headline describes the business, not a result the visitor gets." },
                    { pass: false, label: "Rule 11 — Pricing or price indication",        finding: "No price or 'from £X' figure anywhere on the page. Visitors can't self-qualify." },
                    { pass: false, label: "Rule 12 — Contact immediately accessible",     finding: "No phone number in the header. Contact requires navigating to a separate page." },
                    { pass: false, label: "Rule 20 — Next step after contact is clear",   finding: "Nothing on the page explains what happens after you submit the contact form." },
                  ].map((row, i, arr) => (
                    <div key={i} className={`flex items-start gap-3 px-4 py-3 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold ${row.pass ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}>
                        {row.pass ? "✓" : "✗"}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-700">{row.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{row.finding}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rewritten copy */}
                <div className="bg-slate-900 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
                    Rewritten Copy — Ready to Use
                  </p>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">New Headline</p>
                    <p className="text-lg font-black text-white leading-tight">
                      Your Dream Bathroom, Built to Spec and Installed on Time
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">Subheadline</p>
                    <p className="text-sm text-slate-300">
                      Bespoke bathroom installations across Surrey and the South East — over 10 years and 200+ projects completed.
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Problem Section</p>
                    <ul className="space-y-1.5">
                      {[
                        "You've been quoted wildly different prices and don't know who to trust",
                        "The last contractor left a job half-finished or over budget",
                        "You want something beautiful, but the whole process feels uncertain",
                      ].map((pt) => (
                        <li key={pt} className="flex gap-2 text-sm text-slate-300">
                          <span className="text-orange-400 flex-shrink-0">•</span>{pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-orange-400 mb-2">Primary CTA</p>
                    <span className="inline-block bg-orange-500 text-white text-sm font-bold px-4 py-2 rounded-lg">
                      Get a Free Design Consultation
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Real output from a real scan of tidalbespoke.com — delivered within 24 hours of payment.
            </p>
          </div>
        </section>

        {/* ── Why us ───────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider text-center mb-3">
              Why GradeMysite
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-center text-slate-900 mb-10">
              Not an automated tool. Every report is human-reviewed.
            </h2>
            <div className="grid sm:grid-cols-3 gap-5 mb-10">
              {[
                {
                  heading: "Specific to your site",
                  body: "Every finding references your actual copy — not a generic checklist. If your headline says 'Quality Plumbers in Kent', the report says so.",
                },
                {
                  heading: "Reviewed before it's sent",
                  body: "Unlike automated graders, every paid report is personally read and approved before delivery. You get a quality check, not a raw AI dump.",
                },
                {
                  heading: "Copy you can use immediately",
                  body: "The full report includes a rewritten headline, subheadline, CTA, and problem section — based on your business, ready to hand to a developer.",
                },
              ].map((item) => (
                <div key={item.heading} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
                  <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.heading}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-3xl flex-shrink-0">🛡️</div>
              <div>
                <p className="font-bold text-slate-900 text-sm mb-1">7-day money-back guarantee</p>
                <p className="text-slate-600 text-sm">
                  If your full report doesn&apos;t identify at least 3 specific, actionable changes to your website copy, email{" "}
                  <a href="mailto:hello@grademy.site" className="text-orange-600 font-medium hover:underline">
                    hello@grademy.site
                  </a>{" "}
                  within 7 days and we&apos;ll refund you in full. No questions asked.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Pricing ──────────────────────────────────────────────────── */}
        <section id="pricing" className="py-16 sm:py-20 px-5 bg-slate-50 border-t border-slate-100">
          <div className="max-w-4xl mx-auto">
            <p className="text-orange-500 font-semibold text-sm uppercase tracking-wider text-center mb-3">
              Pricing
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center text-slate-900 mb-3">
              One-time. No subscription.
            </h2>
            <p className="text-slate-500 text-center mb-10 max-w-md mx-auto text-sm">
              Start with the free scan. Upgrade to the full report when you&apos;re ready.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-stretch">

              {/* Free */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col">
                <div className="mb-4">
                  <p className="font-bold text-slate-900 text-base mb-0.5">Quick Scan</p>
                  <p className="text-slate-500 text-xs">See where you stand</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900">Free</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 flex-1 mb-5">
                  {[
                    "5 of the 20 conversion rules",
                    "Pass/fail with specific findings",
                    "Your single biggest quick win",
                    "Results in ~30 seconds",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm text-center hover:bg-slate-50 transition-colors"
                >
                  Get My Free Score
                </a>
              </div>

              {/* Full Report */}
              <div className="rounded-2xl border-2 border-orange-500 bg-white p-6 flex flex-col relative mt-4 sm:mt-0">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </span>
                </div>
                <div className="mb-4">
                  <p className="font-bold text-slate-900 text-base mb-0.5">Full Report</p>
                  <p className="text-slate-500 text-xs">Know exactly what to fix</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900">£49</span>
                  <span className="text-slate-400 text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-600 flex-1 mb-5">
                  {[
                    "Full 20-rule audit with specific findings from your actual copy",
                    "Rewritten headline, subheadline and CTA — ready to hand to your developer",
                    "Problem section rewrite in customer language",
                    "Testimonial prompts — exact questions to ask your best customers",
                    "Human-reviewed and delivered by email within 24 hours",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm text-center transition-colors"
                >
                  Get My Free Score — Upgrade for £49
                </a>
              </div>

              {/* HTML Package */}
              <div className="rounded-2xl border border-violet-500/30 bg-slate-900 p-6 flex flex-col text-white relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <span className="bg-violet-500/20 text-violet-300 text-xs font-semibold px-2 py-0.5 rounded-full">
                    NEW
                  </span>
                </div>
                <div className="mb-4">
                  <p className="font-bold text-base mb-0.5">Report + HTML</p>
                  <p className="text-slate-400 text-xs">A ready-to-build homepage for your developer</p>
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black">£149</span>
                  <span className="text-slate-400 text-sm ml-1">one-time</span>
                </div>
                <ul className="space-y-2 text-sm text-slate-300 flex-1 mb-5">
                  {[
                    "Everything in Full Report",
                    "Complete HTML homepage file",
                    "Tailwind-styled, mobile-ready",
                    "Developer handoff notes included",
                    "Drop-in replacement — no redesign needed",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-violet-400 font-bold flex-shrink-0 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="#top"
                  className="block w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm text-center transition-colors"
                >
                  Get My Free Score — Upgrade for £149
                </a>
              </div>
            </div>

            <p className="text-center text-slate-400 text-xs mt-6">
              Every paid report is reviewed before delivery. Typical turnaround: under 24 hours. 7-day money-back guarantee.
            </p>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="py-16 sm:py-20 px-5 bg-white border-t border-slate-100">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
              See your score in 30 seconds
            </h2>
            <p className="text-slate-500 text-sm mb-8">
              Free. No account. Paste your URL and we&apos;ll show you exactly what&apos;s stopping visitors from calling.
            </p>
            <div className="text-left">
              <ScanForm />
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-black tracking-tight">
            <span className="text-slate-900">Grade</span>
            <span className="text-orange-500">My</span>
            <span className="text-slate-900">Site</span>
          </span>
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-xs text-slate-400">
            <a href="mailto:hello@grademy.site" className="hover:text-slate-600 transition-colors">
              hello@grademy.site
            </a>
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

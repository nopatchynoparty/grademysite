export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-slate-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center">
          <a href="/" className="text-lg font-black text-slate-900 tracking-tight">
            Grade<span className="text-orange-500">My</span>Site
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-emerald-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Payment received
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed mb-8">
            Your report will be delivered to your email within 24 hours.
          </p>

          <div className="rounded-2xl bg-slate-50 border border-slate-100 p-5 text-left mb-8">
            <p className="text-sm font-semibold text-slate-700 mb-2">What happens next</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">1.</span>
                We run your site through all 20 conversion rules
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">2.</span>
                We rewrite your headline, CTA, and problem section using your actual copy
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">3.</span>
                We review and approve the output before it leaves
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 font-bold mt-0.5">4.</span>
                It lands in your inbox — ready to hand to your developer
              </li>
            </ul>
          </div>

          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Back to home
          </a>
        </div>
      </main>
    </div>
  );
}

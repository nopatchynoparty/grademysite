export default function CancelPage() {
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
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Payment cancelled
          </h1>
          <p className="text-slate-500 text-lg mb-8">
            No charge was made. Your free scan results are still available.
          </p>

          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-colors"
          >
            Back to my results
          </a>
        </div>
      </main>
    </div>
  );
}

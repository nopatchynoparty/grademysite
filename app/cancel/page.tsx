export default function CancelPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center">
          <a href="/" className="text-lg font-black text-ink tracking-tight">
            Grade<span className="text-blue">My</span>Site
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-20">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-muted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <h1 className="text-3xl font-black text-ink mb-3">
            Payment cancelled
          </h1>
          <p className="text-muted text-lg mb-8">
            No charge was made. Your free scan results are still available.
          </p>

          <a
            href="/"
            className="inline-block px-5 py-3 rounded-[7px] bg-blue hover:bg-blue-dark text-white font-bold text-sm transition-colors"
          >
            Back to my results
          </a>
        </div>
      </main>
    </div>
  );
}

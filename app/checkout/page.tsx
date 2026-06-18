import CheckoutForm from "@/components/CheckoutForm";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier } = await searchParams;
  const validTier = tier === "html" ? "html" : "report";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center">
          <a href="/" className="text-lg font-black text-ink tracking-tight">
            Grade<span className="text-blue">My</span>Site
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="max-w-md w-full">
          <div className="mb-8">
            <p className="eyebrow mb-2">
              {validTier === "html" ? "Report + HTML Page" : "Full Report"}
            </p>
            <h1 className="text-3xl font-black text-ink mb-2">
              {validTier === "html" ? "£149 one-time" : "£49 one-time"}
            </h1>
            <p className="text-muted">
              {validTier === "html"
                ? "Full 20-rule analysis, rewritten copy, and a ready-to-build HTML homepage."
                : "Full 20-rule analysis with rewritten headlines, CTAs, and copy for your business."}
            </p>
          </div>

          <CheckoutForm tier={validTier} />
        </div>
      </main>
    </div>
  );
}

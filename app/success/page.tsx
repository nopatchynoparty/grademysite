import Stripe from "stripe";
import { redirect } from "next/navigation";

async function getSessionMeta(
  sessionId: string
): Promise<{ upgrade: boolean; tier: string | null } | null> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;
    return {
      upgrade: session.metadata?.upgrade === "true",
      tier: session.metadata?.tier ?? null,
    };
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  if (!session_id) redirect("/");

  const meta = await getSessionMeta(session_id);
  if (!meta) redirect("/cancel");

  const { upgrade, tier } = meta;

  if (upgrade) {
    return (
      <SuccessLayout
        icon="html"
        heading="HTML page incoming"
        subheading="We're building your new homepage now. It'll land in your inbox within 24 hours."
        steps={[
          "We generate a complete HTML homepage using your existing report copy",
          "The file is reviewed before it goes out",
          "It arrives as an email attachment — ready to hand to your developer",
          "Your developer replaces your current homepage with the file",
        ]}
      />
    );
  }

  if (tier === "html") {
    return (
      <SuccessLayout
        icon="html"
        heading="Report + Homepage incoming"
        subheading="We'll run your full audit and build your new homepage. Both land in your inbox within 24 hours."
        steps={[
          "We run your site through all 22 rules with specific findings",
          "We rewrite your headline, CTA, and copy — and build it into a complete HTML file",
          "We review and approve everything before it leaves",
          "Both the report and HTML homepage land in your inbox, ready to hand to your developer",
        ]}
      />
    );
  }

  return (
    <SuccessLayout
      icon="report"
      heading="Payment received"
      subheading="Your report will be delivered to your email within 24 hours."
      steps={[
        "We run your site through all 22 rules",
        "We rewrite your headline, CTA, and problem section using your actual copy",
        "We review and approve the output before it leaves",
        "It lands in your inbox — ready to hand to your developer",
      ]}
    />
  );
}

function SuccessLayout({
  icon,
  heading,
  subheading,
  steps,
}: {
  icon: "report" | "html";
  heading: string;
  subheading: string;
  steps: string[];
}) {
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
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${
              icon === "html" ? "bg-blue-light" : "bg-green/20"
            }`}
          >
            {icon === "html" ? (
              <svg
                className="w-8 h-8 text-blue"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>

          <h1 className="text-3xl font-black text-ink mb-3">{heading}</h1>
          <p className="text-muted text-lg leading-relaxed mb-8">{subheading}</p>

          <div className="rounded-2xl bg-surface border border-border p-5 text-left mb-8">
            <p className="text-sm font-semibold text-ink mb-3">What happens next</p>
            <ul className="space-y-2.5 text-sm text-muted">
              {steps.map((step, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl border border-border text-ink font-semibold text-sm hover:bg-surface transition-colors"
          >
            Back to home
          </a>
        </div>
      </main>
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Grade My Site",
  description: "Terms and conditions for using Grade My Site.",
};

const LAST_UPDATED = "21 June 2026";

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="border-b border-border px-5 py-4">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="flex items-center gap-2 w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="" className="h-6 w-6" aria-hidden="true" />
            <span className="text-sm font-black tracking-tight">
              <span className="text-ink">Grade</span>
              <span className="text-blue">My</span>
              <span className="text-ink">Site</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <h1 className="text-3xl font-black text-ink mb-2">Terms of Service</h1>
        <p className="text-muted text-sm mb-10">Last updated {LAST_UPDATED}</p>

        <div className="prose-legal">

          <Section title="Who we are">
            <p>Grade My Site is operated by Patrick Silcocks ("we", "us", "our"). By using this website or purchasing a report, you agree to these terms. If you do not agree, please do not use the service.</p>
            <p>Contact: <a href="mailto:hello@grademy.site">hello@grademy.site</a></p>
          </Section>

          <Section title="What the service is">
            <p>Grade My Site provides automated and human-reviewed website audits for local business homepages. After purchasing, we scan your homepage against 22 criteria and deliver a written report by email, typically within 24 hours.</p>
            <p>The £99 "Report + Homepage" tier also includes a complete HTML homepage file, styled and ready to hand to a developer.</p>
          </Section>

          <Section title="What the service is not">
            <p>The report is editorial opinion and practical guidance — not legal, financial, or professional advice. We make no guarantee that acting on the report's recommendations will increase your enquiries, website traffic, or revenue. Results will vary depending on your market, competition, and how you implement the suggestions.</p>
            <p>We are not a web development agency. The report tells you what to change; it does not change it for you (unless you purchase the Homepage tier, which provides an HTML file for your developer to implement).</p>
          </Section>

          <Section title="Payment">
            <p>Payments are processed securely by Stripe. We accept major debit and credit cards. All prices are shown inclusive of VAT where applicable. Purchases are one-time — there is no subscription and you will not be charged again.</p>
            <p>Your receipt will be sent to the email address you provide at checkout.</p>
          </Section>

          <Section title="Delivery">
            <p>Reports are typically delivered within 24 hours of payment. Every report is reviewed by a human before sending. Delivery may take longer during periods of high demand or if your website is temporarily unavailable for scanning.</p>
            <p>If we are unable to scan your website (e.g. it is password-protected, returns errors, or contains no meaningful content), we will contact you to discuss options including a full refund.</p>
          </Section>

          <Section title="Cancellation rights and refunds">
            <p>Under the Consumer Contracts (Information, Cancellation and Additional Charges) Regulations 2013, you have a 14-day right to cancel a purchase of digital content. However, by ticking the consent box at checkout, you expressly request that we begin delivering your report immediately and acknowledge that you lose your right to cancel once delivery has started.</p>
            <p>Once your report has been delivered to your email address, no refund is available.</p>
            <p>If your report has not yet been delivered and you wish to cancel, contact us at <a href="mailto:hello@grademy.site">hello@grademy.site</a> and we will issue a full refund.</p>
            <p>If you believe there is a factual error in your report — a finding that is demonstrably incorrect based on what is actually on your homepage — we will review and correct it at no charge.</p>
          </Section>

          <Section title="Your responsibilities">
            <p>By submitting a URL, you confirm that you are authorised to request an audit of that website — either because it is your own site or you have the owner's permission.</p>
            <p>You must not use the service to audit competitor websites with the intent to harm or deceive them, or for any unlawful purpose.</p>
          </Section>

          <Section title="Intellectual property">
            <p>The report and any homepage file we deliver are yours to use for your own business. You may share them with your developer, designer, or colleagues. You may not resell, republish, or present them as your own original work.</p>
            <p>The Grade My Site brand, website, and methodology remain our property.</p>
          </Section>

          <Section title="Limitation of liability">
            <p>To the maximum extent permitted by law, our total liability to you for any claim arising from use of the service is limited to the amount you paid for that specific report.</p>
            <p>We are not liable for any indirect, consequential, or loss-of-profit damages arising from the report or your use of it.</p>
            <p>Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud, or any other liability that cannot be excluded by law.</p>
          </Section>

          <Section title="Governing law">
            <p>These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.</p>
          </Section>

          <Section title="Changes to these terms">
            <p>We may update these terms from time to time. The version in effect at the time of your purchase applies to that purchase. Continued use of the service after changes constitutes acceptance of the updated terms.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about these terms? Email <a href="mailto:hello@grademy.site">hello@grademy.site</a>.</p>
          </Section>

        </div>
      </main>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted">
        <Link href="/" className="hover:text-ink transition-colors">← Back to Grade My Site</Link>
        <span className="mx-3">·</span>
        <Link href="/privacy" className="hover:text-ink transition-colors">Privacy Policy</Link>
      </footer>

      <style>{`
        .prose-legal p { margin-bottom: 1rem; line-height: 1.7; color: var(--color-ink); font-size: 0.9375rem; }
        .prose-legal ul { margin: 0.75rem 0 1rem 1.25rem; list-style: disc; }
        .prose-legal ul li { margin-bottom: 0.4rem; line-height: 1.6; color: var(--color-ink); font-size: 0.9375rem; }
        .prose-legal a { color: var(--color-blue); text-decoration: underline; text-decoration-color: transparent; }
        .prose-legal a:hover { text-decoration-color: var(--color-blue); }
        .prose-legal strong { color: var(--color-ink); }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold text-ink mb-4 pb-2 border-b border-border">{title}</h2>
      {children}
    </section>
  );
}

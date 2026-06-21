import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Grade My Site",
  description: "How Grade My Site collects, uses, and protects your personal data.",
};

const LAST_UPDATED = "21 June 2026";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
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
        <h1 className="text-3xl font-black text-ink mb-2">Privacy Policy</h1>
        <p className="text-muted text-sm mb-10">Last updated {LAST_UPDATED}</p>

        <div className="prose-legal">

          <Section title="Who we are">
            <p>Grade My Site is a website audit service for local businesses, operated by Patrick Silcocks. You can contact us at <a href="mailto:hello@grademy.site">hello@grademy.site</a>.</p>
            <p>We are the data controller for any personal data you provide to us.</p>
          </Section>

          <Section title="What data we collect">
            <p>We collect only what is necessary to provide the service:</p>
            <ul>
              <li><strong>Your website URL</strong> — submitted so we can audit your homepage.</li>
              <li><strong>Your email address</strong> — so we can deliver your report. If you pay, we also use it to send your receipt via Stripe.</li>
              <li><strong>Payment information</strong> — handled entirely by Stripe. We never see or store your card details.</li>
            </ul>
            <p>We do not collect your name, address, phone number, or any other personal information unless you include it in an email to us.</p>
          </Section>

          <Section title="How we use your data">
            <ul>
              <li>To perform the website audit (your URL is sent to Firecrawl for page scraping and to Anthropic's API for analysis)</li>
              <li>To deliver your report by email (your email address is sent to Resend, our email delivery provider)</li>
              <li>To process your payment (your email is shared with Stripe)</li>
              <li>To store your job and report results so we can review and approve them before sending</li>
            </ul>
            <p>We do not use your data for advertising, profiling, or any purpose beyond delivering the service you paid for.</p>
          </Section>

          <Section title="Third parties we share data with">
            <p>To deliver the service, your data passes through the following processors:</p>
            <table>
              <thead>
                <tr><th>Provider</th><th>Purpose</th><th>Privacy policy</th></tr>
              </thead>
              <tbody>
                <tr><td>Stripe</td><td>Payment processing</td><td><a href="https://stripe.com/gb/privacy" target="_blank" rel="noopener noreferrer">stripe.com/gb/privacy</a></td></tr>
                <tr><td>Anthropic</td><td>AI analysis of your homepage</td><td><a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer">anthropic.com/privacy</a></td></tr>
                <tr><td>Firecrawl</td><td>Scraping your homepage content</td><td><a href="https://www.firecrawl.dev/privacy" target="_blank" rel="noopener noreferrer">firecrawl.dev/privacy</a></td></tr>
                <tr><td>Resend</td><td>Sending your report by email</td><td><a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">resend.com/legal/privacy-policy</a></td></tr>
                <tr><td>Supabase</td><td>Storing job data and report results</td><td><a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">supabase.com/privacy</a></td></tr>
              </tbody>
            </table>
            <p>We do not sell your data to any third party.</p>
          </Section>

          <Section title="Cookies">
            <p>This site uses only strictly necessary cookies:</p>
            <ul>
              <li><strong>admin-auth</strong> — used to authenticate the admin dashboard. Only set for site administrators, not visitors or customers.</li>
              <li><strong>Stripe cookies</strong> — set during the checkout process for fraud prevention and payment security. These are necessary to complete your purchase.</li>
            </ul>
            <p>We do not use analytics cookies, advertising cookies, or any third-party tracking. No cookie consent banner is required because we do not set non-essential cookies.</p>
          </Section>

          <Section title="How long we keep your data">
            <p>We retain your URL, email address, and report results for up to 12 months from the date of your scan. After that, your data is deleted. You can request earlier deletion at any time — see "Your rights" below.</p>
          </Section>

          <Section title="Your rights under UK GDPR">
            <p>You have the right to:</p>
            <ul>
              <li><strong>Access</strong> — request a copy of the personal data we hold about you</li>
              <li><strong>Correction</strong> — ask us to correct inaccurate data</li>
              <li><strong>Erasure</strong> — ask us to delete your data</li>
              <li><strong>Restriction</strong> — ask us to stop processing your data in certain circumstances</li>
              <li><strong>Portability</strong> — request your data in a machine-readable format</li>
              <li><strong>Objection</strong> — object to processing based on legitimate interests</li>
            </ul>
            <p>To exercise any of these rights, email <a href="mailto:hello@grademy.site">hello@grademy.site</a>. We will respond within 30 days.</p>
            <p>You also have the right to lodge a complaint with the UK Information Commissioner's Office (ICO) at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.</p>
          </Section>

          <Section title="Changes to this policy">
            <p>We may update this policy from time to time. The "last updated" date at the top of this page will always reflect the most recent version. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </Section>

          <Section title="Contact">
            <p>Questions about this policy? Email <a href="mailto:hello@grademy.site">hello@grademy.site</a>.</p>
          </Section>

        </div>
      </main>

      <footer className="border-t border-border px-5 py-6 text-center text-xs text-muted">
        <Link href="/" className="hover:text-ink transition-colors">← Back to Grade My Site</Link>
        <span className="mx-3">·</span>
        <Link href="/terms" className="hover:text-ink transition-colors">Terms of Service</Link>
      </footer>

      <style>{`
        .prose-legal p { margin-bottom: 1rem; line-height: 1.7; color: #374151; font-size: 0.9375rem; }
        .prose-legal ul { margin: 0.75rem 0 1rem 1.25rem; list-style: disc; }
        .prose-legal ul li { margin-bottom: 0.4rem; line-height: 1.6; color: #374151; font-size: 0.9375rem; }
        .prose-legal a { color: #3B6CF4; text-decoration: underline; text-decoration-color: transparent; }
        .prose-legal a:hover { text-decoration-color: #3B6CF4; }
        .prose-legal strong { color: #1B2534; }
        .prose-legal table { width: 100%; border-collapse: collapse; margin: 0.75rem 0 1rem; font-size: 0.875rem; }
        .prose-legal th { text-align: left; padding: 8px 12px; background: #F4F6F8; font-weight: 600; color: #1B2534; border-bottom: 1px solid #E5E7EB; }
        .prose-legal td { padding: 8px 12px; border-bottom: 1px solid #E5E7EB; color: #374151; vertical-align: top; }
        .prose-legal td:first-child { font-weight: 500; white-space: nowrap; }
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

"use client";

import { useState } from "react";

export default function CheckoutForm({ tier }: { tier: "report" | "html" }) {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waived, setWaived] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, url, email, scanResults: null }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not start checkout. Please try again.");
      } else if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Your website URL
        </label>
        <input
          type="url"
          required
          placeholder="https://yourwebsite.co.uk"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent dm-input"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink mb-1.5">
          Your email address
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-border text-ink placeholder:text-muted text-base focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent dm-input"
        />
        <p className="text-xs text-muted mt-1.5">
          Your report will be delivered here within 24 hours.
        </p>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={waived}
          onChange={(e) => setWaived(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded accent-blue cursor-pointer"
        />
        <span className="text-xs text-muted leading-relaxed">
          Start my audit now — I understand work begins on payment and I won't be able to cancel once it's underway.
        </span>
      </label>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-light border border-red-light text-red text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !waived}
        className="w-full py-3.5 rounded-[7px] bg-blue hover:bg-blue-dark text-white font-bold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Redirecting to payment…"
          : `Pay ${tier === "html" ? "£99" : "£49"} →`}
      </button>

      <p className="text-xs text-muted text-center">
        Secure payment via Stripe. One-time charge, no subscription.
      </p>
    </form>
  );
}

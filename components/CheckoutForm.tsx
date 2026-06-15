"use client";

import { useState } from "react";

export default function CheckoutForm({ tier }: { tier: "report" | "html" }) {
  const [url, setUrl] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Your website URL
        </label>
        <input
          type="url"
          required
          placeholder="https://yourwebsite.co.uk"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Your email address
        </label>
        <input
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-base focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
        <p className="text-xs text-slate-400 mt-1.5">
          Your report will be delivered here within 24 hours.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-base transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading
          ? "Redirecting to payment…"
          : `Pay ${tier === "html" ? "£149" : "£49"} →`}
      </button>

      <p className="text-xs text-slate-400 text-center">
        Secure payment via Stripe. One-time charge, no subscription.
      </p>
    </form>
  );
}

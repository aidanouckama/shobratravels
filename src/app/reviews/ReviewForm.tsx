"use client";

import { useState } from "react";
import { Star, Check } from "lucide-react";
import { track } from "@/lib/analytics";

export default function ReviewForm() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", content: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const payload: Record<string, unknown> = {
        name: form.name,
        content: form.content,
        rating,
      };
      if (form.email) payload.email = form.email;
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setSubmitted(true);
        track("review_submitted", { rating });
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Failed to submit. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12 border border-green-200 bg-green-50">
        <div className="w-12 h-12 bg-accent flex items-center justify-center mx-auto mb-4">
          <Check size={20} className="text-white" strokeWidth={3} />
        </div>
        <p className="font-bold uppercase tracking-wider text-sm mb-1">
          Thank You
        </p>
        <p className="text-neutral-500 text-sm">
          Your review will appear once approved.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Your Name
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Email <span className="text-neutral-400 normal-case tracking-normal">(optional — we'll let you know when your review is published)</span>
        </label>
        <input
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          className="w-full border-b-2 border-neutral-200 px-0 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-3">
          Rating
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={28}
                className={
                  star <= (hover || rating)
                    ? "text-accent fill-accent"
                    : "text-neutral-200"
                }
              />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
          Your Review
        </label>
        <textarea
          required
          rows={4}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          placeholder="Tell us about your experience..."
          className="w-full border-2 border-neutral-200 px-4 py-3 bg-transparent focus:outline-none focus:border-accent transition-colors resize-none"
        />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="bg-accent hover:bg-accent-dark text-white font-semibold py-3 uppercase tracking-wider text-sm transition-colors disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

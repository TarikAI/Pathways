"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewForm({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const decision = formData.get("decision") as string;
    const comment = formData.get("comment") as string;

    try {
      const res = await fetch(`/api/reports/${reportId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      router.refresh();
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit review";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-brand-beige p-6 sticky top-6">
      <h2 className="text-lg font-semibold text-brand-navy mb-4">Add Review</h2>
      
      {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Decision</label>
          <select name="decision" required className="w-full border border-gray-300 rounded p-2 focus:ring-brand-teal focus:border-brand-teal">
            <option value="APPROVED">Approve</option>
            <option value="REJECTED">Reject (Needs Revision)</option>
            <option value="UNDER_REVIEW">Keep Under Review</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-navy mb-1">Feedback Comment</label>
          <textarea name="comment" required rows={4} className="w-full border border-gray-300 rounded p-2" placeholder="Provide constructive feedback..."></textarea>
        </div>

        <button type="submit" disabled={submitting} className="w-full bg-brand-navy hover:bg-brand-teal text-white py-2 px-4 rounded transition-colors disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
}

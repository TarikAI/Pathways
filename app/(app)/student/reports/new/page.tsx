"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewReportPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    // Dummy submit logic since no backend endpoint for report creation was explicitly requested, but we need the form.
    await new Promise(res => setTimeout(res, 1000));
    router.push("/student/reports");
    router.refresh();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Submit Report</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Report Title</label>
            <input type="text" id="title" required className="form-control" placeholder="e.g. Week 3 Progress" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="body">Report Content</label>
            <textarea id="body" required className="form-control" rows={6} placeholder="Describe your week..."></textarea>
          </div>
          <button type="submit" disabled={submitting} className="btn btn-primary w-full">
            {submitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}

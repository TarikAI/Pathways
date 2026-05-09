"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

type Report = {
  id: string;
  title: string;
  body: string;
  weekNumber: number;
  internship: {
    id: string;
    program: { title: string };
  };
  attachments: Array<{
    id: string;
    filename: string;
    url: string;
  }>;
};

export default function EditReportForm({ report }: { report: Report }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const weekNumber = parseInt(formData.get("weekNumber") as string, 10);

    const attachments: Array<{
      url: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    }> = [];

    if (file) {
      try {
        const fileData = new FormData();
        fileData.append("file", file);

        const uploadRes = await fetch(
          `/api/uploads?filename=${encodeURIComponent(file.name)}`,
          {
            method: "POST",
            body: file,
          }
        );

        if (!uploadRes.ok) {
          throw new Error("File upload failed");
        }

        const blob = await uploadRes.json();
        attachments.push({
          url: blob.url,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload attachment";
        setError(message);
        setSubmitting(false);
        return;
      }
    }

    try {
      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          weekNumber,
          attachments,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update report");
      }

      router.push(`/student/reports/${report.id}`);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update report";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href={`/student/reports/${report.id}`}
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Report
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-brand-navy">Edit Report</h1>

      <div className="bg-white rounded-lg shadow-sm p-6 border border-brand-beige">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Program
            </label>
            <input
              type="text"
              value={report.internship.program.title}
              disabled
              className="w-full border border-gray-300 rounded p-2 bg-gray-50"
            />
            <input
              type="hidden"
              name="internshipId"
              value={report.internship.id}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Week Number
            </label>
            <input
              type="number"
              name="weekNumber"
              min="1"
              defaultValue={report.weekNumber}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Report Title
            </label>
            <input
              type="text"
              name="title"
              defaultValue={report.title}
              required
              className="w-full border border-gray-300 rounded p-2"
              placeholder="e.g. Week 1 Progress Report"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Report Content
            </label>
            <textarea
              name="body"
              required
              rows={8}
              defaultValue={report.body}
              className="w-full border border-gray-300 rounded p-2"
              placeholder="Describe your activities..."
            />
          </div>

          {report.attachments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-brand-navy mb-2">
                Current Attachments
              </label>
              <div className="space-y-2">
                {report.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-2 border border-gray-200 rounded text-sm hover:bg-gray-50"
                  >
                    <span className="flex-1 truncate">{att.filename}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-brand-navy mb-1">
              Add New Attachment (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md relative hover:bg-gray-50 cursor-pointer">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md font-medium text-brand-teal hover:text-brand-navy focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-teal"
                  >
                    <span>{file ? file.name : "Upload a file"}</span>
                    <input
                      id="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {!file && <p className="pl-1">or drag and drop</p>}
                </div>
                <p className="text-xs text-gray-500">PDF, DOCX up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-brand-navy hover:bg-brand-teal text-white py-2 px-4 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            <Link
              href={`/student/reports/${report.id}`}
              className="btn btn-outline"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ReportAttachment {
  id: string;
  filename: string;
  url: string;
}

interface Report {
  id: string;
  title: string;
  body: string;
  weekNumber: number;
  internship: {
    id: string;
    program: { title: string };
  };
  attachments: ReportAttachment[];
}

interface EditReportFormProps {
  report: Report;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_FILE_TYPES = [".pdf", ".docx", ".doc"];

export default function EditReportForm({ report }: EditReportFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return { valid: false, error: "File size must be less than 10MB" };
    }
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_FILE_TYPES.includes(extension)) {
      return {
        valid: false,
        error: "Only PDF and DOCX files are accepted",
      };
    }
    return { valid: true };
  };

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setUploadProgress(true);
    try {
      const response = await fetch(
        `/api/uploads?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        }
      );

      if (!response.ok) {
        throw new Error("File upload failed");
      }

      const data = await response.json();
      return data.url;
    } finally {
      setUploadProgress(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const weekNumber = parseInt(formData.get("weekNumber") as string, 10);

    // Basic validation
    if (!title.trim() || !body.trim()) {
      setError("Title and content are required");
      setSubmitting(false);
      return;
    }

    const attachments: Array<{
      url: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
    }> = [];

    if (file) {
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error || "Invalid file");
        setSubmitting(false);
        return;
      }

      try {
        const url = await uploadFile(file);
        attachments.push({
          url,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
      } catch (err) {
        setError("Failed to upload file. Please try again.");
        setSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          weekNumber,
          attachments,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update report");
      }

      router.push(`/student/reports/${report.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update report"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Link
        href={`/student/reports/${report.id}`}
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Report
      </Link>

      <h1 className="text-3xl font-bold mb-6 text-brand-navy">Edit Report</h1>

      <div className="card">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Program</label>
            <input
              type="text"
              value={report.internship.program.title}
              disabled
              className="form-control bg-gray-50"
            />
            <input
              type="hidden"
              name="internshipId"
              value={report.internship.id}
            />
          </div>

          <div>
            <label htmlFor="weekNumber" className="form-label">
              Week Number
            </label>
            <input
              id="weekNumber"
              type="number"
              name="weekNumber"
              min="1"
              defaultValue={report.weekNumber}
              required
              className="form-control"
            />
          </div>

          <div>
            <label htmlFor="title" className="form-label">
              Report Title
            </label>
            <input
              id="title"
              type="text"
              name="title"
              defaultValue={report.title}
              required
              className="form-control"
              placeholder="e.g. Week 1 Progress Report"
            />
          </div>

          <div>
            <label htmlFor="body" className="form-label">
              Report Content
            </label>
            <textarea
              id="body"
              name="body"
              required
              rows={8}
              defaultValue={report.body}
              className="form-control"
              placeholder="Describe your activities, achievements, and challenges..."
            />
          </div>

          {report.attachments.length > 0 && (
            <div>
              <label className="form-label">Current Attachments</label>
              <div className="space-y-2">
                {report.attachments.map((attachment) => (
                  <a
                    key={attachment.id}
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center p-3 border border-gray-200 rounded text-sm hover:bg-gray-50 transition-colors"
                  >
                    <span className="flex-1 truncate">
                      {attachment.filename}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="form-label">
              Add New Attachment <span className="text-gray-400">(Optional)</span>
            </label>
            <div className="mt-1">
              <label
                htmlFor="file-upload"
                className={`
                  flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md
                  cursor-pointer transition-colors
                  ${
                    file
                      ? "border-brand-teal bg-brand-teal/5"
                      : "border-gray-300 hover:border-brand-teal hover:bg-gray-50"
                  }
                `}
              >
                <div className="space-y-1 text-center">
                  <Upload
                    className={`mx-auto h-12 w-12 ${
                      file ? "text-brand-teal" : "text-gray-400"
                    }`}
                  />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <span className="font-medium text-brand-teal">
                      {file ? file.name : "Click to upload"}
                    </span>
                    {!file && (
                      <span className="pl-1">or drag and drop</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DOCX up to 10MB
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.docx,.doc"
                  onChange={(e) => {
                    const selected = e.target.files?.[0] || null;
                    if (selected) {
                      const validation = validateFile(selected);
                      if (validation.valid) {
                        setFile(selected);
                        setError(null);
                      } else {
                        setError(validation.error || "Invalid file");
                      }
                    } else {
                      setFile(null);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="submit"
              disabled={submitting || uploadProgress}
              className="btn btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {submitting || uploadProgress ? (
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

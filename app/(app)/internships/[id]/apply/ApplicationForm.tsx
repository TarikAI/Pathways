"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const applicationSchema = z.object({
  coverLetter: z
    .string()
    .min(50, "Cover letter must be at least 50 characters")
    .max(2000, "Cover letter must not exceed 2000 characters"),
});

type ApplicationForm = z.infer<typeof applicationSchema>;

export default function ApplicationForm({
  programId,
  programTitle: _programTitle,
}: {
  programId: string;
  programTitle: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationForm>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationForm) => {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          coverLetter: data.coverLetter,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to submit application");
      }

      router.push("/student/applications");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit application";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-brand-beige">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="form-label" htmlFor="coverLetter">
            Cover Letter
          </label>
          <textarea
            id="coverLetter"
            className="form-control"
            rows={10}
            placeholder="Tell us why you're interested in this program, what skills you bring, and what you hope to learn..."
            {...register("coverLetter")}
          />
          {errors.coverLetter && (
            <p className="text-red-500 text-xs mt-1">{errors.coverLetter.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Minimum 50 characters. Maximum 2000 characters.
          </p>
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-outline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

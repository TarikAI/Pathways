"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createProgramSchema } from "@/lib/validators/program";

type ProgramForm = z.infer<typeof createProgramSchema>;

export default function ProgramForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgramForm>({
    resolver: zodResolver(createProgramSchema),
  });

  const onSubmit = async (data: ProgramForm) => {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "Failed to create program");
      }

      router.push("/supervisor/programs");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create program";
      setError(message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-brand-beige max-w-2xl">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="form-label" htmlFor="title">
            Program Title
          </label>
          <input
            id="title"
            type="text"
            className="form-control"
            placeholder="e.g. Software Engineering Co-op 2026"
            {...register("title")}
          />
          {errors.title && (
            <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="organization">
            Organization
          </label>
          <input
            id="organization"
            type="text"
            className="form-control"
            placeholder="e.g. TechCorp"
            {...register("organization")}
          />
          {errors.organization && (
            <p className="text-red-500 text-xs mt-1">{errors.organization.message}</p>
          )}
        </div>

        <div>
          <label className="form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="form-control"
            rows={4}
            placeholder="Describe the program objectives, requirements, and expectations..."
            {...register("description")}
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label" htmlFor="durationWeeks">
              Duration (weeks)
            </label>
            <input
              id="durationWeeks"
              type="number"
              className="form-control"
              min={1}
              max={52}
              placeholder="16"
              {...register("durationWeeks", { valueAsNumber: true })}
            />
            {errors.durationWeeks && (
              <p className="text-red-500 text-xs mt-1">{errors.durationWeeks.message}</p>
            )}
          </div>

          <div>
            <label className="form-label" htmlFor="seats">
              Available Seats
            </label>
            <input
              id="seats"
              type="number"
              className="form-control"
              min={1}
              max={100}
              placeholder="10"
              {...register("seats", { valueAsNumber: true })}
            />
            {errors.seats && (
              <p className="text-red-500 text-xs mt-1">{errors.seats.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="form-label" htmlFor="applicationDeadline">
            Application Deadline (optional)
          </label>
          <input
            id="applicationDeadline"
            type="datetime-local"
            className="form-control"
            {...register("applicationDeadline")}
          />
          {errors.applicationDeadline && (
            <p className="text-red-500 text-xs mt-1">{errors.applicationDeadline.message}</p>
          )}
        </div>

        <div className="pt-4 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary flex-1"
          >
            {submitting ? "Creating..." : "Create Program"}
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

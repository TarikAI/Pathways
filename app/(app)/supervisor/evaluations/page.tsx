"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Plus, Star } from "lucide-react";
import Link from "next/link";

interface Internship {
  id: string;
  status: string;
  student: { id: string; fullName: string };
  program: { id: string; title: string };
}

interface Criterion {
  label: string;
  score: number;
  comment?: string;
}

const DEFAULT_CRITERIA: Omit<Criterion, "score">[] = [
  { label: "Attendance & Punctuality" },
  { label: "Technical Skills" },
  { label: "Communication Skills" },
  { label: "Teamwork & Collaboration" },
  { label: "Problem Solving" },
  { label: "Work Quality" },
  { label: "Initiative & Proactivity" },
  { label: "Professionalism" },
];

export default function EvaluationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedInternship, setSelectedInternship] = useState<string>("");
  const [period, setPeriod] = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "FIELD_SUPERVISOR") {
      router.push("/dashboard");
      return;
    }

    const fetchInternships = async () => {
      try {
        const res = await fetch("/api/internships?status=ACTIVE");
        if (res.ok) {
          const data = await res.json();
          setInternships(data);
        }
      } catch (err) {
        console.error("Failed to fetch internships", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, [status, session, router]);

  const addCriterion = () => {
    setCriteria([...criteria, { label: "", score: 5, comment: "" }]);
  };

  const updateCriterion = (index: number, field: keyof Criterion, value: string | number) => {
    const updated = [...criteria];
    updated[index] = { ...updated[index], [field]: value };
    setCriteria(updated);
  };

  const removeCriterion = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setSelectedInternship("");
    setPeriod("");
    setOverallComment("");
    setCriteria(
      DEFAULT_CRITERIA.map((c) => ({
        ...c,
        score: 5,
        comment: "",
      }))
    );
  };

  useEffect(() => {
    if (selectedInternship) {
      setCriteria(
        DEFAULT_CRITERIA.map((c) => ({
          ...c,
          score: 5,
          comment: "",
        }))
      );
    }
  }, [selectedInternship]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInternship || !period || criteria.length === 0) {
      setError("Please fill in all required fields");
      return;
    }

    const validCriteria = criteria.filter((c) => c.label.trim());
    if (validCriteria.length === 0) {
      setError("Please add at least one evaluation criterion");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/evaluations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internshipId: selectedInternship,
          period,
          overallComment,
          criteria: validCriteria,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit evaluation");
      }

      alert("Evaluation submitted successfully!");
      resetForm();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to submit evaluation";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const maxScore = criteria.length * 10;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/supervisor/dashboard"
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold text-brand-navy mb-6">Submit Evaluation</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-brand-navy mb-4">Select Internship</h2>
          <select
            value={selectedInternship}
            onChange={(e) => setSelectedInternship(e.target.value)}
            required
            className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
          >
            <option value="">Choose an internship...</option>
            {internships.map((internship) => (
              <option key={internship.id} value={internship.id}>
                {internship.student.fullName} - {internship.program.title}
              </option>
            ))}
          </select>
        </div>

        {selectedInternship && (
          <>
            <div className="card">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Evaluation Period</h2>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="e.g., Week 1-4, January 2026, Q1 2026"
                required
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-brand-navy">Evaluation Criteria</h2>
                <button
                  type="button"
                  onClick={addCriterion}
                  className="btn btn-outline text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Criterion
                </button>
              </div>

              <div className="space-y-6">
                {criteria.map((criterion, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                    {index >= DEFAULT_CRITERIA.length && (
                      <button
                        type="button"
                        onClick={() => removeCriterion(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-brand-navy mb-1">
                          Criterion
                        </label>
                        <input
                          type="text"
                          value={criterion.label}
                          onChange={(e) => updateCriterion(index, "label", e.target.value)}
                          placeholder="e.g., Communication Skills"
                          required
                          className="w-full border border-gray-300 rounded p-2 focus:ring-brand-teal focus:border-brand-teal"
                        />
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-brand-navy mb-1">
                          Score (0-10)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={criterion.score}
                            onChange={(e) => updateCriterion(index, "score", parseInt(e.target.value))}
                            className="flex-1"
                          />
                          <span className="w-12 text-center font-semibold text-brand-navy">
                            {criterion.score}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-1">
                        <label className="block text-sm font-medium text-brand-navy mb-1">
                          Comment (optional)
                        </label>
                        <input
                          type="text"
                          value={criterion.comment || ""}
                          onChange={(e) => updateCriterion(index, "comment", e.target.value)}
                          placeholder="Feedback..."
                          className="w-full border border-gray-300 rounded p-2 focus:ring-brand-teal focus:border-brand-teal"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {criteria.length > 0 && (
                <div className="mt-6 p-4 bg-brand-beige/50 rounded-lg flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand-navy">Total Score:</span>
                  <span className="text-2xl font-bold text-brand-teal">
                    {totalScore} / {maxScore}
                  </span>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Overall Comment</h2>
              <textarea
                value={overallComment}
                onChange={(e) => setOverallComment(e.target.value)}
                placeholder="Provide overall feedback and recommendations..."
                required
                rows={5}
                className="w-full border border-gray-300 rounded p-3 focus:ring-brand-teal focus:border-brand-teal"
              />
            </div>

            {error && <div className="bg-red-50 text-red-600 p-4 rounded">{error}</div>}

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="btn bg-brand-teal hover:bg-brand-navy text-white px-8 py-3 disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Evaluation"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn btn-outline"
              >
                Reset Form
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

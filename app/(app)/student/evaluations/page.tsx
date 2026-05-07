"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Star, FileText, CheckCircle2 } from "lucide-react";

interface Evaluation {
  id: string;
  period: string;
  overallComment: string;
  totalScore: number;
  createdAt: string;
  cosignedAt: string | null;
  evaluator: { fullName: string; role: string };
  cosigner: { fullName: string } | null;
  criteria: Array<{ label: string; score: number; comment: string | null }>;
  internship: {
    program: { title: string };
  };
}

export default function StudentEvaluationsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (session?.user?.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }

    const fetchEvaluations = async () => {
      try {
        const res = await fetch("/api/evaluations");
        if (res.ok) {
          const data = await res.json();
          setEvaluations(data);
        }
      } catch (err) {
        console.error("Failed to fetch evaluations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvaluations();
  }, [status, session, router]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-gray-500">Loading evaluations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-brand-navy mb-6">My Evaluations</h1>

      {evaluations.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No evaluations yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Your field supervisor will submit evaluations periodically.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {evaluations.map((evaluation) => {
            const maxScore = evaluation.criteria.length * 10;
            const percentage = (evaluation.totalScore / maxScore) * 100;

            return (
              <div key={evaluation.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-brand-navy">
                      {evaluation.period}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {evaluation.internship.program.title} •{" "}
                      {formatDistanceToNow(new Date(evaluation.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {evaluation.cosignedAt ? (
                      <span className="flex items-center gap-1 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        <CheckCircle2 size={16} />
                        Cosigned by {evaluation.cosigner?.fullName}
                      </span>
                    ) : (
                      <span className="text-sm text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                        Pending cosign
                      </span>
                    )}
                  </div>
                </div>

                <div className="mb-4 p-4 bg-brand-beige/50 rounded-lg flex items-center justify-between">
                  <span className="text-lg font-semibold text-brand-navy">Overall Score:</span>
                  <div className="flex items-center gap-3">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-6 h-6 ${
                            star <= Math.ceil(percentage / 20)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold text-brand-teal">
                      {evaluation.totalScore}/{maxScore}
                    </span>
                    <span className="text-lg text-gray-600">({percentage.toFixed(0)}%)</span>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="font-semibold text-brand-navy mb-2">Criteria Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {evaluation.criteria.map((criterion, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-brand-navy">{criterion.label}</span>
                          <span className="font-bold text-brand-teal">{criterion.score}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className="bg-brand-teal h-2 rounded-full"
                            style={{ width: `${(criterion.score / 10) * 100}%` }}
                          />
                        </div>
                        {criterion.comment && (
                          <p className="text-sm text-gray-600 mt-1">{criterion.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {evaluation.overallComment && (
                  <div>
                    <h3 className="font-semibold text-brand-navy mb-2">Overall Feedback</h3>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                      {evaluation.overallComment}
                    </p>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-500">
                  Evaluated by {evaluation.evaluator.fullName} ({evaluation.evaluator.role.replace("_", " ")})
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

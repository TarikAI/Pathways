"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Star, CheckCircle2, FileText, Briefcase } from "lucide-react";
import Link from "next/link";

interface Report {
  id: string;
  title: string;
  weekNumber: number;
  status: string;
  body: string;
  createdAt: string;
}

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
}

interface Internship {
  id: string;
  status: string;
  progressPercent: number;
  startDate: string;
  endDate: string;
  student: { id: string; fullName: string; email: string; fullName: string };
  program: { title: string; organization: string; durationWeeks: number };
  reports: Report[];
  evaluations: Evaluation[];
}

export default function SupervisorStudentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [loading, setLoading] = useState(true);
  const [cosigning, setCosigning] = useState<string | null>(null);
  const studentId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!session?.user) return;

    const fetchStudent = async () => {
      try {
        const res = await fetch(`/api/students/${studentId}`);
        if (res.ok) {
          const data = await res.json();
          setInternship(data);
        } else {
          router.push("/supervisor/students");
        }
      } catch (err) {
        console.error("Failed to fetch student", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [status, session, studentId, router]);

  const handleCosign = async (evaluationId: string) => {
    setCosigning(evaluationId);
    try {
      const res = await fetch(`/api/evaluations/${evaluationId}/cosign`, {
        method: "POST",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cosign evaluation");
      }

      setInternship((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          evaluations: prev.evaluations.map((e) =>
            e.id === evaluationId
              ? {
                  ...e,
                  cosignedAt: new Date().toISOString(),
                  cosigner: { fullName: session?.user?.fullName || "" },
                }
              : e
          ),
        };
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to cosign";
      alert(message);
    } finally {
      setCosigning(null);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <p className="text-gray-500">Loading student profile...</p>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <p className="text-gray-500">Student not found.</p>
      </div>
    );
  }

  const isAcademicSupervisor = session?.user?.role === "ACADEMIC_SUPERVISOR";

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link
        href="/supervisor/students"
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Students
      </Link>

      <div className="card mb-6">
        <div className="flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold text-2xl">
            {internship.student.fullName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-brand-navy">{internship.student.fullName}</h1>
            <p className="text-gray-500">{internship.student.email}</p>
          </div>
          <div className="text-right">
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {internship.status}
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Program</p>
            <p className="font-medium">{internship.program.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Organization</p>
            <p className="font-medium">{internship.program.organization}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{internship.program.durationWeeks} weeks</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="font-medium">{internship.progressPercent}%</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t flex gap-3">
          <Link href={`/supervisor/reports?internshipId=${internship.id}`} className="btn btn-outline text-sm">
            <FileText size={16} className="mr-2" />
            View Reports
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Weekly Reports</h2>
          {internship.reports.length === 0 ? (
            <div className="card text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No reports submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {internship.reports.map((report) => (
                <Link
                  key={report.id}
                  href={`/supervisor/reports/${report.id}`}
                  className="card block hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-brand-navy">{report.title}</h3>
                      <p className="text-sm text-gray-500">
                        Week {report.weekNumber} •{" "}
                        {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : report.status === "REJECTED"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-bold text-brand-navy mb-4">Evaluations</h2>
          {internship.evaluations.length === 0 ? (
            <div className="card text-center py-8">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500">No evaluations submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {internship.evaluations.map((evaluation) => {
                const maxScore = evaluation.criteria.length * 10;
                return (
                  <div key={evaluation.id} className="card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-brand-navy">{evaluation.period}</h3>
                        <p className="text-sm text-gray-500">
                          By {evaluation.evaluator.fullName} •{" "}
                          {formatDistanceToNow(new Date(evaluation.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="font-bold text-brand-teal">
                            {evaluation.totalScore}/{maxScore}
                          </span>
                        </div>
                        {evaluation.cosignedAt ? (
                          <span className="text-xs text-green-600 flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Cosigned
                          </span>
                        ) : isAcademicSupervisor ? (
                          <button
                            onClick={() => handleCosign(evaluation.id)}
                            disabled={cosigning === evaluation.id}
                            className="text-xs bg-brand-teal text-white px-2 py-1 rounded hover:bg-brand-navy disabled:opacity-50"
                          >
                            {cosigning === evaluation.id ? "Cosigning..." : "Cosign"}
                          </button>
                        ) : (
                          <span className="text-xs text-yellow-600">Pending cosign</span>
                        )}
                      </div>
                    </div>

                    <details className="text-sm">
                      <summary className="cursor-pointer text-brand-teal hover:underline mb-2">
                        View details
                      </summary>
                      <div className="mt-2 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          {evaluation.criteria.map((c, i) => (
                            <div key={i} className="border border-gray-200 rounded p-2">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium">{c.label}</span>
                                <span className="text-brand-teal">{c.score}/10</span>
                              </div>
                              {c.comment && <p className="text-gray-500 text-xs mt-1">{c.comment}</p>}
                            </div>
                          ))}
                        </div>
                        {evaluation.overallComment && (
                          <div className="bg-gray-50 p-2 rounded mt-2">
                            <p className="text-xs font-medium text-brand-navy">Overall:</p>
                            <p className="text-xs text-gray-600">{evaluation.overallComment}</p>
                          </div>
                        )}
                      </div>
                    </details>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

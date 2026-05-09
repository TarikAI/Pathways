"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Eye,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface Report {
  id: string;
  title: string;
  weekNumber: number;
  status: string;
  submittedAt: string;
  internship: {
    program: {
      title: string;
    };
  };
}

type ReportStatus = "DRAFT" | "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

const statusConfig: Record<
  ReportStatus,
  { icon: React.ReactNode; colorClass: string; label: string }
> = {
  DRAFT: {
    icon: <Clock className="w-5 h-5 text-gray-600" />,
    colorClass: "bg-gray-100 text-gray-800",
    label: "Draft",
  },
  SUBMITTED: {
    icon: <Clock className="w-5 h-5 text-blue-600" />,
    colorClass: "bg-blue-100 text-blue-800",
    label: "Submitted",
  },
  UNDER_REVIEW: {
    icon: <Clock className="w-5 h-5 text-yellow-600" />,
    colorClass: "bg-yellow-100 text-yellow-800",
    label: "Under Review",
  },
  APPROVED: {
    icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    colorClass: "bg-green-100 text-green-800",
    label: "Approved",
  },
  REJECTED: {
    icon: <XCircle className="w-5 h-5 text-red-600" />,
    colorClass: "bg-red-100 text-red-800",
    label: "Rejected",
  },
};

const EDITABLE_STATUSES: ReportStatus[] = ["DRAFT", "SUBMITTED"];

export default function StudentReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/reports");
      if (!res.ok) {
        throw new Error("Failed to load reports");
      }
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReports();
    }
  }, [status, fetchReports]);

  const canEdit = (status: string): boolean => {
    return EDITABLE_STATUSES.includes(status as ReportStatus);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 text-brand-teal animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="card bg-red-50 border-red-200">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchReports}
            className="mt-4 text-red-700 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">My Reports</h1>
          <p className="text-gray-600 mt-1">
            {reports.length} report{reports.length !== 1 ? "s" : ""} submitted
          </p>
        </div>
        <Link
          href="/student/reports/new"
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <Plus size={18} />
          Submit New Report
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-brand-navy mb-2">
            No reports yet
          </h2>
          <p className="text-gray-500 mb-6">
            Start tracking your internship progress by submitting your first
            weekly report.
          </p>
          <Link href="/student/reports/new" className="btn btn-primary">
            Submit Your First Report
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => {
            const status = report.status as ReportStatus;
            const config = statusConfig[status] || statusConfig.DRAFT;

            return (
              <div
                key={report.id}
                className="card hover:shadow-md transition-shadow p-0 overflow-hidden"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {config.icon}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-brand-navy truncate">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Week {report.weekNumber} •{" "}
                          {report.internship.program.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Submitted on {formatDate(report.submittedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${config.colorClass}`}
                      >
                        {config.label}
                      </span>
                      <div className="flex gap-2">
                        <Link
                          href={`/student/reports/${report.id}`}
                          className="btn btn-outline py-2 px-3"
                          aria-label="View report"
                        >
                          <Eye size={16} />
                        </Link>
                        {canEdit(status) && (
                          <Link
                            href={`/student/reports/${report.id}/edit`}
                            className="btn btn-secondary py-2 px-3"
                            aria-label="Edit report"
                          >
                            <Edit size={16} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Plus, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react";

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

export default function StudentReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchReports();
    }
  }, [status]);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/student/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Failed to fetch reports", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-gray-500">Loading...</p>
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
          {reports.map((report) => (
            <div
              key={report.id}
              className="card hover:shadow-md transition-shadow p-0 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(report.status)}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-brand-navy">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Week {report.weekNumber} •{" "}
                        {report.internship.program.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Submitted on {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                    <div className="flex gap-2">
                      <Link
                        href={`/student/reports/${report.id}`}
                        className="btn btn-outline py-2 px-3"
                        title="View report"
                      >
                        <Eye size={16} />
                      </Link>
                      {(report.status === "DRAFT" || report.status === "SUBMITTED") && (
                        <Link
                          href={`/student/reports/${report.id}/edit`}
                          className="btn btn-secondary py-2 px-3"
                          title="Edit report"
                        >
                          <Edit size={16} />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";

type ReportStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED";

const STATUS_CONFIG: Record<
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

export default async function InternshipReportsPage({
  params,
}: {
  params: Promise<{ internshipId: string }>;
}) {
  const session = await requireRole([
    "ACADEMIC_SUPERVISOR",
    "FIELD_SUPERVISOR",
  ]);
  const { internshipId } = await params;

  const internship = await db.internship.findUnique({
    where: { id: internshipId },
    include: {
      student: true,
      program: true,
      reports: {
        orderBy: { weekNumber: "asc" },
      },
    },
  });

  if (!internship) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="card">
          <h2 className="text-xl font-semibold text-brand-navy mb-2">
            Internship Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The internship you&apos;re looking for doesn&apos;t exist or has
            been removed.
          </p>
          <Link
            href="/supervisor/reports"
            className="text-brand-teal hover:underline"
          >
            Back to Reports
          </Link>
        </div>
      </div>
    );
  }

  const hasAccess =
    internship.academicSupervisorId === session.user.id ||
    internship.fieldSupervisorId === session.user.id;

  if (!hasAccess) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="card bg-red-50 border-red-200">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600">
            You don&apos;t have permission to view these reports.
          </p>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/supervisor/reports"
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Reports
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-brand-navy mb-2">
          Reports for {internship.student.fullName}
        </h1>
        <p className="text-gray-600">
          {internship.program.title} • {internship.reports.length} report
          {internship.reports.length !== 1 ? "s" : ""} submitted
        </p>
      </div>

      {internship.reports.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-brand-navy mb-2">
            No reports submitted yet
          </h2>
          <p className="text-gray-500">
            Reports will appear here once the student submits them.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {internship.reports.map((report) => {
            const status = report.status as ReportStatus;
            const config = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;

            return (
              <Link
                key={report.id}
                href={`/supervisor/reports/${report.id}`}
                className="card block hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {config.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-brand-navy">
                          {report.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Week {report.weekNumber} • Submitted on{" "}
                          {formatDate(report.submittedAt)}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.colorClass}`}
                      >
                        {config.label}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

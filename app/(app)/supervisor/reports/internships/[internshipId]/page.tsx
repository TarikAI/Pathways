import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function InternshipReportsPage({
  params,
}: {
  params: Promise<{ internshipId: string }>;
}) {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);
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
        <p className="text-gray-500">Internship not found.</p>
      </div>
    );
  }

  // Verify access
  if (
    internship.academicSupervisorId !== session.user.id &&
    internship.fieldSupervisorId !== session.user.id
  ) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <p className="text-red-500">You don&apos;t have permission to view these reports.</p>
      </div>
    );
  }

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

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link
        href="/supervisor/reports"
        className="text-brand-teal hover:underline inline-flex items-center mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
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
          <p className="text-gray-500">No reports submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {internship.reports.map((report) => (
            <Link
              key={report.id}
              href={`/supervisor/reports/${report.id}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getStatusIcon(report.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg text-brand-navy">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Week {report.weekNumber} • Submitted on{" "}
                        {new Date(report.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusClass(
                        report.status
                      )}`}
                    >
                      {report.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

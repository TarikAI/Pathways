import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditReportForm from "./EditReportForm";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["STUDENT"]);
  const { id } = await params;

  const report = await db.report.findUnique({
    where: { id },
    include: {
      internship: {
        include: { program: true },
      },
      attachments: true,
    },
  });

  if (!report || report.internship.studentId !== session.user.id) {
    notFound();
  }

  // Only allow editing draft or submitted reports
  if (report.status !== "DRAFT" && report.status !== "SUBMITTED") {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="card text-center py-12">
          <p className="text-red-500">
            This report cannot be edited because it has already been reviewed.
          </p>
        </div>
      </div>
    );
  }

  return <EditReportForm report={report} />;
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { FileText, ArrowLeft, Download } from "lucide-react";
import ReviewForm from "./ReviewForm";

export default async function SupervisorReportDetail({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);
  const { id } = await params;
  
  const report = await db.report.findUnique({
    where: { id },
    include: {
      internship: { 
        include: { 
          program: true,
          student: true
        } 
      },
      attachments: true,
      reviews: { include: { reviewer: true }, orderBy: { createdAt: "desc" } }
    }
  });

  if (!report) {
    notFound();
  }

  if (report.internship.academicSupervisorId !== session.user.id && report.internship.fieldSupervisorId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Link href={`/supervisor/reports/internships/${report.internship.id}`} className="text-brand-teal hover:underline inline-flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Reports
      </Link>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-brand-beige p-6 mb-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-bold text-brand-navy mb-2">{report.title}</h1>
                <p className="text-gray-600">Week {report.weekNumber} • {report.internship.student.fullName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                report.status === "APPROVED" ? "bg-green-100 text-green-800" :
                report.status === "REJECTED" ? "bg-red-100 text-red-800" :
                report.status === "UNDER_REVIEW" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {report.status.replace("_", " ")}
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold text-brand-navy mb-2">Content</h2>
              <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-800">
                {report.body}
              </div>
            </div>

            {report.attachments.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-brand-navy mb-2">Attachments</h2>
                <div className="flex flex-col gap-2">
                  {report.attachments.map(att => (
                    <a key={att.id} href={att.url} target="_blank" rel="noreferrer" className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <FileText className="w-5 h-5 text-brand-teal mr-3" />
                      <span className="flex-1 text-brand-navy font-medium">{att.filename}</span>
                      <Download className="w-4 h-4 text-gray-500" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {report.reviews.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-brand-beige p-6">
              <h2 className="text-lg font-semibold text-brand-navy mb-4">Previous Reviews</h2>
              <div className="space-y-4">
                {report.reviews.map(rev => (
                  <div key={rev.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-brand-navy">{rev.reviewer.fullName}</span>
                      <span className="text-sm text-gray-500">{format(rev.createdAt, "MMM d, yyyy")}</span>
                    </div>
                    <span className="inline-block px-2 py-1 bg-gray-100 text-xs rounded mb-2">
                      {rev.decision}
                    </span>
                    <p className="text-gray-700">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <ReviewForm reportId={report.id} />
        </div>
      </div>
    </div>
  );
}

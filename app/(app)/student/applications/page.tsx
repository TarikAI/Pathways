import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Briefcase, ArrowRight } from "lucide-react";
import { formatDate, applicationStatusClass } from "@/lib/utils";

export default async function StudentApplicationsPage() {
  const session = await requireRole(["STUDENT"]);

  const applications = await db.trainingApplication.findMany({
    where: { studentId: session.user.id },
    include: {
      program: {
        select: { id: true, title: true, organization: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeInternship = await db.internship.findFirst({
    where: {
      studentId: session.user.id,
      status: "ACTIVE",
    },
    include: {
      program: {
        select: { title: true },
      },
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Applications</h1>
        <Link href="/internships" className="btn btn-outline">
          Browse Programs
        </Link>
      </div>

      {activeInternship && (
        <div className="card bg-brand-sky/10 border-brand-sky mb-6">
          <div className="flex items-center gap-4">
            <Briefcase className="w-12 h-12 text-brand-teal" />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Active Internship</h3>
              <p className="text-gray-600">
                You are currently enrolled in{" "}
                <span className="font-medium">{activeInternship.program.title}</span>
              </p>
            </div>
            <Link
              href="/student/internship"
              className="btn btn-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">You haven&apos;t applied to any programs yet.</p>
          <Link href="/internships" className="btn btn-primary">
            Browse Available Programs
          </Link>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Program</th>
                <th className="text-left p-4 font-semibold text-gray-700">Organization</th>
                <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                <th className="text-center p-4 font-semibold text-gray-700">Applied</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {applications.map((application) => (
                <tr key={application.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{application.program.title}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {application.program.organization}
                  </td>
                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${applicationStatusClass(
                        application.status
                      )}`}
                    >
                      {application.status}
                    </span>
                  </td>
                  <td className="p-4 text-center text-sm text-gray-500">
                    {formatDate(application.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-brand-beige rounded-lg">
        <h3 className="font-semibold text-brand-navy mb-2">Application Process</h3>
        <ol className="text-sm text-gray-600 space-y-1">
          <li>1. Submit your application with a cover letter</li>
          <li>2. Field supervisors review applications</li>
          <li>3. If approved, you&apos;ll be assigned an academic supervisor</li>
          <li>4. Your internship workspace becomes available</li>
        </ol>
      </div>
    </div>
  );
}

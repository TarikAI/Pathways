import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { internshipStatusClass, formatDate } from "@/lib/utils";

export default async function StudentInternshipPage() {
  const session = await requireRole(["STUDENT"]);

  const internship = await db.internship.findFirst({
    where: { studentId: session.user.id },
    include: {
      program: true,
      academicSupervisor: true,
      fieldSupervisor: true,
    },
  });

  if (!internship) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Internship</h1>
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">You are not currently enrolled in an internship program.</p>
          <Link href="/student/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Internship</h1>

      <div className="space-y-6">
        {/* Program Info */}
        <div className="card">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-brand-navy">{internship.program.title}</h2>
              <p className="text-gray-600 mt-1">{internship.program.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${internshipStatusClass(internship.status)}`}>
              {internship.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-gray-500">Start Date</p>
              <p className="font-medium">{formatDate(internship.startDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">End Date</p>
              <p className="font-medium">{formatDate(internship.endDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Organization</p>
              <p className="font-medium">{internship.program.organization}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="font-medium">{internship.program.durationWeeks} weeks</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{internship.progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-brand-teal h-3 rounded-full transition-all"
                style={{ width: `${internship.progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Supervisors */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Academic Supervisor */}
          <div className="card">
            <h3 className="font-semibold text-lg text-brand-navy mb-4">Academic Supervisor</h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold text-lg">
                {internship.academicSupervisor.fullName.charAt(0)}
              </div>
              <div>
                <p className="font-medium">{internship.academicSupervisor.fullName}</p>
                <p className="text-sm text-gray-500">{internship.academicSupervisor.email}</p>
              </div>
            </div>
          </div>

          {/* Field Supervisor */}
          <div className="card">
            <h3 className="font-semibold text-lg text-brand-navy mb-4">Field Supervisor</h3>
            {internship.fieldSupervisor ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold text-lg">
                  {internship.fieldSupervisor.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{internship.fieldSupervisor.fullName}</p>
                  <p className="text-sm text-gray-500">{internship.fieldSupervisor.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Not assigned yet</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="font-semibold text-lg text-brand-navy mb-4">Quick Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/student/reports" className="btn btn-outline text-center">
              View Reports
            </Link>
            <Link href={`/supervisor/reports/${internship.id}`} className="btn btn-primary text-center">
              Submit New Report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

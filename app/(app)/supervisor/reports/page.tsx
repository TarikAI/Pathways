import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { internshipStatusClass } from "@/lib/utils";

export default async function SupervisorReportsPage() {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);

  const internships = await db.internship.findMany({
    where: session.user.role === "ACADEMIC_SUPERVISOR"
      ? { academicSupervisorId: session.user.id }
      : { fieldSupervisorId: session.user.id },
    include: {
      student: true,
      program: true,
      _count: {
        select: { reports: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Reports</h1>

      {internships.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No students assigned yet.</p>
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-700">Student</th>
                <th className="text-left p-4 font-semibold text-gray-700">Program</th>
                <th className="text-center p-4 font-semibold text-gray-700">Reports</th>
                <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                <th className="text-center p-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {internships.map((internship) => (
                <tr key={internship.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{internship.student.fullName}</p>
                      <p className="text-sm text-gray-500">{internship.student.email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-700">{internship.program.title}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-brand-sky text-brand-navy font-semibold">
                      {internship._count.reports}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${internshipStatusClass(internship.status)}`}>
                      {internship.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <Link
                      href={`/supervisor/reports/${internship.id}`}
                      className="text-brand-teal hover:underline font-medium"
                    >
                      View Reports
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

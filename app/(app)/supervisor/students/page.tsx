import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { internshipStatusClass, formatDate } from "@/lib/utils";

export default async function SupervisorStudentsPage() {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);

  const internships = await db.internship.findMany({
    where: session.user.role === "ACADEMIC_SUPERVISOR"
      ? { academicSupervisorId: session.user.id }
      : { fieldSupervisorId: session.user.id },
    include: {
      student: true,
      program: true,
    },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Assigned Students</h1>

      {internships.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No students assigned yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {internships.map((internship) => (
            <div key={internship.id} className="card">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-sky text-brand-navy flex items-center justify-center font-bold text-lg">
                  {internship.student.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{internship.student.fullName}</h3>
                  <p className="text-sm text-gray-500">{internship.student.email}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Program:</span>
                  <span className="font-medium">{internship.program.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${internshipStatusClass(internship.status)}`}>
                    {internship.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Progress:</span>
                  <span className="font-medium">{internship.progressPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-brand-navy h-2 rounded-full transition-all"
                    style={{ width: `${internship.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex gap-2">
                <a
                  href={`/supervisor/students/${internship.studentId}`}
                  className="btn btn-outline text-sm flex-1 text-center"
                >
                  View Profile
                </a>
                <a
                  href={`/supervisor/reports/${internship.id}`}
                  className="btn btn-primary text-sm flex-1 text-center"
                >
                  Reports
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";

export default async function SupervisorDashboard() {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);
  
  const internships = await db.internship.findMany({
    where: session.user.role === "ACADEMIC_SUPERVISOR" 
      ? { academicSupervisorId: session.user.id }
      : { fieldSupervisorId: session.user.id },
    include: { student: true, program: true }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Supervisor Dashboard</h1>
      <div className="grid grid-cols-1 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Assigned Students</h2>
          {internships.length === 0 ? (
            <p className="text-gray-500">No students assigned.</p>
          ) : (
            <div className="space-y-4">
              {internships.map(i => (
                <div key={i.id} className="border p-4 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{i.student.fullName}</h3>
                    <p className="text-sm text-gray-500">{i.program.title}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">Progress: {i.progressPercent}%</div>
                    <a href={`/supervisor/students/${i.studentId}`} className="text-brand-teal text-sm hover:underline">View Details</a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function StudentReportsPage() {
  const session = await requireRole(["STUDENT"]);
  
  const internships = await db.internship.findMany({
    where: { studentId: session.user.id },
  });

  const internshipIds = internships.map(i => i.id);

  const reports = await db.report.findMany({
    where: { internshipId: { in: internshipIds } },
    orderBy: { submittedAt: 'desc' },
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Reports</h1>
        <Link href="/student/reports/new" className="btn btn-primary">Submit New Report</Link>
      </div>

      <div className="card">
        {reports.length === 0 ? (
          <p className="text-gray-500">No reports submitted yet.</p>
        ) : (
          <div className="space-y-4">
            {reports.map(r => (
              <div key={r.id} className="border p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{r.title}</h3>
                  <p className="text-sm text-gray-500">Week {r.weekNumber} • Submitted on {r.submittedAt.toLocaleDateString()}</p>
                </div>
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    r.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    r.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

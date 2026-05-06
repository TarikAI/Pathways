import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await requireRole(["STUDENT"]);
  
  const internships = await db.internship.findMany({
    where: { studentId: session.user.id },
    include: { program: true }
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">My Internships</h2>
          {internships.length === 0 ? (
            <p className="text-gray-500">No active internships.</p>
          ) : (
            <ul className="space-y-4">
              {internships.map(i => (
                <li key={i.id} className="border-b pb-2">
                  <div className="font-medium">{i.program.title}</div>
                  <div className="text-sm text-gray-500">Status: {i.status}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-brand-navy h-2 rounded-full" style={{ width: `${i.progressPercent}%` }}></div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <div className="flex flex-col gap-3">
            <Link href="/student/reports/new" className="btn btn-primary text-center">Submit Report</Link>
            <Link href="/messages" className="btn btn-outline text-center">Messages</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

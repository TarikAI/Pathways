import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import ReportForm from "./ReportForm";

export default async function NewReportPage() {
  const session = await requireRole(["STUDENT"]);
  
  const internships = await db.internship.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: { program: true }
  });

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-brand-navy">Submit Weekly Report</h1>
      {internships.length === 0 ? (
        <div className="bg-white p-6 rounded shadow">
          <p>You have no active internships to report on.</p>
        </div>
      ) : (
        <ReportForm internships={internships} />
      )}
    </div>
  );
}

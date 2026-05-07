import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { Users } from "lucide-react";
import { ApplicationCard } from "./ApplicationCard";

export default async function ApplicationsPage() {
  const session = await requireRole(["FIELD_SUPERVISOR", "ADMIN"]);

  const applications = await db.trainingApplication.findMany({
    where: { status: "PENDING" },
    include: {
      student: {
        select: { id: true, fullName: true, email: true },
      },
      program: {
        select: { id: true, title: true, organization: true, durationWeeks: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const academicSupervisors = await db.user.findMany({
    where: { role: "ACADEMIC_SUPERVISOR" },
    orderBy: { fullName: "asc" },
  });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Application Review Queue</h1>
        <Link href="/supervisor/students" className="btn btn-outline">
          <Users size={18} className="mr-2" />
          Assigned Students
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No pending applications.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              academicSupervisors={academicSupervisors}
            />
          ))}
        </div>
      )}
    </div>
  );
}

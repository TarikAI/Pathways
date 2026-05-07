import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, Users, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function SupervisorProgramsPage() {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);

  const programs = await db.trainingProgram.findMany({
    where: session.user.role === "ACADEMIC_SUPERVISOR"
      ? { createdById: session.user.id }
      : {},
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
      _count: {
        select: { applications: true, internships: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Training Programs</h1>
        <Link href="/supervisor/programs/new" className="btn btn-primary">
          <Plus size={18} className="mr-2" />
          Create Program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No programs yet.</p>
          <Link href="/supervisor/programs/new" className="btn btn-primary">
            Create Your First Program
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((program) => (
            <div key={program.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-brand-navy">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-500">{program.organization}</p>
                </div>
                <Link
                  href={`/supervisor/programs/${program.id}`}
                  className="text-brand-teal hover:underline text-sm"
                >
                  View Details
                </Link>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {program.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{program.seats} seats</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText size={16} />
                  <span>{program.durationWeeks} weeks</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-500">
                    <strong className="text-brand-navy">{program._count.applications}</strong>{" "}
                    applicants
                  </span>
                  <span className="text-gray-500">
                    <strong className="text-brand-navy">{program._count.internships}</strong>{" "}
                    active
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(program.createdAt)}
                </span>
              </div>

              {program.applicationDeadline && (
                <div className="mt-3 pt-3 border-t">
                  <span className="text-xs text-gray-500">
                    Deadline: {formatDate(program.applicationDeadline)}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

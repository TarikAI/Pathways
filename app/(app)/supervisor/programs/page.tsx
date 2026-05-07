import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProgramCard } from "./ProgramCard";

export default async function SupervisorProgramsPage() {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);

  const programs = await db.trainingProgram.findMany({
    where: session.user.role === "ADMIN"
      ? {}
      : { createdById: session.user.id },
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
            <ProgramCard
              key={program.id}
              program={program}
              canDelete={session.user.role === "ADMIN" || program.createdById === session.user.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

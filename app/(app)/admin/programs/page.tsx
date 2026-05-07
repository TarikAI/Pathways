import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Briefcase, Users, Edit, Eye } from "lucide-react";

export default async function AdminProgramsPage() {
  await requireRole(["ADMIN"]);

  const programs = await db.trainingProgram.findMany({
    where: { active: true },
    include: {
      createdBy: {
        select: { id: true, fullName: true },
      },
      _count: {
        select: {
          applications: true,
          internships: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Programs</h1>
        <Link href="/supervisor/programs/new" className="btn bg-brand-teal hover:bg-brand-navy text-white">
          Create Program
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No programs yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <div key={program.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-brand-navy">{program.title}</h3>
                  <p className="text-sm text-gray-500">{program.organization}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/supervisor/programs/${program.id}`}
                    className="text-gray-400 hover:text-brand-teal"
                    title="View"
                  >
                    <Eye size={18} />
                  </Link>
                  <Link
                    href={`/supervisor/programs/${program.id}/edit`}
                    className="text-gray-400 hover:text-brand-teal"
                    title="Edit"
                  >
                    <Edit size={18} />
                  </Link>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{program.description}</p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Users size={16} />
                  {program.seats} seats
                </span>
                <span>{program.durationWeeks} weeks</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-teal">{program._count.applications}</p>
                  <p className="text-xs text-gray-500">Applications</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-navy">{program._count.internships}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t text-xs text-gray-400 flex justify-between">
                <span>By {program.createdBy.fullName}</span>
                <span>{formatDate(program.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

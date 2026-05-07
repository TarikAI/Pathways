import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import Link from "next/link";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function InternshipsPage() {
  const session = await requireRole(["STUDENT"]);

  const programs = await db.trainingProgram.findMany({
    where: {
      active: true,
      applicationDeadline: {
        gte: new Date(),
      },
    },
    include: {
      createdBy: {
        select: { id: true, fullName: true },
      },
      _count: {
        select: { internships: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const myApplications = await db.trainingApplication.findMany({
    where: { studentId: session.user.id },
    select: { programId: true, status: true },
  });

  const appliedProgramIds = new Set(myApplications.map((a) => a.programId));
  const applicationStatuses = Object.fromEntries(
    myApplications.map((a) => [a.programId, a.status])
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Internship Programs</h1>
        <Link href="/student/applications" className="btn btn-outline">
          My Applications
        </Link>
      </div>

      {programs.length === 0 ? (
        <div className="card text-center py-12">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No internship programs available at the moment.</p>
          <p className="text-sm text-gray-400">Check back later for new opportunities!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {programs.map((program) => {
            const availableSeats = program.seats - program._count.internships;
            const hasApplied = appliedProgramIds.has(program.id);
            const status = applicationStatuses[program.id];

            return (
              <div key={program.id} className="card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-xl text-brand-navy mb-1">
                      {program.title}
                    </h3>
                    <p className="text-gray-600">{program.organization}</p>
                  </div>
                  {hasApplied && status && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        status === "APPROVED"
                          ? "bg-green-100 text-green-700"
                          : status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700"
                          : status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                  {program.description}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={16} />
                    <span>{program.durationWeeks} weeks</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={16} />
                    <span>{availableSeats} seats left</span>
                  </div>
                  {program.applicationDeadline && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 col-span-2">
                      <MapPin size={16} />
                      <span>Deadline: {formatDate(program.applicationDeadline)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Posted by {program.createdBy.fullName}
                  </span>
                  {hasApplied ? (
                    <span className="text-sm text-gray-500">Applied</span>
                  ) : availableSeats <= 0 ? (
                    <span className="text-sm text-red-500">No seats available</span>
                  ) : (
                    <Link
                      href={`/internships/${program.id}/apply`}
                      className="btn btn-primary text-sm py-1"
                    >
                      Apply Now
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

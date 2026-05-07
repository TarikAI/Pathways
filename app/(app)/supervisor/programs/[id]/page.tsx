import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, Users, FileText, Edit } from "lucide-react";
import { formatDate, applicationStatusClass } from "@/lib/utils";

export default async function ProgramDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);
  const { id } = await params;

  const program = await db.trainingProgram.findUnique({
    where: { id },
    include: {
      createdBy: {
        select: { id: true, fullName: true, email: true },
      },
      applications: {
        include: {
          student: {
            select: { id: true, fullName: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      internships: {
        include: {
          student: {
            select: { id: true, fullName: true, email: true },
          },
        },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const isOwner =
    session.user.role === "ADMIN" ||
    program.createdById === session.user.id;

  const availableSeats = program.seats - program.internships.length;

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        href="/supervisor/programs"
        className="inline-flex items-center text-brand-teal hover:underline mb-6"
      >
        <ArrowLeft size={16} className="mr-2" />
        Back to Programs
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-brand-navy">
                {program.title}
              </h1>
              {isOwner && (
                <div className="flex gap-2">
                  <Link
                    href={`/supervisor/programs/${program.id}/edit`}
                    className="btn btn-outline text-sm py-1"
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </Link>
                </div>
              )}
            </div>
            <p className="text-gray-600">{program.organization}</p>
          </div>
        </div>

        <p className="text-gray-700 mt-4">{program.description}</p>

        <div className="grid md:grid-cols-4 gap-6 mt-6 pt-6 border-t">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText size={16} />
              <span className="text-sm">Duration</span>
            </div>
            <p className="font-semibold">{program.durationWeeks} weeks</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users size={16} />
              <span className="text-sm">Seats</span>
            </div>
            <p className="font-semibold">
              {availableSeats} / {program.seats} available
            </p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Calendar size={16} />
              <span className="text-sm">Created</span>
            </div>
            <p className="font-semibold">{formatDate(program.createdAt)}</p>
          </div>
          {program.applicationDeadline && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={16} />
                <span className="text-sm">Deadline</span>
              </div>
              <p className="font-semibold">
                {formatDate(program.applicationDeadline)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">
            Created by <span className="font-medium">{program.createdBy.fullName}</span>
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Applications</h2>
          {program.applications.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No applications yet.</p>
          ) : (
            <div className="space-y-3">
              {program.applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{app.student.fullName}</p>
                      <p className="text-sm text-gray-500">{app.student.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${applicationStatusClass(
                        app.status
                      )}`}
                    >
                      {app.status}
                    </span>
                  </div>
                  {app.coverLetter && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                      {app.coverLetter}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Active Internships</h2>
          {program.internships.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No active internships.</p>
          ) : (
            <div className="space-y-3">
              {program.internships.map((internship) => (
                <div
                  key={internship.id}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <p className="font-medium">{internship.student.fullName}</p>
                  <p className="text-sm text-gray-500">{internship.student.email}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(internship.startDate)} -{" "}
                      {formatDate(internship.endDate)}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${internship.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {internship.status}
                    </span>
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

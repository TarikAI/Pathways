import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { redirect } from "next/navigation";
import ApplicationForm from "./ApplicationForm";

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["STUDENT"]);
  const { id } = await params;

  const program = await db.trainingProgram.findUnique({
    where: { id, active: true },
    include: {
      _count: {
        select: { internships: true },
      },
    },
  });

  if (!program) {
    notFound();
  }

  const availableSeats = program.seats - program._count.internships;
  if (availableSeats <= 0) {
    redirect("/internships");
  }

  const existing = await db.trainingApplication.findUnique({
    where: {
      studentId_programId: {
        studentId: session.user.id,
        programId: id,
      },
    },
  });

  if (existing) {
    redirect("/student/applications");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Apply for Program</h1>
        <h2 className="text-xl text-brand-navy">{program.title}</h2>
        <p className="text-gray-600">{program.organization}</p>
      </div>

      <ApplicationForm programId={id} programTitle={program.title} />
    </div>
  );
}

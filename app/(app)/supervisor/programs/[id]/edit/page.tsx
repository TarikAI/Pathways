import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ProgramForm from "../../ProgramForm";

export default async function EditProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);
  const { id } = await params;

  const program = await db.trainingProgram.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      organization: true,
      durationWeeks: true,
      seats: true,
      applicationDeadline: true,
      createdById: true,
    },
  });

  if (!program) {
    notFound();
  }

  // Check if user owns the program or is admin
  if (session.user.role !== "ADMIN" && program.createdById !== session.user.id) {
    redirect("/supervisor/programs");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Program</h1>
      <ProgramForm program={program} />
    </div>
  );
}

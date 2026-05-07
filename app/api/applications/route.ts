import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const applicationSchema = z.object({
  programId: z.string(),
  coverLetter: z.string().min(50).max(2000),
});

export async function GET() {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);

    let where;

    if (session.user.role === "STUDENT") {
      where = { studentId: session.user.id };
    } else {
      where = {};
    }

    const applications = await db.trainingApplication.findMany({
      where,
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        program: {
          select: { id: true, title: true, organization: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await req.json();
    const data = applicationSchema.parse(body);

    const program = await db.trainingProgram.findUnique({
      where: { id: data.programId },
      include: {
        _count: {
          select: { internships: true },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (!program.active) {
      return NextResponse.json({ error: "Program is no longer active" }, { status: 400 });
    }

    if (program.applicationDeadline && program.applicationDeadline < new Date()) {
      return NextResponse.json({ error: "Application deadline has passed" }, { status: 400 });
    }

    const availableSeats = program.seats - program._count.internships;
    if (availableSeats <= 0) {
      return NextResponse.json({ error: "No seats available" }, { status: 400 });
    }

    const existing = await db.trainingApplication.findUnique({
      where: {
        studentId_programId: {
          studentId: session.user.id,
          programId: data.programId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already applied to this program" }, { status: 400 });
    }

    const application = await db.trainingApplication.create({
      data: {
        studentId: session.user.id,
        programId: data.programId,
        coverLetter: data.coverLetter,
        status: "PENDING",
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        program: {
          select: { id: true, title: true, organization: true },
        },
      },
    });

    await createNotification({
      userId: program.createdById,
      type: "APPLICATION_DECISION",
      title: "New Program Application",
      body: `${session.user.fullName} has applied for ${program.title}`,
      link: `/supervisor/programs/${program.id}`,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SUBMIT_APPLICATION",
        entity: "TrainingApplication",
        entityId: application.id,
        metadata: { programId: data.programId },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.flatten() },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to submit application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createProgramSchema } from "@/lib/validators/program";

export async function GET() {
  try {
    const programs = await db.trainingProgram.findMany({
      where: { active: true },
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

    return NextResponse.json(programs);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch programs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);
    const body = await req.json();
    const data = createProgramSchema.parse(body);

    const deadline = data.applicationDeadline && data.applicationDeadline !== ""
      ? new Date(data.applicationDeadline)
      : null;

    const program = await db.trainingProgram.create({
      data: {
        title: data.title,
        description: data.description,
        organization: data.organization,
        durationWeeks: data.durationWeeks,
        seats: data.seats,
        applicationDeadline: deadline,
        createdById: session.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_PROGRAM",
        entity: "TrainingProgram",
        entityId: program.id,
        metadata: { title: program.title },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.flatten() },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to create program";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

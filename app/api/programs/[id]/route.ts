import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { updateProgramSchema } from "@/lib/validators/program";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
        _count: {
          select: { applications: true, internships: true },
        },
      },
    });

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch program";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateProgramSchema.parse({ ...body, id });

    const existing = await db.trainingProgram.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (existing.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const program = await db.trainingProgram.update({
      where: { id },
      data: {
        ...data,
        applicationDeadline: data.applicationDeadline
          ? new Date(data.applicationDeadline)
          : null,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_PROGRAM",
        entity: "TrainingProgram",
        entityId: program.id,
        metadata: { title: program.title },
      },
    });

    return NextResponse.json(program);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: (err as any).errors },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to update program";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "ADMIN"]);
    const { id } = await params;

    const existing = await db.trainingProgram.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (existing.createdById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.trainingProgram.update({
      where: { id },
      data: { active: false },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_PROGRAM",
        entity: "TrainingProgram",
        entityId: id,
        metadata: { title: existing.title },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete program";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

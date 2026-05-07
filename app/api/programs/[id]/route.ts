import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
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
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateProgramSchema.parse(body);

    const existing = await db.trainingProgram.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deadline = data.applicationDeadline && data.applicationDeadline !== ""
      ? new Date(data.applicationDeadline)
      : null;

    const program = await db.trainingProgram.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.organization !== undefined && { organization: data.organization }),
        ...(data.durationWeeks !== undefined && { durationWeeks: data.durationWeeks }),
        ...(data.seats !== undefined && { seats: data.seats }),
        ...(data.applicationDeadline !== undefined && { applicationDeadline: deadline }),
      },
      include: {
        createdBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });

    return NextResponse.json(program);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.flatten() },
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
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const { id } = await params;

    const existing = await db.trainingProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: { internships: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (existing._count.internships > 0) {
      return NextResponse.json(
        { error: "Cannot delete program with active internships" },
        { status: 400 }
      );
    }

    if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.trainingProgram.delete({
      where: { id },
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

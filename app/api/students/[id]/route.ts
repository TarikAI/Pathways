import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const { id: studentId } = await params;

    const internship = await db.internship.findFirst({
      where: {
        studentId,
        ...(session.user.role === "ACADEMIC_SUPERVISOR"
          ? { academicSupervisorId: session.user.id }
          : session.user.role === "FIELD_SUPERVISOR"
          ? { fieldSupervisorId: session.user.id }
          : {}),
      },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        program: {
          select: { title: true, organization: true, durationWeeks: true },
        },
        reports: {
          orderBy: { weekNumber: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            weekNumber: true,
            status: true,
            body: true,
            submittedAt: true,
          },
        },
        evaluations: {
          include: {
            evaluator: {
              select: { id: true, fullName: true, role: true },
            },
            cosigner: {
              select: { id: true, fullName: true },
            },
            criteria: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!internship) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(internship);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch student";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const evaluationSchema = z.object({
  internshipId: z.string(),
  period: z.string().min(1),
  overallComment: z.string().min(1),
  criteria: z.array(z.object({
    label: z.string().min(1),
    score: z.number().int().min(0).max(10),
    comment: z.string().optional()
  })).min(1)
});

export async function GET(req: Request) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "STUDENT", "ADMIN"]);

    let where;
    const url = new URL(req.url);
    const internshipId = url.searchParams.get("internshipId");

    if (session.user.role === "STUDENT") {
      const internships = await db.internship.findMany({
        where: { studentId: session.user.id },
        select: { id: true },
      });
      where = { internshipId: { in: internships.map((i) => i.id) } };
    } else if (session.user.role === "ACADEMIC_SUPERVISOR") {
      const internships = await db.internship.findMany({
        where: { academicSupervisorId: session.user.id },
        select: { id: true },
      });
      where = { internshipId: { in: internships.map((i) => i.id) } };
    } else if (session.user.role === "FIELD_SUPERVISOR") {
      const internships = await db.internship.findMany({
        where: { fieldSupervisorId: session.user.id },
        select: { id: true },
      });
      where = { internshipId: { in: internships.map((i) => i.id) } };
    }

    if (internshipId) {
      const internship = await db.internship.findUnique({
        where: { id: internshipId },
      });
      if (!internship || internship.studentId !== session.user.id &&
          internship.academicSupervisorId !== session.user.id &&
          internship.fieldSupervisorId !== session.user.id &&
          session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      where = { ...where, internshipId };
    }

    const evaluations = await db.evaluation.findMany({
      where,
      include: {
        internship: {
          include: {
            student: {
              select: { id: true, fullName: true, email: true },
            },
            program: {
              select: { id: true, title: true },
            },
          },
        },
        evaluator: {
          select: { id: true, fullName: true, role: true },
        },
        cosigner: {
          select: { id: true, fullName: true },
        },
        criteria: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(evaluations);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch evaluations";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireRole(["FIELD_SUPERVISOR"]);
    const body = await req.json();
    const data = evaluationSchema.parse(body);

    const internship = await db.internship.findUnique({
      where: { id: data.internshipId },
      include: { student: true, academicSupervisor: true, program: true },
    });

    if (!internship || internship.fieldSupervisorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const totalScore = data.criteria.reduce((sum, c) => sum + c.score, 0);

    const evaluation = await db.evaluation.create({
      data: {
        internshipId: data.internshipId,
        evaluatorId: session.user.id,
        period: data.period,
        overallComment: data.overallComment,
        totalScore,
        criteria: {
          create: data.criteria.map((c) => ({
            label: c.label,
            score: c.score,
            comment: c.comment ?? null,
          })),
        },
      },
      include: {
        criteria: true,
      },
    });

    await db.notification.create({
      data: {
        userId: internship.academicSupervisorId,
        type: "EVALUATION_POSTED",
        title: "New Evaluation Pending Cosign",
        body: `An evaluation for ${internship.student.fullName} (period: ${data.period}) is ready for your review.`,
        link: `/supervisor/students/${internship.studentId}`,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CREATE_EVALUATION",
        entity: "Evaluation",
        entityId: evaluation.id,
        metadata: {
          internshipId: data.internshipId,
          period: data.period,
          totalScore,
        },
      },
    });

    return NextResponse.json(evaluation, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

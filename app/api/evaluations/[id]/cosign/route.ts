import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR"]);
    const { id } = await params;

    const evaluation = await db.evaluation.findUnique({
      where: { id },
      include: {
        criteria: true,
        internship: {
          include: { student: true, academicSupervisor: true },
        },
      },
    });

    if (!evaluation) {
      return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });
    }

    if (evaluation.internship.academicSupervisorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (evaluation.cosignedById) {
      return NextResponse.json({ error: "Already cosigned" }, { status: 400 });
    }

    const updated = await db.evaluation.update({
      where: { id },
      data: {
        cosignedById: session.user.id,
        cosignedAt: new Date(),
      },
    });

    await createNotification({
      userId: evaluation.internship.studentId,
      type: "EVALUATION_POSTED",
      title: "New Evaluation Posted",
      body: `Your evaluation for period ${evaluation.period} has been posted (${evaluation.totalScore}/${
        evaluation.criteria.length * 10
      }).`,
      link: `/student/internship`,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "COSIGN_EVALUATION",
        entity: "Evaluation",
        entityId: id,
        metadata: {
          evaluationId: id,
          internshipId: evaluation.internshipId,
        },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to cosign evaluation";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

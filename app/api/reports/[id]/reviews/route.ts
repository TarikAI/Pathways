import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const reviewSchema = z.object({
  decision: z.enum(["UNDER_REVIEW", "APPROVED", "REJECTED"]),
  comment: z.string().min(1)
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(["ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR"]);
    const { id } = await params;
    const body = await req.json();
    const data = reviewSchema.parse(body);

    const report = await db.report.findUnique({
      where: { id },
      include: { internship: true }
    });

    if (!report) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (report.internship.academicSupervisorId !== session.user.id && report.internship.fieldSupervisorId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const review = await db.reportReview.create({
      data: {
        reportId: id,
        reviewerId: session.user.id,
        decision: data.decision,
        comment: data.comment
      }
    });

    const previousStatus = report.status;
    await db.report.update({
      where: { id },
      data: { status: data.decision as "APPROVED" | "REJECTED" | "UNDER_REVIEW" }
    });

    if (previousStatus !== data.decision) {
      await createNotification({
        userId: report.internship.studentId,
        type: "REPORT_REVIEWED",
        title: `Report ${data.decision.toLowerCase()}`,
        body: `Your week ${report.weekNumber} report has been ${data.decision.toLowerCase()}. ${data.comment ? "See feedback for details." : ""}`,
        link: `/student/reports/${id}`,
      });

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "REVIEW_REPORT",
          entity: "Report",
          entityId: id,
          metadata: {
            reportId: id,
            decision: data.decision,
            previousStatus,
            newStatus: data.decision,
          },
        },
      });
    }

    return NextResponse.json(review);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

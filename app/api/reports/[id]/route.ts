import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateReportSchema = z.object({
  title: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  weekNumber: z.number().int().min(1).optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        filename: z.string(),
        mimeType: z.string(),
        sizeBytes: z.number().int(),
      })
    )
    .optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["STUDENT"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateReportSchema.parse(body);

    const report = await db.report.findUnique({
      where: { id },
      include: { internship: true },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    if (report.internship.studentId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Only allow editing draft/submitted reports
    if (report.status !== "DRAFT" && report.status !== "SUBMITTED") {
      return NextResponse.json(
        { error: "Cannot edit a report that has been reviewed" },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.weekNumber !== undefined) updateData.weekNumber = data.weekNumber;

    const updatedReport = await db.report.update({
      where: { id },
      data: updateData,
    });

    // Add new attachments if provided
    if (data.attachments && data.attachments.length > 0) {
      await db.reportAttachment.createMany({
        data: data.attachments.map((att) => ({
          reportId: id,
          ...att,
        })),
      });
    }

    return NextResponse.json(updatedReport);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: err.flatten() },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole([
      "STUDENT",
      "ACADEMIC_SUPERVISOR",
      "FIELD_SUPERVISOR",
    ]);
    const { id } = await params;

    const report = await db.report.findUnique({
      where: { id },
      include: {
        internship: {
          include: {
            student: true,
            program: true,
          },
        },
        attachments: true,
        reviews: {
          include: {
            reviewer: {
              select: { id: true, fullName: true, role: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Check access permissions
    const isStudent = session.user.role === "STUDENT";
    const isAcademicSupervisor =
      session.user.role === "ACADEMIC_SUPERVISOR" &&
      report.internship.academicSupervisorId === session.user.id;
    const isFieldSupervisor =
      session.user.role === "FIELD_SUPERVISOR" &&
      report.internship.fieldSupervisorId === session.user.id;

    if (!isStudent && !isAcademicSupervisor && !isFieldSupervisor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(report);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch report";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

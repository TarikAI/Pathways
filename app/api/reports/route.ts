import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { createNotification } from "@/lib/notifications";
import { NextResponse } from "next/server";
import { z } from "zod";

const createReportSchema = z.object({
  internshipId: z.string(),
  weekNumber: z.number().int().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  attachments: z.array(z.object({
    url: z.string().url(),
    filename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number().int()
  })).optional()
});

export async function POST(req: Request) {
  try {
    const session = await requireRole(["STUDENT"]);
    const body = await req.json();
    const data = createReportSchema.parse(body);

    const internship = await db.internship.findUnique({
      where: { id: data.internshipId },
      include: { program: true, academicSupervisor: true },
    });

    if (!internship || internship.studentId !== session.user.id) {
      return NextResponse.json({ error: "Invalid internship" }, { status: 403 });
    }

    const report = await db.report.create({
      data: {
        internshipId: data.internshipId,
        weekNumber: data.weekNumber,
        title: data.title,
        body: data.body,
        status: "SUBMITTED",
        attachments: {
          create: data.attachments || []
        }
      }
    });

    await createNotification({
      userId: internship.academicSupervisorId,
      type: "REPORT_SUBMITTED",
      title: "New Report Submitted",
      body: `${session.user.fullName} submitted a report for week ${data.weekNumber}`,
      link: `/supervisor/reports/${internship.id}`,
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "SUBMIT_REPORT",
        entity: "Report",
        entityId: report.id,
        metadata: { internshipId: data.internshipId, weekNumber: data.weekNumber },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.flatten() }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(_req: Request) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);

    let where;

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

    const reports = await db.report.findMany({
      where,
      include: {
        internship: {
          include: {
            student: {
              select: { id: true, fullName: true, email: true },
            },
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: { id: true, fullName: true, role: true },
            },
          },
        },
      },
      orderBy: { weekNumber: "desc" },
    });

    return NextResponse.json(reports);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch reports";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const decisionSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "WITHDRAWN"]),
  academicSupervisorId: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const application = await db.trainingApplication.findUnique({
      where: { id },
      include: {
        student: {
          select: { id: true, fullName: true, email: true },
        },
        program: {
          select: { id: true, title: true, organization: true },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json(application);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["FIELD_SUPERVISOR", "ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = decisionSchema.parse(body);

    const application = await db.trainingApplication.findUnique({
      where: { id },
      include: {
        program: true,
        student: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    if (application.status !== "PENDING") {
      return NextResponse.json({ error: "Application already processed" }, { status: 400 });
    }

    if (data.status === "APPROVED" && !data.academicSupervisorId) {
      return NextResponse.json(
        { error: "Academic supervisor must be assigned on approval" },
        { status: 400 }
      );
    }

    const updated = await db.trainingApplication.update({
      where: { id },
      data: {
        status: data.status,
        decidedById: session.user.id,
        decidedAt: new Date(),
      },
    });

    if (data.status === "APPROVED" && data.academicSupervisorId) {
      const program = application.program;
      const startDate = new Date();
      const endDate = new Date(
        startDate.getTime() + program.durationWeeks * 7 * 24 * 60 * 60 * 1000
      );

      const internship = await db.internship.create({
        data: {
          studentId: application.studentId,
          academicSupervisorId: data.academicSupervisorId,
          fieldSupervisorId: session.user.id,
          programId: application.programId,
          appliedFromId: application.id,
          startDate,
          endDate,
          status: "ACTIVE",
        },
      });

      const conversation = await db.conversation.create({
        data: {
          participants: {
            create: [
              { userId: application.studentId },
              { userId: data.academicSupervisorId },
              { userId: session.user.id },
            ],
          },
        },
      });

      await db.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.user.id,
          body: `Welcome to the ${program.title} program! This conversation is for coordination between you, your academic supervisor, and your field supervisor.`,
        },
      });

      await db.notification.create({
        data: {
          userId: application.studentId,
          type: "APPLICATION_DECISION",
          title: "Application Approved!",
          body: `Congratulations! Your application for ${program.title} has been approved.`,
          link: "/student/internship",
        },
      });

      await db.notification.create({
        data: {
          userId: data.academicSupervisorId,
          type: "APPLICATION_DECISION",
          title: "New Student Assigned",
          body: `${application.student.fullName} has been assigned to your supervision for ${program.title}.`,
          link: `/supervisor/students/${application.studentId}`,
        },
      });

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "APPROVE_APPLICATION",
          entity: "TrainingApplication",
          entityId: application.id,
          metadata: {
            programId: application.programId,
            studentId: application.studentId,
            academicSupervisorId: data.academicSupervisorId,
            internshipId: internship.id,
          },
        },
      });
    } else if (data.status === "REJECTED") {
      await db.notification.create({
        data: {
          userId: application.studentId,
          type: "APPLICATION_DECISION",
          title: "Application Update",
          body: `Your application for ${application.program.title} was not approved.`,
          link: "/student/applications",
        },
      });

      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "REJECT_APPLICATION",
          entity: "TrainingApplication",
          entityId: application.id,
          metadata: {
            programId: application.programId,
            studentId: application.studentId,
          },
        },
      });
    }

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof Error && err.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: (err as any).errors },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

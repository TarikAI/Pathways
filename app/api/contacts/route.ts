import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const session = await requireRole(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]);
    const url = new URL(req.url);
    const search = url.searchParams.get("search") || "";

    // Get users the current user can message based on their role
    let eligibleUserIds: string[] = [];
    const role = session.user.role;

    if (role === "STUDENT") {
      // Students can message their academic and field supervisors
      const internships = await db.internship.findMany({
        where: { studentId: session.user.id },
        select: { academicSupervisorId: true, fieldSupervisorId: true },
      });
      eligibleUserIds = internships.flatMap((i) => [i.academicSupervisorId, i.fieldSupervisorId]);
    } else if (role === "ACADEMIC_SUPERVISOR") {
      // Academic supervisors can message their students and field supervisors
      const internships = await db.internship.findMany({
        where: { academicSupervisorId: session.user.id },
        select: { studentId: true, fieldSupervisorId: true },
      });
      eligibleUserIds = internships.flatMap((i) => [i.studentId, i.fieldSupervisorId]);
    } else if (role === "FIELD_SUPERVISOR") {
      // Field supervisors can message their students and academic supervisors
      const internships = await db.internship.findMany({
        where: { fieldSupervisorId: session.user.id },
        select: { studentId: true, academicSupervisorId: true },
      });
      eligibleUserIds = internships.flatMap((i) => [i.studentId, i.academicSupervisorId]);
    } else if (role === "ADMIN") {
      // Admins can message everyone
      const allUsers = await db.user.findMany({
        where: { id: { not: session.user.id } },
        select: { id: true },
      });
      eligibleUserIds = allUsers.map((u) => u.id);
    }

    // Get existing conversation participant IDs
    const existingConvos = await db.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.user.id },
        },
      },
      include: {
        participants: {
          select: { userId: true },
        },
      },
    });

    const existingContactIds = existingConvos.flatMap((c) =>
      c.participants.map((p) => p.userId).filter((id) => id !== session.user.id)
    );

    // Combine eligible and existing contacts
    const allContactIds = Array.from(new Set([...eligibleUserIds, ...existingContactIds]));

    // Fetch users with optional search filter
    const users = await db.user.findMany({
      where: {
        id: { in: allContactIds },
        ...(search
          ? {
              OR: [
                { fullName: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        avatarUrl: true,
        role: true,
      },
      orderBy: { fullName: "asc" },
    });

    // Group by role
    const grouped = {
      supervisors: users.filter((u) =>
        u.role === "ACADEMIC_SUPERVISOR" || u.role === "FIELD_SUPERVISOR"
      ),
      students: users.filter((u) => u.role === "STUDENT"),
      admins: users.filter((u) => u.role === "ADMIN"),
    };

    return NextResponse.json(grouped);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch contacts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

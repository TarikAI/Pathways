import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: any = {};
  if (status) {
    where.status = status;
  }

  // Field supervisors only see internships they supervise
  if (session.user.role === "FIELD_SUPERVISOR") {
    where.fieldSupervisorId = session.user.id;
  }
  // Academic supervisors only see internships they supervise
  else if (session.user.role === "ACADEMIC_SUPERVISOR") {
    where.academicSupervisorId = session.user.id;
  }

  const internships = await db.internship.findMany({
    where,
    include: {
      student: {
        select: { id: true, fullName: true, email: true },
      },
      program: {
        select: { id: true, title: true, organization: true },
      },
    },
    orderBy: { startDate: "desc" },
  });

  return NextResponse.json(internships);
}

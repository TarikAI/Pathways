import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const where: Prisma.InternshipWhereInput = {};
  if (status) {
    where.status = status as Prisma.EnumInternshipStatusFilter["equals"];
  }

  if (session.user.role === "FIELD_SUPERVISOR") {
    where.fieldSupervisorId = session.user.id;
  } else if (session.user.role === "ACADEMIC_SUPERVISOR") {
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

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Pathways!2026", 12);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@pathways.dev" },
    update: {},
    create: {
      email: "admin@pathways.dev",
      passwordHash: hash,
      fullName: "Admin User",
      role: "ADMIN",
    },
  });

  const acadSup1 = await prisma.user.upsert({
    where: { email: "acadsup1@pathways.dev" },
    update: {},
    create: {
      email: "acadsup1@pathways.dev",
      passwordHash: hash,
      fullName: "Dr. Emily Chen",
      role: "ACADEMIC_SUPERVISOR",
    },
  });

  const acadSup2 = await prisma.user.upsert({
    where: { email: "acadsup2@pathways.dev" },
    update: {},
    create: {
      email: "acadsup2@pathways.dev",
      passwordHash: hash,
      fullName: "Prof. Alan Smith",
      role: "ACADEMIC_SUPERVISOR",
    },
  });

  const fieldSup1 = await prisma.user.upsert({
    where: { email: "fieldsup1@pathways.dev" },
    update: {},
    create: {
      email: "fieldsup1@pathways.dev",
      passwordHash: hash,
      fullName: "Sarah Johnson",
      role: "FIELD_SUPERVISOR",
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: "student1@pathways.dev" },
    update: {},
    create: {
      email: "student1@pathways.dev",
      passwordHash: hash,
      fullName: "Jordan Lee",
      role: "STUDENT",
    },
  });

  // Programs
  const prog1 = await prisma.trainingProgram.create({
    data: {
      title: "Software Engineering Co-op 2026",
      description: "A 16-week software engineering co-op program.",
      organization: "TechCorp",
      durationWeeks: 16,
    }
  });

  // Internship
  const internship1 = await prisma.internship.create({
    data: {
      studentId: student1.id,
      academicSupervisorId: acadSup1.id,
      fieldSupervisorId: fieldSup1.id,
      programId: prog1.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
      weekNumber: 2,
      progressPercent: 15,
    }
  });

  // Report
  await prisma.report.create({
    data: {
      internshipId: internship1.id,
      weekNumber: 1,
      title: "Week 1 Status Report",
      body: "Learned the tech stack and met the team.",
      status: "SUBMITTED"
    }
  });

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

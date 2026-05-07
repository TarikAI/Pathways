import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BCRYPT_COST = 12;
const DEFAULT_PASSWORD = "Pathways!2026";

async function main() {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_COST);

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

  const fieldSup2 = await prisma.user.upsert({
    where: { email: "fieldsup2@pathways.dev" },
    update: {},
    create: {
      email: "fieldsup2@pathways.dev",
      passwordHash: hash,
      fullName: "Michael Torres",
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

  const student2 = await prisma.user.upsert({
    where: { email: "student2@pathways.dev" },
    update: {},
    create: {
      email: "student2@pathways.dev",
      passwordHash: hash,
      fullName: "Taylor Kim",
      role: "STUDENT",
    },
  });

  const student3 = await prisma.user.upsert({
    where: { email: "student3@pathways.dev" },
    update: {},
    create: {
      email: "student3@pathways.dev",
      passwordHash: hash,
      fullName: "Alex Rivera",
      role: "STUDENT",
    },
  });

  const student4 = await prisma.user.upsert({
    where: { email: "student4@pathways.dev" },
    update: {},
    create: {
      email: "student4@pathways.dev",
      passwordHash: hash,
      fullName: "Casey Morgan",
      role: "STUDENT",
    },
  });

  const prog1 = await prisma.trainingProgram.upsert({
    where: { id: "prog-1" },
    update: {},
    create: {
      id: "prog-1",
      title: "Software Engineering Co-op 2026",
      description: "A 16-week software engineering co-op program focused on full-stack development.",
      organization: "TechCorp",
      durationWeeks: 16,
      seats: 4,
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdById: acadSup1.id,
    },
  });

  const prog2 = await prisma.trainingProgram.upsert({
    where: { id: "prog-2" },
    update: {},
    create: {
      id: "prog-2",
      title: "Data Science Internship Program",
      description: "12-week program focused on data analysis, machine learning, and business intelligence.",
      organization: "DataFirst Analytics",
      durationWeeks: 12,
      seats: 3,
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      createdById: acadSup2.id,
    },
  });

  const app1 = await prisma.trainingApplication.upsert({
    where: { id: "app-1" },
    update: {},
    create: {
      id: "app-1",
      studentId: student1.id,
      programId: prog1.id,
      status: "APPROVED",
      coverLetter: "I am excited to apply for this program to gain hands-on experience.",
      decidedById: fieldSup1.id,
      decidedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
  });

  const app2 = await prisma.trainingApplication.upsert({
    where: { id: "app-2" },
    update: {},
    create: {
      id: "app-2",
      studentId: student2.id,
      programId: prog1.id,
      status: "PENDING",
      coverLetter: "Eager to contribute my skills to a real-world project.",
    },
  });

  const internship1 = await prisma.internship.upsert({
    where: { id: "intern-1" },
    update: {},
    create: {
      id: "intern-1",
      studentId: student1.id,
      academicSupervisorId: acadSup1.id,
      fieldSupervisorId: fieldSup1.id,
      programId: prog1.id,
      appliedFromId: app1.id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 16 * 7 * 24 * 60 * 60 * 1000),
      weekNumber: 3,
      progressPercent: 20,
    },
  });

  await prisma.report.createMany({
    data: [
      {
        internshipId: internship1.id,
        weekNumber: 1,
        title: "Week 1 Status Report",
        body: "Onboarding completed, learned about the tech stack and team processes.",
        status: "APPROVED",
      },
      {
        internshipId: internship1.id,
        weekNumber: 2,
        title: "Week 2 Status Report",
        body: "Started working on the user authentication module. Made good progress.",
        status: "SUBMITTED",
      },
      {
        internshipId: internship1.id,
        weekNumber: 3,
        title: "Week 3 Draft",
        body: "Continued work on authentication. Draft report.",
        status: "DRAFT",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.evaluation.createMany({
    data: [
      {
        internshipId: internship1.id,
        evaluatorId: fieldSup1.id,
        period: "Week 1-2",
        overallComment: "Jordan has shown excellent progress and strong teamwork skills.",
        totalScore: 45,
      },
    ],
    skipDuplicates: true,
  });

  const conv1 = await prisma.conversation.upsert({
    where: { id: "conv-1" },
    update: {},
    create: {
      id: "conv-1",
      participants: {
        create: [
          { userId: student1.id },
          { userId: acadSup1.id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: acadSup1.id,
        body: "Welcome to the program! Feel free to reach out if you have any questions.",
      },
      {
        conversationId: conv1.id,
        senderId: student1.id,
        body: "Thank you! I'm excited to get started.",
      },
    ],
    skipDuplicates: true,
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: "REPORT_REVIEWED",
        title: "Report Approved",
        body: "Your Week 1 report has been approved by your supervisor.",
        link: `/student/reports`,
      },
      {
        userId: acadSup1.id,
        type: "REPORT_SUBMITTED",
        title: "New Report Submitted",
        body: "Jordan Lee submitted a report for Week 2.",
        link: `/supervisor/reports/${internship1.id}`,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeding finished.");
  console.log("\nTest credentials:");
  console.log("===================");
  console.log("Admin: admin@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Academic Supervisor 1: acadsup1@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Academic Supervisor 2: acadsup2@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Field Supervisor 1: fieldsup1@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Field Supervisor 2: fieldsup2@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Student 1: student1@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Student 2: student2@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Student 3: student3@pathways.dev / " + DEFAULT_PASSWORD);
  console.log("Student 4: student4@pathways.dev / " + DEFAULT_PASSWORD);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const OLD_EMAIL_TYPO = "tarik2009h@gamil.com";
const OLD_EMAIL_CORRECT = "tarik2009h@gmail.com";
const NEW_EMAIL = "lele@gmail.com";
const NEW_PASSWORD = "12345678";
const BCRYPT_COST = 12;

async function main() {
  console.log("Starting user account update...\n");

  // Hash the new password
  const passwordHash = await bcrypt.hash(NEW_PASSWORD, BCRYPT_COST);
  console.log(`Password hashed for ${NEW_EMAIL}`);

  // Check if user with typo email exists
  let user = await prisma.user.findUnique({
    where: { email: OLD_EMAIL_TYPO },
  });

  // If not found with typo, check with correct spelling
  if (!user) {
    user = await prisma.user.findUnique({
      where: { email: OLD_EMAIL_CORRECT },
    });
    if (user) {
      console.log(`Found user with correct email: ${OLD_EMAIL_CORRECT}`);
    }
  } else {
    console.log(`Found user with typo email: ${OLD_EMAIL_TYPO}`);
  }

  // If user exists with either email, update them
  if (user) {
    console.log(`Updating user ${user.fullName}...`);

    // Check if new email already exists
    const existingNewEmail = await prisma.user.findUnique({
      where: { email: NEW_EMAIL },
    });

    if (existingNewEmail) {
      console.log(`User with email ${NEW_EMAIL} already exists. Deleting old account...`);

      // Reassign programs from old account to new account
      const oldUserId = user.id;
      const newUserId = existingNewEmail.id;

      await prisma.trainingProgram.updateMany({
        where: { createdById: oldUserId },
        data: { createdById: newUserId },
      });

      await prisma.trainingApplication.updateMany({
        where: { decidedById: oldUserId },
        data: { decidedById: newUserId },
      });

      await prisma.internship.updateMany({
        where: {
          OR: [
            { academicSupervisorId: oldUserId },
            { fieldSupervisorId: oldUserId },
          ],
        },
        data: {
          ...(user.role === "ACADEMIC_SUPERVISOR"
            ? { academicSupervisorId: newUserId }
            : {}),
          ...(user.role === "FIELD_SUPERVISOR"
            ? { fieldSupervisorId: newUserId }
            : {}),
        },
      });

      await prisma.evaluation.updateMany({
        where: { evaluatorId: oldUserId },
        data: { evaluatorId: newUserId },
      });

      // Delete old user
      await prisma.user.delete({
        where: { id: oldUserId },
      });

      console.log(`Old account deleted. All data reassigned to ${NEW_EMAIL}`);
    } else {
      // Update the existing user with new email and password
      await prisma.user.update({
        where: { id: user.id },
        data: {
          email: NEW_EMAIL,
          passwordHash,
        },
      });

      console.log(`User email updated to: ${NEW_EMAIL}`);
      console.log(`Password updated to: ${NEW_PASSWORD}`);
    }

    // Also check if there are any programs created by tarik2009h@gmail.com that need reassignment
    const userWithCorrectEmail = await prisma.user.findUnique({
      where: { email: OLD_EMAIL_CORRECT },
    });

    if (userWithCorrectEmail && userWithCorrectEmail.id !== user.id) {
      console.log(`\nFound additional user with ${OLD_EMAIL_CORRECT}`);
      console.log(`Reassigning programs from ${OLD_EMAIL_CORRECT} to ${NEW_EMAIL}...`);

      const leleUser = await prisma.user.findUnique({
        where: { email: NEW_EMAIL },
      });

      if (leleUser) {
        await prisma.trainingProgram.updateMany({
          where: { createdById: userWithCorrectEmail.id },
          data: { createdById: leleUser.id },
        });

        await prisma.trainingApplication.updateMany({
          where: { decidedById: userWithCorrectEmail.id },
          data: { decidedById: leleUser.id },
        });

        await prisma.internship.updateMany({
          where: {
            OR: [
              { academicSupervisorId: userWithCorrectEmail.id },
              { fieldSupervisorId: userWithCorrectEmail.id },
            ],
          },
          data: {
            ...(userWithCorrectEmail.role === "ACADEMIC_SUPERVISOR"
              ? { academicSupervisorId: leleUser.id }
              : {}),
            ...(userWithCorrectEmail.role === "FIELD_SUPERVISOR"
              ? { fieldSupervisorId: leleUser.id }
              : {}),
          },
        });

        await prisma.evaluation.updateMany({
          where: { evaluatorId: userWithCorrectEmail.id },
          data: { evaluatorId: leleUser.id },
        });

        // Delete the duplicate user
        await prisma.user.delete({
          where: { id: userWithCorrectEmail.id },
        });

        console.log(`Account ${OLD_EMAIL_CORRECT} deleted and data reassigned`);
      }
    }

    // Verify the changes
    const finalUser = await prisma.user.findUnique({
      where: { email: NEW_EMAIL },
    });

    if (finalUser) {
      const programCount = await prisma.trainingProgram.count({
        where: { createdById: finalUser.id },
      });

      console.log(`\n========================================`);
      console.log(`Update Complete!`);
      console.log(`========================================`);
      console.log(`Email: ${NEW_EMAIL}`);
      console.log(`Password: ${NEW_PASSWORD}`);
      console.log(`Name: ${finalUser.fullName}`);
      console.log(`Role: ${finalUser.role}`);
      console.log(`Programs managed: ${programCount}`);
      console.log(`========================================`);
    }
  } else {
    console.log(`No user found with either ${OLD_EMAIL_TYPO} or ${OLD_EMAIL_CORRECT}`);
    console.log("Creating new user...");

    // Create new user if neither old email exists
    const newUser = await prisma.user.create({
      data: {
        email: NEW_EMAIL,
        passwordHash,
        fullName: "Lele",
        role: "ACADEMIC_SUPERVISOR",
      },
    });

    console.log(`\nNew user created:`);
    console.log(`Email: ${NEW_EMAIL}`);
    console.log(`Password: ${NEW_PASSWORD}`);
    console.log(`Name: ${newUser.fullName}`);
    console.log(`Role: ${newUser.role}`);
  }
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

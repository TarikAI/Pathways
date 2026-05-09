import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = "meme@gmail.com";
  const password = "Admin123!"; // Change this after first login
  const fullName = "Admin User";

  // Check if user already exists
  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    console.log(`User ${email} already exists with role: ${existing.role}`);
    // Update to admin if not already
    if (existing.role !== "ADMIN") {
      await prisma.user.update({
        where: { email },
        data: { role: "ADMIN" },
      });
      console.log(`Updated user role to ADMIN`);
    }
    return;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create admin user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      fullName,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log(`Admin user created:`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Name: ${user.fullName}`);
  console.log(`  Role: ${user.role}`);
  console.log(`  Password: ${password} (please change after first login)`);
}

createAdminUser()
  .then(() => {
    console.log("\nDone!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { db } from "@/lib/db";
import { BCRYPT_COST, hashPassword, verifyResetToken } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const resetConfirmSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = resetConfirmSchema.parse(body);

    const userId = await verifyResetToken(data.token);

    if (!userId) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    const passwordHash = await hashPassword(data.newPassword, BCRYPT_COST);

    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await db.passwordResetToken.deleteMany({
      where: { userId },
    });

    await db.auditLog.create({
      data: {
        userId,
        action: "PASSWORD_RESET_COMPLETED",
        entity: "User",
        entityId: userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to reset password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

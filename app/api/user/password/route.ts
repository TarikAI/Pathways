import { requireSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { BCRYPT_COST, hashPassword, verifyPassword } from "@/lib/auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function POST(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = updatePasswordSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await verifyPassword(user.passwordHash, data.currentPassword);
    if (!isValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newPasswordHash = await hashPassword(data.newPassword, BCRYPT_COST);

    await db.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "CHANGE_PASSWORD",
        entity: "User",
        entityId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to update password";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { db } from "@/lib/db";
import { generateResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { NextResponse } from "next/server";
import { z } from "zod";

const resetRequestSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = resetRequestSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const resetToken = await generateResetToken(user.id);
    const appUrl = process.env.AUTH_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(user, resetUrl);

    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        entity: "User",
        entityId: user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.flatten() }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  }
}

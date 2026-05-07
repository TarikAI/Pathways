import { requireSession } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateProfileSchema = z.object({
  fullName: z.string().min(1).max(100),
  email: z.string().email(),
});

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();
    const body = await req.json();
    const data = updateProfileSchema.parse(body);

    const existingUser = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser && existingUser.id !== session.user.id) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: session.user.id },
      data: {
        fullName: data.fullName,
        email: data.email,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_PROFILE",
        entity: "User",
        entityId: session.user.id,
        metadata: { changes: data },
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

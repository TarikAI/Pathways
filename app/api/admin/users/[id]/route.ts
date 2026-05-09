import { requireRole } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

const updateUserSchema = z.object({
  email: z.string().email().optional(),
  fullName: z.string().min(1).optional(),
  role: z.enum(["STUDENT", "ACADEMIC_SUPERVISOR", "FIELD_SUPERVISOR", "ADMIN"]).optional(),
  password: z.string().min(6).optional(),
});

// GET single user
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            studentInternships: true,
            academicInternships: true,
            fieldInternships: true,
            createdPrograms: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH update user
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-role-change
    if (id === session.user.id && data.role && data.role !== user.role) {
      return NextResponse.json({ error: "Cannot change your own role" }, { status: 400 });
    }

    // Check if email already exists (if changing email)
    if (data.email && data.email !== user.email) {
      const existing = await db.user.findUnique({
        where: { email: data.email },
      });
      if (existing) {
        return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      }
    }

    // Prepare update data
    const updateData: {
      email?: string;
      fullName?: string;
      role?: "STUDENT" | "ACADEMIC_SUPERVISOR" | "FIELD_SUPERVISOR" | "ADMIN";
      passwordHash?: string;
    } = {};
    if (data.email) updateData.email = data.email;
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const updatedUser = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        updatedAt: true,
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "UPDATE_USER",
        entity: "User",
        entityId: id,
        metadata: { changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: err.errors }, { status: 400 });
    }
    const message = err instanceof Error ? err.message : "Failed to update user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE user
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireRole(["ADMIN"]);
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-deletion
    if (id === session.user.id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    // Check for related records
    const internships = await db.internship.findMany({
      where: {
        OR: [
          { studentId: id },
          { academicSupervisorId: id },
          { fieldSupervisorId: id },
        ],
      },
    });

    if (internships.length > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete user with active internships",
          details: { internshipCount: internships.length },
        },
        { status: 400 }
      );
    }

    // Delete user (cascade will handle related records)
    await db.user.delete({
      where: { id },
    });

    // Audit log (after deletion, so we don't have the user reference)
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DELETE_USER",
        entity: "User",
        entityId: id,
        metadata: { deletedUserEmail: user.email, deletedUserName: user.fullName },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete user";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

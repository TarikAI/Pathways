import "server-only";
import { auth } from "./auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import type { Session } from "next-auth";

type AppSession = Session & {
  user: {
    id: string;
    email: string;
    role: Role;
    fullName: string;
    avatarUrl?: string | null;
  }
};

export async function requireSession(): Promise<AppSession> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session as unknown as AppSession;
}

export async function requireRole(roles?: Role[]): Promise<AppSession> {
  const session = await requireSession();
  if (roles && roles.length > 0) {
    const role = session.user.role;
    if (!roles.includes(role)) {
      redirect("/403");
    }
  }
  return session;
}

export function roleHomePath(role: Role): string {
  switch (role) {
    case "STUDENT":
      return "/student/dashboard";
    case "ACADEMIC_SUPERVISOR":
    case "FIELD_SUPERVISOR":
      return "/supervisor/dashboard";
    case "ADMIN":
      return "/admin/users";
    default:
      return "/dashboard";
  }
}

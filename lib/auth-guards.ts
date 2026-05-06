import "server-only";
import { auth } from "./auth";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireSession();
  const role = (session.user as any).role;
  if (!roles.includes(role)) {
    throw new Error("Forbidden");
  }
  return session;
}

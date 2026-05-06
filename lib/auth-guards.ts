import "server-only";
import { auth } from "./auth";

import { Session } from "next-auth";

type AppSession = Session & {
  user: {
    id: string;
    email: string;
    role: string;
    fullName: string;
    avatarUrl?: string | null;
  }
};

export async function requireSession(): Promise<AppSession> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session as unknown as AppSession;
}

export async function requireRole(roles: string[]): Promise<AppSession> {
  const session = await requireSession();
  const role = session.user.role;
  if (!roles.includes(role)) {
    throw new Error("Forbidden");
  }
  return session;
}

import "next-auth";
import { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      fullName: string;
      avatarUrl?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
    fullName: string;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    fullName?: string;
  }
}

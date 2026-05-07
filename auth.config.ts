import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { Role } from "@prisma/client";

function roleHomePath(role: Role): string {
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

export const authConfig = {
  providers: [],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }: { auth: Session | null, request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isAuthRoute = ['/login', '/register', '/forgot-password', '/'].includes(nextUrl.pathname);

      if (isAuthRoute && isLoggedIn && auth?.user?.role) {
        return NextResponse.redirect(new URL(roleHomePath(auth.user.role), nextUrl));
      }

      if (!isLoggedIn && !isAuthRoute) {
        return NextResponse.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
};

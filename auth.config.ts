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
      const isAuthPage = ['/login', '/register', '/forgot-password'].includes(nextUrl.pathname);
      const isPublicPage = ['/'].includes(nextUrl.pathname);

      if (isAuthPage && isLoggedIn && auth?.user?.role) {
        return NextResponse.redirect(new URL(roleHomePath(auth.user.role), nextUrl));
      }

      if (isPublicPage && isLoggedIn && auth?.user?.role) {
        return NextResponse.redirect(new URL(roleHomePath(auth.user.role), nextUrl));
      }

      if (!isLoggedIn && !isAuthPage && !isPublicPage) {
        return NextResponse.redirect(new URL('/login', nextUrl));
      }

      return true;
    },
  },
};

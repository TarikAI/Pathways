import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    '/',
    '/student/:path*',
    '/supervisor/:path*',
    '/admin/:path*',
    '/messages/:path*',
    '/notifications/:path*',
    '/settings/:path*',
  ],
};

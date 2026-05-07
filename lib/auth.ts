import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import crypto from "crypto";

export const BCRYPT_COST = 12;

export async function hashPassword(password: string, cost: number = BCRYPT_COST): Promise<string> {
  return bcrypt.hash(password, cost);
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: {
      userId,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyResetToken(token: string): Promise<string | null> {
  const resetToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!resetToken || resetToken.expires < new Date()) {
    if (resetToken) {
      await db.passwordResetToken.delete({ where: { token } });
    }
    return null;
  }

  return resetToken.userId;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await db.user.findUnique({ where: { email } });
          if (!user) return null;
          
          const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              fullName: user.fullName,
              avatarUrl: user.avatarUrl,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id ?? "";
        session.user.role = (token.role ?? "STUDENT") as Role;
        session.user.fullName = token.fullName ?? "";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

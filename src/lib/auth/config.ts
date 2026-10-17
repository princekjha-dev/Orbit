import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDemoAccountByEmail } from "@/lib/auth/roles";
import { UserRole } from "@prisma/client";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    newUser: "/onboarding",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // 1. Check for demo accounts first (enables zero-config offline demo mode)
        const demoConfig = getDemoAccountByEmail(parsed.data.email);
        const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD || "OrbitDemo@2025!";

        if (demoConfig && parsed.data.password === demoPassword) {
          const prismaRole =
            demoConfig.role === "PLATFORM_ADMIN"
              ? UserRole.ADMIN
              : demoConfig.role === "FOUNDER"
              ? UserRole.FOUNDER
              : UserRole.STUDENT;

          // Attempt database lookup if reachable, but never block or fail offline mode
          try {
            const user = await Promise.race([
              prisma.user.findUnique({
                where: { email: parsed.data.email },
                select: {
                  id: true,
                  email: true,
                  name: true,
                  username: true,
                  role: true,
                  image: true,
                  isSuspended: true,
                },
              }),
              new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("DB timeout")), 1200)
              ),
            ]);
            if (user && !user.isSuspended) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                username: user.username,
                role: user.role,
                image: user.image,
                orbitRole: demoConfig.role,
              };
            }
          } catch {
            // DB is offline or timed out; continue with synthetic demo user
          }

          return {
            id: `demo-${demoConfig.role.toLowerCase()}`,
            email: demoConfig.email,
            name: demoConfig.name,
            username: demoConfig.username,
            role: prismaRole,
            image: null,
            orbitRole: demoConfig.role,
          };
        }

        // 2. Regular credentials authentication via DB
        try {
          const user = await Promise.race([
            prisma.user.findUnique({
              where: { email: parsed.data.email },
              select: {
                id: true,
                email: true,
                name: true,
                username: true,
                role: true,
                image: true,
                passwordHash: true,
                isSuspended: true,
              },
            }),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error("DB timeout")), 2000)
            ),
          ]);

          if (!user || !user.passwordHash || user.isSuspended) return null;

          const valid = await bcrypt.compare(
            parsed.data.password,
            user.passwordHash
          );
          if (!valid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            username: user.username,
            role: user.role,
            image: user.image,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.orbitRole = (user as any).orbitRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        (session.user as any).orbitRole = token.orbitRole as string;
      }
      return session;
    },
  },
});

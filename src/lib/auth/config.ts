import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
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
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
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
        const demoPassword = process.env.DEMO_ACCOUNT_PASSWORD || "OrbitDemo@2026!";
        const isPasswordValid =
          parsed.data.password === demoPassword ||
          parsed.data.password === "OrbitDemo@2026!" ||
          parsed.data.password === "OrbitDemo@2025!";

        if (demoConfig && isPasswordValid) {
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
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const email = user.email || profile?.email;
        if (!email) return false;

        try {
          // If DB is reachable, lookup or create user
          const existingUser = await Promise.race([
            prisma.user.findUnique({
              where: { email },
            }),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error("DB timeout")), 1200)
            ),
          ]);

          if (existingUser) {
            if (existingUser.isSuspended) return false;
            user.id = existingUser.id;
            (user as any).role = existingUser.role;
            (user as any).username = existingUser.username;

            // Check if profile exists and has headline/about
            try {
              const profile = await prisma.profile.findUnique({
                where: { userId: existingUser.id },
                select: { headline: true, about: true },
              });
              (user as any).onboardingCompleted = !!(profile?.headline || profile?.about);
            } catch {
              (user as any).onboardingCompleted = false;
            }

            return true;
          }

          const baseUsername = (email.split("@")[0] || "user")
            .replace(/[^a-zA-Z0-9_]/g, "")
            .slice(0, 15);
          const username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;

          const newUser = await Promise.race([
            prisma.user.create({
              data: {
                email,
                name: user.name || profile?.name || "Orbit Member",
                username,
                image: user.image || (profile as any)?.picture || null,
                role: UserRole.STUDENT,
              },
            }),
            new Promise<null>((_, reject) =>
              setTimeout(() => reject(new Error("DB timeout")), 1200)
            ),
          ]);

          if (newUser) {
            user.id = newUser.id;
            (user as any).role = newUser.role;
            (user as any).username = newUser.username;
            (user as any).onboardingCompleted = false;
          }
        } catch {
          // Development / offline resilience fallback
          user.id = `google-${email.replace(/[^a-zA-Z0-9]/g, "-")}`;
          (user as any).role = UserRole.STUDENT;
          (user as any).username = (email.split("@")[0] || "user").slice(0, 20);
          (user as any).onboardingCompleted = false;
        }
        return true;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.username =
          (user as any).username ||
          (user.email ? user.email.split("@")[0] : "user");
        token.role = (user as any).role || "STUDENT";
        token.orbitRole = (user as any).orbitRole || "STUDENT";
        token.onboardingCompleted =
          (user as any).onboardingCompleted ??
          (user.email?.toLowerCase().endsWith("@orbit.demo") || false);
      }
      if (trigger === "update" && session) {
        if (session.onboardingCompleted !== undefined) {
          token.onboardingCompleted = session.onboardingCompleted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.role = token.role as string;
        (session.user as any).orbitRole = token.orbitRole as string;
        (session.user as any).onboardingCompleted = token.onboardingCompleted ?? false;
      }
      return session;
    },
  },
});

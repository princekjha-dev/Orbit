import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { prisma, safeDbCall } from "@/lib/db";
import { inMemoryStore } from "@/lib/database/in-memory-store";
import { generateUsername } from "@/lib/utils";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  role: z.enum(["TALENT", "FOUNDER", "RECRUITER", "MENTOR"]),
  headline: z.string().trim().min(2, "Headline must be at least 2 characters").max(160),
  about: z.string().max(2000).optional().or(z.literal("")),
  location: z.string().max(100).optional().or(z.literal("")),
  skills: z.array(z.string()).max(30).default([]),
  interests: z.string().max(500).optional().or(z.literal("")),
  college: z.string().max(200).optional().or(z.literal("")),
  company: z.string().max(200).optional().or(z.literal("")),
  experienceLevel: z.string().max(100).optional().or(z.literal("")),
  collaborationPreference: z.string().max(100).optional().or(z.literal("")),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
  avatarUrl: z.string().optional().or(z.literal("")),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

/**
 * GET /api/onboarding
 * Checks authentication status and existing profile draft/state
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { authenticated: false, onboardingCompleted: false },
        { status: 401 }
      );
    }

    // Try loading existing profile if already saved in memory or DB
    const memoryProfile = inMemoryStore.userProfiles.get(user.id);

    return NextResponse.json({
      authenticated: true,
      onboardingCompleted: !!user.onboardingCompleted,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.orbitRole || user.role,
        image: user.image,
      },
      profile: user.profile || memoryProfile || null,
    });
  } catch (error) {
    console.error("[GET /api/onboarding]", error);
    return NextResponse.json(
      { error: "Failed to fetch onboarding state" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/onboarding
 * Validates, persists user details, role & profile, updates Supabase metadata,
 * and sets onboarding_completed = true.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Please sign in to complete onboarding." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body." },
        { status: 400 }
      );
    }

    const parsed = onboardingSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Validation failed";
      return NextResponse.json(
        { success: false, error: firstError, details: parsed.error.issues },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Map Orbit persona role to Prisma UserRole
    const prismaRole: UserRole =
      data.role === "FOUNDER"
        ? UserRole.FOUNDER
        : UserRole.STUDENT;

    // 1. Update Supabase Auth user metadata (RLS & auth session consistency)
    let supabaseSuccess = false;
    try {
      const supabase = await createServerSupabase();
      const { error: sbError } = await supabase.auth.updateUser({
        data: {
          name: data.name,
          role: prismaRole,
          orbitRole: data.role,
          headline: data.headline,
          onboarding_completed: true,
          onboarding_status: "COMPLETED",
          completed_at: new Date().toISOString(),
        },
      });

      if (!sbError) {
        supabaseSuccess = true;
      } else {
        console.warn("[Onboarding] Supabase updateUser warning:", sbError.message);
      }

      // 1b. Directly synchronize canonical public.profiles table in Supabase PostgreSQL
      try {
        await (supabase as any)
          .from("profiles")
          .upsert({
            id: user.id,
            email: user.email,
            full_name: data.name,
            role: data.role.toLowerCase(),
            headline: data.headline,
            bio: data.about || null,
            location: data.location || null,
            experience_level: data.experienceLevel || null,
            education: data.college || null,
            website_url: data.website || null,
            github_url: data.github || null,
            linkedin_url: data.linkedin || null,
            avatar_url: data.avatarUrl || null,
            onboarding_status: "completed",
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
          });
      } catch (profileErr) {
        console.warn("[Onboarding] Supabase profiles table sync note:", profileErr);
      }
    } catch (sbErr) {
      console.warn("[Onboarding] Supabase client error (proceeding with DB / in-memory fallback):", sbErr);
    }

    // 2. Persist in Database (User, Profile, Skills)
    try {
      await safeDbCall(async () => {
        // Upsert User
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            name: data.name,
            role: prismaRole,
            image: data.avatarUrl || undefined,
          },
          create: {
            id: user.id,
            email: user.email || `${user.id}@orbit.local`,
            name: data.name,
            username: generateUsername(data.name),
            role: prismaRole,
            image: data.avatarUrl || null,
          },
        });

        // Upsert Skills
        const skillRecords = await Promise.all(
          data.skills.map((skillName: string) =>
            prisma.skill.upsert({
              where: { name: skillName.trim() },
              update: {},
              create: { name: skillName.trim() },
            })
          )
        );

        // Upsert Profile
        await prisma.profile.upsert({
          where: { userId: user.id },
          update: {
            headline: data.headline,
            about: data.about || null,
            location: data.location || null,
            college: data.college || null,
            company: data.company || null,
            website: data.website || null,
            github: data.github || null,
            linkedin: data.linkedin || null,
            portfolio: data.portfolio || null,
            avatarUrl: data.avatarUrl || null,
            skillsLookingFor: data.interests || null,
            collaborationPreference: data.collaborationPreference || data.experienceLevel || null,
            skills: {
              deleteMany: {},
              create: skillRecords.map((s) => ({ skillId: s.id })),
            },
          },
          create: {
            userId: user.id,
            headline: data.headline,
            about: data.about || null,
            location: data.location || null,
            college: data.college || null,
            company: data.company || null,
            website: data.website || null,
            github: data.github || null,
            linkedin: data.linkedin || null,
            portfolio: data.portfolio || null,
            avatarUrl: data.avatarUrl || null,
            skillsLookingFor: data.interests || null,
            collaborationPreference: data.collaborationPreference || data.experienceLevel || null,
            skills: {
              create: skillRecords.map((s) => ({ skillId: s.id })),
            },
          },
        });
      }, null);
    } catch (dbErr) {
      console.warn("[Onboarding] Prisma database upsert warning:", dbErr);
    }

    // 3. Persist in memory store for zero-latency instant availability
    inMemoryStore.userProfiles.set(user.id, {
      userId: user.id,
      name: data.name,
      orbitRole: data.role,
      role: prismaRole,
      headline: data.headline,
      about: data.about,
      location: data.location,
      skills: data.skills,
      interests: data.interests,
      college: data.college,
      company: data.company,
      experienceLevel: data.experienceLevel,
      collaborationPreference: data.collaborationPreference,
      website: data.website,
      github: data.github,
      linkedin: data.linkedin,
      portfolio: data.portfolio,
      avatarUrl: data.avatarUrl,
      onboarding_completed: true,
      onboarding_status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully.",
      redirectUrl: "/home",
      user: {
        id: user.id,
        name: data.name,
        role: data.role,
      },
    });
  } catch (error: any) {
    console.error("[POST /api/onboarding error]", error);
    return NextResponse.json(
      {
        success: false,
        error: "We couldn't save your profile. Please try again.",
      },
      { status: 500 }
    );
  }
}

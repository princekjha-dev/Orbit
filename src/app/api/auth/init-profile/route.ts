import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db";
import { generateUsername } from "@/lib/utils";
import { z } from "zod";

const initProfileSchema = z.object({
  name: z.string().min(2).max(100),
  role: z.enum(["STUDENT", "FOUNDER"]).default("STUDENT"),
});

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authUser || !authUser.email) {
      return NextResponse.json(
        { error: "Unauthorized: Active Supabase session required" },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = initProfileSchema.safeParse(body);
    const name = parsed.success ? parsed.data.name : (authUser.user_metadata?.name || authUser.email.split("@")[0]);
    const role = parsed.success ? parsed.data.role : (authUser.user_metadata?.role || "STUDENT");

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ id: authUser.id }, { email: authUser.email }],
      },
    });

    if (existing) {
      return NextResponse.json({ success: true, user: existing });
    }

    // Generate unique username
    let username = generateUsername(name);
    let attempts = 0;
    while (attempts < 5) {
      const taken = await prisma.user.findUnique({ where: { username } });
      if (!taken) break;
      username = generateUsername(name);
      attempts++;
    }

    const user = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email,
        name,
        username,
        role: role as any,
        profile: {
          create: {},
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user }, { status: 201 });
  } catch (error) {
    console.error("POST /api/auth/init-profile error:", error);
    return NextResponse.json(
      { error: "Failed to initialize user profile" },
      { status: 500 }
    );
  }
}

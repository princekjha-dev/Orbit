import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db";
import { organizationSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = organizationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });

  // Generate unique slug
  let slug = slugify(parsed.data.name);
  const existing = await prisma.organization.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const org = await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      industry: parsed.data.industry,
      location: parsed.data.location,
      website: parsed.data.website || null,
      email: parsed.data.email || null,
      members: {
        create: { userId: session.user.id!, role: "OWNER" },
      },
    },
  });

  return NextResponse.json({ id: org.id, slug: org.slug }, { status: 201 });
}

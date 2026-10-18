import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { getPrivateDocumentSignedUrl } from "@/lib/supabase/storage";
import { inMemoryStore } from "@/lib/database/in-memory-store";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in required." } },
        { status: 401 }
      );
    }

    // 1. Check in-memory applications first
    let resumePath: string | null = null;
    let isApplicant = false;
    let isOrgMember = false;

    for (const [key, app] of inMemoryStore.applications.entries()) {
      if (app.id === id || key === id) {
        resumePath = (app as any).resumeUrl || (app as any).portfolioUrl || null;
        if (app.userId === user.id) isApplicant = true;
        // In local memory, allow recruiter/admin access
        isOrgMember = true;
        break;
      }
    }

    // 2. Check DB
    if (!resumePath) {
      const dbApp = await safeDbCall(
        () =>
          prisma.opportunityApplication.findUnique({
            where: { id },
            include: {
              opportunity: {
                include: {
                  organization: {
                    include: {
                      members: {
                        where: { userId: user.id! },
                        select: { role: true },
                      },
                    },
                  },
                },
              },
            },
          }),
        null
      );

      if (dbApp) {
        resumePath = dbApp.resumeUrl;
        isApplicant = dbApp.userId === user.id;
        const member = dbApp.opportunity.organization?.members?.[0];
        if (member && ["OWNER", "ADMIN"].includes(member.role)) {
          isOrgMember = true;
        }
      }
    }

    // Security check: Only applicant or authorized organization recruiters can access the resume
    if (!isApplicant && !isOrgMember && (user as any).role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You are not authorized to view this document." } },
        { status: 403 }
      );
    }

    if (!resumePath) {
      return NextResponse.json(
        { success: false, error: { code: "NO_RESUME", message: "No resume document found for this application." } },
        { status: 404 }
      );
    }

    // 3. Generate signed URL from Supabase Storage
    const { signedUrl, error } = await getPrivateDocumentSignedUrl(resumePath, 3600);

    if (error || !signedUrl) {
      // If Supabase Storage is local or simulated, return fallback path
      return NextResponse.json({
        success: true,
        signedUrl: resumePath.startsWith("http") ? resumePath : `/api/resumes/download?path=${encodeURIComponent(resumePath)}`,
        expiresIn: 3600,
      });
    }

    return NextResponse.json({
      success: true,
      signedUrl,
      expiresIn: 3600,
    });
  } catch (err: any) {
    console.error("[get resume-url error]", err);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: err?.message || "Failed to generate resume URL" } },
      { status: 500 }
    );
  }
}

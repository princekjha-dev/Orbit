import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/helpers";
import { prisma, safeDbCall } from "@/lib/db";
import { uploadPrivateDocument, STORAGE_BUCKETS } from "@/lib/supabase/storage";
import { inMemoryStore } from "@/lib/database/in-memory-store";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Sign in to upload a resume." } },
        { status: 401 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "NO_FILE", message: "No file was provided." } },
        { status: 400 }
      );
    }

    // 1. Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FILE_TOO_LARGE",
            message: `Resume file exceeds maximum size of 10MB (file is ${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
          },
        },
        { status: 400 }
      );
    }

    // 2. Validate MIME type & file extension
    const fileName = file.name.trim();
    const ext = fileName.split(".").pop()?.toLowerCase();
    const validExts = ["pdf", "doc", "docx"];

    if (!ALLOWED_MIME_TYPES.includes(file.type) && !validExts.includes(ext || "")) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_FILE_TYPE",
            message: "Unsupported file format. Please upload a PDF, DOC, or DOCX document.",
          },
        },
        { status: 400 }
      );
    }

    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const storagePath = `${user.id}/resumes/${timestamp}-${sanitizedName}`;

    // 3. Upload to Supabase Storage private-documents bucket
    let finalPath = storagePath;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadRes = await uploadPrivateDocument(buffer, storagePath, file.type || "application/pdf");
    if (!uploadRes.error && uploadRes.path) {
      finalPath = uploadRes.path;
    }

    // 4. Update Profile resumeUrl in DB and inMemoryStore if not already present
    safeDbCall(() =>
      prisma.profile.updateMany({
        where: { userId: user.id! },
        data: { resumeUrl: finalPath },
      })
    );

    // Save in inMemoryStore user profile if active
    const userProfile = inMemoryStore.userProfiles.get(user.id);
    if (userProfile) {
      userProfile.resumeUrl = finalPath;
      userProfile.resumeName = fileName;
    } else {
      inMemoryStore.userProfiles.set(user.id, {
        userId: user.id,
        resumeUrl: finalPath,
        resumeName: fileName,
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        path: finalPath,
        fileName,
        fileSize: file.size,
        mimeType: file.type || "application/pdf",
        uploadedAt: new Date().toISOString(),
        bucket: STORAGE_BUCKETS.PRIVATE_DOCUMENTS,
      },
    });
  } catch (error: any) {
    console.error("[resume upload error]", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "UPLOAD_FAILED", message: error?.message || "Failed to process resume upload." },
      },
      { status: 500 }
    );
  }
}

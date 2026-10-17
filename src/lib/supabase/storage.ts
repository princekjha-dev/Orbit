import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKETS = {
  PUBLIC_ASSETS: "public-assets",
  PRIVATE_DOCUMENTS: "private-documents",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface UploadResult {
  path: string;
  url?: string;
  error?: string;
}

/**
 * Uploads a public asset (profile avatar, organization logo, community cover).
 * Public assets are readable by anyone but can only be uploaded by authenticated owners.
 */
export async function uploadPublicAsset(
  file: File | Blob | Buffer,
  filePath: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PUBLIC_ASSETS)
      .upload(filePath, file, {
        contentType,
        upsert: true,
      });

    if (error) {
      return { path: filePath, error: error.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(STORAGE_BUCKETS.PUBLIC_ASSETS)
      .getPublicUrl(data.path);

    return { path: data.path, url: publicUrl };
  } catch (err: any) {
    return { path: filePath, error: err?.message || "Failed to upload public asset" };
  }
}

/**
 * Uploads a private document (resume, deliverable, verification evidence, portfolio artifact).
 * Private documents are NEVER publicly accessible and require authenticated signed URLs.
 */
export async function uploadPrivateDocument(
  file: File | Blob | Buffer,
  filePath: string,
  contentType?: string
): Promise<UploadResult> {
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PRIVATE_DOCUMENTS)
      .upload(filePath, file, {
        contentType,
        upsert: false,
      });

    if (error) {
      return { path: filePath, error: error.message };
    }

    return { path: data.path };
  } catch (err: any) {
    return { path: filePath, error: err?.message || "Failed to upload private document" };
  }
}

/**
 * Generates a time-limited signed URL for a private document.
 * Must only be called after verifying the requesting user's authorization to view the document.
 */
export async function getPrivateDocumentSignedUrl(
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<{ signedUrl?: string; error?: string }> {
  try {
    const supabase = await createServerSupabase();

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PRIVATE_DOCUMENTS)
      .createSignedUrl(filePath, expiresInSeconds);

    if (error) {
      return { error: error.message };
    }

    return { signedUrl: data.signedUrl };
  } catch (err: any) {
    return { error: err?.message || "Failed to generate signed URL" };
  }
}

/**
 * Deletes a file from either public or private storage.
 */
export async function deleteStorageFile(
  bucket: StorageBucket,
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete storage file" };
  }
}

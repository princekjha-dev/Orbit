import { fileTypeFromBuffer } from "file-type";

export interface FileValidationOptions {
  maxSizeBytes?: number;
  allowedExtensions?: string[];
  allowedMimeTypes?: string[];
}

export interface FileValidationResult {
  isValid: boolean;
  detectedExtension?: string;
  detectedMimeType?: string;
  fileSizeBytes: number;
  error?: string;
}

const DEFAULT_ALLOWED_EXTENSIONS = ["pdf", "png", "jpg", "jpeg", "webp", "zip", "txt", "md"];
const DEFAULT_ALLOWED_MIMES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/zip",
  "text/plain",
  "text/markdown",
];
const DEFAULT_MAX_SIZE = 15 * 1024 * 1024; // 15 MB

/**
 * Validates uploaded file buffers against magic-byte inspection, size limits,
 * and extension allowlists to prevent MIME-confusion and malicious uploads.
 */
export async function validateUploadedFile(
  buffer: Buffer | Uint8Array,
  filename: string,
  options: FileValidationOptions = {}
): Promise<FileValidationResult> {
  const maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE;
  const allowedExtensions = options.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;
  const allowedMimeTypes = options.allowedMimeTypes || DEFAULT_ALLOWED_MIMES;

  const fileSizeBytes = buffer.length;

  if (fileSizeBytes > maxSizeBytes) {
    return {
      isValid: false,
      fileSizeBytes,
      error: `File size exceeds the maximum allowed limit of ${Math.round(maxSizeBytes / (1024 * 1024))} MB`,
    };
  }

  // Check declared filename extension
  const extensionMatch = filename.split(".").pop()?.toLowerCase();
  if (!extensionMatch || !allowedExtensions.includes(extensionMatch)) {
    return {
      isValid: false,
      fileSizeBytes,
      error: `File extension .${extensionMatch || "unknown"} is not permitted`,
    };
  }

  // Plain text / markdown exception: does not have magic bytes header
  if (extensionMatch === "txt" || extensionMatch === "md") {
    // Scan for dangerous embedded script tags
    const textSample = Buffer.from(buffer.slice(0, 4096)).toString("utf-8");
    if (/<script[\s>]/i.test(textSample)) {
      return {
        isValid: false,
        fileSizeBytes,
        error: "Executable script tags are not allowed in uploaded text files",
      };
    }
    return {
      isValid: true,
      detectedExtension: extensionMatch,
      detectedMimeType: extensionMatch === "md" ? "text/markdown" : "text/plain",
      fileSizeBytes,
    };
  }

  // Inspect binary magic bytes
  const typeResult = await fileTypeFromBuffer(buffer);

  if (!typeResult) {
    return {
      isValid: false,
      fileSizeBytes,
      error: "Unable to identify valid binary signature for this file",
    };
  }

  if (!allowedMimeTypes.includes(typeResult.mime)) {
    return {
      isValid: false,
      detectedExtension: typeResult.ext,
      detectedMimeType: typeResult.mime,
      fileSizeBytes,
      error: `Detected file type ${typeResult.mime} is not permitted`,
    };
  }

  return {
    isValid: true,
    detectedExtension: typeResult.ext,
    detectedMimeType: typeResult.mime,
    fileSizeBytes,
  };
}

/**
 * Central Environment Validation Layer for Orbit
 *
 * Validates configuration at server execution and provides clean,
 * actionable diagnostics instead of cryptic 'undefined' or '500' errors.
 */

interface EnvConfig {
  // Supabase
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKey?: string;

  // App & Auth
  appUrl: string;
  appName: string;
  authSecret?: string;
  nextAuthUrl?: string;

  // OAuth
  googleClientId?: string;
  googleClientSecret?: string;
  isGoogleAuthEnabled: boolean;

  // AI Providers
  aiApiKey?: string;
  groqApiKey?: string;
  groqModel: string;
  isAiEnabled: boolean;

  // Storage
  storageProvider: "s3" | "local" | "supabase";
  awsRegion?: string;
  awsBucket?: string;

  // Email
  resendApiKey?: string;
  emailFrom: string;
  isEmailEnabled: boolean;
}

let cachedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (cachedEnv) return cachedEnv;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "[Config Error] Missing NEXT_PUBLIC_SUPABASE_URL. Please set this in .env or your production environment."
    );
  }

  if (!supabasePublishableKey) {
    throw new Error(
      "[Config Error] Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Please set this in .env or your production environment."
    );
  }

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const isGoogleAuthEnabled = Boolean(googleClientId && googleClientSecret);

  const aiApiKey = process.env.AI_API_KEY || process.env.GROQ_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  const isAiEnabled = Boolean(aiApiKey || groqApiKey);

  const resendApiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.EMAIL_FROM || "noreply@orbit.app";
  const isEmailEnabled = Boolean(resendApiKey);

  cachedEnv = {
    supabaseUrl,
    supabasePublishableKey,
    supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    appName: process.env.NEXT_PUBLIC_APP_NAME || "Orbit",
    authSecret: process.env.AUTH_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    googleClientId,
    googleClientSecret,
    isGoogleAuthEnabled,
    aiApiKey,
    groqApiKey,
    groqModel,
    isAiEnabled,
    storageProvider: (process.env.STORAGE_PROVIDER as any) || "local",
    awsRegion: process.env.AWS_REGION,
    awsBucket: process.env.AWS_S3_BUCKET,
    resendApiKey,
    emailFrom,
    isEmailEnabled,
  };

  return cachedEnv;
}

/**
 * Asserts that a specific optional service is configured before attempting execution.
 */
export function requireServiceConfig(
  service: "google" | "ai" | "email" | "storage"
): void {
  const env = getEnv();

  switch (service) {
    case "google":
      if (!env.isGoogleAuthEnabled) {
        throw new Error(
          "[Service Error] Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET."
        );
      }
      break;

    case "ai":
      if (!env.isAiEnabled) {
        throw new Error(
          "[Service Error] AI capabilities require GROQ_API_KEY or AI_API_KEY to be configured in .env."
        );
      }
      break;

    case "email":
      if (!env.isEmailEnabled) {
        throw new Error(
          "[Service Error] Email dispatch requires RESEND_API_KEY to be configured in .env."
        );
      }
      break;

    case "storage":
      if (env.storageProvider === "s3" && (!env.awsRegion || !env.awsBucket)) {
        throw new Error(
          "[Service Error] S3 storage requires AWS_REGION and AWS_S3_BUCKET to be configured."
        );
      }
      break;
  }
}

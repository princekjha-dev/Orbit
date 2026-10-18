import { auth } from "@/lib/auth/config";
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth/callback",
  "/privacy",
  "/terms",
  "/safety",
  "/verify",
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password"];

export async function middleware(request: NextRequest) {
  // Sync Supabase SSR session cookies
  const { response: supabaseResponse, user: supabaseUser } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Allow static assets, Next.js internals, and specific API endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/onboarding") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    return supabaseResponse;
  }

  // Check authentication across both NextAuth and Supabase SSR sessions
  const nextAuthSession = await auth();
  const isAuthenticated = !!nextAuthSession?.user || !!supabaseUser;

  // Determine onboarding completion status
  const userEmail = supabaseUser?.email || nextAuthSession?.user?.email;
  const isDemo = !!userEmail && userEmail.toLowerCase().endsWith("@orbit.demo");
  const isOnboardingComplete =
    isDemo ||
    supabaseUser?.user_metadata?.onboarding_completed === true ||
    (nextAuthSession?.user as any)?.onboardingCompleted === true;

  // 1. Auth routes (/login, /signup, /forgot-password)
  if (AUTH_ROUTES.includes(pathname)) {
    if (isAuthenticated) {
      if (isOnboardingComplete) {
        return NextResponse.redirect(new URL("/home", request.url));
      } else {
        return NextResponse.redirect(new URL("/onboarding", request.url));
      }
    }
    return supabaseResponse;
  }

  // 2. Public informational routes (/, /privacy, /terms, /safety, /verify, /auth/callback)
  if (PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"))) {
    return supabaseResponse;
  }

  // 3. Unauthenticated users trying to access protected routes
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Onboarding route protection (/onboarding)
  if (pathname === "/onboarding") {
    // If authenticated user has ALREADY completed onboarding, redirect them to /home
    if (isOnboardingComplete) {
      return NextResponse.redirect(new URL("/home", request.url));
    }
    // Incomplete authenticated user is allowed to access /onboarding
    return supabaseResponse;
  }

  // 5. Authenticated user with INCOMPLETE onboarding trying to access application routes
  if (!isOnboardingComplete) {
    if (pathname.startsWith("/api/")) {
      return supabaseResponse;
    }
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // 6. Admin route protection
  const isAdmin =
    (nextAuthSession?.user as any)?.role === "ADMIN" ||
    supabaseUser?.user_metadata?.role === "ADMIN" ||
    supabaseUser?.email === "demo.admin@orbit.demo";

  if (pathname.startsWith("/admin") && !isAdmin) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

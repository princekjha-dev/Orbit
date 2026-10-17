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

  // Allow public routes and static assets
  if (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.(png|jpg|jpeg|svg|ico|webp|css|js)$/)
  ) {
    // If authenticated user tries to visit login/signup/forgot-password, redirect to dashboard
    if (AUTH_ROUTES.includes(pathname)) {
      const nextAuthSession = await auth();
      if (nextAuthSession?.user || supabaseUser) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    return supabaseResponse;
  }

  // Check authentication across both NextAuth and Supabase SSR sessions
  const nextAuthSession = await auth();
  const isAuthenticated = !!nextAuthSession?.user || !!supabaseUser;

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin route protection
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

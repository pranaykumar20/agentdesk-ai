import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { AUTH_ROUTES } from "@/lib/auth/constants";
import { isLocalDemoMode } from "@/lib/auth/local-demo";

const publicExact = new Set([
  "/",
  "/pricing",
  "/features",
  "/industries",
  "/integrations",
  "/security",
  "/audit",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/auth/callback",
  "/api/health",
]);

function isPublicPath(pathname: string): boolean {
  if (publicExact.has(pathname)) return true;
  if (pathname.startsWith("/solutions")) return true;
  if (pathname.startsWith("/enquire/")) return true;
  if (pathname.startsWith("/sites/")) return true;
  if (pathname.startsWith("/sign-in")) return true;
  if (pathname.startsWith("/sign-up")) return true;
  if (pathname === "/embed.js") return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/api/public/")) return true;
  if (pathname.startsWith("/api/internal/")) return true;
  return false;
}

function isAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up")
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { configured } = getSupabaseEnv();

  // Redirect legacy Clerk routes
  if (pathname.startsWith("/sign-in")) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    return NextResponse.redirect(url);
  }
  if (pathname.startsWith("/sign-up")) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.signup;
    return NextResponse.redirect(url);
  }

  if (!configured) {
    // Local demo: browse marketing + dashboard with in-memory Smile Dental data (no Supabase).
    if (isLocalDemoMode()) {
      if (isAuthPath(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = AUTH_ROUTES.dashboard;
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!isPublicPath(pathname) && (pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding"))) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  if (!isPublicPath(pathname) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.login;
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = AUTH_ROUTES.dashboard;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

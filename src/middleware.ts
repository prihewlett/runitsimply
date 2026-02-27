import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("middleware");

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/invite", "/forgot-password", "/reset-password"];

// Check if Supabase is configured (not placeholder values)
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    key &&
    !url.includes("YOUR_PROJECT") &&
    url.startsWith("https://")
  );
}

export async function middleware(request: NextRequest) {
  // Skip auth checks if Supabase is not configured (local dev with sample data)
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the session (important for token refresh)
  const {
    data: { user },
    error: getUserError,
  } = await supabase.auth.getUser();

  if (getUserError) {
    log.error("middleware", "getUser() failed - may redirect to login incorrectly", {
      pathname: request.nextUrl.pathname, error: getUserError,
    });
  }

  const { pathname } = request.nextUrl;

  // If user is NOT authenticated and trying to access a protected route
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
    log.info("middleware", "unauthenticated user redirected to login", {
      pathname, hadGetUserError: !!getUserError,
    });
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // If user IS authenticated and trying to access auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashboardUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};

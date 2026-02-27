import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("auth-callback");

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // The `setAll` method is called from a Server Component.
              // This can be ignored if you have middleware refreshing sessions.
            }
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      log.error("GET", "failed to exchange code for session", {
        error: error.message,
        next,
      });
      // Redirect to forgot-password with error
      return NextResponse.redirect(
        new URL("/forgot-password?error=expired", request.url)
      );
    }

    log.info("GET", "auth code exchanged successfully", { next });

    // Redirect to the intended destination (e.g., /reset-password)
    return NextResponse.redirect(new URL(next, request.url));
  }

  log.warn("GET", "auth callback called without code parameter");

  // No code provided, redirect to login
  return NextResponse.redirect(new URL("/login", request.url));
}

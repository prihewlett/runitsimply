"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("auth-callback");

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";
    let done = false;

    function redirect(to: string) {
      if (done) return;
      done = true;
      clearTimeout(fallback);
      router.push(to);
    }

    // Listen for auth events first — catches hash-based token flows
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      log.info("onAuthStateChange", event);
      if (event === "PASSWORD_RECOVERY") {
        subscription.unsubscribe();
        redirect("/reset-password");
      } else if (event === "SIGNED_IN") {
        subscription.unsubscribe();
        redirect(next);
      }
    });

    // Exchange PKCE code if present — triggers SIGNED_IN above
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          log.error("exchangeCode", "failed", { error: error.message });
          subscription.unsubscribe();
          redirect("/forgot-password?error=expired");
        }
      });
    }

    // Fallback — if nothing fires in 5s, go to login
    const fallback = setTimeout(() => {
      log.warn("fallback", "no auth event fired, redirecting to login");
      subscription.unsubscribe();
      redirect("/login");
    }, 5000);

    return () => {
      clearTimeout(fallback);
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFBFD]">
      <p className="font-body text-sm text-gray-400">Loading...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FAFBFD]">
        <p className="font-body text-sm text-gray-400">Loading...</p>
      </div>
    }>
      <AuthCallbackInner />
    </Suspense>
  );
}

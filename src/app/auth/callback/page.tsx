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

    async function handleCallback() {
      // If there's a PKCE code, exchange it for a session
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          log.error("handleCallback", "code exchange failed", { error: error.message });
          router.push("/forgot-password?error=expired");
          return;
        }
        log.info("handleCallback", "code exchange successful", { next });
      }

      // Check the current session (covers both PKCE and hash-based token flows)
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        // No session yet — listen for Supabase to process hash tokens (implicit flow)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          subscription.unsubscribe();
          if (event === "PASSWORD_RECOVERY") {
            log.info("handleCallback", "PASSWORD_RECOVERY via hash tokens");
            router.push("/reset-password");
          } else if (event === "SIGNED_IN") {
            log.info("handleCallback", "SIGNED_IN via hash tokens", { next });
            router.push(next);
          } else {
            router.push("/login");
          }
        });

        // If nothing fires after 3s, redirect to login
        setTimeout(() => {
          subscription.unsubscribe();
          router.push("/login");
        }, 3000);
        return;
      }

      // Session exists — check if this is a password recovery session
      const isRecovery = next === "/reset-password" ||
        session.user?.recovery_sent_at != null;

      if (isRecovery || next === "/reset-password") {
        log.info("handleCallback", "recovery session detected — redirecting to reset-password");
        router.push("/reset-password");
      } else {
        log.info("handleCallback", "session established — redirecting", { next });
        router.push(next);
      }
    }

    handleCallback();
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

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("reset-password");

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  // Check that we have a valid session (from the auth callback)
  useEffect(() => {
    const supabase = createClient();

    async function checkSession() {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        log.error("checkSession", "failed to get session", {
          error: sessionError,
        });
        setError(t("auth.resetLinkInvalid"));
        return;
      }

      if (!session) {
        log.warn("checkSession", "no session found - invalid or expired reset link");
        setError(t("auth.resetLinkInvalid"));
        return;
      }

      log.debug("checkSession", "session valid for password reset", {
        userId: session.user.id,
      });
      setSessionReady(true);
    }

    checkSession();
  }, [t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError(t("auth.passwordsNoMatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("auth.passwordMinLength"));
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        log.warn("handleSubmit", "password update failed", {
          errorMessage: updateError.message,
        });
        setError(t("auth.resetError"));
        return;
      }

      log.info("handleSubmit", "password reset successful");
      setSuccess(true);

      // Redirect to dashboard after a moment
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (err) {
      log.error("handleSubmit", "unexpected exception during password update", {
        error: err instanceof Error ? err : String(err),
      });
      setError(t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-bold">
          {t("auth.resetSuccessTitle")}
        </h1>
        <div className="mb-4 rounded-[10px] bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          {t("auth.resetSuccessMessage")}
        </div>
        <p className="text-center font-body text-xs text-gray-400">
          {t("auth.redirectingToDashboard")}
        </p>
      </div>
    );
  }

  if (!sessionReady && !error) {
    return (
      <div className="py-8 text-center text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (error && !sessionReady) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-bold">{t("auth.resetPassword")}</h1>
        <div
          role="alert"
          className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
        >
          {error}
        </div>
        <p className="mt-4 text-center font-body text-xs text-gray-400">
          <Link
            href="/forgot-password"
            className="font-semibold text-blue-600 hover:underline"
          >
            {t("auth.requestNewLink")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">{t("auth.resetPassword")}</h1>
      <p className="mb-6 font-body text-sm text-gray-400">
        {t("auth.resetPasswordSubtitle")}
      </p>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="new-password"
            className="mb-1 block font-body text-[11px] font-semibold text-gray-500"
          >
            {t("auth.newPassword")}
          </label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="••••••••"
          />
          {password.length > 0 && password.length < 6 && (
            <p className="mt-1 font-body text-[10px] text-amber-600">
              {t("auth.passwordMinLength")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm-password"
            className="mb-1 block font-body text-[11px] font-semibold text-gray-500"
          >
            {t("auth.confirmPassword")}
          </label>
          <input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("auth.resettingPassword") : t("auth.resetPassword")}
        </button>
      </form>
    </div>
  );
}

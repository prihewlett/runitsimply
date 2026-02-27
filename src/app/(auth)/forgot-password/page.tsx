"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("forgot-password");

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Determine the redirect URL based on the current origin
      const redirectTo = `${window.location.origin}/auth/callback?next=/reset-password`;

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo }
      );

      if (resetError) {
        log.warn("handleSubmit", "password reset request failed", {
          email,
          errorMessage: resetError.message,
        });
        setError(t("auth.resetError"));
        return;
      }

      log.info("handleSubmit", "password reset email sent", { email });
      setSent(true);
    } catch (err) {
      log.error("handleSubmit", "unexpected exception during password reset request", {
        email,
        error: err instanceof Error ? err : String(err),
      });
      setError(t("auth.resetError"));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div>
        <h1 className="mb-1 text-xl font-bold">{t("auth.checkEmail")}</h1>
        <p className="mb-6 font-body text-sm text-gray-400">
          {t("auth.resetEmailSent")}
        </p>

        <div className="mb-4 rounded-[10px] bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          {t("auth.resetEmailSentDetail")}
        </div>

        <p className="mt-4 text-center font-body text-xs text-gray-400">
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            {t("auth.backToLogin")}
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">{t("auth.forgotPassword")}</h1>
      <p className="mb-6 font-body text-sm text-gray-400">
        {t("auth.forgotPasswordSubtitle")}
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
            htmlFor="reset-email"
            className="mb-1 block font-body text-[11px] font-semibold text-gray-500"
          >
            {t("auth.email")}
          </label>
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="you@example.com"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("auth.sendingReset") : t("auth.sendResetLink")}
        </button>
      </form>

      <p className="mt-4 text-center font-body text-xs text-gray-400">
        <Link
          href="/login"
          className="font-semibold text-blue-600 hover:underline"
        >
          {t("auth.backToLogin")}
        </Link>
      </p>
    </div>
  );
}

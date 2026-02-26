"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("signup-page");

export default function SignupPage() {
  const [businessName, setBusinessName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use server-side API to create business + user + profile
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, businessName, fullName }),
      });

      let data;
      try {
        data = await res.json();
      } catch (parseErr) {
        log.error("handleSubmit", "failed to parse signup API response", {
          status: res.status, error: parseErr instanceof Error ? parseErr : String(parseErr),
        });
        setError("Something went wrong. Please try again.");
        return;
      }

      if (!res.ok) {
        log.warn("handleSubmit", "signup API returned error", { status: res.status, apiError: data.error });
        setError(data.error || t("auth.signupError"));
        return;
      }

      // Account created! Redirect to login page with success message
      router.push("/login?registered=true");
    } catch (err) {
      log.error("handleSubmit", "unexpected exception during signup", {
        error: err instanceof Error ? err : String(err),
      });
      setError(t("auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">{t("auth.signup")}</h1>
      <p className="mb-6 font-body text-sm text-gray-400">
        {t("auth.signupSubtitle")}
      </p>

      {error && (
        <div role="alert" className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="signup-business" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.businessName")}
          </label>
          <input
            id="signup-business"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="My Cleaning Co."
          />
        </div>

        <div>
          <label htmlFor="signup-name" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.fullName")}
          </label>
          <input
            id="signup-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="signup-email" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.email")}
          </label>
          <input
            id="signup-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="signup-password" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.password")}
          </label>
          <input
            id="signup-password"
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

        <button
          type="submit"
          disabled={loading}
          className="w-full cursor-pointer rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? t("auth.signingUp") : t("auth.signUp")}
        </button>
      </form>

      <p className="mt-4 text-center font-body text-xs text-gray-400">
        {t("auth.hasAccount")}{" "}
        <Link href="/login" className="font-semibold text-blue-600 hover:underline">
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}

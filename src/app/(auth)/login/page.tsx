"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "true";
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(t("auth.loginError"));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("auth.loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">{t("auth.login")}</h1>
      <p className="mb-6 font-body text-sm text-gray-400">
        {t("auth.loginSubtitle")}
      </p>

      {justRegistered && (
        <div role="status" className="mb-4 rounded-[10px] bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          Account created successfully! Please sign in.
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="login-email" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.email")}
          </label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="login-password" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.password")}
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </button>
      </form>

      <p className="mt-4 text-center font-body text-xs text-gray-400">
        {t("auth.noAccount")}{" "}
        <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
          {t("auth.signUp")}
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center text-sm text-gray-400">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}

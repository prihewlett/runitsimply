"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useLanguage } from "@/lib/language-context";

function InviteForm() {
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();

  const businessId = searchParams.get("business_id");
  const employeeId = searchParams.get("employee_id");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!businessId || !employeeId || !email) {
      setInvalid(true);
    }
  }, [businessId, employeeId, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email: email!,
        password,
        options: {
          data: {
            full_name: fullName,
            invite_business_id: businessId,
            invite_employee_id: employeeId,
          },
        },
      });

      if (signUpError) {
        setError(t("auth.signupError"));
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError(t("auth.signupError"));
    } finally {
      setLoading(false);
    }
  };

  if (invalid) {
    return (
      <div className="text-center">
        <h1 className="mb-2 text-xl font-bold">{t("auth.inviteTitle")}</h1>
        <p className="font-body text-sm text-gray-400">
          {t("auth.inviteInvalid")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-1 text-xl font-bold">{t("auth.inviteTitle")}</h1>
      <p className="mb-6 font-body text-sm text-gray-400">
        {t("auth.inviteSubtitle")}
      </p>

      {email && (
        <div className="mb-4 rounded-[10px] bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-600">
          {email}
        </div>
      )}

      {error && (
        <div role="alert" className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invite-name" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.fullName")}
          </label>
          <input
            id="invite-name"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-sm outline-none transition-colors focus:border-blue-400"
            placeholder="Jane Doe"
          />
        </div>

        <div>
          <label htmlFor="invite-password" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("auth.password")}
          </label>
          <input
            id="invite-password"
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
          {loading ? "..." : t("auth.inviteAccept")}
        </button>
      </form>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="text-sm text-gray-400">Loading...</div>
        </div>
      }
    >
      <InviteForm />
    </Suspense>
  );
}

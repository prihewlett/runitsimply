"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckIcon, GiftIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/i18n";

const ALL_FEATURES: TranslationKey[] = [
  "pricing.scheduling",
  "pricing.clientDb",
  "pricing.messaging",
  "pricing.basicInvoicing",
  "pricing.unlimitedClients",
  "pricing.smsReminders",
];

export function Pricing() {
  const { t } = useLanguage();
  const [referralCode, setReferralCode] = useState("");
  const [codeApplied, setCodeApplied] = useState(false);

  // Check if a referral code was already used (persisted in localStorage)
  useEffect(() => {
    const used = localStorage.getItem("runitsimply-referral-used");
    if (used === "true") {
      setCodeApplied(true);
      const savedCode = localStorage.getItem("runitsimply-referral-code");
      if (savedCode) setReferralCode(savedCode);
    }
  }, []);

  const handleApplyCode = () => {
    if (!referralCode.trim() || codeApplied) return;
    setCodeApplied(true);
    localStorage.setItem("runitsimply-referral-used", "true");
    localStorage.setItem("runitsimply-referral-code", referralCode.trim());
  };

  return (
    <section id="pricing" className="bg-slate-50 px-10 py-[70px]">
      <div className="mx-auto max-w-[700px] text-center">
        <h2 className="mb-2.5 text-4xl font-extrabold tracking-tight">
          {t("pricing.title")}
        </h2>
        <p className="mb-10 font-body text-base text-gray-500">
          {t("pricing.subtitle")}
        </p>
        <div className="mx-auto max-w-sm">
          <div className="rounded-[18px] bg-gradient-to-br from-slate-800 to-blue-800 p-7 text-left text-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
            <div className="text-4xl font-extrabold">{t("pricing.freeTrial")}</div>
            <div className="mb-5 font-body text-xs text-white/50">
              {t("pricing.trialDuration")}
            </div>
            {ALL_FEATURES.map((key) => (
              <div
                key={key}
                className="mb-2 flex items-center gap-2 font-body text-sm text-white/80"
              >
                <span className="text-green-300">
                  <CheckIcon />
                </span>
                {t(key)}
              </div>
            ))}
            <Link
              href="/signup"
              className="mt-4 inline-flex w-full items-center justify-center rounded-[11px] bg-white px-5 py-2.5 text-sm font-semibold text-blue-800"
            >
              {t("pricing.startFreeTrial")}
            </Link>
          </div>
        </div>

        {/* Referral code input */}
        <div className="mt-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-purple-500">
              <GiftIcon size={16} />
            </span>
            <span className="font-body text-sm text-gray-500">
              {t("pricing.haveReferralCode")}
            </span>
          </div>
          <div className="flex w-full max-w-xs items-center gap-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => !codeApplied && setReferralCode(e.target.value.toUpperCase())}
              placeholder={t("pricing.enterCode")}
              disabled={codeApplied}
              className="flex-1 rounded-[10px] border border-[#F0F2F5] bg-white px-4 py-2.5 font-body text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-purple-300 disabled:opacity-60"
            />
            <button
              onClick={handleApplyCode}
              disabled={!referralCode.trim() || codeApplied}
              className="cursor-pointer rounded-[10px] bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("pricing.applyCode")}
            </button>
          </div>
          {codeApplied && (
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-green-500">
                <CheckIcon />
              </span>
              <span className="font-body text-sm font-medium text-green-600">
                {t("pricing.codeApplied")}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

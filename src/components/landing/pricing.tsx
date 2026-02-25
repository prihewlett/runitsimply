"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CheckIcon, GiftIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/i18n";

const STARTER_KEYS: TranslationKey[] = [
  "pricing.scheduling",
  "pricing.team3",
  "pricing.clientDb",
  "pricing.basicInvoicing",
  "pricing.messaging",
];

const PRO_KEYS: TranslationKey[] = [
  "pricing.everythingStarter",
  "pricing.unlimitedClients",
  "pricing.venmoZelle",
  "pricing.stripeAuto",
  "pricing.smsReminders",
  "pricing.gpsVerification",
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
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-2">
          {/* Starter */}
          <div className="rounded-[18px] border border-[#F0F2F5] bg-white p-7 text-left shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="font-body text-sm font-semibold text-gray-500">
              {t("pricing.starter")}
            </div>
            <div className="text-4xl font-extrabold">{t("pricing.freeTrial")}</div>
            <div className="mb-5 font-body text-xs text-gray-400">
              {t("pricing.trialDuration")}
            </div>
            {STARTER_KEYS.map((key) => (
              <div
                key={key}
                className="mb-2 flex items-center gap-2 font-body text-sm text-gray-500"
              >
                <span className="text-emerald-600">
                  <CheckIcon />
                </span>
                {t(key)}
              </div>
            ))}
            <button className="mt-4 inline-flex w-full cursor-pointer items-center justify-center rounded-[11px] border-[1.5px] border-[#F0F2F5] bg-[#FAFBFD] px-5 py-2.5 text-sm font-semibold text-gray-500">
              {t("pricing.startFreeTrial")}
            </button>
          </div>

          {/* Pro */}
          <div className="relative rounded-[18px] bg-gradient-to-br from-slate-800 to-blue-800 p-7 text-left text-white shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
            <div className="absolute right-3.5 top-3.5 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-bold">
              {t("pricing.popular")}
            </div>
            <div className="font-body text-sm font-semibold text-white/60">
              {t("pricing.pro")}
            </div>
            <div className="text-4xl font-extrabold">
              $24.99
              <span className="text-[15px] font-medium opacity-60">
                {t("pricing.perMonth")}
              </span>
            </div>
            <div className="mb-5 font-body text-xs text-white/50">
              {t("pricing.unlimited")}
            </div>
            {PRO_KEYS.map((key) => (
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
              href="/dashboard"
              className="mt-4 inline-flex w-full items-center justify-center rounded-[11px] bg-white px-5 py-2.5 text-sm font-semibold text-blue-800"
            >
              {t("pricing.signUp")}
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

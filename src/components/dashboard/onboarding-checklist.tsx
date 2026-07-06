"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useSettings } from "@/lib/settings-context";
import { CheckIcon } from "@/components/icons";

const DISMISS_KEY = "runitsimply-onboarding-dismissed";

export function OnboardingChecklist() {
  const { t } = useLanguage();
  const { clients, jobs, employees, loading } = useData();
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  if (loading || dismissed) return null;

  const steps = [
    {
      id: "client",
      title: t("onboarding.step1Title"),
      desc: t("onboarding.step1Desc"),
      href: "/clients",
      done: clients.length > 0,
    },
    {
      id: "job",
      title: t("onboarding.step2Title"),
      desc: t("onboarding.step2Desc"),
      href: "/schedule",
      done: jobs.length > 0,
    },
    {
      id: "payment",
      title: t("onboarding.step3Title"),
      desc: t("onboarding.step3Desc"),
      href: "/settings",
      done: !!(settings.venmoHandle || settings.zelleEmail),
    },
    {
      id: "team",
      title: t("onboarding.step4Title"),
      desc: t("onboarding.step4Desc"),
      href: "/team",
      done: employees.length > 0,
      optional: true,
    },
  ];

  const required = steps.filter((s) => !s.optional);
  // All required steps finished — nothing left to guide, hide entirely
  if (required.every((s) => s.done)) return null;

  const doneCount = steps.filter((s) => s.done).length;

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <div className="mb-5 rounded-[14px] border border-blue-100 bg-gradient-to-br from-blue-50/60 to-purple-50/60 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-1 flex items-start justify-between">
        <div>
          <div className="text-base font-extrabold">{t("onboarding.welcome")}</div>
          <div className="font-body text-xs text-gray-500">
            {t("onboarding.subtitle")}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="cursor-pointer whitespace-nowrap font-body text-[11px] font-semibold text-gray-400 hover:text-gray-600 hover:underline"
        >
          {t("onboarding.hide")}
        </button>
      </div>

      <div className="mb-3 font-body text-[11px] font-semibold text-blue-600">
        {t("onboarding.progress", { done: doneCount, total: steps.length })}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 rounded-[10px] border p-3 ${
              step.done
                ? "border-emerald-100 bg-emerald-50/60"
                : "border-[#F0F2F5] bg-white"
            }`}
          >
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                step.done
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {step.done ? <CheckIcon size={16} /> : i + 1}
            </div>
            <div className="min-w-0 flex-1">
              <div className={`text-xs font-semibold ${step.done ? "text-emerald-700" : ""}`}>
                {step.title}
              </div>
              <div className="truncate font-body text-[11px] text-gray-400">
                {step.desc}
              </div>
            </div>
            {step.done ? (
              <span className="whitespace-nowrap font-body text-[11px] font-semibold text-emerald-600">
                {t("onboarding.done")}
              </span>
            ) : (
              <Link
                href={step.href}
                className="whitespace-nowrap rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-bold text-white transition-colors hover:bg-blue-700"
              >
                {t("onboarding.go")} →
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

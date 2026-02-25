"use client";

import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";

export function TrialBanner() {
  const { isReadOnly, daysLeftInTrial, subscriptionStatus } = useSettings();
  const { t } = useLanguage();

  if (subscriptionStatus === "active") return null;

  if (isReadOnly) {
    return (
      <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-bold text-red-700">{t("trial.expired")}</span>{" "}
            <span className="text-red-600">{t("trial.expiredDesc")}</span>
          </div>
          <button className="shrink-0 cursor-pointer rounded-[10px] bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
            {t("trial.upgradeNow")}
          </button>
        </div>
      </div>
    );
  }

  if (subscriptionStatus === "trial" && daysLeftInTrial > 0) {
    return (
      <div className="mb-4 rounded-[12px] border border-amber-200 bg-amber-50 px-5 py-3 text-sm">
        <div className="flex items-center justify-between gap-4">
          <span className="font-semibold text-amber-700">
            {t("trial.daysLeft", { count: daysLeftInTrial })}
          </span>
          <button className="shrink-0 cursor-pointer rounded-[10px] bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700">
            {t("trial.subscribeNow")}
          </button>
        </div>
      </div>
    );
  }

  return null;
}

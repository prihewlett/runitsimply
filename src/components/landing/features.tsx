"use client";

import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  HomeIcon,
  DollarIcon,
  MessageIcon,
} from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/i18n";

const FEATURES: { icon: React.ReactNode; titleKey: TranslationKey; descKey: TranslationKey; color: string }[] = [
  {
    icon: <CalendarIcon />,
    titleKey: "features.smartScheduling",
    descKey: "features.smartSchedulingDesc",
    color: "#2563EB",
  },
  {
    icon: <ClockIcon />,
    titleKey: "features.timeTracking",
    descKey: "features.timeTrackingDesc",
    color: "#059669",
  },
  {
    icon: <UserIcon />,
    titleKey: "features.teamManagement",
    descKey: "features.teamManagementDesc",
    color: "#7C3AED",
  },
  {
    icon: <HomeIcon />,
    titleKey: "features.clientDatabase",
    descKey: "features.clientDatabaseDesc",
    color: "#D97706",
  },
  {
    icon: <DollarIcon />,
    titleKey: "features.payments",
    descKey: "features.paymentsDesc",
    color: "#DC2626",
  },
  {
    icon: <MessageIcon />,
    titleKey: "features.communication",
    descKey: "features.communicationDesc",
    color: "#0EA5E9",
  },
];

export function Features() {
  const { t } = useLanguage();

  return (
    <section id="features" className="mx-auto max-w-[1060px] px-10 py-[70px]">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-extrabold tracking-tight">
          {t("features.title1")}
        </h2>
        <h2 className="text-4xl font-extrabold tracking-tight text-gray-400">
          {t("features.title2")}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feat) => (
          <div
            key={feat.titleKey}
            className="hover-lift cursor-default rounded-2xl border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div
              className="mb-3.5 flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: feat.color + "10", color: feat.color }}
            >
              {feat.icon}
            </div>
            <h3 className="mb-1.5 text-[15px] font-bold">{t(feat.titleKey)}</h3>
            <p className="font-body text-sm leading-relaxed text-gray-500">
              {t(feat.descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

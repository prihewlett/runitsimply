"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { BUSINESS_TYPES } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/i18n";

export function Hero() {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden pb-16 pt-32 text-center">
      {/* Decorative gradient */}
      <div className="pointer-events-none absolute left-[10%] top-12 h-[350px] w-[350px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06)_0%,transparent_70%)]" />

      {/* NEW badge */}
      <div className="animate-fade-up mb-5 inline-flex items-center gap-2 rounded-full border border-blue-600/10 bg-gradient-to-br from-blue-50 to-purple-50 py-1 pl-2 pr-4">
        <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white">
          {t("hero.badge")}
        </span>
        <span className="font-body text-xs font-medium text-gray-500">
          {t("hero.badgeText")}
        </span>
      </div>

      {/* Headline — increased from clamp(38px,6vw,62px) to clamp(48px,8vw,80px) */}
      <h1 className="animate-fade-up-1 mx-auto mb-5 max-w-[850px] text-[clamp(48px,8vw,80px)] font-black leading-[1.05] tracking-tighter">
        {t("hero.headline1")}
        <br />
        <span className="gradient-text">{t("hero.headline2")}</span>
      </h1>

      {/* Subtitle */}
      <p className="animate-fade-up-2 mx-auto mb-8 max-w-[480px] font-body text-[17px] leading-relaxed text-gray-500">
        {t("hero.subtitle")}
      </p>

      {/* CTAs */}
      <div className="animate-fade-up-3 mb-12 flex justify-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 rounded-[13px] bg-gradient-to-br from-blue-600 to-blue-700 px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
        >
          {t("hero.cta")} <ArrowRightIcon size={16} />
        </Link>
        <Link
          href="/signup"
          className="inline-flex items-center rounded-[13px] border-[1.5px] border-[#F0F2F5] bg-[#FAFBFD] px-7 py-3.5 text-[15px] font-semibold text-gray-500"
        >
          {t("hero.ctaSecondary")}
        </Link>
      </div>

      {/* Business type pills */}
      <div className="animate-fade-up-4 mx-auto flex max-w-[660px] flex-wrap justify-center gap-2.5">
        {BUSINESS_TYPES.map((bt) => (
          <div
            key={bt.id}
            onMouseEnter={() => setHoveredType(bt.id)}
            onMouseLeave={() => setHoveredType(null)}
            className="inline-flex cursor-default items-center gap-2 rounded-full px-3.5 py-[7px] font-body text-xs font-semibold transition-all"
            style={{
              background:
                hoveredType === bt.id ? bt.color + "14" : "white",
              border: `1.5px solid ${
                hoveredType === bt.id ? bt.color + "40" : "#F0F2F5"
              }`,
            }}
          >
            <span className="text-[15px]">{bt.emoji}</span>
            {t(`businessType.${bt.id}` as TranslationKey)}
          </div>
        ))}
      </div>
    </section>
  );
}

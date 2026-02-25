"use client";

import { BUSINESS_TYPES } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import type { TranslationKey } from "@/lib/i18n";

export function Industries() {
  const { t } = useLanguage();

  return (
    <section id="industries" className="bg-slate-50 px-10 py-[70px]">
      <div className="mx-auto max-w-[1060px]">
        <div className="mb-10 text-center">
          <h2 className="mb-2.5 text-4xl font-extrabold tracking-tight">
            {t("industries.title")}
          </h2>
          <p className="font-body text-base text-gray-500">
            {t("industries.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
          {BUSINESS_TYPES.map((bt) => (
            <div
              key={bt.id}
              className="hover-lift cursor-default rounded-[14px] border border-[#F0F2F5] bg-white px-5 py-6 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
            >
              <div className="mb-2.5 text-[32px]">{bt.emoji}</div>
              <div className="text-sm font-bold">
                {t(`businessType.${bt.id}` as TranslationKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

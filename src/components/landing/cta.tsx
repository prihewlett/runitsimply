"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";

export function Cta() {
  const { t } = useLanguage();

  return (
    <section className="px-10 py-[70px] text-center">
      <h2 className="mb-2.5 text-[32px] font-extrabold tracking-tight">
        {t("cta.title")}
      </h2>
      <p className="mb-7 font-body text-base text-gray-500">
        {t("cta.subtitle")}
      </p>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 rounded-[14px] bg-gradient-to-br from-blue-600 to-blue-700 px-9 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
      >
        {t("cta.button")} <ArrowRightIcon size={16} />
      </Link>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import { LanguageToggle } from "@/components/ui/language-toggle";

export function Navbar() {
  const { t } = useLanguage();

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-black/[0.04] bg-[#FAFBFD]/[0.88] px-10 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-extrabold text-white">
          R
        </div>
        <span className="text-lg font-extrabold tracking-tight">
          RunItSimply
        </span>
      </div>
      <div className="flex items-center gap-7">
        <a
          href="#features"
          className="hidden font-body text-sm font-medium text-gray-500 hover:text-gray-900 sm:block"
        >
          {t("nav.features")}
        </a>
        <a
          href="#industries"
          className="hidden font-body text-sm font-medium text-gray-500 hover:text-gray-900 sm:block"
        >
          {t("nav.industries")}
        </a>
        <a
          href="#pricing"
          className="hidden font-body text-sm font-medium text-gray-500 hover:text-gray-900 sm:block"
        >
          {t("nav.pricing")}
        </a>
        <LanguageToggle />
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-[11px] bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
        >
          {t("nav.openDashboard")} <ArrowRightIcon size={16} />
        </Link>
      </div>
    </nav>
  );
}

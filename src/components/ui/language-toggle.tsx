"use client";

import { useLanguage } from "@/lib/language-context";

export function LanguageToggle({ compact }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center rounded-full border border-[#F0F2F5] bg-[#FAFBFD] ${
        compact ? "gap-0 p-0.5 text-[10px]" : "gap-0 p-0.5 text-xs"
      }`}
    >
      <button
        onClick={() => setLanguage("en")}
        className={`cursor-pointer rounded-full font-semibold transition-all ${
          compact ? "px-2 py-0.5" : "px-2.5 py-1"
        } ${
          language === "en"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage("es")}
        className={`cursor-pointer rounded-full font-semibold transition-all ${
          compact ? "px-2 py-0.5" : "px-2.5 py-1"
        } ${
          language === "es"
            ? "bg-white text-blue-600 shadow-sm"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        ES
      </button>
    </div>
  );
}

"use client";

import { LanguageToggle } from "@/components/ui/language-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FAFBFD] p-4">
      {/* Logo */}
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg font-extrabold text-white">
          R
        </div>
        <div>
          <div className="text-xl font-extrabold tracking-tight">
            RunItSimply
          </div>
          <div className="text-[11px] font-medium text-gray-400">
            Business Manager
          </div>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-sm rounded-[16px] border border-[#F0F2F5] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        {children}
      </div>

      {/* Language toggle */}
      <div className="mt-6">
        <LanguageToggle compact />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { TrialBanner } from "@/components/ui/trial-banner";
import { GearIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";

const OWNER_ONLY_ROUTES = ["/clients", "/payments", "/expenses", "/reports", "/settings"];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isOwner } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Route guard: redirect employees away from owner-only pages
  useEffect(() => {
    if (!isOwner && OWNER_ONLY_ROUTES.includes(pathname)) {
      router.replace("/dashboard");
    }
  }, [isOwner, pathname, router]);

  // Don't render owner-only content while redirecting
  if (!isOwner && OWNER_ONLY_ROUTES.includes(pathname)) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 p-4 md:ml-[220px] md:p-8">
        {/* Mobile header with hamburger */}
        <div className="mb-2 flex items-center justify-between md:justify-end">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50 md:hidden"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
          {isOwner && (
            <Link
              href="/settings"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t("settings.settingsTitle")}
            >
              <GearIcon size={20} />
            </Link>
          )}
        </div>
        <TrialBanner />
        {children}
      </main>
    </div>
  );
}

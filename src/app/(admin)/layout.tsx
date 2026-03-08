"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardIcon, HomeIcon, ArrowRightIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

const ADMIN_NAV = [
  { id: "dashboard", label: "Dashboard", href: "/admin", icon: <DashboardIcon /> },
  { id: "businesses", label: "Businesses", href: "/admin/businesses", icon: <HomeIcon /> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userEmail = user?.email || "";

  const handleSignOut = async () => {
    // Server-side signout clears httpOnly cookies that browser JS can't touch
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/login";
  };

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Admin sidebar */}
      <nav
        aria-label="Admin navigation"
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[220px] flex-col border-r border-[#F0F2F5] bg-white shadow-[1px_0_6px_rgba(0,0,0,0.02)] transition-transform duration-200 md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="border-b border-[#F0F2F5] px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-orange-500 text-sm font-extrabold text-white">
              A
            </div>
            <div>
              <div className="text-base font-extrabold tracking-tight">
                RunItSimply
              </div>
              <div className="text-[10px] font-medium text-gray-400">
                Admin Panel
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="flex-1 px-2.5 py-3.5">
          {ADMIN_NAV.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`mb-0.5 flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm transition-all ${
                  isActive
                    ? "bg-red-50 font-bold text-red-600"
                    : "font-medium text-gray-500 hover:bg-gray-50"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Bottom section */}
        <div className="space-y-2.5 border-t border-[#F0F2F5] px-3 py-3.5">
          <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-[10px] font-bold text-white">
                {userEmail.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">Admin</div>
                <div className="truncate font-body text-[10px] text-gray-400">
                  {userEmail}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full cursor-pointer rounded-lg border border-[#F0F2F5] bg-white px-2 py-1.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-blue-50 to-purple-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:from-blue-100 hover:to-purple-100"
          >
            <ArrowRightIcon size={14} />
            Back to App
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 md:ml-[220px] md:p-8">
        {/* Mobile header with hamburger */}
        <div className="mb-2 flex items-center justify-between md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
            aria-label="Open menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        </div>
        {children}
      </main>
    </div>
  );
}

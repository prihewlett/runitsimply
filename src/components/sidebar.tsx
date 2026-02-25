"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useData } from "@/lib/data-context";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  DashboardIcon,
  CalendarIcon,
  UserIcon,
  HomeIcon,
  MessageIcon,
  DollarIcon,
  ReceiptIcon,
  FileTextIcon,
  GearIcon,
  ArrowRightIcon,
} from "@/components/icons";
import type { TranslationKey } from "@/lib/i18n";

const NAV_ITEMS: {
  id: string;
  icon: React.ReactNode;
  labelKey: TranslationKey;
  href: string;
  ownerOnly?: boolean;
}[] = [
  { id: "dashboard", icon: <DashboardIcon />, labelKey: "sidebar.dashboard", href: "/dashboard" },
  { id: "schedule", icon: <CalendarIcon />, labelKey: "sidebar.schedule", href: "/schedule" },
  { id: "team", icon: <UserIcon />, labelKey: "sidebar.team", href: "/team" },
  { id: "clients", icon: <HomeIcon />, labelKey: "sidebar.clients", href: "/clients", ownerOnly: true },
  { id: "messages", icon: <MessageIcon />, labelKey: "sidebar.messages", href: "/messages" },
  { id: "payments", icon: <DollarIcon />, labelKey: "sidebar.payments", href: "/payments", ownerOnly: true },
  { id: "expenses", icon: <ReceiptIcon />, labelKey: "sidebar.expenses", href: "/expenses", ownerOnly: true },
  { id: "reports", icon: <FileTextIcon />, labelKey: "sidebar.reports", href: "/reports", ownerOnly: true },
  { id: "settings", icon: <GearIcon />, labelKey: "sidebar.settings", href: "/settings", ownerOnly: true },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { role, setRole, currentEmployeeId, setCurrentEmployeeId, isOwner, user, profile, signOut } = useAuth();
  const { employees } = useData();

  const isUsingSupabaseAuth = !!user;

  const visibleItems = isOwner
    ? NAV_ITEMS
    : NAV_ITEMS.filter((i) => !i.ownerOnly);

  const handleNavClick = () => {
    // Close sidebar on mobile when a nav link is clicked
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <nav
        aria-label="Main navigation"
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[220px] flex-col border-r border-[#F0F2F5] bg-white shadow-[1px_0_6px_rgba(0,0,0,0.02)] transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      {/* Logo */}
      <div className="border-b border-[#F0F2F5] px-5 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-extrabold text-white">
            R
          </div>
          <div>
            <div className="text-base font-extrabold tracking-tight">
              RunItSimply
            </div>
            <div className="text-[10px] font-medium text-gray-400">
              {t("sidebar.businessManager")}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 px-2.5 py-3.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={handleNavClick}
              aria-current={isActive ? "page" : undefined}
              className={`mb-0.5 flex items-center gap-2.5 rounded-[9px] px-3 py-2.5 text-sm transition-all ${
                isActive
                  ? "bg-blue-50 font-bold text-blue-600"
                  : "font-medium text-gray-500 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </div>

      {/* Bottom section */}
      <div className="space-y-2.5 border-t border-[#F0F2F5] px-3 py-3.5">
        {/* When using Supabase auth: show user info + sign out */}
        {isUsingSupabaseAuth ? (
          <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-2.5">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-[10px] font-bold text-white">
                {(profile?.fullName || user?.email || "U")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">
                  {profile?.fullName || "User"}
                </div>
                <div className="truncate font-body text-[10px] text-gray-400">
                  {user?.email}
                </div>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="w-full cursor-pointer rounded-lg border border-[#F0F2F5] bg-white px-2 py-1.5 text-[10px] font-semibold text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              {t("auth.signOut")}
            </button>
          </div>
        ) : (
          /* Fallback: role switcher (local dev without Supabase) */
          <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-2.5">
            <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
              {t("auth.switchRole")}
            </div>
            <div className="flex overflow-hidden rounded-lg border border-[#F0F2F5]">
              <button
                onClick={() => setRole("owner")}
                aria-pressed={role === "owner"}
                className={`flex-1 cursor-pointer px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                  role === "owner"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("auth.owner")}
              </button>
              <button
                onClick={() => {
                  setRole("employee");
                  // Auto-select first employee if none selected
                  if (!currentEmployeeId && employees.length > 0) {
                    setCurrentEmployeeId(employees[0].id);
                  }
                }}
                aria-pressed={role === "employee"}
                className={`flex-1 cursor-pointer border-l border-[#F0F2F5] px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                  role === "employee"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {t("auth.employee")}
              </button>
            </div>

            {/* Employee picker (only visible in employee mode) */}
            {role === "employee" && (
              <div className="mt-2">
                <div className="mb-1 text-[9px] font-semibold text-gray-400">
                  {t("auth.viewingAs")}
                </div>
                <select
                  value={currentEmployeeId ?? ""}
                  onChange={(e) => setCurrentEmployeeId(e.target.value || null)}
                  aria-label={t("auth.viewingAs")}
                  className="w-full rounded-md border border-[#F0F2F5] bg-white px-2 py-1.5 text-[11px] font-semibold outline-none focus:border-blue-400"
                >
                  <option value="" disabled>
                    {t("auth.selectEmployee")}
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-center">
          <LanguageToggle compact />
        </div>
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-[10px] bg-gradient-to-br from-blue-50 to-purple-50 px-3 py-2 text-xs font-semibold text-blue-600 transition-colors hover:from-blue-100 hover:to-purple-100"
        >
          <ArrowRightIcon size={14} />
          {t("sidebar.homepage")}
        </Link>
      </div>
    </nav>
    </>
  );
}

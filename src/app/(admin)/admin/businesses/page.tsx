"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { SearchIcon } from "@/components/icons";

type StatusFilter = "all" | "active" | "trial" | "expired" | "cancelled";

interface BusinessRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  createdAt: string;
  referralCode: string;
  referralsCount: number;
  referralCredit: number;
  clientCount: number;
  employeeCount: number;
  jobCount: number;
}

const STATUS_TABS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "trial", label: "Trial" },
  { id: "expired", label: "Expired" },
  { id: "cancelled", label: "Cancelled" },
];

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  active: { bg: "#ECFDF5", color: "#059669" },
  trial: { bg: "#EFF6FF", color: "#2563EB" },
  expired: { bg: "#FEF2F2", color: "#DC2626" },
  cancelled: { bg: "#FFF7ED", color: "#EA580C" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.trial;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
      style={{ background: s.bg, color: s.color }}
    >
      {status}
    </span>
  );
}

export default function BusinessListPage() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchBusinesses = (searchTerm: string, status: StatusFilter) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (status !== "all") params.set("status", status);

    fetch(`/api/admin/businesses?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setBusinesses(data.businesses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Initial fetch
  useEffect(() => {
    fetchBusinesses("", "all");
  }, []);

  // Debounced search
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchBusinesses(value, statusFilter);
    }, 300);
  };

  const handleStatusChange = (status: StatusFilter) => {
    setStatusFilter(status);
    fetchBusinesses(search, status);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div>
      <PageHeader title="Businesses" subtitle="All businesses on the platform" />

      {/* Search + filter */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-[10px] border border-[#F0F2F5] bg-white py-2.5 pl-9 pr-4 font-body text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-blue-300 sm:w-[280px]"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleStatusChange(tab.id)}
              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                statusFilter === tab.id
                  ? "bg-red-50 text-red-600"
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto rounded-[14px] border border-[#F0F2F5] bg-white">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F0F2F5] bg-[#FAFBFD]">
              <th className="px-4 py-3 text-[11px] font-semibold uppercase text-gray-500">
                Business
              </th>
              <th className="px-4 py-3 text-[11px] font-semibold uppercase text-gray-500">
                Status
              </th>
              <th className="hidden px-4 py-3 text-center text-[11px] font-semibold uppercase text-gray-500 sm:table-cell">
                Clients
              </th>
              <th className="hidden px-4 py-3 text-center text-[11px] font-semibold uppercase text-gray-500 md:table-cell">
                Employees
              </th>
              <th className="hidden px-4 py-3 text-center text-[11px] font-semibold uppercase text-gray-500 md:table-cell">
                Jobs
              </th>
              <th className="hidden px-4 py-3 text-[11px] font-semibold uppercase text-gray-500 lg:table-cell">
                Created
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : businesses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">
                  No businesses found
                </td>
              </tr>
            ) : (
              businesses.map((biz) => (
                <tr
                  key={biz.id}
                  onClick={() => router.push(`/admin/businesses/${biz.id}`)}
                  className="cursor-pointer border-b border-[#F0F2F5] transition-colors last:border-b-0 hover:bg-blue-50/30"
                >
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-gray-800">
                      {biz.name || "Unnamed"}
                    </div>
                    <div className="font-body text-xs text-gray-400">
                      {biz.email || "No email"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={biz.subscriptionStatus} />
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm font-semibold text-gray-600 sm:table-cell">
                    {biz.clientCount}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm font-semibold text-gray-600 md:table-cell">
                    {biz.employeeCount}
                  </td>
                  <td className="hidden px-4 py-3 text-center text-sm font-semibold text-gray-600 md:table-cell">
                    {biz.jobCount}
                  </td>
                  <td className="hidden px-4 py-3 font-body text-xs text-gray-400 lg:table-cell">
                    {formatDate(biz.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

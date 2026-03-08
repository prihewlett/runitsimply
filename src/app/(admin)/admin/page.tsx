"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { HomeIcon, DollarIcon, ClockIcon, UserIcon } from "@/components/icons";

interface TrialExpiring {
  id: string;
  name: string;
  trialEndsAt: string;
  daysRemaining: number;
}

interface OverdueBusiness {
  id: string;
  name: string;
  subscriptionStatus: string;
  lastPaymentDate: string | null;
}

interface PlatformStats {
  totalBusinesses: number;
  activeCount: number;
  trialCount: number;
  expiredCount: number;
  cancelledCount: number;
  monthlyRevenue: number;
  newThisMonth: number;
  totalClients: number;
  totalJobs: number;
  overdueCount: number;
  trialExpiringCount: number;
  trialExpiringSoon: TrialExpiring[];
  overdueBusinesses: OverdueBusiness[];
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueByMonth: { month: string; amount: number }[];
  revenueByMethod: { stripe: number; venmo: number; zelle: number; other: number };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  if (loading) {
    return (
      <div>
        <PageHeader title="Platform Overview" subtitle="RunItSimply admin dashboard" />
        <div className="mt-8 text-center text-sm text-gray-400">Loading stats...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div>
        <PageHeader title="Platform Overview" subtitle="RunItSimply admin dashboard" />
        <div className="mt-8 text-center text-sm text-red-400">Failed to load stats</div>
      </div>
    );
  }

  const needsAttention = stats.overdueCount + stats.trialExpiringCount;

  return (
    <div>
      <PageHeader title="Platform Overview" subtitle="RunItSimply admin dashboard" />

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<HomeIcon />}
          label="TOTAL BUSINESSES"
          value={stats.totalBusinesses}
          subtitle={`${stats.newThisMonth} new this month`}
          accentColor="#2563EB"
        />
        <StatCard
          icon={<DollarIcon />}
          label="REVENUE"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          subtitle={`$${stats.revenueThisMonth.toFixed(2)} this month`}
          accentColor="#059669"
        />
        <StatCard
          icon={<ClockIcon />}
          label="NEEDS ATTENTION"
          value={needsAttention}
          subtitle={`${stats.overdueCount} overdue · ${stats.trialExpiringCount} expiring`}
          accentColor={needsAttention > 0 ? "#DC2626" : "#D97706"}
        />
        <StatCard
          icon={<UserIcon />}
          label="TOTAL CLIENTS"
          value={stats.totalClients}
          subtitle={`${stats.totalJobs} total jobs`}
          accentColor="#7C3AED"
        />
      </div>

      {/* Needs Attention Section */}
      {(stats.overdueBusinesses.length > 0 || stats.trialExpiringSoon.length > 0) && (
        <div className="mt-4 rounded-[14px] border border-[#F0F2F5] bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-gray-700">Needs Attention</h3>

          {stats.overdueBusinesses.length > 0 && (
            <>
              <div className="mb-2 text-[11px] font-semibold uppercase text-red-400">
                Overdue / Expired
              </div>
              {stats.overdueBusinesses.map((b) => (
                <div
                  key={b.id}
                  onClick={() => router.push(`/admin/businesses/${b.id}`)}
                  className="mb-1 flex cursor-pointer items-center justify-between rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 transition-colors hover:bg-red-50/40"
                >
                  <span className="text-sm font-semibold text-gray-700">{b.name}</span>
                  <span className="font-body text-xs text-gray-400">
                    {b.lastPaymentDate
                      ? `Last paid ${formatShortDate(b.lastPaymentDate)}`
                      : "No payments"}
                  </span>
                </div>
              ))}
            </>
          )}

          {stats.trialExpiringSoon.length > 0 && (
            <>
              <div className="mb-2 mt-3 text-[11px] font-semibold uppercase text-yellow-500">
                Trials Expiring Soon
              </div>
              {stats.trialExpiringSoon.map((b) => (
                <div
                  key={b.id}
                  onClick={() => router.push(`/admin/businesses/${b.id}`)}
                  className="mb-1 flex cursor-pointer items-center justify-between rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 transition-colors hover:bg-yellow-50/40"
                >
                  <span className="text-sm font-semibold text-gray-700">{b.name}</span>
                  <span className="font-body text-xs font-semibold text-yellow-600">
                    {b.daysRemaining} day{b.daysRemaining !== 1 ? "s" : ""} left
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Revenue Breakdown */}
      <div className="mt-4 rounded-[14px] border border-[#F0F2F5] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Revenue</h3>

        {/* Month-by-month */}
        <div className="mb-4 space-y-1.5">
          {stats.revenueByMonth.map((m) => {
            const max = Math.max(...stats.revenueByMonth.map((x) => x.amount), 1);
            const pct = Math.round((m.amount / max) * 100);
            return (
              <div key={m.month} className="flex items-center gap-3">
                <div className="w-16 shrink-0 font-body text-[11px] text-gray-400">{m.month}</div>
                <div className="flex-1 rounded-full bg-[#F0F2F5]" style={{ height: 8 }}>
                  <div
                    className="rounded-full bg-green-500"
                    style={{ width: `${pct}%`, height: 8 }}
                  />
                </div>
                <div className="w-14 text-right font-body text-xs font-semibold text-gray-700">
                  ${m.amount.toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>

        {/* By method */}
        <div className="border-t border-[#F0F2F5] pt-4">
          <div className="mb-2 text-[11px] font-semibold uppercase text-gray-400">By Method</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Stripe", key: "stripe", color: "#0369A1" },
              { label: "Venmo", key: "venmo", color: "#008CFF" },
              { label: "Zelle", key: "zelle", color: "#6D28D9" },
              { label: "Other", key: "other", color: "#6B7280" },
            ].map(({ label, key, color }) => (
              <div key={key} className="rounded-[10px] bg-[#FAFBFD] px-3 py-2">
                <div className="font-body text-[10px] font-semibold uppercase" style={{ color }}>
                  {label}
                </div>
                <div className="mt-0.5 text-base font-extrabold text-gray-700">
                  ${(stats.revenueByMethod[key as keyof typeof stats.revenueByMethod] ?? 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Last month comparison */}
        <div className="mt-3 border-t border-[#F0F2F5] pt-3 font-body text-xs text-gray-400">
          Last month: <span className="font-semibold text-gray-600">${stats.revenueLastMonth.toFixed(2)}</span>
          {" · "}Active subscribers: <span className="font-semibold text-gray-600">{stats.activeCount} × $19.99 = ${stats.monthlyRevenue.toFixed(2)}/mo potential</span>
        </div>
      </div>

      {/* Subscription breakdown */}
      <div className="mt-4 rounded-[14px] border border-[#F0F2F5] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-gray-700">Subscription Breakdown</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="text-2xl font-extrabold text-green-600">{stats.activeCount}</div>
            <div className="font-body text-xs text-gray-400">Active</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-blue-600">{stats.trialCount}</div>
            <div className="font-body text-xs text-gray-400">Trial</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-red-500">{stats.expiredCount}</div>
            <div className="font-body text-xs text-gray-400">Expired</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-orange-500">{stats.cancelledCount}</div>
            <div className="font-body text-xs text-gray-400">Cancelled</div>
          </div>
        </div>
      </div>
    </div>
  );
}

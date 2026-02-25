"use client";

import { PageHeader } from "@/components/ui/page-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { TodaysSchedule } from "@/components/dashboard/todays-schedule";
import { TeamAvailability } from "@/components/dashboard/team-availability";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { t } = useLanguage();
  const { isOwner } = useAuth();

  return (
    <div>
      <PageHeader
        title={t("dashboard.title")}
        subtitle={isOwner ? t("dashboard.subtitle") : t("dashboard.mySubtitle")}
      />
      <KpiCards />
      <div className={`mt-4 grid grid-cols-1 gap-4 ${isOwner ? "lg:grid-cols-2" : ""}`}>
        <TodaysSchedule />
        {isOwner && <TeamAvailability />}
      </div>
    </div>
  );
}

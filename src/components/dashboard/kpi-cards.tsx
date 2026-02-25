"use client";

import { CalendarIcon, ClockIcon, DollarIcon, UserIcon } from "@/components/icons";
import { StatCard } from "@/components/ui/stat-card";
import { getWeekDates, toDateString } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";

export function KpiCards() {
  const { t } = useLanguage();
  const { jobs, employees, clients } = useData();
  const { isOwner, currentEmployeeId } = useAuth();

  const weekDates = getWeekDates(0);
  const allWeekJobs = jobs.filter((j) =>
    weekDates.some((d) => toDateString(d) === j.date)
  );

  if (isOwner) {
    // ── Owner view ──
    const completedJobs = allWeekJobs.filter((j) => j.status === "completed");
    const totalHours = allWeekJobs.reduce((sum, j) => sum + j.duration, 0);
    const totalRevenue = allWeekJobs.reduce((sum, j) => sum + j.amount, 0);

    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<CalendarIcon />}
          label={t("kpi.jobsThisWeek")}
          value={allWeekJobs.length}
          subtitle={t("kpi.completed", { count: completedJobs.length })}
          accentColor="#2563EB"
        />
        <StatCard
          icon={<ClockIcon />}
          label={t("kpi.hours")}
          value={totalHours.toFixed(1)}
          subtitle={t("kpi.thisWeek")}
          accentColor="#059669"
        />
        <StatCard
          icon={<DollarIcon />}
          label={t("kpi.revenue")}
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle={t("kpi.estimated")}
          accentColor="#D97706"
        />
        <StatCard
          icon={<UserIcon />}
          label={t("kpi.teamLabel")}
          value={employees.length}
          subtitle={t("kpi.clientsCount", { count: clients.length })}
          accentColor="#7C3AED"
        />
      </div>
    );
  }

  // ── Employee view ──
  const myJobs = allWeekJobs.filter(
    (j) => currentEmployeeId !== null && j.employeeIds.includes(currentEmployeeId)
  );
  const myCompleted = myJobs.filter((j) => j.status === "completed");
  const myHours = myJobs.reduce((sum, j) => sum + j.duration, 0);
  const currentEmp = employees.find((e) => e.id === currentEmployeeId);
  const myEarnings = currentEmp
    ? currentEmp.payType === "perJob"
      ? myCompleted.length * currentEmp.rate
      : myHours * currentEmp.rate
    : 0;
  const myUpcoming = myJobs.filter((j) => j.status === "scheduled").length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={<CalendarIcon />}
        label={t("kpi.myJobs")}
        value={myJobs.length}
        subtitle={t("kpi.completed", { count: myCompleted.length })}
        accentColor="#2563EB"
      />
      <StatCard
        icon={<ClockIcon />}
        label={t("kpi.myHours")}
        value={myHours.toFixed(1)}
        subtitle={t("kpi.thisWeek")}
        accentColor="#059669"
      />
      <StatCard
        icon={<DollarIcon />}
        label={t("kpi.myEarnings")}
        value={`$${myEarnings.toLocaleString()}`}
        subtitle={t("kpi.estimated")}
        accentColor="#D97706"
      />
      <StatCard
        icon={<CalendarIcon />}
        label={t("kpi.upcoming")}
        value={myUpcoming}
        subtitle={t("kpi.thisWeek")}
        accentColor="#7C3AED"
      />
    </div>
  );
}

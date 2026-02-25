"use client";

import { getWeekDates, toDateString } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";

export function TeamAvailability() {
  const { t } = useLanguage();
  const { jobs, employees } = useData();

  const weekDates = getWeekDates(0);
  const weekJobs = jobs.filter((j) =>
    weekDates.some((d) => toDateString(d) === j.date)
  );

  return (
    <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-3 text-sm font-bold">{t("teamAvailability.title")}</h3>
      {employees.length === 0 && (
        <p className="py-4 text-center font-body text-sm text-gray-400">
          {t("team.noMembers")}
        </p>
      )}
      {employees.map((emp) => {
        const empHours = weekJobs
          .filter((j) => j.employeeIds.includes(emp.id))
          .reduce((sum, j) => sum + j.duration, 0);
        const percent = Math.min((empHours / 40) * 100, 100);

        return (
          <div key={emp.id} className="mb-3">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-[26px] w-[26px] items-center justify-center rounded-md text-[9px] font-bold"
                  style={{
                    background: emp.color + "18",
                    color: emp.color,
                  }}
                >
                  {emp.avatar}
                </div>
                <span className="text-xs font-semibold">{emp.name}</span>
              </div>
              <span className="font-body text-[11px] text-gray-500">
                {empHours.toFixed(1)}h
              </span>
            </div>
            <div className="h-1 rounded-full bg-[#FAFBFD]">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${percent}%`,
                  background: emp.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

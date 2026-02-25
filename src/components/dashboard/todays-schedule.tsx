"use client";

import { toDateString } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";

export function TodaysSchedule() {
  const { t } = useLanguage();
  const { jobs, clients, employees } = useData();
  const { isOwner, currentEmployeeId } = useAuth();

  const today = toDateString(new Date());
  let todaysJobs = jobs.filter((j) => j.date === today);

  // Employee view: only show their assigned jobs
  if (!isOwner && currentEmployeeId !== null) {
    todaysJobs = todaysJobs.filter((j) =>
      j.employeeIds.includes(currentEmployeeId)
    );
  }

  return (
    <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <h3 className="mb-3 text-sm font-bold">{t("todaysSchedule.title")}</h3>
      {todaysJobs.length === 0 ? (
        <p className="py-4 text-center font-body text-sm text-gray-400">
          {t("todaysSchedule.noJobs")}
        </p>
      ) : (
        todaysJobs.map((job) => {
          const client = clients.find((c) => c.id === job.clientId);
          const assignedEmployees = employees.filter((e) =>
            job.employeeIds.includes(e.id)
          );
          return (
            <div
              key={job.id}
              className="mb-1.5 rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-2.5"
            >
              <div className="flex items-center justify-between">
                <strong className="text-sm">
                  {client?.name ?? t("common.unknown")}
                </strong>
                <span
                  className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                  style={{
                    background:
                      job.status === "completed" ? "#ECFDF5" : "#EFF6FF",
                    color:
                      job.status === "completed" ? "#059669" : "#2563EB",
                  }}
                >
                  {job.status}
                </span>
              </div>
              <div className="mt-1 font-body text-[11px] text-gray-500">
                {job.time} &middot; {job.duration}h &middot;{" "}
                {assignedEmployees
                  .map((e) => e.name.split(" ")[0])
                  .join(", ")}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

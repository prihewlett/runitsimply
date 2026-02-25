"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormInput } from "@/components/ui/form-input";
import { PlusIcon, ClockIcon } from "@/components/icons";
import {
  getWeekDates,
  toDateString,
} from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import type { Employee, TimeEntry } from "@/types";

// Format employee rate for display
function formatRate(emp: Employee, perJobLabel: string): string {
  if (emp.payType === "perJob") return `$${emp.rate}/${perJobLabel}`;
  return `$${emp.rate}/hr`;
}

const MEMBER_COLORS = ["#3B82F6", "#16A34A", "#F59E0B", "#EF4444", "#8B5CF6", "#0EA5E9", "#EC4899", "#6366F1"];

export default function TeamPage() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberAdded, setMemberAdded] = useState(false);
  const { employees, setEmployees, jobs: JOBS, clients: CLIENTS, timeEntries, setTimeEntries } = useData();
  const [logForm, setLogForm] = useState({
    employeeId: "",
    date: "",
    clockIn: "",
    clockOut: "",
  });
  const [memberForm, setMemberForm] = useState({
    name: "",
    phone: "",
    role: "",
    rate: "",
    payType: "hourly" as "hourly" | "perJob",
  });

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [memberRemoved, setMemberRemoved] = useState(false);

  const { t } = useLanguage();
  const { settings, isReadOnly } = useSettings();
  const { isOwner, currentEmployeeId } = useAuth();

  // Employee view: only show their own card
  const visibleEmployees = isOwner
    ? employees
    : employees.filter((e) => e.id === currentEmployeeId);

  const handleSaveMember = () => {
    if (!memberForm.name.trim() || !memberForm.role.trim()) return;
    const newId = crypto.randomUUID();
    const initials = memberForm.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const color = MEMBER_COLORS[employees.length % MEMBER_COLORS.length];
    const newEmployee: Employee = {
      id: newId,
      name: memberForm.name,
      phone: memberForm.phone,
      role: memberForm.role,
      rate: parseFloat(memberForm.rate) || 0,
      payType: memberForm.payType,
      color,
      avatar: initials,
    };
    setEmployees((prev) => [...prev, newEmployee]);
    setShowAddMember(false);
    setMemberForm({ name: "", phone: "", role: "", rate: "", payType: "hourly" });
    setMemberAdded(true);
    setTimeout(() => setMemberAdded(false), 2500);
  };

  const weekDates = getWeekDates(0);
  const weekJobs = JOBS.filter((j) =>
    weekDates.some((d) => toDateString(d) === j.date)
  );

  const selectedEmp = employees.find((e) => e.id === selectedEmployee);
  const selectedEntries = timeEntries.filter(
    (te) => te.employeeId === selectedEmployee
  );
  const selectedJobs = weekJobs.filter((j) =>
    selectedEmployee ? j.employeeIds.includes(selectedEmployee) : false
  );

  // Convert 24h time string (HH:MM) to 12h format (H:MM AM/PM)
  const formatTime12h = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  const handleDeleteMember = () => {
    if (!selectedEmployee) return;
    setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee));
    setSelectedEmployee(null);
    setConfirmDelete(false);
    setMemberRemoved(true);
    setTimeout(() => setMemberRemoved(false), 2500);
  };

  const handleSaveTimeEntry = () => {
    if (
      !logForm.employeeId ||
      !logForm.date ||
      !logForm.clockIn ||
      !logForm.clockOut
    )
      return;

    const [inH, inM] = logForm.clockIn.split(":").map(Number);
    const [outH, outM] = logForm.clockOut.split(":").map(Number);
    const hours = outH + outM / 60 - (inH + inM / 60);
    if (hours <= 0) return;

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employeeId: logForm.employeeId,
      date: logForm.date,
      clockIn: formatTime12h(logForm.clockIn),
      clockOut: formatTime12h(logForm.clockOut),
      hours: Math.round(hours * 100) / 100,
    };

    setTimeEntries((prev) => [...prev, newEntry]);
    setShowLogModal(false);
    setLogForm({ employeeId: "", date: "", clockIn: "", clockOut: "" });
  };

  return (
    <div>
      <PageHeader
        title={t("team.title")}
        subtitle={t("team.subtitle")}
        action={
          !isReadOnly ? (
          <div className="flex gap-2">
            {settings.employeeSelfLog && (
              <ButtonSecondary onClick={() => setShowLogModal(true)}>
                <ClockIcon size={16} />
                {t("team.logHours")}
              </ButtonSecondary>
            )}
            {isOwner && (
              <ButtonPrimary icon={<PlusIcon size={16} />} onClick={() => setShowAddMember(true)}>
                {t("team.addMember")}
              </ButtonPrimary>
            )}
          </div>
          ) : undefined
        }
      />

      {/* Employee cards grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visibleEmployees.map((emp) => {
          const empWeekJobs = weekJobs.filter((j) =>
            j.employeeIds.includes(emp.id)
          );
          const empHours = empWeekJobs.reduce(
            (sum, j) => sum + j.duration,
            0
          );
          const empEntries = timeEntries.filter(
            (te) => te.employeeId === emp.id
          );
          const loggedHours = empEntries.reduce(
            (sum, te) => sum + te.hours,
            0
          );

          return (
            <div
              key={emp.id}
              className="hover-lift cursor-pointer rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
              onClick={() => setSelectedEmployee(emp.id)}
              role="button"
              aria-label={emp.name}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedEmployee(emp.id); } }}
            >
              {/* Avatar + name */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ background: emp.color }}
                >
                  {emp.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold">{emp.name}</div>
                  <div className="font-body text-xs text-gray-400">
                    {emp.role}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2.5">
                {!settings.hidePayroll && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[11px] text-gray-400">
                      {t("team.rate")}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatRate(emp, t("team.perJob"))}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-gray-400">
                    {t("team.jobsThisWeek")}
                  </span>
                  <span className="text-sm font-semibold">
                    {empWeekJobs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-gray-400">
                    {t("team.scheduledHours")}
                  </span>
                  <span className="text-sm font-semibold">
                    {empHours.toFixed(1)}h
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-body text-[11px] text-gray-400">
                    {t("team.loggedHours")}
                  </span>
                  <span className="text-sm font-semibold">
                    {loggedHours.toFixed(1)}h
                  </span>
                </div>
                {!settings.hidePayroll && (
                  <div className="flex items-center justify-between">
                    <span className="font-body text-[11px] text-gray-400">
                      {t("team.earnings")}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ${emp.payType === "perJob"
                        ? (empWeekJobs.filter((j) => j.status === "completed").length * emp.rate).toFixed(2)
                        : (loggedHours * emp.rate).toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Workload bar */}
              <div className="mt-3">
                <div className="h-1.5 rounded-full bg-[#FAFBFD]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min((empHours / 40) * 100, 100)}%`,
                      background: emp.color,
                    }}
                  />
                </div>
                <div className="mt-1 font-body text-[10px] text-gray-400">
                  {t("team.capacity", { pct: ((empHours / 40) * 100).toFixed(0) })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee detail modal */}
      <Modal
        open={selectedEmployee !== null}
        onClose={() => { setSelectedEmployee(null); setConfirmDelete(false); }}
        title={selectedEmp?.name ?? ""}
        wide
      >
        {selectedEmp && (
          <div>
            {/* Header */}
            <div className="mb-5 flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
                style={{ background: selectedEmp.color }}
              >
                {selectedEmp.avatar}
              </div>
              <div>
                <div className="text-lg font-bold">{selectedEmp.name}</div>
                <div className="font-body text-sm text-gray-500">
                  {selectedEmp.role}
                  {!settings.hidePayroll && (
                    <> &middot; {formatRate(selectedEmp, t("team.perJob"))}</>
                  )}
                </div>
                <div className="font-body text-sm text-gray-400">
                  {selectedEmp.phone}
                </div>
              </div>
            </div>

            {/* Time entries */}
            <h4 className="mb-2 flex items-center gap-2 text-sm font-bold">
              <ClockIcon size={16} /> {t("team.clockInHistory")}
            </h4>
            {selectedEntries.length === 0 ? (
              <p className="font-body text-sm text-gray-400">
                {t("team.noTimeEntries")}
              </p>
            ) : (
              <div className="overflow-hidden rounded-[10px] border border-[#F0F2F5]">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-[#FAFBFD]">
                      <th scope="col" className="px-3 py-2 font-body font-semibold text-gray-500">
                        {t("team.date")}
                      </th>
                      <th scope="col" className="px-3 py-2 font-body font-semibold text-gray-500">
                        {t("team.clockIn")}
                      </th>
                      <th scope="col" className="px-3 py-2 font-body font-semibold text-gray-500">
                        {t("team.clockOut")}
                      </th>
                      <th scope="col" className="px-3 py-2 font-body font-semibold text-gray-500">
                        {t("team.hoursCol")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-t border-[#F0F2F5]"
                      >
                        <td className="px-3 py-2">{entry.date}</td>
                        <td className="px-3 py-2">{entry.clockIn}</td>
                        <td className="px-3 py-2">{entry.clockOut}</td>
                        <td className="px-3 py-2 font-semibold">
                          {entry.hours.toFixed(2)}h
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Total Earnings */}
            {!settings.hidePayroll && selectedEntries.length > 0 && (
              <div className="mt-3 flex items-center justify-between rounded-[10px] bg-green-50 p-3">
                <span className="text-sm font-bold text-green-700">
                  {t("team.totalEarnings")}
                </span>
                <span className="text-sm font-bold text-green-700">
                  ${selectedEmp.payType === "perJob"
                    ? (selectedJobs.filter((j) => j.status === "completed").length * selectedEmp.rate).toFixed(2)
                    : (selectedEntries.reduce((s, te) => s + te.hours, 0) * selectedEmp.rate).toFixed(2)}
                </span>
              </div>
            )}

            {/* Upcoming jobs */}
            <h4 className="mb-2 mt-5 text-sm font-bold">
              {t("team.jobsWeek", { count: selectedJobs.length })}
            </h4>
            {selectedJobs.length === 0 ? (
              <p className="font-body text-sm text-gray-400">
                {t("team.noJobsWeek")}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedJobs.map((job) => {
                  const client = CLIENTS.find(
                    (c) => c.id === job.clientId
                  );
                  return (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold">
                          {client?.name}
                        </div>
                        <div className="font-body text-[11px] text-gray-500">
                          {job.date} &middot; {job.time} &middot; {job.duration}h
                        </div>
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
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
                  );
                })}
              </div>
            )}

            {/* Delete button (owner only) */}
            {isOwner && !isReadOnly && (
              <div className="mt-5 border-t border-[#F0F2F5] pt-4">
                {!confirmDelete ? (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="cursor-pointer rounded-[10px] bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                  >
                    {t("team.removeMember")}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{t("common.confirmDelete")}</span>
                    <button
                      onClick={handleDeleteMember}
                      className="cursor-pointer rounded-[10px] bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
                    >
                      {t("common.confirm")}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="cursor-pointer rounded-[10px] border border-[#F0F2F5] bg-white px-4 py-2 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Member modal */}
      <Modal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        title={t("team.addMember")}
      >
        <div>
          <FormInput
            label={t("team.name")}
            value={memberForm.name}
            onChange={(v) => setMemberForm((prev) => ({ ...prev, name: v }))}
            placeholder={t("team.placeholderName")}
          />
          <FormInput
            label={t("team.phone")}
            value={memberForm.phone}
            onChange={(v) => setMemberForm((prev) => ({ ...prev, phone: v }))}
            placeholder="(555) 234-5678"
          />
          <FormInput
            label={t("team.roleLabel")}
            value={memberForm.role}
            onChange={(v) => setMemberForm((prev) => ({ ...prev, role: v }))}
            placeholder={t("team.placeholderRole")}
          />
          <FormInput
            label={t("team.rateLabel")}
            value={memberForm.rate}
            onChange={(v) => setMemberForm((prev) => ({ ...prev, rate: v }))}
            type="number"
            placeholder="20"
          />
          <FormInput
            label={t("team.payType")}
            value={memberForm.payType}
            onChange={(v) => setMemberForm((prev) => ({ ...prev, payType: v as "hourly" | "perJob" }))}
            options={[
              { value: "hourly", label: t("team.hourly") },
              { value: "perJob", label: t("team.perJob") },
            ]}
          />
          <div className="mt-4">
            <ButtonPrimary onClick={handleSaveMember}>
              {t("team.saveMember")}
            </ButtonPrimary>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {memberAdded && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("team.memberAdded")}
        </div>
      )}
      {memberRemoved && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("team.memberRemoved")}
        </div>
      )}

      {/* Log Hours modal */}
      <Modal
        open={showLogModal}
        onClose={() => {
          setShowLogModal(false);
          setLogForm({ employeeId: "", date: "", clockIn: "", clockOut: "" });
        }}
        title={t("team.logHoursTitle")}
      >
        <div>
          <FormInput
            label={t("team.selectEmployee")}
            value={logForm.employeeId}
            onChange={(v) => setLogForm({ ...logForm, employeeId: v })}
            options={[
              { value: "", label: "—" },
              ...employees.map((e) => ({
                value: String(e.id),
                label: e.name,
              })),
            ]}
          />
          <FormInput
            label={t("team.entryDate")}
            value={logForm.date}
            onChange={(v) => setLogForm({ ...logForm, date: v })}
            type="date"
          />
          <FormInput
            label={t("team.clockInTime")}
            value={logForm.clockIn}
            onChange={(v) => setLogForm({ ...logForm, clockIn: v })}
            type="time"
          />
          <FormInput
            label={t("team.clockOutTime")}
            value={logForm.clockOut}
            onChange={(v) => setLogForm({ ...logForm, clockOut: v })}
            type="time"
          />
          <div className="mt-4">
            <ButtonPrimary onClick={handleSaveTimeEntry}>
              {t("team.saveEntry")}
            </ButtonPrimary>
          </div>
        </div>
      </Modal>
    </div>
  );
}

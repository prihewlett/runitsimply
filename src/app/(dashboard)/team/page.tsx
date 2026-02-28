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

// Capture GPS coordinates via browser geolocation API
function captureGPS(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// MapPinIcon component
function MapPinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
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
  const [memberUpdated, setMemberUpdated] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "",
    rate: "",
    payType: "hourly" as "hourly" | "perJob",
  });

  // GPS clock in/out state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsToast, setGpsToast] = useState<string | null>(null);

  const { t } = useLanguage();
  const { settings, isReadOnly } = useSettings();
  const { isOwner, currentEmployeeId } = useAuth();

  // Employee view: only show their own card
  const visibleEmployees = isOwner
    ? employees
    : employees.filter((e) => e.id === currentEmployeeId);

  // Find active shift (clocked in but no clock out) for an employee
  const getActiveShift = (empId: string): TimeEntry | undefined => {
    return timeEntries.find(
      (te) => te.employeeId === empId && te.clockOut === "" && te.hours === 0
    );
  };

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

  // Get current time as 12h format
  const getCurrentTime12h = () => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
  };

  // Get today as YYYY-MM-DD
  const getTodayString = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };

  const handleDeleteMember = () => {
    if (!selectedEmployee) return;
    setEmployees((prev) => prev.filter((e) => e.id !== selectedEmployee));
    setSelectedEmployee(null);
    setConfirmDelete(false);
    setMemberRemoved(true);
    setTimeout(() => setMemberRemoved(false), 2500);
  };

  const handleStartEdit = () => {
    if (!selectedEmp) return;
    setEditForm({
      name: selectedEmp.name,
      phone: selectedEmp.phone,
      role: selectedEmp.role,
      rate: String(selectedEmp.rate),
      payType: selectedEmp.payType || "hourly",
    });
    setEditing(true);
  };

  const handleUpdateMember = () => {
    if (!selectedEmployee || !editForm.name.trim() || !editForm.role.trim()) return;
    const updatedName = editForm.name.trim();
    const initials = updatedName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === selectedEmployee
          ? {
              ...e,
              name: updatedName,
              phone: editForm.phone,
              role: editForm.role,
              rate: parseFloat(editForm.rate) || 0,
              payType: editForm.payType,
              avatar: initials,
            }
          : e
      )
    );
    setEditing(false);
    setMemberUpdated(true);
    setTimeout(() => setMemberUpdated(false), 2500);
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

  // GPS Clock In: creates an open time entry (no clockOut yet)
  const handleClockIn = async (empId: string) => {
    setGpsLoading(true);
    const gps = await captureGPS();
    setGpsLoading(false);

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      employeeId: empId,
      date: getTodayString(),
      clockIn: getCurrentTime12h(),
      clockOut: "",
      hours: 0,
      clockInLat: gps?.lat ?? null,
      clockInLng: gps?.lng ?? null,
      clockInAccuracy: gps?.accuracy ?? null,
    };

    setTimeEntries((prev) => [...prev, newEntry]);

    if (!gps) {
      setGpsToast(t("team.gpsPermissionDenied"));
    } else {
      setGpsToast(t("team.gpsVerified"));
    }
    setTimeout(() => setGpsToast(null), 2500);
  };

  // GPS Clock Out: finds the open entry and completes it
  const handleClockOut = async (empId: string) => {
    const activeShift = getActiveShift(empId);
    if (!activeShift) return;

    setGpsLoading(true);
    const gps = await captureGPS();
    setGpsLoading(false);

    // Parse clockIn time to calculate hours
    const clockOutTime = getCurrentTime12h();
    const parseTime12h = (t12: string): number => {
      const match = t12.match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let h = parseInt(match[1]);
      const m = parseInt(match[2]);
      const period = match[3].toUpperCase();
      if (period === "PM" && h !== 12) h += 12;
      if (period === "AM" && h === 12) h = 0;
      return h + m / 60;
    };

    const inDecimal = parseTime12h(activeShift.clockIn);
    const outDecimal = parseTime12h(clockOutTime);
    const hours = Math.max(0, outDecimal - inDecimal);

    setTimeEntries((prev) =>
      prev.map((te) =>
        te.id === activeShift.id
          ? {
              ...te,
              clockOut: clockOutTime,
              hours: Math.round(hours * 100) / 100,
              clockOutLat: gps?.lat ?? null,
              clockOutLng: gps?.lng ?? null,
              clockOutAccuracy: gps?.accuracy ?? null,
            }
          : te
      )
    );

    if (!gps) {
      setGpsToast(t("team.gpsPermissionDenied"));
    } else {
      setGpsToast(t("team.gpsVerified"));
    }
    setTimeout(() => setGpsToast(null), 2500);
  };

  return (
    <div>
      <PageHeader
        title={t("team.title")}
        subtitle={t("team.subtitle")}
        action={
          !isReadOnly ? (
          <div className="flex flex-wrap gap-2">
            {/* GPS Clock In/Out buttons for employees */}
            {!isOwner && currentEmployeeId && (
              <>
                {getActiveShift(currentEmployeeId) ? (
                  <ButtonSecondary
                    onClick={() => handleClockOut(currentEmployeeId)}
                    disabled={gpsLoading}
                  >
                    <ClockIcon size={16} />
                    {gpsLoading ? t("team.gpsCapturing") : t("team.clockOutNow")}
                  </ButtonSecondary>
                ) : (
                  <ButtonPrimary
                    onClick={() => handleClockIn(currentEmployeeId)}
                    disabled={gpsLoading}
                  >
                    <ClockIcon size={16} />
                    {gpsLoading ? t("team.gpsCapturing") : t("team.clockInNow")}
                  </ButtonPrimary>
                )}
              </>
            )}
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
          const activeShift = getActiveShift(emp.id);

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

              {/* Active shift indicator */}
              {activeShift && (
                <div className="mb-2.5 flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
                  </span>
                  <span className="text-[11px] font-semibold text-blue-700">
                    {t("team.clockedInAt", { time: activeShift.clockIn })}
                  </span>
                </div>
              )}

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
        onClose={() => { setSelectedEmployee(null); setConfirmDelete(false); setEditing(false); }}
        title={selectedEmp?.name ?? ""}
        wide
      >
        {selectedEmp && (
          <div>
            {/* Header — view or edit mode */}
            {editing ? (
              <div className="mb-5">
                <FormInput
                  label={t("team.name")}
                  value={editForm.name}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, name: v }))}
                  placeholder={t("team.placeholderName")}
                />
                <FormInput
                  label={t("team.phone")}
                  value={editForm.phone}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, phone: v }))}
                  placeholder="(555) 234-5678"
                />
                <FormInput
                  label={t("team.roleLabel")}
                  value={editForm.role}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, role: v }))}
                  placeholder={t("team.placeholderRole")}
                />
                <FormInput
                  label={t("team.rateLabel")}
                  value={editForm.rate}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, rate: v }))}
                  type="number"
                  placeholder="20"
                />
                <FormInput
                  label={t("team.payType")}
                  value={editForm.payType}
                  onChange={(v) => setEditForm((prev) => ({ ...prev, payType: v as "hourly" | "perJob" }))}
                  options={[
                    { value: "hourly", label: t("team.hourly") },
                    { value: "perJob", label: t("team.perJob") },
                  ]}
                />
                <div className="mt-4 flex gap-2">
                  <ButtonPrimary onClick={handleUpdateMember}>
                    {t("team.saveMember")}
                  </ButtonPrimary>
                  <ButtonSecondary onClick={() => setEditing(false)}>
                    {t("common.cancel")}
                  </ButtonSecondary>
                </div>
              </div>
            ) : (
              <div className="mb-5 flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold text-white"
                  style={{ background: selectedEmp.color }}
                >
                  {selectedEmp.avatar}
                </div>
                <div className="flex-1">
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
                {isOwner && !isReadOnly && (
                  <button
                    onClick={handleStartEdit}
                    className="cursor-pointer rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] px-3 py-1.5 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-100"
                  >
                    {t("team.editMember")}
                  </button>
                )}
              </div>
            )}

            {/* Owner: Clock In/Out buttons for this employee */}
            {isOwner && !isReadOnly && !editing && (
              <div className="mb-4 flex gap-2">
                {getActiveShift(selectedEmp.id) ? (
                  <button
                    onClick={() => handleClockOut(selectedEmp.id)}
                    disabled={gpsLoading}
                    className="flex cursor-pointer items-center gap-1.5 rounded-[10px] bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                  >
                    <ClockIcon size={14} />
                    {gpsLoading ? t("team.gpsCapturing") : t("team.clockOutNow")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleClockIn(selectedEmp.id)}
                    disabled={gpsLoading}
                    className="flex cursor-pointer items-center gap-1.5 rounded-[10px] bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 disabled:opacity-50"
                  >
                    <ClockIcon size={14} />
                    {gpsLoading ? t("team.gpsCapturing") : t("team.clockInNow")}
                  </button>
                )}
              </div>
            )}

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
                      {isOwner && (
                        <th scope="col" className="px-3 py-2 font-body font-semibold text-gray-500">
                          GPS
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedEntries.map((entry) => {
                      const hasGpsIn = entry.clockInLat != null && entry.clockInLng != null;
                      const hasGpsOut = entry.clockOutLat != null && entry.clockOutLng != null;
                      const isActive = entry.clockOut === "" && entry.hours === 0;

                      return (
                        <tr
                          key={entry.id}
                          className={`border-t border-[#F0F2F5] ${isActive ? "bg-blue-50/50" : ""}`}
                        >
                          <td className="px-3 py-2">{entry.date}</td>
                          <td className="px-3 py-2">{entry.clockIn}</td>
                          <td className="px-3 py-2">
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 text-blue-600">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500" />
                                </span>
                                {t("team.activeShift")}
                              </span>
                            ) : (
                              entry.clockOut
                            )}
                          </td>
                          <td className="px-3 py-2 font-semibold">
                            {isActive ? "—" : `${entry.hours.toFixed(2)}h`}
                          </td>
                          {isOwner && (
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                {hasGpsIn && (
                                  <a
                                    href={`https://www.google.com/maps?q=${entry.clockInLat},${entry.clockInLng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-600 hover:text-green-800"
                                    title={`${t("team.clockIn")}: ${entry.clockInLat?.toFixed(4)}, ${entry.clockInLng?.toFixed(4)}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MapPinIcon size={14} />
                                  </a>
                                )}
                                {hasGpsOut && (
                                  <a
                                    href={`https://www.google.com/maps?q=${entry.clockOutLat},${entry.clockOutLng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-orange-600 hover:text-orange-800"
                                    title={`${t("team.clockOut")}: ${entry.clockOutLat?.toFixed(4)}, ${entry.clockOutLng?.toFixed(4)}`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MapPinIcon size={14} />
                                  </a>
                                )}
                                {!hasGpsIn && !hasGpsOut && !isActive && (
                                  <span className="text-gray-300">—</span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
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

      {/* Toasts */}
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
      {memberUpdated && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("team.memberUpdated")}
        </div>
      )}
      {gpsToast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-[12px] bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          <MapPinIcon size={16} />
          {gpsToast}
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
              { value: "", label: "\u2014" },
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

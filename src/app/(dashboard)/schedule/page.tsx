"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormInput } from "@/components/ui/form-input";
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, CheckIcon, SendIcon } from "@/components/icons";
import { AddressLink } from "@/components/ui/address-link";
import { SendInvoiceModal } from "@/components/send-invoice-modal";
import {
  BUSINESS_TYPES,
  TIME_SLOTS,
  getWeekDates,
  getMonthDates,
  formatMonthYear,
  isSameMonth,
  toDateString,
  formatDateShort,
  formatDayName,
  isToday,
} from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import type { Job } from "@/types";

// DAYS_SHORT defined inside component for i18n

function advanceDate(current: Date, rule: "weekly" | "biweekly" | "monthly"): Date {
  const next = new Date(current);
  switch (rule) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

const DEFAULT_FORM = {
  clientId: "",
  date: "",
  time: "",
  duration: "",
  employeeIds: [] as string[],
  amount: "",
  rateType: "flat" as "flat" | "hourly",
  recurrenceRule: "" as "" | "weekly" | "biweekly" | "monthly",
  recurrenceEndDate: "",
};

export default function SchedulePage() {
  const [view, setView] = useState<"week" | "month">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const [monthOffset, setMonthOffset] = useState(0);
  const { clients: CLIENTS, jobs, setJobs, employees: EMPLOYEES } = useData();
  const { isOwner, currentEmployeeId } = useAuth();
  const { isReadOnly } = useSettings();
  const [showNewJob, setShowNewJob] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [jobAdded, setJobAdded] = useState(false);
  const [jobUpdated, setJobUpdated] = useState(false);
  const [formError, setFormError] = useState(false);

  // Job detail/edit state
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(DEFAULT_FORM);

  const weekDates = getWeekDates(weekOffset);
  const monthDates = getMonthDates(monthOffset);
  const { t } = useLanguage();

  // ── Auto-generate recurring job instances for visible date range ──
  const generatedRef = useRef(new Set<string>());

  useEffect(() => {
    const startDate = view === "week" ? toDateString(weekDates[0]) : toDateString(monthDates[0]);
    const endDate = view === "week" ? toDateString(weekDates[6]) : toDateString(monthDates[monthDates.length - 1]);
    const rangeKey = `${startDate}_${endDate}`;

    // Only generate once per date range
    if (generatedRef.current.has(rangeKey)) return;
    generatedRef.current.add(rangeKey);

    // Find recurring parent jobs
    const parentJobs = jobs.filter((j) => j.isRecurring && !j.parentJobId);
    if (parentJobs.length === 0) return;

    const rangeStart = new Date(startDate);
    const rangeEnd = new Date(endDate);
    const newJobs: Job[] = [];

    for (const parent of parentJobs) {
      const rule = parent.recurrenceRule;
      if (!rule) continue;

      const seriesId = parent.seriesId || parent.id;
      let current = new Date(parent.date);
      const recEnd = parent.recurrenceEndDate ? new Date(parent.recurrenceEndDate) : null;

      // Advance to range start
      while (current < rangeStart) {
        current = advanceDate(current, rule);
      }

      // Generate instances
      while (current <= rangeEnd) {
        if (recEnd && current > recEnd) break;
        const dateStr = toDateString(current);

        // Skip if parent date or instance already exists
        if (dateStr !== parent.date) {
          const exists = jobs.some(
            (j) => j.seriesId === seriesId && j.date === dateStr
          ) || newJobs.some(
            (j) => j.seriesId === seriesId && j.date === dateStr
          );

          if (!exists) {
            newJobs.push({
              id: crypto.randomUUID(),
              clientId: parent.clientId,
              employeeIds: [...parent.employeeIds],
              date: dateStr,
              time: parent.time,
              duration: parent.duration,
              status: "scheduled",
              amount: parent.amount,
              rateType: parent.rateType,
              paymentStatus: "pending",
              isRecurring: false,
              parentJobId: parent.id,
              seriesId,
            });
          }
        }

        current = advanceDate(current, rule);
      }
    }

    if (newJobs.length > 0) {
      setJobs((prev) => [...prev, ...newJobs]);
    }
  }, [view, weekOffset, monthOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const DAYS_SHORT = [
    t("common.sun"), t("common.mon"), t("common.tue"),
    t("common.wed"), t("common.thu"), t("common.fri"), t("common.sat"),
  ];

  const weekLabel = `${formatDateShort(weekDates[0])} \u2013 ${formatDateShort(weekDates[6])}`;
  const monthLabel = formatMonthYear(monthOffset);

  // Employee view: filter jobs to only their assigned ones
  const visibleJobs = !isOwner && currentEmployeeId !== null
    ? jobs.filter((j) => j.employeeIds.includes(currentEmployeeId))
    : jobs;

  const handlePrev = () => {
    if (view === "week") setWeekOffset(weekOffset - 1);
    else setMonthOffset(monthOffset - 1);
  };

  const handleNext = () => {
    if (view === "week") setWeekOffset(weekOffset + 1);
    else setMonthOffset(monthOffset + 1);
  };

  const handleToday = () => {
    if (view === "week") setWeekOffset(0);
    else setMonthOffset(0);
  };

  const showTodayBtn = view === "week" ? weekOffset !== 0 : monthOffset !== 0;

  // Auto-fill amount and rate type when client changes (new job form)
  const handleClientChange = (clientId: string) => {
    const client = CLIENTS.find((c) => c.id === clientId);
    setForm((prev) => ({
      ...prev,
      clientId,
      amount: client ? String(client.serviceRate) : "",
      rateType: client?.serviceRateType ?? "flat",
    }));
  };

  const toggleEmployee = (empId: string) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter((id) => id !== empId)
        : [...prev.employeeIds, empId],
    }));
  };

  const handleSaveJob = () => {
    if (!form.clientId || !form.date || !form.time || !form.duration) {
      setFormError(true);
      return;
    }
    setFormError(false);

    const newId = crypto.randomUUID();
    const seriesId = form.recurrenceRule ? crypto.randomUUID() : null;
    const newJob: Job = {
      id: newId,
      clientId: form.clientId,
      employeeIds: form.employeeIds,
      date: form.date,
      time: form.time,
      duration: Number(form.duration),
      status: "scheduled",
      amount: Number(form.amount) || 0,
      rateType: form.rateType,
      paymentStatus: "pending",
      isRecurring: !!form.recurrenceRule,
      recurrenceRule: form.recurrenceRule || undefined,
      recurrenceEndDate: form.recurrenceEndDate || undefined,
      seriesId,
    };

    setJobs((prev) => [...prev, newJob]);
    setShowNewJob(false);
    setForm(DEFAULT_FORM);
    setJobAdded(true);
    setTimeout(() => setJobAdded(false), 2500);
  };

  // ── Job Detail / Edit ──

  const handleJobClick = (job: Job) => {
    setSelectedJob(job);
    setEditing(false);
  };

  const handleStartEdit = () => {
    if (!selectedJob) return;
    const client = CLIENTS.find((c) => c.id === selectedJob.clientId);
    setEditForm({
      clientId: String(selectedJob.clientId),
      date: selectedJob.date,
      time: selectedJob.time,
      duration: String(selectedJob.duration),
      employeeIds: [...selectedJob.employeeIds],
      amount: String(selectedJob.amount),
      rateType: selectedJob.rateType ?? client?.serviceRateType ?? "flat",
      recurrenceRule: selectedJob.recurrenceRule ?? "",
      recurrenceEndDate: selectedJob.recurrenceEndDate ?? "",
    });
    setEditing(true);
  };

  const handleEditClientChange = (clientId: string) => {
    const client = CLIENTS.find((c) => c.id === clientId);
    setEditForm((prev) => ({
      ...prev,
      clientId,
      amount: client ? String(client.serviceRate) : prev.amount,
      rateType: client?.serviceRateType ?? prev.rateType,
    }));
  };

  const toggleEditEmployee = (empId: string) => {
    setEditForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(empId)
        ? prev.employeeIds.filter((id) => id !== empId)
        : [...prev.employeeIds, empId],
    }));
  };

  const handleUpdateJob = () => {
    if (!selectedJob || !editForm.clientId || !editForm.date || !editForm.time || !editForm.duration) return;

    const updated: Job = {
      ...selectedJob,
      clientId: editForm.clientId,
      employeeIds: editForm.employeeIds,
      date: editForm.date,
      time: editForm.time,
      duration: Number(editForm.duration),
      amount: Number(editForm.amount) || 0,
      rateType: editForm.rateType,
    };

    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    setSelectedJob(updated);
    setEditing(false);
    setJobUpdated(true);
    setTimeout(() => setJobUpdated(false), 2500);
  };

  const handleToggleStatus = () => {
    if (!selectedJob) return;
    const newStatus = selectedJob.status === "completed" ? "scheduled" : "completed";
    const updated: Job = { ...selectedJob, status: newStatus };
    setJobs((prev) => prev.map((j) => (j.id === updated.id ? updated : j)));
    setSelectedJob(updated);
  };

  const [jobDeleted, setJobDeleted] = useState(false);
  const [invoiceModalJob, setInvoiceModalJob] = useState<string | null>(null);
  const [invoiceSentToast, setInvoiceSentToast] = useState(false);

  const handleDeleteJob = () => {
    if (!selectedJob) return;
    setJobs((prev) => prev.filter((j) => j.id !== selectedJob.id));
    setSelectedJob(null);
    setEditing(false);
    setJobDeleted(true);
    setTimeout(() => setJobDeleted(false), 2500);
  };

  const handleSendInvoice = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, invoiceSentAt: new Date().toISOString() }
          : j
      )
    );
    if (selectedJob && selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, invoiceSentAt: new Date().toISOString() });
    }
    setInvoiceModalJob(null);
    setInvoiceSentToast(true);
    setTimeout(() => setInvoiceSentToast(false), 2500);
  };

  const closeDetailModal = () => {
    setSelectedJob(null);
    setEditing(false);
  };

  const clientOptions = [
    { value: "", label: t("schedule.selectClient") },
    ...CLIENTS.map((c) => ({ value: String(c.id), label: c.name })),
  ];

  const timeOptions = [
    { value: "", label: "\u2014" },
    ...TIME_SLOTS.map((t) => ({ value: t, label: t })),
  ];

  // Lookup helpers for selected job detail view
  const detailClient = selectedJob ? CLIENTS.find((c) => c.id === selectedJob.clientId) : null;
  const detailBt = detailClient ? BUSINESS_TYPES.find((b) => b.id === detailClient.serviceType) : null;
  const detailAssignees = selectedJob ? EMPLOYEES.filter((e) => selectedJob.employeeIds.includes(e.id)) : [];

  return (
    <div>
      <PageHeader
        title={t("schedule.title")}
        subtitle={t("schedule.subtitle")}
        action={
          isOwner && !isReadOnly ? (
            <ButtonPrimary
              icon={<PlusIcon size={16} />}
              onClick={() => setShowNewJob(true)}
            >
              {t("schedule.newJob")}
            </ButtonPrimary>
          ) : undefined
        }
      />

      {/* Job added toast */}
      {jobAdded && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckIcon size={16} />
          {t("schedule.jobAdded")}
        </div>
      )}

      {/* Job updated toast */}
      {jobUpdated && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckIcon size={16} />
          {t("schedule.jobUpdated")}
        </div>
      )}

      {/* Job deleted toast */}
      {jobDeleted && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
          {t("schedule.jobDeleted")}
        </div>
      )}

      {/* Invoice sent toast */}
      {invoiceSentToast && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckIcon size={16} />
          {t("invoice.invoiceSentSuccess")}
        </div>
      )}

      {/* Navigation bar */}
      <div className="mb-4 flex items-center gap-3">
        {/* View toggle */}
        <div className="flex overflow-hidden rounded-lg border border-[#F0F2F5]">
          <button
            onClick={() => setView("week")}
            aria-pressed={view === "week"}
            className={`cursor-pointer px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "week"
                ? "bg-blue-50 text-blue-600"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t("schedule.week")}
          </button>
          <button
            onClick={() => setView("month")}
            aria-pressed={view === "month"}
            className={`cursor-pointer border-l border-[#F0F2F5] px-3 py-1.5 text-xs font-semibold transition-colors ${
              view === "month"
                ? "bg-blue-50 text-blue-600"
                : "bg-white text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t("schedule.month")}
          </button>
        </div>

        {/* Prev/Next */}
        <button
          onClick={handlePrev}
          aria-label={t("schedule.previousWeek")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
        >
          <ChevronLeftIcon size={16} />
        </button>
        <button
          onClick={handleNext}
          aria-label={t("schedule.nextWeek")}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
        >
          <ChevronRightIcon size={16} />
        </button>

        {/* Label */}
        <span className="text-sm font-semibold">
          {view === "week" ? weekLabel : monthLabel}
        </span>

        {/* Today button */}
        {showTodayBtn && (
          <button
            onClick={handleToday}
            className="cursor-pointer rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600"
          >
            {t("schedule.today")}
          </button>
        )}
      </div>

      {/* ── Week View ── */}
      {view === "week" && (
        <div className="grid grid-cols-7 gap-2">
          {weekDates.map((date) => {
            const dateStr = toDateString(date);
            const dayJobs = visibleJobs.filter((j) => j.date === dateStr);
            const today = isToday(date);

            return (
              <div
                key={dateStr}
                className={`min-h-[200px] rounded-[14px] border bg-white p-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${
                  today ? "border-blue-300 ring-1 ring-blue-100" : "border-[#F0F2F5]"
                }`}
              >
                {/* Day header */}
                <div className="mb-2 text-center">
                  <div className="font-body text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                    {formatDayName(date)}
                  </div>
                  <div
                    className={`mx-auto mt-0.5 flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                      today
                        ? "bg-blue-600 text-white"
                        : "text-[#1A1D26]"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>

                {/* Jobs */}
                {dayJobs.length === 0 ? (
                  <div className="py-4 text-center font-body text-[10px] text-gray-300">
                    {t("schedule.noJobs")}
                  </div>
                ) : (
                  dayJobs.map((job) => {
                    const client = CLIENTS.find((c) => c.id === job.clientId);
                    const bt = BUSINESS_TYPES.find(
                      (b) => b.id === client?.serviceType
                    );
                    const assignees = EMPLOYEES.filter((e) =>
                      job.employeeIds.includes(e.id)
                    );

                    return (
                      <div
                        key={job.id}
                        className="mb-1.5 cursor-pointer rounded-lg p-2 transition-opacity hover:opacity-80"
                        style={{
                          background: (bt?.color ?? "#6B7280") + "10",
                          borderLeft: `3px solid ${bt?.color ?? "#6B7280"}`,
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleJobClick(job)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleJobClick(job); } }}
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-xs">{bt?.emoji}</span>
                          <span className="truncate text-[11px] font-semibold">
                            {client?.name}
                          </span>
                        </div>
                        <div className="mt-0.5 font-body text-[10px] text-gray-500">
                          {job.time} &middot; {job.duration}h
                        </div>
                        <div className="mt-1 flex gap-1">
                          {assignees.map((e) => (
                            <div
                              key={e.id}
                              className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[7px] font-bold text-white"
                              style={{ background: e.color }}
                              title={e.name}
                            >
                              {e.avatar}
                            </div>
                          ))}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          <span
                            className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                            style={{
                              background:
                                job.status === "completed" ? "#ECFDF5" : "#EFF6FF",
                              color:
                                job.status === "completed" ? "#059669" : "#2563EB",
                            }}
                          >
                            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                          </span>
                          <span
                            className="inline-block rounded-full px-1.5 py-0.5 text-[8px] font-semibold"
                            style={{
                              background:
                                job.paymentStatus === "paid" ? "#ECFDF5" : "#FEF3C7",
                              color:
                                job.paymentStatus === "paid" ? "#059669" : "#92400E",
                            }}
                          >
                            {job.paymentStatus.charAt(0).toUpperCase() + job.paymentStatus.slice(1)}
                          </span>
                          {(job.isRecurring || job.seriesId) && (
                            <span className="inline-block rounded-full bg-purple-50 px-1.5 py-0.5 text-[8px] font-semibold text-purple-600">
                              {t("schedule.recurringBadge")}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Month View ── */}
      {view === "month" && (
        <div>
          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7 gap-1">
            {DAYS_SHORT.map((day) => (
              <div
                key={day}
                className="py-2 text-center font-body text-[10px] font-semibold uppercase tracking-wider text-gray-400"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7 gap-1">
            {monthDates.map((date) => {
              const dateStr = toDateString(date);
              const dayJobs = visibleJobs.filter((j) => j.date === dateStr);
              const today = isToday(date);
              const inMonth = isSameMonth(date, monthOffset);

              return (
                <div
                  key={dateStr}
                  className={`min-h-[100px] rounded-[10px] border p-2 ${
                    today
                      ? "border-blue-300 bg-white ring-1 ring-blue-100"
                      : inMonth
                      ? "border-[#F0F2F5] bg-white"
                      : "border-[#F0F2F5] bg-gray-50/50"
                  }`}
                >
                  {/* Date number */}
                  <div
                    className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      today
                        ? "bg-blue-600 text-white"
                        : inMonth
                        ? "text-[#1A1D26]"
                        : "text-gray-300"
                    }`}
                  >
                    {date.getDate()}
                  </div>

                  {/* Compact job bars */}
                  {dayJobs.map((job) => {
                    const client = CLIENTS.find((c) => c.id === job.clientId);
                    const bt = BUSINESS_TYPES.find(
                      (b) => b.id === client?.serviceType
                    );

                    return (
                      <div
                        key={job.id}
                        className="mb-0.5 flex cursor-pointer items-center gap-1 truncate rounded px-1 py-0.5 transition-opacity hover:opacity-80"
                        style={{
                          background: (bt?.color ?? "#6B7280") + "15",
                          borderLeft: `2px solid ${bt?.color ?? "#6B7280"}`,
                        }}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleJobClick(job)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleJobClick(job); } }}
                      >
                        <span className="text-[9px]">{bt?.emoji}</span>
                        <span className="truncate text-[9px] font-semibold text-gray-700">
                          {client?.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Job Detail Modal ── */}
      <Modal
        open={!!selectedJob}
        onClose={closeDetailModal}
        title={t("schedule.jobDetails")}
        wide
      >
        {selectedJob && !editing && (
          <div>
            {/* Client + service type */}
            <div className="mb-4 flex items-center gap-3">
              {detailBt && (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-lg"
                  style={{ background: (detailBt.color ?? "#6B7280") + "15" }}
                >
                  {detailBt.emoji}
                </div>
              )}
              <div>
                <div className="text-base font-bold">{detailClient?.name}</div>
                <div className="font-body text-xs text-gray-400">{detailBt?.label}</div>
              </div>
            </div>

            {/* Info rows */}
            <div className="mb-4 space-y-3 rounded-[14px] border border-[#F0F2F5] bg-[#FAFBFD] p-4">
              {/* Address */}
              {detailClient?.address && (
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.address")}</div>
                  <div className="text-sm"><AddressLink address={detailClient.address} /></div>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.date")}</div>
                  <div className="text-sm font-semibold">{selectedJob.date}</div>
                </div>
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.time")}</div>
                  <div className="text-sm font-semibold">{selectedJob.time}</div>
                </div>
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.duration")}</div>
                  <div className="text-sm font-semibold">{selectedJob.duration}h</div>
                </div>
              </div>

              {/* Assigned employees */}
              <div>
                <div className="mb-1 font-body text-[10px] font-semibold text-gray-400">{t("schedule.assignEmployees")}</div>
                <div className="flex flex-wrap gap-2">
                  {detailAssignees.length > 0 ? (
                    detailAssignees.map((e) => (
                      <div key={e.id} className="flex items-center gap-1.5 rounded-full bg-white border border-[#F0F2F5] px-2.5 py-1">
                        <div
                          className="flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white"
                          style={{ background: e.color }}
                        >
                          {e.avatar}
                        </div>
                        <span className="text-xs font-semibold">{e.name}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">&mdash;</span>
                  )}
                </div>
              </div>

              {/* Amount & Payment */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.amount")}</div>
                  <div className="text-sm font-bold">
                    ${selectedJob.amount}
                    <span className="ml-1 text-[10px] font-normal text-gray-400">
                      {(selectedJob.rateType ?? detailClient?.serviceRateType ?? "flat") === "hourly"
                        ? t("clients.perHour")
                        : t("clients.perVisit")}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.paymentStatus")}</div>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: selectedJob.paymentStatus === "paid" ? "#ECFDF5" : "#FEF3C7",
                      color: selectedJob.paymentStatus === "paid" ? "#059669" : "#92400E",
                    }}
                  >
                    {selectedJob.paymentStatus.charAt(0).toUpperCase() + selectedJob.paymentStatus.slice(1)}
                  </span>
                  {selectedJob.invoiceSentAt && selectedJob.paymentStatus === "pending" && (
                    <div className="mt-1 font-body text-[10px] text-blue-500">
                      {t("invoice.invoiceSentAt", {
                        date: new Date(selectedJob.invoiceSentAt).toLocaleDateString(),
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-body text-[10px] font-semibold text-gray-400">{t("schedule.status")}</div>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background: selectedJob.status === "completed" ? "#ECFDF5" : "#EFF6FF",
                      color: selectedJob.status === "completed" ? "#059669" : "#2563EB",
                    }}
                  >
                    {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            {!isReadOnly && (
            <div className="flex gap-2">
              {isOwner && (
                <ButtonSecondary onClick={handleStartEdit}>
                  {t("schedule.editJob")}
                </ButtonSecondary>
              )}
              <button
                onClick={handleToggleStatus}
                className={`cursor-pointer rounded-[10px] px-4 py-2 text-xs font-semibold transition-colors ${
                  selectedJob.status === "completed"
                    ? "bg-blue-50 text-blue-600 hover:bg-blue-100"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                {selectedJob.status === "completed"
                  ? t("schedule.markScheduled")
                  : t("schedule.markComplete")}
              </button>
              {isOwner &&
                selectedJob.status === "completed" &&
                selectedJob.paymentStatus === "pending" && (
                  <button
                    onClick={() => {
                      setInvoiceModalJob(selectedJob.id);
                      closeDetailModal();
                    }}
                    className="flex cursor-pointer items-center gap-1.5 rounded-[10px] bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <SendIcon size={14} />
                    {selectedJob.invoiceSentAt
                      ? t("invoice.resendInvoice")
                      : t("invoice.sendInvoice")}
                  </button>
                )}
              {isOwner && (
                <button
                  onClick={handleDeleteJob}
                  className="ml-auto cursor-pointer rounded-[10px] bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  {t("schedule.deleteJob")}
                </button>
              )}
            </div>
            )}
          </div>
        )}

        {/* Edit mode */}
        {selectedJob && editing && (
          <div>
            <FormInput
              label={t("schedule.client")}
              value={editForm.clientId}
              onChange={handleEditClientChange}
              options={clientOptions}
            />

            <FormInput
              label={t("schedule.date")}
              value={editForm.date}
              onChange={(v) => setEditForm((prev) => ({ ...prev, date: v }))}
              type="date"
            />

            <FormInput
              label={t("schedule.time")}
              value={editForm.time}
              onChange={(v) => setEditForm((prev) => ({ ...prev, time: v }))}
              options={timeOptions}
            />

            <FormInput
              label={t("schedule.duration")}
              value={editForm.duration}
              onChange={(v) => setEditForm((prev) => ({ ...prev, duration: v }))}
              type="number"
              placeholder="2.5"
            />

            <div className="mb-3">
              <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                {t("schedule.assignEmployees")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EMPLOYEES.map((emp) => {
                  const selected = editForm.employeeIds.includes(emp.id);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      role="checkbox"
                      aria-checked={selected}
                      onClick={() => toggleEditEmployee(emp.id)}
                      className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-left transition-colors ${
                        selected
                          ? "border-blue-400 bg-blue-50"
                          : "border-[#F0F2F5] bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white"
                        style={{ background: emp.color }}
                      >
                        {emp.avatar}
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{emp.name}</div>
                        <div className="font-body text-[10px] text-gray-400">{emp.role}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rate Type Toggle */}
            <div className="mb-3">
              <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                {t("clients.rateType")}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-pressed={editForm.rateType === "flat"}
                  onClick={() => setEditForm((prev) => ({ ...prev, rateType: "flat" }))}
                  className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-2 text-xs font-semibold transition-colors ${
                    editForm.rateType === "flat"
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t("clients.flatRate")}
                </button>
                <button
                  type="button"
                  aria-pressed={editForm.rateType === "hourly"}
                  onClick={() => setEditForm((prev) => ({ ...prev, rateType: "hourly" }))}
                  className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-2 text-xs font-semibold transition-colors ${
                    editForm.rateType === "hourly"
                      ? "border-blue-400 bg-blue-50 text-blue-600"
                      : "border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {t("clients.hourlyRate")}
                </button>
              </div>
            </div>

            <FormInput
              label={editForm.rateType === "hourly" ? `${t("schedule.amount")} (${t("clients.perHour")})` : `${t("schedule.amount")} (${t("clients.perVisit")})`}
              value={editForm.amount}
              onChange={(v) => setEditForm((prev) => ({ ...prev, amount: v }))}
              type="number"
              placeholder="0"
            />

            <ButtonPrimary
              onClick={handleUpdateJob}
              icon={<CheckIcon size={16} />}
            >
              {t("schedule.updateJob")}
            </ButtonPrimary>
          </div>
        )}
      </Modal>

      {/* ── New Job Modal ── */}
      <Modal
        open={showNewJob}
        onClose={() => {
          setShowNewJob(false);
          setForm(DEFAULT_FORM);
          setFormError(false);
        }}
        title={t("schedule.newJobTitle")}
      >
        {/* Client */}
        <FormInput
          label={t("schedule.client")}
          value={form.clientId}
          onChange={handleClientChange}
          options={clientOptions}
        />

        {/* Date */}
        <FormInput
          label={t("schedule.date")}
          value={form.date}
          onChange={(v) => setForm((prev) => ({ ...prev, date: v }))}
          type="date"
        />

        {/* Time */}
        <FormInput
          label={t("schedule.time")}
          value={form.time}
          onChange={(v) => setForm((prev) => ({ ...prev, time: v }))}
          options={timeOptions}
        />

        {/* Duration */}
        <FormInput
          label={t("schedule.duration")}
          value={form.duration}
          onChange={(v) => setForm((prev) => ({ ...prev, duration: v }))}
          type="number"
          placeholder="2.5"
        />

        {/* Assign Employees */}
        <div className="mb-3">
          <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("schedule.assignEmployees")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {EMPLOYEES.map((emp) => {
              const selected = form.employeeIds.includes(emp.id);
              return (
                <button
                  key={emp.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  onClick={() => toggleEmployee(emp.id)}
                  className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-left transition-colors ${
                    selected
                      ? "border-blue-400 bg-blue-50"
                      : "border-[#F0F2F5] bg-white hover:bg-gray-50"
                  }`}
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    style={{ background: emp.color }}
                  >
                    {emp.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold">{emp.name}</div>
                    <div className="font-body text-[10px] text-gray-400">{emp.role}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Rate Type Toggle */}
        <div className="mb-3">
          <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
            {t("clients.rateType")}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              aria-pressed={form.rateType === "flat"}
              onClick={() => setForm((prev) => ({ ...prev, rateType: "flat" }))}
              className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-2 text-xs font-semibold transition-colors ${
                form.rateType === "flat"
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t("clients.flatRate")}
            </button>
            <button
              type="button"
              aria-pressed={form.rateType === "hourly"}
              onClick={() => setForm((prev) => ({ ...prev, rateType: "hourly" }))}
              className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-2 text-xs font-semibold transition-colors ${
                form.rateType === "hourly"
                  ? "border-blue-400 bg-blue-50 text-blue-600"
                  : "border-[#F0F2F5] bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {t("clients.hourlyRate")}
            </button>
          </div>
        </div>

        {/* Amount */}
        <FormInput
          label={form.rateType === "hourly" ? `${t("schedule.amount")} (${t("clients.perHour")})` : `${t("schedule.amount")} (${t("clients.perVisit")})`}
          value={form.amount}
          onChange={(v) => setForm((prev) => ({ ...prev, amount: v }))}
          type="number"
          placeholder="0"
        />

        {/* Recurring Job */}
        <FormInput
          label={t("schedule.repeatEvery")}
          value={form.recurrenceRule}
          onChange={(v) => setForm((prev) => ({ ...prev, recurrenceRule: v as typeof prev.recurrenceRule }))}
          options={[
            { value: "", label: t("schedule.none") },
            { value: "weekly", label: t("schedule.weekly") },
            { value: "biweekly", label: t("schedule.biweekly") },
            { value: "monthly", label: t("schedule.monthly") },
          ]}
        />

        {form.recurrenceRule && (
          <FormInput
            label={t("schedule.endDate")}
            value={form.recurrenceEndDate}
            onChange={(v) => setForm((prev) => ({ ...prev, recurrenceEndDate: v }))}
            type="date"
          />
        )}

        {/* Validation error */}
        {formError && (
          <div className="mb-3 rounded-[10px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {t("schedule.formError")}
          </div>
        )}

        {/* Save button */}
        <ButtonPrimary
          onClick={handleSaveJob}
          icon={<CheckIcon size={16} />}
        >
          {t("schedule.saveJob")}
        </ButtonPrimary>
      </Modal>

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        open={invoiceModalJob !== null}
        onClose={() => setInvoiceModalJob(null)}
        job={invoiceModalJob ? jobs.find((j) => j.id === invoiceModalJob) ?? null : null}
        client={
          invoiceModalJob
            ? CLIENTS.find(
                (c) => c.id === jobs.find((j) => j.id === invoiceModalJob)?.clientId
              ) ?? null
            : null
        }
        onSend={handleSendInvoice}
      />
    </div>
  );
}

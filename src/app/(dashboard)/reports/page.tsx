"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary } from "@/components/ui/button";
import { PrinterIcon } from "@/components/icons";
import { AddressLink } from "@/components/ui/address-link";
import { BUSINESS_TYPES } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";
import { useData } from "@/lib/data-context";
import type { TranslationKey } from "@/lib/i18n";
import type { Employee, Client, Job, TimeEntry, Expense, ExpenseCategory } from "@/types";

type ReportTab = "clients" | "revenue" | "hours" | "profitloss";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("clients");
  const { t } = useLanguage();
  const { clients, jobs, employees, timeEntries, expenses, expenseCategories } = useData();

  const handlePrint = () => {
    window.print();
  };

  const tabs: { id: ReportTab; labelKey: TranslationKey }[] = [
    { id: "clients", labelKey: "reports.clientsTab" },
    { id: "revenue", labelKey: "reports.revenueTab" },
    { id: "hours", labelKey: "reports.employeeHoursTab" },
    { id: "profitloss", labelKey: "reports.profitLossTab" },
  ];

  const generatedDate = new Date().toLocaleDateString();

  return (
    <div>
      <PageHeader
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
        action={
          <ButtonPrimary onClick={handlePrint}>
            <PrinterIcon size={16} />
            {t("reports.printSavePdf")}
          </ButtonPrimary>
        }
      />

      {/* Tab bar — hidden during print */}
      <div className="no-print mb-6 flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`cursor-pointer rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {t(tab.labelKey)}
          </button>
        ))}
      </div>

      {/* Report content — this is what prints */}
      <div className="print-report">
        {activeTab === "clients" && (
          <ClientReport generatedDate={generatedDate} clients={clients} />
        )}
        {activeTab === "revenue" && (
          <RevenueReport generatedDate={generatedDate} clients={clients} jobs={jobs} />
        )}
        {activeTab === "hours" && (
          <EmployeeHoursReport generatedDate={generatedDate} employees={employees} timeEntries={timeEntries} />
        )}
        {activeTab === "profitloss" && (
          <ProfitLossReport generatedDate={generatedDate} jobs={jobs} expenses={expenses} expenseCategories={expenseCategories} />
        )}
      </div>
    </div>
  );
}

/* ────────────────────────── Client Report ────────────────────────── */

function ClientReport({ generatedDate, clients }: { generatedDate: string; clients: Client[] }) {
  const { t } = useLanguage();

  return (
    <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t("reports.clientInfoReport")}</h2>
        <span className="font-body text-xs text-gray-400">
          {t("reports.generatedOn", { date: generatedDate })}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#F0F2F5]">
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.property")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.contact")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.address")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("settings.phone")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.service")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.frequency")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.payment")}
              </th>
              <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.serviceRate")}
              </th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => {
              const bt = BUSINESS_TYPES.find(
                (b) => b.id === client.serviceType
              );
              return (
                <tr
                  key={client.id}
                  className="border-b border-[#F0F2F5] last:border-0"
                >
                  <td className="px-4 py-3 text-sm font-semibold">
                    {client.name}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {client.contact}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {client.address && <AddressLink address={client.address} />}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {client.phone}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {bt ? `${bt.emoji} ${t(`businessType.${bt.id}` as TranslationKey)}` : "—"}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {client.frequency}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {client.paymentMethod}
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-semibold">
                    {client.serviceRate
                      ? `$${client.serviceRate}/${(client.serviceRateType ?? "flat") === "hourly" ? t("clients.perHour") : t("clients.perVisit")}`
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ────────────────────────── Revenue Report ────────────────────────── */

function RevenueReport({ generatedDate, clients, jobs }: { generatedDate: string; clients: Client[]; jobs: Job[] }) {
  const { t } = useLanguage();

  const totalRevenue = jobs.reduce((sum, j) => sum + j.amount, 0);
  const paidAmount = jobs.filter((j) => j.paymentStatus === "paid").reduce(
    (sum, j) => sum + j.amount,
    0
  );
  const pendingAmount = totalRevenue - paidAmount;

  // Group by client
  const clientRevenue = clients.map((client) => {
    const clientJobs = jobs.filter((j) => j.clientId === client.id);
    const total = clientJobs.reduce((sum, j) => sum + j.amount, 0);
    const paid = clientJobs.filter((j) => j.paymentStatus === "paid").reduce(
      (sum, j) => sum + j.amount,
      0
    );
    return {
      client,
      jobCount: clientJobs.length,
      total,
      paid,
      pending: total - paid,
    };
  }).filter((cr) => cr.jobCount > 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("reports.totalRevenue")}
          </div>
          <div className="mt-1 text-2xl font-bold">
            ${totalRevenue.toLocaleString()}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-green-500">
            {t("reports.paid")}
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            ${paidAmount.toLocaleString()}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-amber-500">
            {t("reports.pending")}
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            ${pendingAmount.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Revenue by client table */}
      <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {t("reports.monthlyRevenueReport")}
          </h2>
          <span className="font-body text-xs text-gray-400">
            {t("reports.generatedOn", { date: generatedDate })}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F0F2F5]">
                <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("payments.clientCol")}
                </th>
                <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("reports.jobCount")}
                </th>
                <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("reports.totalAmount")}
                </th>
                <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("reports.paid")}
                </th>
                <th className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("reports.pending")}
                </th>
              </tr>
            </thead>
            <tbody>
              {clientRevenue.map((cr) => (
                <tr
                  key={cr.client.id}
                  className="border-b border-[#F0F2F5] last:border-0"
                >
                  <td className="px-4 py-3 text-sm font-semibold">
                    {cr.client.name}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-gray-500">
                    {cr.jobCount}
                  </td>
                  <td className="px-4 py-3 font-body text-sm font-semibold">
                    ${cr.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-green-600">
                    ${cr.paid.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-body text-sm text-amber-600">
                    ${cr.pending.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#F0F2F5] font-bold">
                <td className="px-4 py-3 text-sm">{t("reports.totalRevenue")}</td>
                <td className="px-4 py-3 text-sm">
                  {clientRevenue.reduce((s, cr) => s + cr.jobCount, 0)}
                </td>
                <td className="px-4 py-3 text-sm">
                  ${totalRevenue.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-green-600">
                  ${paidAmount.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-amber-600">
                  ${pendingAmount.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Employee Hours Report ────────────────────────── */

// Format employee rate for display in reports
function formatEmpRate(emp: Employee, perJobLabel: string): string {
  if (emp.payType === "perJob") return `$${emp.rate}/${perJobLabel}`;
  return `$${emp.rate}/hr`;
}

function EmployeeHoursReport({ generatedDate, employees, timeEntries }: { generatedDate: string; employees: Employee[]; timeEntries: TimeEntry[] }) {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const showPayroll = !settings.hidePayroll;

  return (
    <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">
          {t("reports.employeeHoursReport")}
        </h2>
        <span className="font-body text-xs text-gray-400">
          {t("reports.generatedOn", { date: generatedDate })}
        </span>
      </div>

      <div className="space-y-6">
        {employees.map((emp) => {
          const entries = timeEntries.filter(
            (te) => te.employeeId === emp.id
          );
          const totalHours = entries.reduce((s, te) => s + te.hours, 0);
          const totalEarnings =
            emp.payType === "perJob" ? null : totalHours * emp.rate;

          return (
            <div key={emp.id}>
              {/* Employee header */}
              <div className="mb-3 flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: emp.color }}
                >
                  {emp.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold">{emp.name}</div>
                  <div className="font-body text-xs text-gray-400">
                    {emp.role}
                    {showPayroll && (
                      <> · {formatEmpRate(emp, t("team.perJob"))}</>
                    )}
                  </div>
                </div>
              </div>

              {entries.length === 0 ? (
                <p className="mb-2 font-body text-xs text-gray-400">
                  {t("reports.noTimeEntries")}
                </p>
              ) : (
                <table className="mb-2 w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F0F2F5]">
                      <th className="px-4 py-2 font-body text-[11px] font-semibold text-gray-500">
                        {t("team.date")}
                      </th>
                      <th className="px-4 py-2 font-body text-[11px] font-semibold text-gray-500">
                        {t("team.clockIn")}
                      </th>
                      <th className="px-4 py-2 font-body text-[11px] font-semibold text-gray-500">
                        {t("team.clockOut")}
                      </th>
                      <th className="px-4 py-2 font-body text-[11px] font-semibold text-gray-500">
                        {t("team.hoursCol")}
                      </th>
                      {showPayroll && (
                        <th className="px-4 py-2 font-body text-[11px] font-semibold text-gray-500">
                          {t("reports.earnings")}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((te) => (
                      <tr
                        key={te.id}
                        className="border-b border-[#F0F2F5] last:border-0"
                      >
                        <td className="px-4 py-2 font-body text-sm text-gray-500">
                          {te.date}
                        </td>
                        <td className="px-4 py-2 font-body text-sm text-gray-500">
                          {te.clockIn}
                        </td>
                        <td className="px-4 py-2 font-body text-sm text-gray-500">
                          {te.clockOut}
                        </td>
                        <td className="px-4 py-2 font-body text-sm font-semibold">
                          {te.hours.toFixed(2)}
                        </td>
                        {showPayroll && (
                          <td className="px-4 py-2 font-body text-sm font-semibold text-green-600">
                            {emp.payType === "perJob"
                              ? "—"
                              : `$${(te.hours * emp.rate).toFixed(2)}`}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-[#F0F2F5]">
                      <td
                        colSpan={3}
                        className="px-4 py-2 text-sm font-bold"
                      >
                        {t("reports.totalHours")}
                      </td>
                      <td className="px-4 py-2 text-sm font-bold">
                        {totalHours.toFixed(2)}
                      </td>
                      {showPayroll && (
                        <td className="px-4 py-2 text-sm font-bold text-green-600">
                          {totalEarnings !== null
                            ? `$${totalEarnings.toFixed(2)}`
                            : "—"}
                        </td>
                      )}
                    </tr>
                  </tfoot>
                </table>
              )}

              {/* Divider between employees (not after last) */}
              <hr className="border-[#F0F2F5]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ────────────────────────── Profit & Loss Report ────────────────────────── */

function ProfitLossReport({
  generatedDate,
  jobs,
  expenses,
  expenseCategories,
}: {
  generatedDate: string;
  jobs: Job[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
}) {
  const { t } = useLanguage();

  const totalRevenue = jobs.reduce((sum, j) => sum + j.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  // Group expenses by category
  const categoryBreakdown = expenseCategories
    .map((cat) => {
      const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { category: cat, total, count: catExpenses.length };
    })
    .filter((cb) => cb.count > 0)
    .sort((a, b) => b.total - a.total);

  // Uncategorized expenses
  const uncategorizedExpenses = expenses.filter((e) => !e.categoryId);
  const uncategorizedTotal = uncategorizedExpenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("reports.totalRevenue")}
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-red-500">
            {t("reports.totalExpenses")}
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("reports.netProfit")}
          </div>
          <div className={`mt-1 text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
            {netProfit < 0 ? "-" : ""}${Math.abs(netProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Profit margin bar */}
      {totalRevenue > 0 && (
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-body text-[11px] font-semibold text-gray-400">
              {t("reports.profitMargin")}
            </span>
            <span className={`text-sm font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {((netProfit / totalRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className={`h-full rounded-full transition-all ${netProfit >= 0 ? "bg-green-500" : "bg-red-500"}`}
              style={{ width: `${Math.min(Math.max((netProfit / totalRevenue) * 100, 0), 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Expense breakdown by category */}
      <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{t("reports.expensesByCategory")}</h2>
          <span className="font-body text-xs text-gray-400">
            {t("reports.generatedOn", { date: generatedDate })}
          </span>
        </div>

        {categoryBreakdown.length === 0 && uncategorizedTotal === 0 ? (
          <p className="py-4 text-center font-body text-sm text-gray-400">
            {t("reports.noExpensesYet")}
          </p>
        ) : (
          <div className="space-y-3">
            {categoryBreakdown.map((cb) => {
              const pct = totalExpenses > 0 ? (cb.total / totalExpenses) * 100 : 0;
              return (
                <div key={cb.category.id}>
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: cb.category.color }}
                      />
                      <span className="text-sm font-semibold">{cb.category.name}</span>
                      <span className="font-body text-[11px] text-gray-400">
                        ({cb.count} {cb.count === 1 ? t("reports.expenseSingular") : t("reports.expensePlural")})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-red-600">
                      ${cb.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: cb.category.color }}
                    />
                  </div>
                </div>
              );
            })}
            {uncategorizedTotal > 0 && (
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                    <span className="text-sm font-semibold">{t("reports.uncategorized")}</span>
                    <span className="font-body text-[11px] text-gray-400">
                      ({uncategorizedExpenses.length})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-red-600">
                    ${uncategorizedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-gray-400"
                    style={{ width: `${totalExpenses > 0 ? (uncategorizedTotal / totalExpenses) * 100 : 0}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

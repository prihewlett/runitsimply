"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { Modal } from "@/components/ui/modal";
import { DollarIcon, CheckIcon, SendIcon } from "@/components/icons";
import { PAYMENT_INFO, BUSINESS_TYPES } from "@/lib/data";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import type { PaymentMethod } from "@/types";
import { useLanguage } from "@/lib/language-context";
import { SendInvoiceModal } from "@/components/send-invoice-modal";
import { AddressLink } from "@/components/ui/address-link";

export default function PaymentsPage() {
  const [filter, setFilter] = useState<"all" | "pending" | "paid">("all");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [recorded, setRecorded] = useState(false);
  const [invoiceModalJob, setInvoiceModalJob] = useState<string | null>(null);
  const [invoiceSentToast, setInvoiceSentToast] = useState(false);
  const { t } = useLanguage();
  const { clients, jobs, setJobs } = useData();
  const { isOwner } = useAuth();
  const { isReadOnly } = useSettings();

  const paymentMethodLabel = (method: string) => {
    const map: Record<string, string> = {
      Venmo: t("payments.venmo"),
      Zelle: t("payments.zelle"),
      "Credit Card": t("payments.creditCard"),
      Cash: t("payments.cash"),
      Check: t("payments.check"),
    };
    return map[method] ?? method;
  };

  const invoices = jobs.map((job) => {
    const client = clients.find((c) => c.id === job.clientId);
    return { ...job, client };
  });

  const filtered = invoices.filter((inv) => {
    if (filter === "pending") return inv.paymentStatus === "pending";
    if (filter === "paid") return inv.paymentStatus === "paid";
    return true;
  });

  const totalRevenue = jobs.reduce((s, j) => s + j.amount, 0);
  const collected = jobs.filter((j) => j.paymentStatus === "paid").reduce(
    (s, j) => s + j.amount,
    0
  );
  const pending = jobs.filter((j) => j.paymentStatus === "pending").reduce(
    (s, j) => s + j.amount,
    0
  );

  const selectedInvoice = selectedJob
    ? invoices.find((inv) => inv.id === selectedJob)
    : null;

  const filterLabels = {
    all: t("payments.all"),
    pending: t("payments.pendingTab"),
    paid: t("payments.paidTab"),
  };

  const handleCollectPayment = (method: PaymentMethod) => {
    if (selectedJob === null) return;
    setJobs((prev) =>
      prev.map((j) =>
        j.id === selectedJob
          ? { ...j, paymentStatus: "paid" as const, paymentVia: method }
          : j
      )
    );
    setSelectedJob(null);
    setRecorded(true);
    setTimeout(() => setRecorded(false), 2500);
  };

  const handleSendInvoice = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, invoiceSentAt: new Date().toISOString() }
          : j
      )
    );
    setInvoiceModalJob(null);
    setInvoiceSentToast(true);
    setTimeout(() => setInvoiceSentToast(false), 2500);
  };

  return (
    <div>
      <PageHeader
        title={t("payments.title")}
        subtitle={t("payments.subtitle")}
      />

      {/* Payment recorded toast */}
      {recorded && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckIcon size={16} />
          {t("payments.recorded")}
        </div>
      )}

      {/* Invoice sent toast */}
      {invoiceSentToast && (
        <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-[10px] bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700">
          <CheckIcon size={16} />
          {t("invoice.invoiceSentSuccess")}
        </div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<DollarIcon />}
          label={t("payments.totalRevenue")}
          value={`$${totalRevenue.toLocaleString()}`}
          subtitle={t("kpi.thisWeek")}
          accentColor="#2563EB"
        />
        <StatCard
          icon={<CheckIcon size={20} />}
          label={t("payments.collected")}
          value={`$${collected.toLocaleString()}`}
          subtitle={t("payments.invoicesCount", { count: jobs.filter((j) => j.paymentStatus === "paid").length })}
          accentColor="#059669"
        />
        <StatCard
          icon={<DollarIcon />}
          label={t("payments.pending")}
          value={`$${pending.toLocaleString()}`}
          subtitle={t("payments.invoicesCount", { count: jobs.filter((j) => j.paymentStatus === "pending").length })}
          accentColor="#D97706"
        />
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-1">
        {(["all", "pending", "paid"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
              filter === f
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {filterLabels[f]} ({f === "all"
              ? invoices.length
              : invoices.filter((i) =>
                  f === "pending"
                    ? i.paymentStatus === "pending"
                    : i.paymentStatus === "paid"
                ).length
            })
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="overflow-x-auto rounded-[14px] border border-[#F0F2F5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#FAFBFD]">
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("payments.invoiceCol")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("payments.clientCol")}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-body text-[11px] font-semibold text-gray-500 md:table-cell">
                {t("payments.dateCol")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("payments.amountCol")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("payments.statusCol")}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-body text-[11px] font-semibold text-gray-500 lg:table-cell">
                {t("payments.methodCol")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const bt = BUSINESS_TYPES.find(
                (b) => b.id === inv.client?.serviceType
              );
              return (
                <tr
                  key={inv.id}
                  className="cursor-pointer border-t border-[#F0F2F5] transition-colors hover:bg-blue-50/30"
                  onClick={() => setSelectedJob(inv.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedJob(inv.id); } }}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-gray-500">
                      INV-{inv.id.slice(-8).toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{bt?.emoji}</span>
                      <span className="font-semibold">
                        {inv.client?.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 font-body text-xs text-gray-500 md:table-cell">
                    {inv.date} &middot; {inv.time}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold">
                    ${inv.amount}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{
                        background:
                          inv.paymentStatus === "paid"
                            ? "#ECFDF5"
                            : "#FFFBEB",
                        color:
                          inv.paymentStatus === "paid"
                            ? "#059669"
                            : "#D97706",
                      }}
                    >
                      {inv.paymentStatus}
                    </span>
                    {inv.invoiceSentAt && inv.paymentStatus === "pending" && (
                      <span className="ml-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                        {t("invoice.invoiceSent")}
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {inv.paymentVia ? (
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        style={{
                          background:
                            PAYMENT_INFO[inv.paymentVia as PaymentMethod].bg,
                          color:
                            PAYMENT_INFO[inv.paymentVia as PaymentMethod].color,
                        }}
                      >
                        {PAYMENT_INFO[inv.paymentVia as PaymentMethod].icon}{" "}
                        {paymentMethodLabel(inv.paymentVia!)}
                      </span>
                    ) : (
                      <span className="font-body text-xs text-gray-300">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Invoice detail modal */}
      <Modal
        open={selectedJob !== null}
        onClose={() => setSelectedJob(null)}
        title={`Invoice INV-${(selectedInvoice?.id ?? "").slice(-8).toUpperCase()}`}
      >
        {selectedInvoice && (
          <div>
            <div className="mb-5 rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">
                    {selectedInvoice.client?.name}
                  </div>
                  <div className="font-body text-xs text-gray-500">
                    {selectedInvoice.client?.contact} &middot;{" "}
                    {selectedInvoice.client?.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold">
                    ${selectedInvoice.amount}
                  </div>
                  <span
                    className="inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{
                      background:
                        selectedInvoice.paymentStatus === "paid"
                          ? "#ECFDF5"
                          : "#FFFBEB",
                      color:
                        selectedInvoice.paymentStatus === "paid"
                          ? "#059669"
                          : "#D97706",
                    }}
                  >
                    {selectedInvoice.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="font-body text-[11px] font-semibold text-gray-400">
                    {t("payments.dateCol")}
                  </div>
                  <div>{selectedInvoice.date}</div>
                </div>
                <div>
                  <div className="font-body text-[11px] font-semibold text-gray-400">
                    {t("payments.time")}
                  </div>
                  <div>{selectedInvoice.time}</div>
                </div>
                <div>
                  <div className="font-body text-[11px] font-semibold text-gray-400">
                    {t("payments.duration")}
                  </div>
                  <div>{t("payments.hours", { count: selectedInvoice.duration })}</div>
                </div>
                <div>
                  <div className="font-body text-[11px] font-semibold text-gray-400">
                    {t("clients.address")}
                  </div>
                  <div className="text-xs">
                    {selectedInvoice.client?.address && <AddressLink address={selectedInvoice.client.address} />}
                  </div>
                </div>
              </div>
            </div>

            {/* Send Invoice button for pending invoices (owner only) */}
            {isOwner && !isReadOnly && selectedInvoice.paymentStatus === "pending" && (
              <div className="mb-4">
                <button
                  onClick={() => {
                    setInvoiceModalJob(selectedInvoice.id);
                    setSelectedJob(null);
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  <SendIcon size={16} />
                  {selectedInvoice.invoiceSentAt
                    ? t("invoice.resendInvoice")
                    : t("invoice.sendInvoice")}
                </button>
                {selectedInvoice.invoiceSentAt && (
                  <div className="mt-1 text-center font-body text-[11px] text-gray-400">
                    {t("invoice.invoiceSentAt", {
                      date: new Date(selectedInvoice.invoiceSentAt).toLocaleDateString(),
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Payment actions for pending invoices */}
            {!isReadOnly && selectedInvoice.paymentStatus === "pending" && (
              <div>
                <h4 className="mb-2 text-sm font-bold">{t("payments.collectPayment")}</h4>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    ["Venmo", "Zelle", "Credit Card", "Cash", "Check"] as const
                  ).map((method) => {
                    const pi = PAYMENT_INFO[method];
                    return (
                      <button
                        key={method}
                        onClick={() => handleCollectPayment(method)}
                        className="flex cursor-pointer items-center gap-2 rounded-[10px] border border-[#F0F2F5] p-3 text-left transition-colors hover:bg-gray-50"
                      >
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                          style={{ background: pi.bg, color: pi.color }}
                        >
                          {pi.icon}
                        </span>
                        <div>
                          <div className="text-xs font-semibold">
                            {paymentMethodLabel(method)}
                          </div>
                          <div className="font-body text-[10px] text-gray-400">
                            {t("payments.markAsPaid")}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment info for paid invoices */}
            {selectedInvoice.paymentStatus === "paid" &&
              selectedInvoice.paymentVia && (
                <div className="flex items-center gap-2 rounded-[10px] bg-emerald-50 p-3">
                  <span className="text-emerald-600">
                    <CheckIcon size={18} />
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-emerald-700">
                      {t("payments.paymentReceived")}
                    </div>
                    <div className="font-body text-xs text-emerald-600">
                      {t("payments.paidVia", { method: selectedInvoice.paymentVia })}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Send Invoice Modal */}
      <SendInvoiceModal
        open={invoiceModalJob !== null}
        onClose={() => setInvoiceModalJob(null)}
        job={invoiceModalJob ? jobs.find((j) => j.id === invoiceModalJob) ?? null : null}
        client={
          invoiceModalJob
            ? clients.find(
                (c) => c.id === jobs.find((j) => j.id === invoiceModalJob)?.clientId
              ) ?? null
            : null
        }
        onSend={handleSendInvoice}
      />
    </div>
  );
}

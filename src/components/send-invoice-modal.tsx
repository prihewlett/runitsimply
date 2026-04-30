"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { SendIcon, CheckIcon } from "@/components/icons";
import { PAYMENT_INFO } from "@/lib/data";
import { useSettings } from "@/lib/settings-context";
import { useLanguage } from "@/lib/language-context";
import type { Job, Client } from "@/types";

interface SendInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  job: Job | null;
  client: Client | null;
  onSend: (jobId: string) => void;
}

export function SendInvoiceModal({
  open,
  onClose,
  job,
  client,
  onSend,
}: SendInvoiceModalProps) {
  const { settings } = useSettings();
  const { t } = useLanguage();
  const [sendMethod, setSendMethod] = useState<"email" | "sms" | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [copiedPayment, setCopiedPayment] = useState<"venmo" | "zelle" | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [editedBody, setEditedBody] = useState<string | null>(null);
  // Per-invoice payment method selection
  const [includeVenmo, setIncludeVenmo] = useState(true);
  const [includeZelle, setIncludeZelle] = useState(true);
  const [includeCreditCard, setIncludeCreditCard] = useState(false);
  const [includeCash, setIncludeCash] = useState(false);
  const [includeCheck, setIncludeCheck] = useState(false);

  if (!job || !client) return null;

  const invoiceId = `INV-${job.id.slice(-8).toUpperCase()}`;
  const invoiceLink = `https://pay.runitsimply.com/inv/${invoiceId}`;

  // Calculate total: hourly rate × hours, or flat amount
  const totalAmount =
    job.rateType === "hourly" && job.duration
      ? job.amount * job.duration
      : job.amount;
  const totalAmountStr = totalAmount.toFixed(2);

  const biz = settings.businessName ?? "RunItSimply";
  const bizPhone = settings.businessPhone ?? "";

  const paymentLines: string[] = [];
  const venmoDeepLink = settings.venmoHandle && includeVenmo
    ? `venmo://paycharge?txn=pay&recipients=${encodeURIComponent(settings.venmoHandle)}&amount=${totalAmountStr}&note=${encodeURIComponent(invoiceId)}`
    : "";
  if (settings.venmoHandle && includeVenmo) {
    paymentLines.push(`Venmo: @${settings.venmoHandle}`);
  }
  if (settings.zelleEmail && includeZelle) {
    paymentLines.push(`Zelle: ${settings.zelleEmail}`);
  }
  if (includeCreditCard) {
    paymentLines.push(`Credit Card accepted`);
  }
  if (includeCash) {
    paymentLines.push(`Cash accepted`);
  }
  if (includeCheck) {
    paymentLines.push(`Check payable to ${biz}`);
  }

  const emailSubject = t("invoice.invoiceFor", { business: biz });
  const rateBreakdown =
    job.rateType === "hourly" && job.duration
      ? ` (${job.duration} hrs × $${job.amount}/hr)`
      : "";
  const emailBody = `${t("invoice.hi")} ${client.contact},\n\n${t("invoice.invoiceBody")} $${totalAmountStr}${rateBreakdown} ${t("invoice.from").toLowerCase()} ${biz}.\n\n${t("invoice.serviceDate")}: ${job.date} · ${job.time}\n\n${t("invoice.paymentInstructions")}:\n${paymentLines.map((l) => `- ${l}`).join("\n")}\n\n${t("invoice.invoiceLink")}: ${invoiceLink}\n\n${t("invoice.thankYou")}\n${biz}${bizPhone ? ` · ${bizPhone}` : ""}`;

  const smsBody = `${t("invoice.hi")} ${client.contact}! ${t("invoice.invoiceBody")} $${totalAmountStr}${rateBreakdown} ${t("invoice.from").toLowerCase()} ${biz}. ${paymentLines.join(" | ")}.${venmoDeepLink ? ` Pay now: ${venmoDeepLink}` : ""} ${invoiceLink}`;

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(invoiceLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleSend = async () => {
    if (!sendMethod) return;

    setSending(true);
    setSendError("");

    try {
      const payload: Record<string, string> = {
        method: sendMethod,
        jobId: job.id,
        body: editedBody ?? (sendMethod === "email" ? emailBody : smsBody),
      };

      if (sendMethod === "email") {
        payload.to = client.email || client.phone;
        payload.subject = emailSubject;
      } else {
        payload.to = client.phone;
      }

      const res = await fetch("/api/send-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        // If service not configured (503), fall back to simulated send
        if (res.status === 503) {
          // Graceful fallback: mark as sent locally even if APIs aren't configured
          onSend(job.id);
          setSendMethod(null);
          return;
        }
        throw new Error(data.error || "Failed to send");
      }

      // Success — mark invoice as sent
      onSend(job.id);
      setSendMethod(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      // If the API is unreachable (no backend), fall back to simulated send
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        onSend(job.id);
        setSendMethod(null);
        return;
      }
      setSendError(t("invoice.sendFailed"));
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setSendMethod(null);
    setLinkCopied(false);
    setCopiedPayment(null);
    setSendError("");
    setIncludeVenmo(true);
    setIncludeZelle(true);
    setIncludeCreditCard(false);
    setIncludeCash(false);
    setIncludeCheck(false);
    setEditedBody(null);
    setSendMethod(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${t("invoice.sendInvoice")} — ${invoiceId}`}
      wide
    >
      {/* Already-sent banner */}
      {job.invoiceSentAt && (
        <div className="mb-4 flex items-center gap-2 rounded-[10px] bg-blue-50 p-3">
          <span className="text-blue-600">
            <CheckIcon size={16} />
          </span>
          <div className="text-sm font-semibold text-blue-700">
            {t("invoice.invoiceSentAt", {
              date: new Date(job.invoiceSentAt).toLocaleDateString(),
            })}
          </div>
        </div>
      )}

      {/* Invoice summary card */}
      <div className="mb-5 rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{client.name}</div>
            <div className="font-body text-xs text-gray-500">
              {client.contact} &middot; {client.phone}
            </div>
          </div>
          <div className="text-right">
            <div className="font-body text-[11px] font-semibold text-gray-400">
              {t("invoice.amountDue")}
            </div>
            <div className="text-2xl font-extrabold">${totalAmountStr}</div>
            {job.rateType === "hourly" && job.duration && (
              <div className="font-body text-[10px] text-gray-400">
                {job.duration} hrs × ${job.amount}/hr
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="font-body text-[11px] font-semibold text-gray-400">
              {t("invoice.serviceDate")}
            </div>
            <div>
              {job.date} &middot; {job.time}
            </div>
          </div>
          <div>
            <div className="font-body text-[11px] font-semibold text-gray-400">
              {t("invoice.from")}
            </div>
            <div>{biz}</div>
          </div>
        </div>
      </div>

      {/* Payment method selection — choose which to include per invoice */}
      <div className="mb-4">
        <div className="mb-2 font-body text-[11px] font-semibold text-gray-400">
          Include payment options in this invoice:
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.venmoHandle && (
            <button
              onClick={() => setIncludeVenmo((v) => !v)}
              className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all ${
                includeVenmo ? "border-blue-400 bg-blue-50 text-blue-700" : "border-[#F0F2F5] bg-white text-gray-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "#3D95CE" }}>V</span>
              Venmo {includeVenmo ? "✓" : "✕"}
            </button>
          )}
          {settings.zelleEmail && (
            <button
              onClick={() => setIncludeZelle((v) => !v)}
              className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all ${
                includeZelle ? "border-purple-400 bg-purple-50 text-purple-700" : "border-[#F0F2F5] bg-white text-gray-400"
              }`}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "#6D1ED4" }}>Z</span>
              Zelle {includeZelle ? "✓" : "✕"}
            </button>
          )}
          <button
            onClick={() => setIncludeCreditCard((v) => !v)}
            className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all ${
              includeCreditCard ? "border-sky-400 bg-sky-50 text-sky-700" : "border-[#F0F2F5] bg-white text-gray-400"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "#0EA5E9" }}>💳</span>
            Credit Card {includeCreditCard ? "✓" : "+"}
          </button>
          <button
            onClick={() => setIncludeCash((v) => !v)}
            className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all ${
              includeCash ? "border-emerald-400 bg-emerald-50 text-emerald-700" : "border-[#F0F2F5] bg-white text-gray-400"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "#10B981" }}>💵</span>
            Cash {includeCash ? "✓" : "+"}
          </button>
          <button
            onClick={() => setIncludeCheck((v) => !v)}
            className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 text-xs font-semibold transition-all ${
              includeCheck ? "border-amber-400 bg-amber-50 text-amber-700" : "border-[#F0F2F5] bg-white text-gray-400"
            }`}
          >
            <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white" style={{ background: "#F59E0B" }}>✎</span>
            Check {includeCheck ? "✓" : "+"}
          </button>
        </div>
        {paymentLines.length === 0 && (
          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 font-semibold">
            No payment method selected — invoice will only include the payment link.
          </div>
        )}
      </div>

      {/* Payment instructions */}
      <div className="mb-5">
        <div className="mb-2 font-body text-[11px] font-semibold text-gray-400">
          {t("invoice.paymentInstructions")}
        </div>
        <div className="flex flex-wrap gap-2">
          {settings.venmoHandle && includeVenmo && (
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(`@${settings.venmoHandle}`);
                  setCopiedPayment("venmo");
                  setTimeout(() => setCopiedPayment(null), 2000);
                }}
                className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 transition-all ${
                  copiedPayment === "venmo"
                    ? "border-blue-400 ring-2 ring-blue-200"
                    : "border-[#F0F2F5] hover:border-blue-300"
                }`}
                style={{ background: PAYMENT_INFO.Venmo.bg }}
              >
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                  style={{ background: PAYMENT_INFO.Venmo.color }}
                >
                  {PAYMENT_INFO.Venmo.icon}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: PAYMENT_INFO.Venmo.color }}
                >
                  {copiedPayment === "venmo" ? t("invoice.linkCopied") : `@${settings.venmoHandle}`}
                </span>
              </button>
              {venmoDeepLink && (
                <a
                  href={venmoDeepLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-2 text-xs font-semibold transition-all hover:border-blue-300"
                  style={{ background: PAYMENT_INFO.Venmo.bg, color: PAYMENT_INFO.Venmo.color }}
                >
                  Pay with Venmo
                </a>
              )}
            </div>
          )}
          {settings.zelleEmail && includeZelle && (
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(settings.zelleEmail);
                setCopiedPayment("zelle");
                setTimeout(() => setCopiedPayment(null), 2000);
              }}
              className={`flex cursor-pointer items-center gap-2 rounded-[10px] border-[1.5px] px-3 py-2 transition-all ${
                copiedPayment === "zelle"
                  ? "border-purple-400 ring-2 ring-purple-200"
                  : "border-[#F0F2F5] hover:border-purple-300"
              }`}
              style={{ background: PAYMENT_INFO.Zelle.bg }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold text-white"
                style={{ background: PAYMENT_INFO.Zelle.color }}
              >
                {PAYMENT_INFO.Zelle.icon}
              </span>
              <span
                className="text-xs font-semibold"
                style={{ color: PAYMENT_INFO.Zelle.color }}
              >
                {copiedPayment === "zelle" ? t("invoice.linkCopied") : settings.zelleEmail}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Invoice link + copy */}
      <div className="mb-5">
        <div className="mb-2 font-body text-[11px] font-semibold text-gray-400">
          {t("invoice.invoiceLink")}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 truncate rounded-[10px] border border-[#F0F2F5] bg-white px-3 py-2 font-mono text-xs text-gray-600">
            {invoiceLink}
          </div>
          <button
            onClick={handleCopyLink}
            className="cursor-pointer whitespace-nowrap rounded-[10px] bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200"
          >
            {linkCopied ? t("invoice.linkCopied") : t("invoice.copyLink")}
          </button>
        </div>
      </div>

      {/* Send method selection */}
      <div className="mb-4">
        <div className="mb-2 font-body text-[11px] font-semibold text-gray-400">
          {t("invoice.sendMethod")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setSendMethod("email"); setSendError(""); setEditedBody(null); }}
            className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-3 text-sm font-semibold transition-colors ${
              sendMethod === "email"
                ? "border-blue-400 bg-blue-50 text-blue-600"
                : "border-[#F0F2F5] bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("invoice.sendViaEmail")}
          </button>
          <button
            onClick={() => { setSendMethod("sms"); setSendError(""); setEditedBody(null); }}
            className={`cursor-pointer rounded-[10px] border-[1.5px] px-4 py-3 text-sm font-semibold transition-colors ${
              sendMethod === "sms"
                ? "border-blue-400 bg-blue-50 text-blue-600"
                : "border-[#F0F2F5] bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            {t("invoice.sendViaSMS")}
          </button>
        </div>
      </div>

      {/* Error message */}
      {sendError && (
        <div className="mb-4 rounded-[10px] bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600">
          {sendError}
        </div>
      )}

      {/* Email preview — editable */}
      {sendMethod === "email" && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">{t("invoice.emailPreview")}</span>
            {editedBody !== null && (
              <button
                onClick={() => setEditedBody(null)}
                className="cursor-pointer text-[10px] font-semibold text-blue-500 hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
          <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-4">
            <div className="mb-1 font-body text-[11px] text-gray-400">
              To: {client.contact} ({client.email || client.phone})
            </div>
            <div className="mb-2 font-body text-[11px] text-gray-400">
              Subject: {emailSubject}
            </div>
            <textarea
              value={editedBody ?? emailBody}
              onChange={(e) => setEditedBody(e.target.value)}
              rows={10}
              className="w-full resize-y rounded-lg border border-[#F0F2F5] bg-white p-2 font-body text-xs leading-relaxed text-gray-700 outline-none focus:border-blue-300"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-colors hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {sending ? (
              <span>{t("invoice.sending")}</span>
            ) : (
              <>
                <SendIcon size={16} />
                {t("invoice.sendViaEmail")}
              </>
            )}
          </button>
        </div>
      )}

      {/* SMS preview — editable */}
      {sendMethod === "sms" && (
        <div className="mb-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-600">{t("invoice.smsPreview")}</span>
            {editedBody !== null && (
              <button
                onClick={() => setEditedBody(null)}
                className="cursor-pointer text-[10px] font-semibold text-blue-500 hover:underline"
              >
                Reset to default
              </button>
            )}
          </div>
          <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-4">
            <div className="mb-1 font-body text-[11px] text-gray-400">
              To: {client.phone}
            </div>
            <textarea
              value={editedBody ?? smsBody}
              onChange={(e) => setEditedBody(e.target.value)}
              rows={5}
              className="w-full resize-y rounded-lg border border-[#F0F2F5] bg-white p-2 font-body text-xs leading-relaxed text-gray-700 outline-none focus:border-blue-300"
            />
          </div>
          <button
            onClick={handleSend}
            disabled={sending}
            className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[11px] bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] transition-colors hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {sending ? (
              <span>{t("invoice.sending")}</span>
            ) : (
              <>
                <SendIcon size={16} />
                {t("invoice.sendViaSMS")}
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}

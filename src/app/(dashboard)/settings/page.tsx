"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FormInput } from "@/components/ui/form-input";
import { GiftIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import { useSettings } from "@/lib/settings-context";

export default function SettingsPage() {
  const { settings, updateSettings: rawUpdateSettings, isReadOnly } = useSettings();
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateSettings = (partial: Parameters<typeof rawUpdateSettings>[0]) => {
    rawUpdateSettings(partial);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleCopy = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text);
    if (type === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const referralLink = `runitsimply.com/?ref=${settings.referralCode}`;

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <div className="max-w-lg space-y-6">
        {/* Payment Settings */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="mb-1 text-base font-bold">{t("settings.paymentSetup")}</h3>
          <p className="mb-4 font-body text-xs text-gray-400">
            {t("settings.paymentSetupDesc")}
          </p>
          <FormInput
            label={t("settings.venmoHandle")}
            value={settings.venmoHandle}
            onChange={(v) => updateSettings({ venmoHandle: v })}
            placeholder="@YourBusiness"
            disabled={isReadOnly}
          />
          <FormInput
            label={t("settings.zelleEmail")}
            value={settings.zelleEmail}
            onChange={(v) => updateSettings({ zelleEmail: v })}
            placeholder="pay@yourbusiness.com"
            disabled={isReadOnly}
          />
          <div className="mt-4 flex items-center gap-3">
            <div
              className="flex h-5 w-9 cursor-pointer items-center rounded-full px-0.5 transition-colors"
              role="switch"
              aria-checked={settings.stripeConnected}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateSettings({ stripeConnected: !settings.stripeConnected }); } }}
              style={{
                background: settings.stripeConnected ? "#2563EB" : "#E5E7EB",
              }}
              onClick={() => !isReadOnly &&
                updateSettings({ stripeConnected: !settings.stripeConnected })
              }
            >
              <div
                className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings.stripeConnected
                    ? "translateX(16px)"
                    : "translateX(0)",
                }}
              />
            </div>
            <span className="font-body text-sm text-gray-600">
              {t("settings.stripeAutoCharge")}{" "}
              <span className="text-xs text-gray-400">
                ({settings.stripeConnected ? t("settings.connected") : t("settings.notConnected")})
              </span>
            </span>
          </div>
        </div>

        {/* Employee Hour Logging */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="mb-1 text-base font-bold">{t("settings.employeeLogging")}</h3>
          <p className="mb-4 font-body text-xs text-gray-400">
            {t("settings.employeeSelfLogDesc")}
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-5 w-9 cursor-pointer items-center rounded-full px-0.5 transition-colors"
              role="switch"
              aria-checked={settings.employeeSelfLog}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateSettings({ employeeSelfLog: !settings.employeeSelfLog }); } }}
              style={{
                background: settings.employeeSelfLog ? "#2563EB" : "#E5E7EB",
              }}
              onClick={() => !isReadOnly &&
                updateSettings({ employeeSelfLog: !settings.employeeSelfLog })
              }
            >
              <div
                className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings.employeeSelfLog
                    ? "translateX(16px)"
                    : "translateX(0)",
                }}
              />
            </div>
            <span className="font-body text-sm text-gray-600">
              {t("settings.employeeSelfLog")}{" "}
              <span className="text-xs text-gray-400">
                ({settings.employeeSelfLog ? t("settings.enabled") : t("settings.disabled")})
              </span>
            </span>
          </div>
        </div>

        {/* Payroll Privacy */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="mb-1 text-base font-bold">{t("settings.payrollPrivacy")}</h3>
          <p className="mb-4 font-body text-xs text-gray-400">
            {t("settings.payrollPrivacyDesc")}
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex h-5 w-9 cursor-pointer items-center rounded-full px-0.5 transition-colors"
              role="switch"
              aria-checked={settings.hidePayroll}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); updateSettings({ hidePayroll: !settings.hidePayroll }); } }}
              style={{
                background: settings.hidePayroll ? "#2563EB" : "#E5E7EB",
              }}
              onClick={() => !isReadOnly &&
                updateSettings({ hidePayroll: !settings.hidePayroll })
              }
            >
              <div
                className="h-4 w-4 rounded-full bg-white shadow-sm transition-transform"
                style={{
                  transform: settings.hidePayroll
                    ? "translateX(16px)"
                    : "translateX(0)",
                }}
              />
            </div>
            <span className="font-body text-sm text-gray-600">
              {t("settings.payrollPrivacy")}{" "}
              <span className="text-xs text-gray-400">
                ({settings.hidePayroll ? t("settings.enabled") : t("settings.disabled")})
              </span>
            </span>
          </div>
        </div>

        {/* Referral Program */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-purple-500">
              <GiftIcon size={18} />
            </span>
            <h3 className="text-base font-bold">{t("settings.referralProgram")}</h3>
          </div>
          <p className="mb-5 font-body text-xs text-gray-400">
            {t("settings.referralDesc")}
          </p>

          {/* Referral code */}
          <div className="mb-4">
            <label className="mb-1.5 block font-body text-[11px] font-semibold text-gray-400">
              {t("settings.yourReferralCode")}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] px-4 py-2.5">
                <span className="text-lg font-bold tracking-wider text-purple-600">
                  {settings.referralCode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(settings.referralCode, "code")}
                className="cursor-pointer rounded-[10px] bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100"
              >
                {copiedCode ? t("settings.codeCopied") : t("settings.copyCode")}
              </button>
            </div>
          </div>

          {/* Share link */}
          <div className="mb-5">
            <label className="mb-1.5 block font-body text-[11px] font-semibold text-gray-400">
              {t("settings.shareLink")}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 truncate rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] px-4 py-2.5 font-body text-sm text-gray-500">
                {referralLink}
              </div>
              <button
                onClick={() => handleCopy(referralLink, "link")}
                className="cursor-pointer rounded-[10px] bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-purple-100"
              >
                {copiedLink ? t("settings.codeCopied") : t("settings.copyCode")}
              </button>
            </div>
          </div>

          {/* Stats */}
          <label className="mb-1.5 block font-body text-[11px] font-semibold text-gray-400">
            {t("settings.referralStats")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-3 text-center">
              <div className="text-2xl font-bold text-purple-600">{settings.referralsCount}</div>
              <div className="font-body text-[11px] text-gray-400">
                {t("settings.totalReferrals")}
              </div>
            </div>
            <div className="rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-3 text-center">
              <div className="text-2xl font-bold text-green-600">${settings.referralCredit}</div>
              <div className="font-body text-[11px] text-gray-400">
                {t("settings.creditEarned")}
              </div>
            </div>
          </div>
        </div>

        {/* Business Info */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <h3 className="mb-1 text-base font-bold">{t("settings.businessInfo")}</h3>
          <p className="mb-4 font-body text-xs text-gray-400">
            {t("settings.businessInfoDesc")}
          </p>
          <FormInput
            label={t("settings.businessName")}
            value={settings.businessName ?? "RunItSimply"}
            onChange={(v) => updateSettings({ businessName: v })}
            placeholder="Your Business Name"
            disabled={isReadOnly}
          />
          <FormInput
            label={t("settings.phone")}
            value={settings.businessPhone ?? "(555) 123-4567"}
            onChange={(v) => updateSettings({ businessPhone: v })}
            placeholder="(555) 000-0000"
            disabled={isReadOnly}
          />
          <FormInput
            label={t("settings.email")}
            value={settings.businessEmail ?? "hello@runitsimply.com"}
            onChange={(v) => updateSettings({ businessEmail: v })}
            placeholder="hello@yourbusiness.com"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Saved toast */}
      {saved && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("settings.saved")}
        </div>
      )}
    </div>
  );
}

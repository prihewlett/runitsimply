"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { MessageIcon, SendIcon, CheckIcon } from "@/components/icons";

export function Footer() {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError(true);
      return;
    }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 1200);
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
    setError(false);
  };

  return (
    <footer>
      {/* ── Contact Form Section ── */}
      <div className="border-t border-[#F0F2F5] bg-[#FAFBFD]">
        <div className="mx-auto max-w-[1060px] px-10 py-[50px]">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Left column: info */}
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
                <MessageIcon size={22} />
              </div>
              <h3 className="mb-2 text-2xl font-extrabold tracking-tight text-[#1A1D26]">
                {t("footer.contactTitle")}
              </h3>
              <p className="font-body text-sm leading-relaxed text-gray-500">
                {t("footer.contactSubtitle")}
              </p>
            </div>

            {/* Right column: form card */}
            <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              {!submitted ? (
                <form onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className="mb-3">
                    <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                      {t("footer.nameLabel")}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("footer.namePlaceholder")}
                      className="w-full rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-2 font-body text-sm outline-none transition-colors focus:border-blue-600"
                    />
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                      {t("footer.emailLabel")}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("footer.emailPlaceholder")}
                      className="w-full rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-2 font-body text-sm outline-none transition-colors focus:border-blue-600"
                    />
                  </div>

                  {/* Message */}
                  <div className="mb-3">
                    <label className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                      {t("footer.messageLabel")}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={t("footer.messagePlaceholder")}
                      rows={4}
                      className="w-full resize-none rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-2 font-body text-sm outline-none transition-colors focus:border-blue-600"
                    />
                  </div>

                  {/* Validation error */}
                  {error && (
                    <p className="mb-3 font-body text-xs text-red-500">
                      {t("footer.required")}
                    </p>
                  )}

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={sending}
                    className="flex w-full items-center justify-center gap-2 rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
                  >
                    {sending ? t("footer.sending") : t("footer.send")}
                    {!sending && <SendIcon size={16} />}
                  </button>
                </form>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckIcon size={24} />
                  </div>
                  <h4 className="mb-1 text-lg font-bold text-[#1A1D26]">
                    {t("footer.successTitle")}
                  </h4>
                  <p className="mb-5 font-body text-sm text-gray-500">
                    {t("footer.successMessage")}
                  </p>
                  <button
                    onClick={handleReset}
                    className="cursor-pointer font-body text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {t("footer.sendAnother")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar: logo + copyright ── */}
      <div className="flex items-center justify-between border-t border-[#F0F2F5] px-10 py-8">
        <div className="flex items-center gap-2">
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-md bg-gradient-to-br from-blue-600 to-purple-600 text-[11px] font-extrabold text-white">
            R
          </div>
          <span className="text-sm font-bold">RunItSimply</span>
        </div>
        <div className="font-body text-xs text-gray-400">
          {t("footer.copyright")}
        </div>
      </div>
    </footer>
  );
}

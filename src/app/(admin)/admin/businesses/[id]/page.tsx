"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { ButtonPrimary, ButtonSecondary } from "@/components/ui/button";
import { UserIcon, HomeIcon, CalendarIcon, ChevronLeftIcon, GiftIcon } from "@/components/icons";

interface SubscriptionPayment {
  id: string;
  amount: number;
  paymentMethod: string;
  status: string;
  periodStart: string | null;
  periodEnd: string | null;
  stripeInvoiceId: string | null;
  referenceNote: string;
  recordedBy: string;
  createdAt: string;
}

interface BusinessDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  venmoHandle: string;
  zelleEmail: string;
  stripeConnected: boolean;
  stripeCustomerId: string | null;
  subscriptionStatus: string;
  trialEndsAt: string | null;
  smsRemindersEnabled: boolean;
  referralCode: string;
  referralsCount: number;
  referralCredit: number;
  referredBy: string | null;
  referralCredited: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OwnerInfo {
  id: string;
  fullName: string;
  email: string | null;
}

interface ReferralBusiness {
  id: string;
  name: string;
  subscriptionStatus: string;
  createdAt: string;
}

interface BusinessData {
  business: BusinessDetail;
  owner: OwnerInfo | null;
  counts: { clients: number; employees: number; jobs: number };
  referrer: { id: string; name: string | null } | null;
  referrals: ReferralBusiness[];
  payments: SubscriptionPayment[];
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: "#ECFDF5", color: "#059669", label: "Active" },
  trial: { bg: "#EFF6FF", color: "#2563EB", label: "Trial" },
  expired: { bg: "#FEF2F2", color: "#DC2626", label: "Expired" },
  cancelled: { bg: "#FFF7ED", color: "#EA580C", label: "Cancelled" },
};

const PAYMENT_METHOD_COLORS: Record<string, { bg: string; color: string }> = {
  stripe: { bg: "#E0F2FE", color: "#0369A1" },
  venmo: { bg: "#E8F5FE", color: "#008CFF" },
  zelle: { bg: "#F3E8FF", color: "#6D28D9" },
  other: { bg: "#F3F4F6", color: "#6B7280" },
};

export default function BusinessDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<BusinessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Modal state
  const [showRecordPayment, setShowRecordPayment] = useState(false);
  const [showSendRequest, setShowSendRequest] = useState(false);

  // Record payment form
  const [payMethod, setPayMethod] = useState<"venmo" | "zelle" | "other">("venmo");
  const [payAmount, setPayAmount] = useState("19.99");
  const [payNote, setPayNote] = useState("");
  const [payActivate, setPayActivate] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  // Send request form
  const [sendMethod, setSendMethod] = useState<"sms" | "email">("sms");
  const [sendLoading, setSendLoading] = useState(false);

  // Edit business info
  const [editing, setEditing] = useState(false);
  const [editFields, setEditFields] = useState({ name: "", email: "", phone: "", venmoHandle: "", zelleEmail: "", smsRemindersEnabled: false });
  const [editLoading, setEditLoading] = useState(false);

  const fetchBusiness = (showLoader = true) => {
    if (showLoader) setLoading(true);
    fetch(`/api/admin/businesses/${id}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubscriptionAction = async (action: "activate" | "deactivate") => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/activate-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: id, action }),
      });
      const result = await res.json();
      if (result.success) {
        setToast(`Subscription ${action === "activate" ? "activated" : "deactivated"}`);
        setTimeout(() => setToast(""), 3000);
        fetchBusiness(false);
      }
    } catch {
      setToast("Action failed");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordPayment = async () => {
    setPayLoading(true);
    try {
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split("T")[0];

      const res = await fetch("/api/admin/payments/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: id,
          amount: parseFloat(payAmount) || 19.99,
          paymentMethod: payMethod,
          periodStart,
          periodEnd,
          referenceNote: payNote,
          activateSubscription: payActivate,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setToast("Payment recorded!");
        setTimeout(() => setToast(""), 3000);
        setShowRecordPayment(false);
        setPayNote("");
        setPayAmount("19.99");
        fetchBusiness(false);
      } else {
        setToast(result.error || "Failed to record payment");
        setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("Failed to record payment");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setPayLoading(false);
    }
  };

  const handleSendRequest = async () => {
    setSendLoading(true);
    try {
      const res = await fetch("/api/admin/send-payment-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: id,
          method: sendMethod,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setToast("Payment request sent!");
        setTimeout(() => setToast(""), 3000);
        setShowSendRequest(false);
      } else {
        setToast(result.error || "Failed to send request");
        setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("Failed to send request");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setSendLoading(false);
    }
  };

  const startEditing = () => {
    if (!data?.business) return;
    setEditFields({
      name: data.business.name || "",
      email: data.business.email || "",
      phone: data.business.phone || "",
      venmoHandle: data.business.venmoHandle || "",
      zelleEmail: data.business.zelleEmail || "",
      smsRemindersEnabled: data.business.smsRemindersEnabled || false,
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    setEditLoading(true);
    try {
      const res = await fetch(`/api/admin/businesses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editFields),
      });
      const result = await res.json();
      if (result.success) {
        setToast("Business updated!");
        setTimeout(() => setToast(""), 3000);
        setEditing(false);
        fetchBusiness(false);
      } else {
        setToast(result.error || "Failed to update");
        setTimeout(() => setToast(""), 3000);
      }
    } catch {
      setToast("Failed to update");
      setTimeout(() => setToast(""), 3000);
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const formatShortDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  if (loading) {
    return (
      <div>
        <button
          onClick={() => router.push("/admin/businesses")}
          className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          <ChevronLeftIcon size={16} /> Back to Businesses
        </button>
        <div className="text-center text-sm text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!data?.business) {
    return (
      <div>
        <button
          onClick={() => router.push("/admin/businesses")}
          className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600"
        >
          <ChevronLeftIcon size={16} /> Back to Businesses
        </button>
        <div className="text-center text-sm text-red-400">Business not found</div>
      </div>
    );
  }

  const { business, owner, counts, referrer, referrals, payments } = data;
  const statusInfo = STATUS_COLORS[business.subscriptionStatus] || STATUS_COLORS.trial;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push("/admin/businesses")}
        className="mb-4 flex cursor-pointer items-center gap-1 text-sm font-medium text-gray-400 hover:text-gray-600"
      >
        <ChevronLeftIcon size={16} /> Back to Businesses
      </button>

      {/* Toast */}
      {toast && (
        <div className="mb-4 rounded-[10px] bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
          {toast}
        </div>
      )}

      <PageHeader
        title={business.name || "Unnamed Business"}
        subtitle={`Created ${formatDate(business.createdAt)}`}
      />

      {/* Subscription Status & Actions */}
      <div className="mt-6 flex flex-wrap items-center gap-3 rounded-[14px] border border-[#F0F2F5] bg-white p-5">
        <div className="mr-4">
          <div className="mb-1 text-[11px] font-semibold uppercase text-gray-400">
            Subscription
          </div>
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-bold uppercase"
            style={{ background: statusInfo.bg, color: statusInfo.color }}
          >
            {statusInfo.label}
          </span>
        </div>
        {business.trialEndsAt && business.subscriptionStatus === "trial" && (
          <div className="mr-4">
            <div className="mb-1 text-[11px] font-semibold uppercase text-gray-400">
              Trial Ends
            </div>
            <div className="text-sm font-semibold text-gray-700">
              {formatDate(business.trialEndsAt)}
            </div>
          </div>
        )}
        {business.stripeCustomerId && (
          <div className="mr-4">
            <div className="mb-1 text-[11px] font-semibold uppercase text-gray-400">
              Stripe Customer
            </div>
            <div className="font-body text-xs text-gray-500">{business.stripeCustomerId}</div>
          </div>
        )}
        <div className="ml-auto flex flex-wrap gap-2">
          <ButtonPrimary onClick={() => setShowRecordPayment(true)}>
            Record Payment
          </ButtonPrimary>
          <ButtonSecondary onClick={() => setShowSendRequest(true)}>
            Send Request
          </ButtonSecondary>
          {business.subscriptionStatus !== "active" && (
            <ButtonPrimary
              onClick={() => handleSubscriptionAction("activate")}
              disabled={actionLoading}
            >
              {actionLoading ? "..." : "Activate"}
            </ButtonPrimary>
          )}
          {business.subscriptionStatus === "active" && (
            <ButtonSecondary
              onClick={() => handleSubscriptionAction("deactivate")}
              disabled={actionLoading}
            >
              {actionLoading ? "..." : "Deactivate"}
            </ButtonSecondary>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          icon={<HomeIcon />}
          label="CLIENTS"
          value={counts.clients}
          accentColor="#2563EB"
        />
        <StatCard
          icon={<UserIcon />}
          label="EMPLOYEES"
          value={counts.employees}
          accentColor="#7C3AED"
        />
        <StatCard
          icon={<CalendarIcon />}
          label="JOBS"
          value={counts.jobs}
          accentColor="#059669"
        />
      </div>

      {/* Payment History */}
      <div className="mt-4 rounded-[14px] border border-[#F0F2F5] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-700">Payment History</h3>
          <button
            onClick={() => setShowRecordPayment(true)}
            className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            + Record Payment
          </button>
        </div>
        {(!payments || payments.length === 0) ? (
          <div className="py-6 text-center text-sm text-gray-400">
            No payments recorded yet
          </div>
        ) : (
          <div className="space-y-2">
            {payments.map((p) => {
              const methodColors = PAYMENT_METHOD_COLORS[p.paymentMethod] || PAYMENT_METHOD_COLORS.other;
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] px-4 py-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase"
                        style={{ background: methodColors.bg, color: methodColors.color }}
                      >
                        {p.paymentMethod}
                      </span>
                      <span className="text-sm font-bold text-gray-700">
                        ${Number(p.amount).toFixed(2)}
                      </span>
                      <span
                        className={`text-[10px] font-bold ${
                          p.status === "completed"
                            ? "text-green-600"
                            : p.status === "failed"
                              ? "text-red-600"
                              : p.status === "pending"
                                ? "text-yellow-600"
                                : "text-gray-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    {p.referenceNote && (
                      <div className="mt-0.5 font-body text-xs text-gray-400">
                        {p.referenceNote}
                      </div>
                    )}
                    {p.periodStart && p.periodEnd && (
                      <div className="mt-0.5 font-body text-[10px] text-gray-400">
                        Period: {formatShortDate(p.periodStart)} &mdash;{" "}
                        {formatShortDate(p.periodEnd)}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-body text-xs text-gray-400">
                      {formatShortDate(p.createdAt)}
                    </div>
                    <div className="font-body text-[10px] text-gray-300">
                      {p.recordedBy}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Business Info & Referral Info */}
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Contact & Owner */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700">Business Info</h3>
            {!editing ? (
              <button
                onClick={startEditing}
                className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Edit
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={editLoading}
                  className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="cursor-pointer text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              {[
                { label: "Name", field: "name" as const, type: "text" },
                { label: "Email", field: "email" as const, type: "email" },
                { label: "Phone", field: "phone" as const, type: "tel" },
                { label: "Venmo Handle", field: "venmoHandle" as const, type: "text" },
                { label: "Zelle Email", field: "zelleEmail" as const, type: "email" },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="mb-1 block text-[11px] font-semibold uppercase text-gray-400">
                    {label}
                  </label>
                  <input
                    type={type}
                    value={editFields[field] as string}
                    onChange={(e) => setEditFields((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
                  />
                </div>
              ))}
              <label className="flex cursor-pointer items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  checked={editFields.smsRemindersEnabled}
                  onChange={(e) => setEditFields((f) => ({ ...f, smsRemindersEnabled: e.target.checked }))}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-600">SMS Reminders Enabled</span>
              </label>
            </div>
          ) : (
            <div className="space-y-3 font-body text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="font-semibold text-gray-700">{business.email || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone</span>
                <span className="font-semibold text-gray-700">{business.phone || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Venmo</span>
                <span className="font-semibold text-gray-700">
                  {business.venmoHandle ? `@${business.venmoHandle}` : "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Zelle</span>
                <span className="font-semibold text-gray-700">
                  {business.zelleEmail || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SMS Reminders</span>
                <span className="font-semibold text-gray-700">
                  {business.smsRemindersEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              {owner && (
                <>
                  <div className="my-2 border-t border-[#F0F2F5]" />
                  <div className="flex justify-between">
                    <span className="text-gray-400">Owner</span>
                    <span className="font-semibold text-gray-700">
                      {owner.fullName || "—"}
                    </span>
                  </div>
                  {owner.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Owner Email</span>
                      <span className="font-semibold text-gray-700">{owner.email}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Referral Info */}
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-700">
            <span className="text-purple-500">
              <GiftIcon size={16} />
            </span>
            Referral Info
          </h3>
          <div className="space-y-3 font-body text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Referral Code</span>
              <span className="font-mono font-semibold text-gray-700">
                {business.referralCode || "—"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Referrals Made</span>
              <span className="font-semibold text-gray-700">{business.referralsCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Credit Earned</span>
              <span className="font-semibold text-green-600">
                ${(business.referralCredit || 0).toFixed(2)}
              </span>
            </div>
            {referrer && (
              <div className="flex justify-between">
                <span className="text-gray-400">Referred By</span>
                <button
                  onClick={() => router.push(`/admin/businesses/${referrer.id}`)}
                  className="cursor-pointer font-semibold text-blue-600 underline"
                >
                  {referrer.name || "Unknown"}
                </button>
              </div>
            )}
            {referrals.length > 0 && (
              <>
                <div className="my-2 border-t border-[#F0F2F5]" />
                <div className="text-[11px] font-semibold uppercase text-gray-400">
                  Businesses They Referred
                </div>
                {referrals.map((r) => (
                  <div key={r.id} className="flex items-center justify-between">
                    <button
                      onClick={() => router.push(`/admin/businesses/${r.id}`)}
                      className="cursor-pointer font-semibold text-blue-600 underline"
                    >
                      {r.name || "Unnamed"}
                    </button>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                      style={{
                        background:
                          (STATUS_COLORS[r.subscriptionStatus] || STATUS_COLORS.trial).bg,
                        color:
                          (STATUS_COLORS[r.subscriptionStatus] || STATUS_COLORS.trial).color,
                      }}
                    >
                      {r.subscriptionStatus}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showRecordPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-[14px] bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Record Payment</h3>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase text-gray-400">
                Payment Method
              </label>
              <div className="flex gap-2">
                {(["venmo", "zelle", "other"] as const).map((m) => {
                  const colors = PAYMENT_METHOD_COLORS[m];
                  const isActive = payMethod === m;
                  return (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className="cursor-pointer rounded-[10px] px-4 py-2 text-sm font-bold uppercase transition-all"
                      style={{
                        background: isActive ? colors.color : colors.bg,
                        color: isActive ? "#fff" : colors.color,
                        border: `2px solid ${isActive ? colors.color : "transparent"}`,
                      }}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase text-gray-400">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm font-semibold text-gray-700 outline-none focus:border-blue-400"
              />
            </div>

            {/* Reference Note */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase text-gray-400">
                Reference Note (optional)
              </label>
              <input
                type="text"
                placeholder="Venmo txn ID, Zelle confirmation, etc."
                value={payNote}
                onChange={(e) => setPayNote(e.target.value)}
                className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400"
              />
            </div>

            {/* Activate Subscription */}
            <div className="mb-6">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={payActivate}
                  onChange={(e) => setPayActivate(e.target.checked)}
                  className="h-4 w-4 rounded accent-blue-600"
                />
                <span className="text-sm font-medium text-gray-600">
                  Activate subscription
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <ButtonPrimary
                onClick={handleRecordPayment}
                disabled={payLoading}
              >
                {payLoading ? "Recording..." : "Record Payment"}
              </ButtonPrimary>
              <ButtonSecondary onClick={() => setShowRecordPayment(false)}>
                Cancel
              </ButtonSecondary>
            </div>
          </div>
        </div>
      )}

      {/* Send Payment Request Modal */}
      {showSendRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="mx-4 w-full max-w-md rounded-[14px] bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Send Payment Request</h3>

            <p className="mb-4 text-sm text-gray-500">
              Send a payment request to <strong>{business.name || "this business"}</strong> for
              $19.99 with your Venmo and Zelle details.
            </p>

            {/* Send Method */}
            <div className="mb-4">
              <label className="mb-1.5 block text-[11px] font-semibold uppercase text-gray-400">
                Send via
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSendMethod("sms")}
                  className={`cursor-pointer rounded-[10px] px-4 py-2 text-sm font-bold transition-all ${
                    sendMethod === "sms"
                      ? "bg-blue-600 text-white"
                      : "bg-[#F0F2F5] text-gray-600"
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setSendMethod("email")}
                  className={`cursor-pointer rounded-[10px] px-4 py-2 text-sm font-bold transition-all ${
                    sendMethod === "email"
                      ? "bg-blue-600 text-white"
                      : "bg-[#F0F2F5] text-gray-600"
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Recipient info */}
            <div className="mb-4 rounded-[10px] bg-[#FAFBFD] p-3">
              <div className="text-[11px] font-semibold uppercase text-gray-400">
                {sendMethod === "sms" ? "Phone" : "Email"}
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {sendMethod === "sms"
                  ? business.phone || "No phone on file"
                  : business.email || "No email on file"}
              </div>
            </div>

            {/* Warning if no contact info */}
            {((sendMethod === "sms" && !business.phone) ||
              (sendMethod === "email" && !business.email)) && (
              <div className="mb-4 rounded-[10px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                This business doesn&apos;t have a {sendMethod === "sms" ? "phone number" : "email"} on
                file. Try the other method.
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <ButtonPrimary
                onClick={handleSendRequest}
                disabled={
                  sendLoading ||
                  (sendMethod === "sms" && !business.phone) ||
                  (sendMethod === "email" && !business.email)
                }
              >
                {sendLoading ? "Sending..." : "Send Request"}
              </ButtonPrimary>
              <ButtonSecondary onClick={() => setShowSendRequest(false)}>
                Cancel
              </ButtonSecondary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

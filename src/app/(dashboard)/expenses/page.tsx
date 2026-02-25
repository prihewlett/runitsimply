"use client";

import { useState, useMemo } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary } from "@/components/ui/button";
import { PlusIcon, XIcon, SearchIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useSettings } from "@/lib/settings-context";
import type { Expense } from "@/types";

const EMPTY_FORM = {
  date: new Date().toISOString().split("T")[0],
  description: "",
  amount: "",
  categoryId: "",
  vendor: "",
  jobId: "",
  notes: "",
};

export default function ExpensesPage() {
  const { t } = useLanguage();
  const { expenses, setExpenses, expenseCategories, jobs, clients } = useData();
  const { isReadOnly } = useSettings();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [formError, setFormError] = useState(false);

  // ─── Computed stats ───

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(currentMonth));
  const totalThisMonth = monthlyExpenses.reduce((s, e) => s + e.amount, 0);

  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    monthlyExpenses.forEach((e) => {
      const key = e.categoryId || "uncategorized";
      map[key] = (map[key] || 0) + e.amount;
    });
    return map;
  }, [monthlyExpenses]);

  const topCategory = useMemo(() => {
    let maxAmt = 0;
    let maxCat = "";
    Object.entries(categoryTotals).forEach(([catId, amt]) => {
      if (amt > maxAmt) {
        maxAmt = amt;
        maxCat = catId;
      }
    });
    const cat = expenseCategories.find((c) => c.id === maxCat);
    return cat ? cat.name : "—";
  }, [categoryTotals, expenseCategories]);

  const jobsWithExpenses = new Set(expenses.filter((e) => e.jobId).map((e) => e.jobId));
  const avgPerJob = jobsWithExpenses.size > 0
    ? totalThisMonth / jobsWithExpenses.size
    : 0;

  // ─── Filtered list ───

  const filtered = useMemo(() => {
    let list = [...expenses];

    if (filterCategory !== "all") {
      list = list.filter((e) => e.categoryId === filterCategory);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.vendor.toLowerCase().includes(q) ||
          e.notes.toLowerCase().includes(q)
      );
    }

    // Sort by date descending
    list.sort((a, b) => b.date.localeCompare(a.date));

    return list;
  }, [expenses, filterCategory, search]);

  // ─── Handlers ───

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(false);
    setShowModal(true);
  }

  function openEdit(expense: Expense) {
    setEditingId(expense.id);
    setForm({
      date: expense.date,
      description: expense.description,
      amount: String(expense.amount),
      categoryId: expense.categoryId || "",
      vendor: expense.vendor,
      jobId: expense.jobId || "",
      notes: expense.notes,
    });
    setShowModal(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!form.description.trim() || isNaN(amount) || amount <= 0) {
      setFormError(true);
      return;
    }
    setFormError(false);

    if (editingId) {
      // Update
      setExpenses((prev) =>
        prev.map((exp) =>
          exp.id === editingId
            ? {
                ...exp,
                date: form.date,
                description: form.description.trim(),
                amount,
                categoryId: form.categoryId || null,
                vendor: form.vendor.trim(),
                jobId: form.jobId || null,
                notes: form.notes.trim(),
              }
            : exp
        )
      );
      showToast(t("expenses.expenseAdded"));
    } else {
      // Create
      const newExpense: Expense = {
        id: crypto.randomUUID(),
        businessId: "",
        date: form.date,
        description: form.description.trim(),
        amount,
        categoryId: form.categoryId || null,
        vendor: form.vendor.trim(),
        jobId: form.jobId || null,
        receiptUrl: null,
        notes: form.notes.trim(),
      };
      setExpenses((prev) => [...prev, newExpense]);
      showToast(t("expenses.expenseAdded"));
    }

    setShowModal(false);
  }

  function handleDelete(id: string) {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast(t("expenses.expenseDeleted"));
    setShowModal(false);
    setConfirmDeleteId(null);
  }

  // ─── Helpers ───

  function getCategoryName(catId: string | null) {
    if (!catId) return "—";
    const cat = expenseCategories.find((c) => c.id === catId);
    return cat ? cat.name : "—";
  }

  function getCategoryColor(catId: string | null) {
    if (!catId) return "#6B7280";
    const cat = expenseCategories.find((c) => c.id === catId);
    return cat ? cat.color : "#6B7280";
  }

  function getJobLabel(jobId: string | null) {
    if (!jobId) return null;
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return null;
    const client = clients.find((c) => c.id === job.clientId);
    return client ? `${client.name} — ${job.date}` : job.date;
  }

  return (
    <div>
      <PageHeader
        title={t("expenses.title")}
        subtitle={t("expenses.subtitle")}
        action={
          !isReadOnly ? (
            <ButtonPrimary onClick={openAdd}>
              <PlusIcon size={16} />
              {t("expenses.addExpense")}
            </ButtonPrimary>
          ) : undefined
        }
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("expenses.totalThisMonth")}
          </div>
          <div className="mt-1 text-2xl font-bold text-red-600">
            ${totalThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("expenses.topCategory")}
          </div>
          <div className="mt-1 text-2xl font-bold">{topCategory}</div>
        </div>
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="font-body text-[11px] font-semibold text-gray-400">
            {t("expenses.avgPerJob")}
          </div>
          <div className="mt-1 text-2xl font-bold">
            ${avgPerJob.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter + Search bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Category filter tabs */}
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setFilterCategory("all")}
            aria-pressed={filterCategory === "all"}
            className={`cursor-pointer whitespace-nowrap rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterCategory === "all"
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            {t("expenses.all")}
          </button>
          {expenseCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              aria-pressed={filterCategory === cat.id}
              className={`cursor-pointer whitespace-nowrap rounded-[10px] px-3 py-1.5 text-xs font-semibold transition-colors ${
                filterCategory === cat.id
                  ? "text-white"
                  : "text-gray-400 hover:bg-gray-50"
              }`}
              style={filterCategory === cat.id ? { backgroundColor: cat.color } : undefined}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative ml-auto">
          <SearchIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("expenses.searchExpenses")}
            placeholder={t("common.search")}
            className="w-48 rounded-[10px] border border-[#F0F2F5] py-1.5 pl-8 pr-3 text-xs outline-none transition-colors focus:border-blue-400"
          />
        </div>
      </div>

      {/* Expense table */}
      {filtered.length === 0 ? (
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="font-body text-sm text-gray-400">{t("expenses.noExpenses")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[14px] border border-[#F0F2F5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#F0F2F5]">
                <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.date")}
                </th>
                <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.description")}
                </th>
                <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.category")}
                </th>
                <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.vendor")}
                </th>
                <th scope="col" className="px-4 py-3 text-right font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.amount")}
                </th>
                <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.linkedJob")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((exp) => {
                const jobLabel = getJobLabel(exp.jobId);
                return (
                  <tr
                    key={exp.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => openEdit(exp)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openEdit(exp); } }}
                    className="cursor-pointer border-b border-[#F0F2F5] transition-colors last:border-0 hover:bg-blue-50/30"
                  >
                    <td className="px-4 py-3 font-body text-sm text-gray-500">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {exp.description}
                      {exp.notes && (
                        <span className="ml-2 text-[11px] font-normal text-gray-400">
                          {exp.notes.length > 40 ? exp.notes.slice(0, 40) + "…" : exp.notes}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-white"
                        style={{ backgroundColor: getCategoryColor(exp.categoryId) }}
                      >
                        {getCategoryName(exp.categoryId)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-body text-sm text-gray-500">
                      {exp.vendor || "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                      ${exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 font-body text-xs text-gray-400">
                      {jobLabel || t("expenses.noLinkedJob")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-[#F0F2F5]">
                <td colSpan={4} className="px-4 py-3 text-sm font-bold">
                  Total ({filtered.length})
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-red-600">
                  ${filtered.reduce((s, e) => s + e.amount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-[10px] bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md rounded-[16px] bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">
                {editingId ? t("expenses.description") : t("expenses.addExpense")}
              </h2>
              <button
                onClick={() => { setShowModal(false); setConfirmDeleteId(null); }}
                aria-label="Close dialog"
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                <XIcon size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Date */}
              <div>
                <label htmlFor="expense-date" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.date")}
                </label>
                <input
                  id="expense-date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="expense-desc" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.description")}
                </label>
                <input
                  id="expense-desc"
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                  placeholder="Cleaning supplies, gas, etc."
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="expense-amount" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.amount")}
                </label>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                  placeholder="0.00"
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="expense-category" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.category")}
                </label>
                <select
                  id="expense-category"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">—</option>
                  {expenseCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vendor */}
              <div>
                <label htmlFor="expense-vendor" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.vendor")}
                </label>
                <input
                  id="expense-vendor"
                  type="text"
                  value={form.vendor}
                  onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                  placeholder="Home Depot, Amazon, etc."
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Linked Job */}
              <div>
                <label htmlFor="expense-job" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.linkedJob")}
                </label>
                <select
                  id="expense-job"
                  value={form.jobId}
                  onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                >
                  <option value="">{t("expenses.noLinkedJob")}</option>
                  {jobs.map((job) => {
                    const client = clients.find((c) => c.id === job.clientId);
                    return (
                      <option key={job.id} value={job.id}>
                        {client?.name ?? "?"} — {job.date} (${job.amount})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="expense-notes" className="mb-1 block font-body text-[11px] font-semibold text-gray-500">
                  {t("expenses.notes")}
                </label>
                <textarea
                  id="expense-notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full rounded-[10px] border border-[#F0F2F5] px-3 py-2 text-sm outline-none focus:border-blue-400"
                />
              </div>

              {/* Actions */}
              {formError && (
                <div className="mb-2 rounded-[10px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
                  {t("common.requiredFields")}
                </div>
              )}
              {!isReadOnly && (
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 cursor-pointer rounded-[10px] bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  {t("expenses.saveExpense")}
                </button>
                {editingId && confirmDeleteId !== editingId && (
                  <button
                    type="button"
                    onClick={() => setConfirmDeleteId(editingId)}
                    className="cursor-pointer rounded-[10px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 transition-colors hover:bg-red-100"
                  >
                    {t("expenses.deleteExpense")}
                  </button>
                )}
                {editingId && confirmDeleteId === editingId && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleDelete(editingId)}
                      className="cursor-pointer rounded-[10px] bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-700"
                    >
                      {t("common.confirm")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(null)}
                      className="cursor-pointer rounded-[10px] border border-[#F0F2F5] bg-white px-4 py-2.5 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                )}
              </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

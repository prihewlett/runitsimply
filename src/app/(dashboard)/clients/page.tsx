"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { FormInput } from "@/components/ui/form-input";
import { ServiceBadge } from "@/components/ui/badge";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { AddressLink } from "@/components/ui/address-link";
import { PAYMENT_INFO, BUSINESS_TYPES } from "@/lib/data";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useAuth } from "@/lib/auth-context";
import { useSettings } from "@/lib/settings-context";
import type { Client, ServiceType, PaymentMethod } from "@/types";

export default function ClientsPage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const { clients, setClients, jobs: JOBS } = useData();
  const { isOwner } = useAuth();
  const { isReadOnly } = useSettings();
  const [editingRate, setEditingRate] = useState(false);
  const [rateValue, setRateValue] = useState("");
  const [rateType, setRateType] = useState<"flat" | "hourly">("flat");
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientAdded, setClientAdded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [clientDeleted, setClientDeleted] = useState(false);
  const DEFAULT_CLIENT_FORM = {
    name: "",
    contact: "",
    phone: "",
    email: "",
    address: "",
    frequency: "Weekly" as Client["frequency"],
    paymentMethod: "Cash" as PaymentMethod,
    serviceType: "cleaning" as ServiceType,
    serviceRate: "",
    serviceRateType: "flat" as "flat" | "hourly",
    notes: "",
  };
  const [clientForm, setClientForm] = useState(DEFAULT_CLIENT_FORM);
  const [clientFormError, setClientFormError] = useState(false);
  const { t } = useLanguage();

  const handleSaveClient = () => {
    if (!clientForm.name.trim() || !clientForm.contact.trim()) {
      setClientFormError(true);
      return;
    }
    setClientFormError(false);
    const newId = crypto.randomUUID();
    const newClient: Client = {
      id: newId,
      name: clientForm.name,
      contact: clientForm.contact,
      phone: clientForm.phone,
      email: clientForm.email || undefined,
      address: clientForm.address,
      frequency: clientForm.frequency,
      paymentMethod: clientForm.paymentMethod,
      serviceType: clientForm.serviceType,
      serviceRate: clientForm.serviceRate ? parseFloat(clientForm.serviceRate) : undefined,
      serviceRateType: clientForm.serviceRateType,
      notes: clientForm.notes,
    };
    setClients((prev) => [...prev, newClient]);
    setShowAddClient(false);
    setClientForm(DEFAULT_CLIENT_FORM);
    setClientAdded(true);
    setTimeout(() => setClientAdded(false), 2500);
  };

  // Format rate for display: "$180/visit" or "$90/hr"
  const formatRate = (client: Client) => {
    if (!client.serviceRate) return "—";
    const type = client.serviceRateType ?? "flat";
    const suffix = type === "hourly" ? `/${t("clients.perHour")}` : `/${t("clients.perVisit")}`;
    return `$${client.serviceRate}${suffix}`;
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.contact.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
  );

  const selected = clients.find((c) => c.id === selectedClient);
  const selectedClientJobs = JOBS.filter(
    (j) => j.clientId === selectedClient
  );

  const handleDeleteClient = () => {
    if (!selectedClient) return;
    setClients((prev) => prev.filter((c) => c.id !== selectedClient));
    setSelectedClient(null);
    setConfirmDelete(false);
    setClientDeleted(true);
    setTimeout(() => setClientDeleted(false), 2500);
  };

  const handleSaveRate = () => {
    if (selectedClient === null) return;
    const rate = parseFloat(rateValue);
    if (isNaN(rate) || rate < 0) return;
    setClients((prev) =>
      prev.map((c) =>
        c.id === selectedClient
          ? { ...c, serviceRate: rate, serviceRateType: rateType }
          : c
      )
    );
    setEditingRate(false);
  };

  return (
    <div>
      <PageHeader
        title={t("clients.title")}
        subtitle={t("clients.subtitle")}
        action={
          !isReadOnly ? (
            <ButtonPrimary icon={<PlusIcon size={16} />} onClick={() => setShowAddClient(true)}>
              {t("clients.addClient")}
            </ButtonPrimary>
          ) : undefined
        }
      />

      {/* Search bar */}
      <div className="relative mb-4 max-w-md">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon size={16} />
        </div>
        <input
          type="text"
          placeholder={t("clients.searchPlaceholder")}
          aria-label={t("clients.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-[10px] border-[1.5px] border-[#F0F2F5] bg-white py-2.5 pl-9 pr-4 font-body text-sm outline-none focus:border-blue-600"
        />
      </div>

      {/* Clients table */}
      {clients.length === 0 ? (
        <div className="rounded-[14px] border border-[#F0F2F5] bg-white p-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <p className="font-body text-sm text-gray-400">{t("clients.noClients")}</p>
        </div>
      ) : (
      <div className="overflow-x-auto rounded-[14px] border border-[#F0F2F5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-[#FAFBFD]">
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.property")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.contact")}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-body text-[11px] font-semibold text-gray-500 md:table-cell">
                {t("clients.address")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.service")}
              </th>
              <th scope="col" className="px-4 py-3 font-body text-[11px] font-semibold text-gray-500">
                {t("clients.frequency")}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-body text-[11px] font-semibold text-gray-500 lg:table-cell">
                {t("clients.payment")}
              </th>
              <th scope="col" className="hidden px-4 py-3 font-body text-[11px] font-semibold text-gray-500 lg:table-cell">
                {t("clients.serviceRate")}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((client) => {
              const pi = PAYMENT_INFO[client.paymentMethod];
              return (
                <tr
                  key={client.id}
                  role="button"
                  tabIndex={0}
                  className="cursor-pointer border-t border-[#F0F2F5] transition-colors hover:bg-blue-50/30"
                  onClick={() => setSelectedClient(client.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelectedClient(client.id); } }}
                >
                  <td className="px-4 py-3">
                    <div className="font-semibold">{client.name}</div>
                  </td>
                  <td className="px-4 py-3 font-body text-gray-500">
                    {client.contact}
                  </td>
                  <td className="hidden px-4 py-3 font-body text-xs text-gray-500 md:table-cell">
                    {client.address && <AddressLink address={client.address} />}
                  </td>
                  <td className="px-4 py-3">
                    <ServiceBadge type={client.serviceType} />
                  </td>
                  <td className="px-4 py-3 font-body text-xs text-gray-500">
                    {client.frequency}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                      style={{ background: pi.bg, color: pi.color }}
                    >
                      <span>{pi.icon}</span>
                      {client.paymentMethod}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 font-body text-sm font-semibold lg:table-cell">
                    {formatRate(client)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center font-body text-sm text-gray-400"
                >
                  {t("clients.noResults", { query: search })}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      )}

      {/* Add Client modal */}
      <Modal
        open={showAddClient}
        onClose={() => setShowAddClient(false)}
        title={t("clients.addClient")}
        wide
      >
        <div className="grid grid-cols-2 gap-x-4">
          <FormInput
            label={t("clients.property")}
            value={clientForm.name}
            onChange={(v) => setClientForm((prev) => ({ ...prev, name: v }))}
            placeholder={t("clients.placeholderProperty")}
          />
          <FormInput
            label={t("clients.contactName")}
            value={clientForm.contact}
            onChange={(v) => setClientForm((prev) => ({ ...prev, contact: v }))}
            placeholder={t("clients.placeholderContact")}
          />
          <FormInput
            label={t("clients.phone")}
            value={clientForm.phone}
            onChange={(v) => setClientForm((prev) => ({ ...prev, phone: v }))}
            placeholder="(555) 123-4567"
          />
          <FormInput
            label={t("clients.email")}
            value={clientForm.email}
            onChange={(v) => setClientForm((prev) => ({ ...prev, email: v }))}
            type="email"
            placeholder={t("clients.emailPlaceholder")}
          />
          <FormInput
            label={t("clients.address")}
            value={clientForm.address}
            onChange={(v) => setClientForm((prev) => ({ ...prev, address: v }))}
            placeholder="1420 Oak Valley Dr, Austin, TX"
          />
          <FormInput
            label={t("clients.frequency")}
            value={clientForm.frequency}
            onChange={(v) => setClientForm((prev) => ({ ...prev, frequency: v as Client["frequency"] }))}
            options={[
              { value: "Weekly", label: t("clients.weekly") },
              { value: "Bi-weekly", label: t("clients.biweekly") },
              { value: "Monthly", label: t("clients.monthly") },
              { value: "One-time", label: t("clients.oneTime") },
            ]}
          />
          <FormInput
            label={t("clients.paymentMethod")}
            value={clientForm.paymentMethod}
            onChange={(v) => setClientForm((prev) => ({ ...prev, paymentMethod: v as PaymentMethod }))}
            options={[
              { value: "Cash", label: t("payments.cash") },
              { value: "Venmo", label: t("payments.venmo") },
              { value: "Zelle", label: t("payments.zelle") },
              { value: "Credit Card", label: t("payments.creditCard") },
              { value: "Check", label: t("payments.check") },
            ]}
          />
          <FormInput
            label={t("clients.serviceType")}
            value={clientForm.serviceType}
            onChange={(v) => setClientForm((prev) => ({ ...prev, serviceType: v as ServiceType }))}
            options={BUSINESS_TYPES.map((bt) => ({ value: bt.id, label: `${bt.emoji} ${bt.label}` }))}
          />
          <div>
            <FormInput
              label={t("clients.serviceRateLabel")}
              value={clientForm.serviceRate}
              onChange={(v) => setClientForm((prev) => ({ ...prev, serviceRate: v }))}
              type="number"
              placeholder="150"
            />
            <div className="mb-3 -mt-1 inline-flex rounded-[8px] border border-[#F0F2F5] p-0.5">
              <button
                onClick={() => setClientForm((prev) => ({ ...prev, serviceRateType: "flat" }))}
                aria-pressed={clientForm.serviceRateType === "flat"}
                className={`cursor-pointer rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors ${
                  clientForm.serviceRateType === "flat"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("clients.flatRate")}
              </button>
              <button
                onClick={() => setClientForm((prev) => ({ ...prev, serviceRateType: "hourly" }))}
                aria-pressed={clientForm.serviceRateType === "hourly"}
                className={`cursor-pointer rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors ${
                  clientForm.serviceRateType === "hourly"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {t("clients.hourlyRate")}
              </button>
            </div>
          </div>
          <div className="col-span-2">
            <FormInput
              label={t("clients.notes")}
              value={clientForm.notes}
              onChange={(v) => setClientForm((prev) => ({ ...prev, notes: v }))}
              placeholder="2-story. Has a dog."
            />
          </div>
        </div>
        {clientFormError && (
          <div className="mb-2 rounded-[10px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">
            {t("common.requiredFields")}
          </div>
        )}
        <button
          onClick={handleSaveClient}
          className="mt-2 w-full cursor-pointer rounded-[10px] bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("clients.addClient")}
        </button>
      </Modal>

      {/* Toast */}
      {clientAdded && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("clients.clientAdded")}
        </div>
      )}

      {/* Client detail modal */}
      <Modal
        open={selectedClient !== null}
        onClose={() => {
          setSelectedClient(null);
          setEditingRate(false);
          setConfirmDelete(false);
        }}
        title={selected?.name ?? ""}
        wide
      >
        {selected && (
          <div>
            {/* Client info */}
            <div className="mb-5 grid grid-cols-2 gap-4">
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.contact")}
                </div>
                <div className="text-sm font-semibold">{selected.contact}</div>
                <div className="font-body text-xs text-gray-500">
                  {selected.phone}
                </div>
                {selected.email && (
                  <div className="font-body text-xs text-gray-500">
                    {selected.email}
                  </div>
                )}
              </div>
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.serviceType")}
                </div>
                <div className="mt-1">
                  <ServiceBadge type={selected.serviceType} size="md" />
                </div>
              </div>
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.address")}
                </div>
                <div className="text-sm">{selected.address && <AddressLink address={selected.address} />}</div>
              </div>
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.paymentMethod")}
                </div>
                <div className="mt-1">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    style={{
                      background: PAYMENT_INFO[selected.paymentMethod].bg,
                      color: PAYMENT_INFO[selected.paymentMethod].color,
                    }}
                  >
                    {PAYMENT_INFO[selected.paymentMethod].icon}{" "}
                    {selected.paymentMethod}
                  </span>
                </div>
              </div>
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.frequency")}
                </div>
                <div className="text-sm">{selected.frequency}</div>
              </div>
              <div>
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.notes")}
                </div>
                <div className="text-sm text-gray-600">{selected.notes}</div>
              </div>

              {/* Service Rate */}
              <div className="col-span-2">
                <div className="font-body text-[11px] font-semibold text-gray-400">
                  {t("clients.serviceRateLabel")}
                </div>
                <div className="mt-1">
                  {editingRate ? (
                    <div className="space-y-3">
                      {/* Flat / Hourly toggle */}
                      <div>
                        <div className="mb-1 font-body text-[10px] font-semibold text-gray-400">
                          {t("clients.rateType")}
                        </div>
                        <div className="inline-flex rounded-[8px] border border-[#F0F2F5] p-0.5">
                          <button
                            onClick={() => setRateType("flat")}
                            aria-pressed={rateType === "flat"}
                            className={`cursor-pointer rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors ${
                              rateType === "flat"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {t("clients.flatRate")}
                          </button>
                          <button
                            onClick={() => setRateType("hourly")}
                            aria-pressed={rateType === "hourly"}
                            className={`cursor-pointer rounded-[6px] px-3 py-1 text-xs font-semibold transition-colors ${
                              rateType === "hourly"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                          >
                            {t("clients.hourlyRate")}
                          </button>
                        </div>
                      </div>
                      {/* Amount input */}
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-400">$</span>
                        <input
                          type="number"
                          value={rateValue}
                          onChange={(e) => setRateValue(e.target.value)}
                          className="w-24 rounded-[10px] border-[1.5px] border-[#F0F2F5] px-3 py-1.5 font-body text-sm outline-none focus:border-blue-600"
                          placeholder="150"
                          min="0"
                          autoFocus
                        />
                        <span className="font-body text-[10px] text-gray-400">
                          {rateType === "hourly"
                            ? t("clients.perHour")
                            : t("clients.perVisit")}
                        </span>
                      </div>
                      {/* Save button */}
                      <button
                        onClick={handleSaveRate}
                        className="w-full cursor-pointer rounded-[10px] bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        {t("clients.saveRate")}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {formatRate(selected)}
                      </span>
                      {selected.serviceRate && (
                        <span className="font-body text-[10px] text-gray-400">
                          {(selected.serviceRateType ?? "flat") === "hourly"
                            ? t("clients.perHour")
                            : t("clients.perVisit")}
                        </span>
                      )}
                      {!isReadOnly && (
                        <button
                          onClick={() => {
                            setEditingRate(true);
                            setRateValue(String(selected.serviceRate ?? ""));
                            setRateType(selected.serviceRateType ?? "flat");
                          }}
                          className="cursor-pointer rounded-[6px] bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500 hover:bg-gray-200"
                        >
                          {t("clients.editRate")}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job history */}
            <h4 className="mb-2 text-sm font-bold">
              {t("clients.serviceHistory", { count: selectedClientJobs.length })}
            </h4>
            {selectedClientJobs.length === 0 ? (
              <p className="font-body text-sm text-gray-400">
                {t("clients.noHistory")}
              </p>
            ) : (
              <div className="space-y-2">
                {selectedClientJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between rounded-[10px] border border-[#F0F2F5] bg-[#FAFBFD] p-3"
                  >
                    <div>
                      <div className="font-body text-xs text-gray-500">
                        {job.date} &middot; {job.time} &middot; {job.duration}h
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        ${job.amount}
                      </span>
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
                  </div>
                ))}
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
                    {t("clients.deleteClient")}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{t("common.confirmDelete")}</span>
                    <button
                      onClick={handleDeleteClient}
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

      {/* Client deleted toast */}
      {clientDeleted && (
        <div role="status" aria-live="polite" className="fixed bottom-6 right-6 z-50 rounded-[12px] bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {t("clients.clientDeleted")}
        </div>
      )}
    </div>
  );
}

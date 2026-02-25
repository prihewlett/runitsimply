"use client";

import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { ButtonPrimary } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SendIcon, PlusIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language-context";
import { useData } from "@/lib/data-context";
import { useSettings } from "@/lib/settings-context";

const CONTACT_COLORS = ["#3B82F6", "#059669", "#D97706", "#EF4444", "#8B5CF6", "#0EA5E9", "#EC4899", "#6366F1"];

export default function MessagesPage() {
  const { messages, setMessages, clients, employees } = useData();
  const [selectedConvo, setSelectedConvo] = useState(messages[0]?.id ?? null);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "client" | "team">("all");
  const [showNewConvo, setShowNewConvo] = useState(false);
  const { t } = useLanguage();
  const { isReadOnly } = useSettings();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const filteredConvos = activeTab === "all"
    ? messages
    : messages.filter((m) => m.contactType === activeTab);

  const activeConvo = messages.find((m) => m.id === selectedConvo);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConvo?.messages.length]);

  const handleSend = () => {
    if (!newMessage.trim() || selectedConvo === null) return;
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    const timeStr = `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;

    setMessages((prev) =>
      prev.map((convo) =>
        convo.id === selectedConvo
          ? {
              ...convo,
              messages: [
                ...convo.messages,
                { from: "me" as const, text: newMessage.trim(), time: timeStr },
              ],
            }
          : convo
      )
    );
    setNewMessage("");
  };

  // Start a new conversation with a client or employee
  const handleStartConvo = (name: string, type: "client" | "team") => {
    // Check if conversation already exists
    const existing = messages.find(
      (m) => m.contactName === name && m.contactType === type
    );
    if (existing) {
      setSelectedConvo(existing.id);
      setShowNewConvo(false);
      return;
    }

    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const newId = crypto.randomUUID();
    const color = CONTACT_COLORS[messages.length % CONTACT_COLORS.length];

    setMessages((prev) => [
      {
        id: newId,
        contactName: name,
        contactType: type,
        avatar: initials,
        color,
        messages: [],
        unread: 0,
      },
      ...prev,
    ]);
    setSelectedConvo(newId);
    setShowNewConvo(false);
    setActiveTab("all");
  };

  // Build contact lists for the new convo modal
  const clientContacts = clients.map((c) => c.name);
  const teamContacts = employees.map((e) => e.name);

  return (
    <div>
      <PageHeader
        title={t("messages.title")}
        subtitle={t("messages.subtitle")}
        action={
          !isReadOnly ? (
            <ButtonPrimary
              icon={<PlusIcon size={16} />}
              onClick={() => setShowNewConvo(true)}
            >
              {t("messages.newMessage")}
            </ButtonPrimary>
          ) : undefined
        }
      />

      <div className="flex h-[calc(100vh-180px)] overflow-hidden rounded-[14px] border border-[#F0F2F5] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {/* Conversation list */}
        <div className="w-[280px] overflow-y-auto border-r border-[#F0F2F5]">
          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-[#F0F2F5] p-3">
            {([
              { key: "all" as const, label: t("messages.all") },
              { key: "client" as const, label: t("messages.clientsTab") },
              { key: "team" as const, label: t("messages.teamTab") },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  const filtered = tab.key === "all"
                    ? messages
                    : messages.filter((m) => m.contactType === tab.key);
                  if (!filtered.find((m) => m.id === selectedConvo)) {
                    setSelectedConvo(filtered[0]?.id ?? null);
                  }
                }}
                className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-semibold ${
                  activeTab === tab.key
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {filteredConvos.map((convo) => (
            <div
              key={convo.id}
              className={`cursor-pointer border-b border-[#F0F2F5] p-3 transition-colors ${
                selectedConvo === convo.id ? "bg-blue-50/50" : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedConvo(convo.id)}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: convo.color }}
                >
                  {convo.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">
                      {convo.contactName}
                    </span>
                    {convo.unread > 0 && (
                      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                        {convo.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[9px] font-semibold"
                      style={{
                        background:
                          convo.contactType === "client"
                            ? "#EFF6FF"
                            : "#ECFDF5",
                        color:
                          convo.contactType === "client"
                            ? "#2563EB"
                            : "#059669",
                      }}
                    >
                      {convo.contactType === "client"
                        ? t("messages.client")
                        : t("messages.teamMember")}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate font-body text-[11px] text-gray-400">
                    {convo.messages[convo.messages.length - 1]?.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Chat area */}
        <div className="flex flex-1 flex-col">
          {activeConvo ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b border-[#F0F2F5] px-5 py-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: activeConvo.color }}
                >
                  {activeConvo.avatar}
                </div>
                <div>
                  <div className="text-sm font-bold">
                    {activeConvo.contactName}
                  </div>
                  <div className="font-body text-[11px] text-gray-400">
                    {activeConvo.contactType === "client"
                      ? t("messages.client")
                      : t("messages.teamMember")}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {activeConvo.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.from === "me" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                        msg.from === "me"
                          ? "rounded-br-md bg-blue-600 text-white"
                          : "rounded-bl-md bg-[#F0F2F5] text-[#1A1D26]"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p
                        className={`mt-1 text-[10px] ${
                          msg.from === "me"
                            ? "text-blue-200"
                            : "text-gray-400"
                        }`}
                      >
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              {!isReadOnly && (
              <div className="border-t border-[#F0F2F5] p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t("messages.placeholder")}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 rounded-[10px] border-[1.5px] border-[#F0F2F5] px-4 py-2.5 font-body text-sm outline-none focus:border-blue-600"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newMessage.trim()) {
                        handleSend();
                      }
                    }}
                  />
                  <button
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[10px] bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSend}
                  >
                    <SendIcon />
                  </button>
                </div>
              </div>
              )}
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center font-body text-sm text-gray-400">
              {t("messages.selectConvo")}
            </div>
          )}
        </div>
      </div>

      {/* New Conversation Modal */}
      <Modal
        open={showNewConvo}
        onClose={() => setShowNewConvo(false)}
        title={t("messages.newMessage")}
      >
        <div>
          {/* Clients */}
          {clientContacts.length > 0 && (
            <div className="mb-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("messages.clientsTab")}
              </div>
              <div className="space-y-1">
                {clientContacts.map((name) => {
                  const alreadyExists = messages.some(
                    (m) => m.contactName === name && m.contactType === "client"
                  );
                  return (
                    <button
                      key={name}
                      onClick={() => handleStartConvo(name, "client")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-left transition-colors hover:bg-blue-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
                        {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-[10px] text-gray-400">
                          {alreadyExists ? t("messages.existingConvo") : t("messages.client")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Members */}
          {teamContacts.length > 0 && (
            <div>
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {t("messages.teamTab")}
              </div>
              <div className="space-y-1">
                {teamContacts.map((name) => {
                  const alreadyExists = messages.some(
                    (m) => m.contactName === name && m.contactType === "team"
                  );
                  return (
                    <button
                      key={name}
                      onClick={() => handleStartConvo(name, "team")}
                      className="flex w-full cursor-pointer items-center gap-3 rounded-[10px] border border-[#F0F2F5] px-3 py-2.5 text-left transition-colors hover:bg-green-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-[10px] font-bold text-green-600">
                        {name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{name}</div>
                        <div className="text-[10px] text-gray-400">
                          {alreadyExists ? t("messages.existingConvo") : t("messages.teamMember")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

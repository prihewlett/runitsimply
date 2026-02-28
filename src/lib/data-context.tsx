"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { CLIENTS, JOBS, EMPLOYEES, MESSAGES, TIME_ENTRIES } from "./data";
import { createClient } from "./supabase";
import { useAuth } from "./auth-context";
import { useSettings } from "./settings-context";
import { createModuleLogger } from "./logger";

const log = createModuleLogger("data");
import type { Client, Job, Employee, TimeEntry, Expense, ExpenseCategory } from "@/types";
import type { Message } from "./data";

/* ────────────────────────── Types ────────────────────────── */

interface DataContextValue {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  jobs: Job[];
  setJobs: React.Dispatch<React.SetStateAction<Job[]>>;
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  timeEntries: TimeEntry[];
  setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>>;
  expenses: Expense[];
  setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
  expenseCategories: ExpenseCategory[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>>;
  loading: boolean;
}

const DataContext = createContext<DataContextValue | null>(null);

/* ────────────────────────── localStorage keys (fallback) ────────────────────────── */

const CLIENTS_KEY = "runitsimply-clients";
const JOBS_KEY = "runitsimply-jobs";
const EMPLOYEES_KEY = "runitsimply-employees";
const MESSAGES_KEY = "runitsimply-messages";
const TIME_ENTRIES_KEY = "runitsimply-time-entries";
const EXPENSES_KEY = "runitsimply-expenses";
const EXPENSE_CATEGORIES_KEY = "runitsimply-expense-categories";

// Default expense categories (matches database seed)
const DEFAULT_CATEGORIES: ExpenseCategory[] = [
  { id: "cat-supplies", businessId: "", name: "Supplies", color: "#3B82F6", icon: "box", isDefault: true },
  { id: "cat-equipment", businessId: "", name: "Equipment", color: "#10B981", icon: "wrench", isDefault: true },
  { id: "cat-vehicle", businessId: "", name: "Vehicle/Gas", color: "#F59E0B", icon: "truck", isDefault: true },
  { id: "cat-insurance", businessId: "", name: "Insurance", color: "#8B5CF6", icon: "shield", isDefault: true },
  { id: "cat-marketing", businessId: "", name: "Marketing", color: "#EC4899", icon: "megaphone", isDefault: true },
  { id: "cat-office", businessId: "", name: "Office", color: "#6366F1", icon: "building", isDefault: true },
  { id: "cat-other", businessId: "", name: "Other", color: "#6B7280", icon: "folder", isDefault: true },
];

/* ────────────────────────── Helpers ────────────────────────── */

// Check if Supabase is configured (not placeholder values)
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !!(
    url &&
    key &&
    !url.includes("YOUR_PROJECT") &&
    url.startsWith("https://")
  );
}

// Convert snake_case DB row → camelCase Client
function rowToClient(row: Record<string, unknown>): Client {
  return {
    id: row.id as string,
    name: row.name as string,
    contact: (row.contact as string) ?? "",
    phone: (row.phone as string) ?? "",
    email: (row.email as string) || undefined,
    address: (row.address as string) ?? "",
    frequency: (row.frequency as Client["frequency"]) ?? "One-time",
    paymentMethod: (row.payment_method as Client["paymentMethod"]) ?? "Cash",
    notes: (row.notes as string) ?? "",
    serviceType: (row.service_type as Client["serviceType"]) ?? "other",
    serviceRate: row.service_rate != null ? Number(row.service_rate) : undefined,
    serviceRateType: (row.service_rate_type as Client["serviceRateType"]) ?? undefined,
  };
}

// Convert snake_case DB row → camelCase Job
function rowToJob(row: Record<string, unknown>, employeeIds: string[]): Job {
  return {
    id: row.id as string,
    clientId: row.client_id as string,
    employeeIds,
    date: row.date as string,
    time: row.time as string,
    duration: Number(row.duration),
    status: (row.status as Job["status"]) ?? "scheduled",
    amount: Number(row.amount),
    rateType: (row.rate_type as Job["rateType"]) ?? undefined,
    paymentStatus: (row.payment_status as Job["paymentStatus"]) ?? "pending",
    paymentVia: (row.payment_via as Job["paymentVia"]) ?? undefined,
    invoiceSentAt: (row.invoice_sent_at as string) ?? undefined,
    isRecurring: (row.is_recurring as boolean) ?? false,
    recurrenceRule: (row.recurrence_rule as Job["recurrenceRule"]) ?? undefined,
    recurrenceEndDate: (row.recurrence_end_date as string) ?? undefined,
    parentJobId: (row.parent_job_id as string) ?? null,
    seriesId: (row.series_id as string) ?? null,
  };
}

// Convert snake_case DB row → camelCase Employee
function rowToEmployee(row: Record<string, unknown>): Employee {
  return {
    id: row.id as string,
    name: row.name as string,
    phone: (row.phone as string) ?? "",
    role: (row.role as string) ?? "",
    rate: Number(row.rate),
    payType: (row.pay_type as Employee["payType"]) ?? undefined,
    color: (row.color as string) ?? "#3B82F6",
    avatar: (row.avatar as string) ?? "",
  };
}

// Convert snake_case DB row → camelCase TimeEntry
function rowToTimeEntry(row: Record<string, unknown>): TimeEntry {
  return {
    id: row.id as string,
    employeeId: row.employee_id as string,
    date: row.date as string,
    clockIn: row.clock_in as string,
    clockOut: row.clock_out as string,
    hours: Number(row.hours),
  };
}

// Convert snake_case DB row → camelCase Message
function rowToMessage(
  row: Record<string, unknown>,
  items: { from: "me" | "them"; text: string; time: string }[]
): Message {
  return {
    id: row.id as string,
    contactName: row.contact_name as string,
    contactType: row.contact_type as "client" | "team",
    avatar: (row.avatar as string) ?? "",
    color: (row.color as string) ?? "#3B82F6",
    messages: items,
    unread: Number(row.unread ?? 0),
  };
}

/* ────────────────────────── Provider ────────────────────────── */

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { profile, authReady } = useAuth();
  const businessId = profile?.businessId ?? null;
  const { isReadOnly } = useSettings();

  const useSupabase = useRef(isSupabaseConfigured());

  const [clients, setClientsRaw] = useState<Client[]>(useSupabase.current ? [] : CLIENTS);
  const [jobs, setJobsRaw] = useState<Job[]>(useSupabase.current ? [] : JOBS);
  const [employees, setEmployeesRaw] = useState<Employee[]>(useSupabase.current ? [] : EMPLOYEES);
  const [messages, setMessagesRaw] = useState<Message[]>(useSupabase.current ? [] : MESSAGES);
  const [timeEntries, setTimeEntriesRaw] = useState<TimeEntry[]>(useSupabase.current ? [] : TIME_ENTRIES);
  const [expenses, setExpensesRaw] = useState<Expense[]>([]);
  const [expenseCategories, setExpenseCategoriesRaw] = useState<ExpenseCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  // ─── Initial load ───
  useEffect(() => {
    if (useSupabase.current) {
      // Wait for auth to finish initializing before deciding whether to fetch
      if (!authReady) {
        log.debug("fetchAll", "waiting for auth to be ready");
        return;
      }

      // Wait for profile/businessId to be available before fetching
      if (!businessId) {
        log.warn("fetchAll", "no businessId available - skipping data fetch (dashboard will be empty)", {
          hasProfile: !!profile,
        });
        setLoading(false);
        return;
      }

      log.info("fetchAll", "starting data fetch", { businessId });
      // Fetch from Supabase
      const supabase = createClient();

      async function fetchAll() {
        try {
          const [clientsRes, jobsRes, employeesRes, timeEntriesRes, messagesRes, expensesRes, categoriesRes] =
            await Promise.all([
              supabase.from("clients").select("*"),
              supabase.from("jobs").select("*, job_employees(employee_id)"),
              supabase.from("employees").select("*"),
              supabase.from("time_entries").select("*"),
              supabase.from("messages").select("*, message_items(*)"),
              supabase.from("expenses").select("*"),
              supabase.from("expense_categories").select("*"),
            ]);

          // Check for query errors
          const queryErrors: Record<string, unknown> = {};
          if (clientsRes.error) queryErrors.clients = clientsRes.error;
          if (jobsRes.error) queryErrors.jobs = jobsRes.error;
          if (employeesRes.error) queryErrors.employees = employeesRes.error;
          if (timeEntriesRes.error) queryErrors.timeEntries = timeEntriesRes.error;
          if (messagesRes.error) queryErrors.messages = messagesRes.error;
          if (expensesRes.error) queryErrors.expenses = expensesRes.error;
          if (categoriesRes.error) queryErrors.categories = categoriesRes.error;
          if (Object.keys(queryErrors).length > 0) {
            log.error("fetchAll", "one or more data queries failed", {
              businessId, failedQueries: Object.keys(queryErrors).join(", "), ...queryErrors,
            });
          }

          if (clientsRes.data) {
            setClientsRaw(clientsRes.data.map(rowToClient));
          } else if (clientsRes.error) {
            log.error("fetchAll", "clients query returned error", { businessId, error: clientsRes.error });
          }

          if (jobsRes.data) {
            setJobsRaw(
              jobsRes.data.map((row: Record<string, unknown>) => {
                const je = (row.job_employees as { employee_id: string }[]) ?? [];
                return rowToJob(row, je.map((j) => j.employee_id));
              })
            );
          }

          if (employeesRes.data) {
            setEmployeesRaw(employeesRes.data.map(rowToEmployee));
          } else if (employeesRes.error) {
            log.error("fetchAll", "employees query returned error", { businessId, error: employeesRes.error });
          }

          if (timeEntriesRes.data) {
            setTimeEntriesRaw(timeEntriesRes.data.map(rowToTimeEntry));
          } else if (timeEntriesRes.error) {
            log.error("fetchAll", "timeEntries query returned error", { businessId, error: timeEntriesRes.error });
          }

          if (messagesRes.data) {
            setMessagesRaw(
              messagesRes.data.map((row: Record<string, unknown>) => {
                const items = (
                  (row.message_items as Record<string, unknown>[]) ?? []
                ).map((mi) => ({
                  from: mi.from_who as "me" | "them",
                  text: mi.text as string,
                  time: mi.time as string,
                }));
                return rowToMessage(row, items);
              })
            );
          }

          if (expensesRes.data) {
            setExpensesRaw(
              expensesRes.data.map((row: Record<string, unknown>) => ({
                id: row.id as string,
                businessId: (row.business_id as string) ?? "",
                date: row.date as string,
                description: row.description as string,
                amount: Number(row.amount),
                categoryId: (row.category_id as string) ?? null,
                vendor: (row.vendor as string) ?? "",
                jobId: (row.job_id as string) ?? null,
                receiptUrl: (row.receipt_url as string) ?? null,
                notes: (row.notes as string) ?? "",
              }))
            );
          }

          if (categoriesRes.data) {
            setExpenseCategoriesRaw(
              categoriesRes.data.map((row: Record<string, unknown>) => ({
                id: row.id as string,
                businessId: (row.business_id as string) ?? "",
                name: row.name as string,
                color: (row.color as string) ?? "#6B7280",
                icon: (row.icon as string) ?? "",
                isDefault: (row.is_default as boolean) ?? false,
              }))
            );
          }
        } catch (err) {
          log.error("fetchAll", "Promise.all threw - all queries failed together", {
            businessId, error: err instanceof Error ? err : String(err),
          });
        } finally {
          log.info("fetchAll", "data fetch complete", { businessId });
          setLoading(false);
        }
      }

      fetchAll();
    } else {
      // Fallback: load from localStorage
      const loadLS = <T,>(key: string, setter: React.Dispatch<React.SetStateAction<T>>) => {
        const saved = localStorage.getItem(key);
        if (saved) {
          try {
            setter(JSON.parse(saved) as T);
          } catch {
            // ignore corrupt data
          }
        }
      };

      loadLS(CLIENTS_KEY, setClientsRaw);
      loadLS(JOBS_KEY, setJobsRaw);
      loadLS(EMPLOYEES_KEY, setEmployeesRaw);
      loadLS(MESSAGES_KEY, setMessagesRaw);
      loadLS(TIME_ENTRIES_KEY, setTimeEntriesRaw);
      loadLS(EXPENSES_KEY, setExpensesRaw);
      loadLS(EXPENSE_CATEGORIES_KEY, setExpenseCategoriesRaw);
      setLoading(false);
    }
  }, [businessId, authReady]);

  // ─── Supabase sync helpers ───

  const syncClients = useCallback(async (next: Client[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(CLIENTS_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncClients", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("clients").upsert(
        next.map((c) => ({
          id: c.id,
          business_id: businessId,
          name: c.name,
          contact: c.contact,
          phone: c.phone,
          email: c.email ?? "",
          address: c.address,
          frequency: c.frequency,
          payment_method: c.paymentMethod,
          notes: c.notes,
          service_type: c.serviceType,
          service_rate: c.serviceRate ?? null,
          service_rate_type: c.serviceRateType ?? null,
        }))
      );
      if (error) log.error("syncClients", "upsert failed", { businessId, error });
    } catch (err) {
      log.error("syncClients", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncJobs = useCallback(async (next: Job[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(JOBS_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncJobs", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      // Batch upsert all jobs in one call
      const { error } = await supabase.from("jobs").upsert(
        next.map((j) => ({
          id: j.id,
          business_id: businessId,
          client_id: j.clientId,
          date: j.date,
          time: j.time,
          duration: j.duration,
          status: j.status,
          amount: j.amount,
          rate_type: j.rateType ?? null,
          payment_status: j.paymentStatus,
          payment_via: j.paymentVia ?? null,
          invoice_sent_at: j.invoiceSentAt ?? null,
          is_recurring: j.isRecurring ?? false,
          recurrence_rule: j.recurrenceRule ?? null,
          recurrence_end_date: j.recurrenceEndDate ?? null,
          parent_job_id: j.parentJobId ?? null,
          series_id: j.seriesId ?? null,
        }))
      );
      if (error) log.error("syncJobs", "upsert failed", { businessId, error });

      // Sync job_employees junction table
      const jobIds = next.map((j) => j.id);
      if (jobIds.length > 0) {
        const { error: deleteJeError } = await supabase.from("job_employees").delete().in("job_id", jobIds);
        if (deleteJeError) log.error("syncJobs", "job_employees delete failed", { businessId, error: deleteJeError });
        const allJunctionRows = next.flatMap((j) =>
          j.employeeIds.map((empId) => ({
            job_id: j.id,
            employee_id: empId,
          }))
        );
        if (allJunctionRows.length > 0) {
          const { error: insertJeError } = await supabase.from("job_employees").insert(allJunctionRows);
          if (insertJeError) log.error("syncJobs", "job_employees insert failed", { businessId, rowCount: allJunctionRows.length, error: insertJeError });
        }
      }
    } catch (err) {
      log.error("syncJobs", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncEmployees = useCallback(async (next: Employee[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncEmployees", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("employees").upsert(
        next.map((e) => ({
          id: e.id,
          business_id: businessId,
          name: e.name,
          phone: e.phone,
          role: e.role,
          rate: e.rate,
          pay_type: e.payType ?? "hourly",
          color: e.color,
          avatar: e.avatar,
        }))
      );
      if (error) log.error("syncEmployees", "upsert failed", { businessId, error });
    } catch (err) {
      log.error("syncEmployees", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncMessages = useCallback(async (next: Message[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncMessages", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      // Batch upsert all messages in one call
      const { error } = await supabase.from("messages").upsert(
        next.map((m) => ({
          id: m.id,
          business_id: businessId,
          contact_name: m.contactName,
          contact_type: m.contactType,
          avatar: m.avatar,
          color: m.color,
          unread: m.unread,
        }))
      );
      if (error) log.error("syncMessages", "upsert failed", { businessId, error });

      // Sync message_items junction table
      const msgIds = next.map((m) => m.id);
      if (msgIds.length > 0) {
        const { error: deleteMiError } = await supabase.from("message_items").delete().in("message_id", msgIds);
        if (deleteMiError) log.error("syncMessages", "message_items delete failed", { businessId, error: deleteMiError });
        const allItems = next.flatMap((m) =>
          m.messages.map((mi) => ({
            message_id: m.id,
            from_who: mi.from,
            text: mi.text,
            time: mi.time,
          }))
        );
        if (allItems.length > 0) {
          const { error: insertMiError } = await supabase.from("message_items").insert(allItems);
          if (insertMiError) log.error("syncMessages", "message_items insert failed", { businessId, rowCount: allItems.length, error: insertMiError });
        }
      }
    } catch (err) {
      log.error("syncMessages", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncTimeEntries = useCallback(async (next: TimeEntry[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(TIME_ENTRIES_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncTimeEntries", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("time_entries").upsert(
        next.map((te) => ({
          id: te.id,
          business_id: businessId,
          employee_id: te.employeeId,
          date: te.date,
          clock_in: te.clockIn,
          clock_out: te.clockOut,
          hours: te.hours,
        }))
      );
      if (error) log.error("syncTimeEntries", "upsert failed", { businessId, error });
    } catch (err) {
      log.error("syncTimeEntries", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncExpenses = useCallback(async (next: Expense[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(EXPENSES_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncExpenses", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expenses").upsert(
        next.map((exp) => ({
          id: exp.id,
          business_id: businessId,
          date: exp.date,
          description: exp.description,
          amount: exp.amount,
          category_id: exp.categoryId,
          vendor: exp.vendor,
          job_id: exp.jobId,
          receipt_url: exp.receiptUrl,
          notes: exp.notes,
        }))
      );
      if (error) log.error("syncExpenses", "upsert failed", { businessId, error });
    } catch (err) {
      log.error("syncExpenses", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  const syncExpenseCategories = useCallback(async (next: ExpenseCategory[]) => {
    if (!useSupabase.current) {
      localStorage.setItem(EXPENSE_CATEGORIES_KEY, JSON.stringify(next));
      return;
    }
    if (!businessId) { log.warn("syncExpenseCategories", "skipped - no businessId", { itemCount: next.length }); return; }
    try {
      const supabase = createClient();
      const { error } = await supabase.from("expense_categories").upsert(
        next.map((cat) => ({
          id: cat.id,
          business_id: businessId,
          name: cat.name,
          color: cat.color,
          icon: cat.icon,
          is_default: cat.isDefault,
        }))
      );
      if (error) log.error("syncExpenseCategories", "upsert failed", { businessId, error });
    } catch (err) {
      log.error("syncExpenseCategories", "unexpected exception", { businessId, error: err instanceof Error ? err : String(err) });
    }
  }, [businessId]);

  // ─── Wrapped setters (optimistic update + async persist) ───

  const setClients: React.Dispatch<React.SetStateAction<Client[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setClients", "write blocked - account is read-only"); return; }
      setClientsRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncClients(next);
        return next;
      });
    },
    [syncClients, isReadOnly]
  );

  const setJobs: React.Dispatch<React.SetStateAction<Job[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setJobs", "write blocked - account is read-only"); return; }
      setJobsRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncJobs(next);
        return next;
      });
    },
    [syncJobs, isReadOnly]
  );

  const setEmployees: React.Dispatch<React.SetStateAction<Employee[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setEmployees", "write blocked - account is read-only"); return; }
      setEmployeesRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncEmployees(next);
        return next;
      });
    },
    [syncEmployees, isReadOnly]
  );

  const setMessages: React.Dispatch<React.SetStateAction<Message[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setMessages", "write blocked - account is read-only"); return; }
      setMessagesRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncMessages(next);
        return next;
      });
    },
    [syncMessages, isReadOnly]
  );

  const setTimeEntries: React.Dispatch<React.SetStateAction<TimeEntry[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setTimeEntries", "write blocked - account is read-only"); return; }
      setTimeEntriesRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncTimeEntries(next);
        return next;
      });
    },
    [syncTimeEntries, isReadOnly]
  );

  const setExpenses: React.Dispatch<React.SetStateAction<Expense[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setExpenses", "write blocked - account is read-only"); return; }
      setExpensesRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncExpenses(next);
        return next;
      });
    },
    [syncExpenses, isReadOnly]
  );

  const setExpenseCategories: React.Dispatch<React.SetStateAction<ExpenseCategory[]>> = useCallback(
    (action) => {
      if (isReadOnly) { log.warn("setExpenseCategories", "write blocked - account is read-only"); return; }
      setExpenseCategoriesRaw((prev) => {
        const next = typeof action === "function" ? action(prev) : action;
        syncExpenseCategories(next);
        return next;
      });
    },
    [syncExpenseCategories, isReadOnly]
  );

  return (
    <DataContext.Provider
      value={{
        clients,
        setClients,
        jobs,
        setJobs,
        employees,
        setEmployees,
        messages,
        setMessages,
        timeEntries,
        setTimeEntries,
        expenses,
        setExpenses,
        expenseCategories,
        setExpenseCategories,
        loading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx)
    throw new Error("useData must be used within a DataProvider");
  return ctx;
}

"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { DEFAULT_BUSINESS_SETTINGS } from "./data";
import { createClient } from "./supabase";
import { createModuleLogger } from "./logger";
import type { BusinessSettings, SubscriptionStatus } from "@/types";

const log = createModuleLogger("settings");

interface SettingsContextValue {
  settings: BusinessSettings;
  updateSettings: (patch: Partial<BusinessSettings>) => void;
  isReadOnly: boolean;
  daysLeftInTrial: number;
  subscriptionStatus: SubscriptionStatus;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

const SETTINGS_LS_KEY = "runitsimply-settings";

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

// Convert a DB business row to BusinessSettings
function rowToSettings(row: Record<string, unknown>): BusinessSettings {
  return {
    venmoHandle: (row.venmo_handle as string) ?? "",
    zelleEmail: (row.zelle_email as string) ?? "",
    stripeConnected: (row.stripe_connected as boolean) ?? false,
    employeeSelfLog: (row.employee_self_log as boolean) ?? false,
    hidePayroll: (row.hide_payroll as boolean) ?? false,
    referralCode: (row.referral_code as string) ?? "",
    referralsCount: Number(row.referrals_count ?? 0),
    referralCredit: Number(row.referral_credit ?? 0),
    businessName: (row.name as string) ?? "",
    businessPhone: (row.phone as string) ?? "",
    businessEmail: (row.email as string) ?? "",
    trialEndsAt: (row.trial_ends_at as string) ?? undefined,
    subscriptionStatus: (row.subscription_status as SubscriptionStatus) ?? "trial",
  };
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] =
    useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);

  const useSupabase = useRef(isSupabaseConfigured());
  const businessIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (useSupabase.current) {
      const supabase = createClient();

      async function fetchSettings() {
        try {
          // Get the first business the user belongs to
          const { data, error: fetchError } = await supabase
            .from("businesses")
            .select("*")
            .limit(1)
            .maybeSingle();

          if (fetchError) {
            log.error("fetchSettings", "business query failed", { error: fetchError });
          } else if (!data) {
            log.warn("fetchSettings", "no business found for current user - settings will use defaults");
          } else {
            businessIdRef.current = data.id as string;
            setSettings(rowToSettings(data as Record<string, unknown>));
            log.debug("fetchSettings", "business settings loaded", { businessId: data.id });
          }
        } catch (err) {
          log.error("fetchSettings", "unexpected exception fetching settings", {
            error: err instanceof Error ? err : String(err),
          });
        }
      }

      fetchSettings();
    } else {
      // Fallback: load from localStorage
      const saved = localStorage.getItem(SETTINGS_LS_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure trial fields exist for localStorage users
          if (!parsed.trialEndsAt) {
            parsed.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
            parsed.subscriptionStatus = "trial";
            localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(parsed));
          }
          setSettings({ ...DEFAULT_BUSINESS_SETTINGS, ...parsed });
        } catch {
          // ignore corrupt data
        }
      }
    }
  }, []);

  // ── Trial / subscription derived state ──

  const subscriptionStatus: SubscriptionStatus = settings.subscriptionStatus ?? "trial";

  const daysLeftInTrial = useMemo(() => {
    if (!settings.trialEndsAt) return 14;
    const now = new Date();
    const end = new Date(settings.trialEndsAt);
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [settings.trialEndsAt]);

  const isTrialExpired =
    subscriptionStatus === "expired" ||
    (subscriptionStatus === "trial" && daysLeftInTrial <= 0);

  const isReadOnly = isTrialExpired || subscriptionStatus === "cancelled";

  // Auto-expire: mark trial as expired in DB/localStorage when time is up
  useEffect(() => {
    if (subscriptionStatus === "trial" && daysLeftInTrial <= 0) {
      if (useSupabase.current && businessIdRef.current) {
        const supabase = createClient();
        supabase
          .from("businesses")
          .update({ subscription_status: "expired" })
          .eq("id", businessIdRef.current)
          .then(({ error }) => {
            if (error) {
              log.error("autoExpireTrial", "failed to update subscription_status to expired", {
                businessId: businessIdRef.current, error,
              });
            } else {
              log.info("autoExpireTrial", "trial marked as expired in database", {
                businessId: businessIdRef.current,
              });
            }
          });
      }
      setSettings((prev) => {
        const next = { ...prev, subscriptionStatus: "expired" as const };
        if (!useSupabase.current) {
          localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(next));
        }
        return next;
      });
    }
  }, [subscriptionStatus, daysLeftInTrial]);

  const updateSettings = useCallback((patch: Partial<BusinessSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };

      if (useSupabase.current && businessIdRef.current) {
        // Persist to Supabase businesses table (async, fire-and-forget)
        const supabase = createClient();
        supabase
          .from("businesses")
          .update({
            name: next.businessName ?? "",
            phone: next.businessPhone ?? "",
            email: next.businessEmail ?? "",
            venmo_handle: next.venmoHandle,
            zelle_email: next.zelleEmail,
            stripe_connected: next.stripeConnected,
            employee_self_log: next.employeeSelfLog,
            hide_payroll: next.hidePayroll,
            referral_code: next.referralCode,
            referrals_count: next.referralsCount,
            referral_credit: next.referralCredit,
          })
          .eq("id", businessIdRef.current)
          .then(({ error }) => {
            if (error) {
              log.error("updateSettings", "business settings update failed", {
                businessId: businessIdRef.current, error,
              });
            } else {
              log.debug("updateSettings", "settings persisted to database", {
                businessId: businessIdRef.current,
              });
            }
          });
      } else {
        localStorage.setItem(SETTINGS_LS_KEY, JSON.stringify(next));
      }

      return next;
    });
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, updateSettings, isReadOnly, daysLeftInTrial, subscriptionStatus }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx)
    throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

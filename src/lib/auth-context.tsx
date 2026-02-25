"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "./supabase";
import type { User } from "@supabase/supabase-js";

type Role = "owner" | "employee";

interface Profile {
  id: string;
  businessId: string;
  role: Role;
  employeeId: string | null;
  fullName: string;
}

interface AuthContextValue {
  role: Role;
  setRole: (role: Role) => void;
  currentEmployeeId: string | null;
  setCurrentEmployeeId: (id: string | null) => void;
  isOwner: boolean;
  // New auth fields
  user: User | null;
  profile: Profile | null;
  signOut: () => Promise<void>;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_KEY = "runitsimply-auth";

interface StoredAuth {
  role: Role;
  currentEmployeeId: string | null;
}

// Check if Supabase is configured
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleRaw] = useState<Role>("owner");
  const [currentEmployeeId, setCurrentEmployeeIdRaw] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const router = useRouter();
  const useSupabase = useRef(isSupabaseConfigured());

  // ─── Supabase Auth ───
  useEffect(() => {
    if (useSupabase.current) {
      const supabase = createClient();

      // Get initial session
      async function getSession() {
        try {
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          setUser(currentUser);

          if (currentUser) {
            // Fetch profile
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", currentUser.id)
              .maybeSingle();

            if (profileData) {
              const prof: Profile = {
                id: profileData.id as string,
                businessId: profileData.business_id as string,
                role: profileData.role as Role,
                employeeId: (profileData.employee_id as string) ?? null,
                fullName: (profileData.full_name as string) ?? "",
              };
              setProfile(prof);
              setRoleRaw(prof.role);
              setCurrentEmployeeIdRaw(prof.employeeId);
            }
          }
        } catch (err) {
          console.error("Failed to get auth session:", err);
        } finally {
          setAuthReady(true);
        }
      }

      getSession();

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setUser(session?.user ?? null);
          if (event === "SIGNED_OUT") {
            setProfile(null);
            setRoleRaw("owner");
            setCurrentEmployeeIdRaw(null);
          }
          if (event === "SIGNED_IN" && session?.user) {
            // Fetch profile on sign in (use maybeSingle to avoid errors for new users)
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .maybeSingle();

            if (profileData) {
              const prof: Profile = {
                id: profileData.id as string,
                businessId: profileData.business_id as string,
                role: profileData.role as Role,
                employeeId: (profileData.employee_id as string) ?? null,
                fullName: (profileData.full_name as string) ?? "",
              };
              setProfile(prof);
              setRoleRaw(prof.role);
              setCurrentEmployeeIdRaw(prof.employeeId);
            }
          }
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // ─── Fallback: localStorage role switcher ───
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        try {
          const parsed: StoredAuth = JSON.parse(saved);
          if (parsed.role === "owner" || parsed.role === "employee") {
            setRoleRaw(parsed.role);
          }
          if (typeof parsed.currentEmployeeId === "string" || parsed.currentEmployeeId === null) {
            setCurrentEmployeeIdRaw(parsed.currentEmployeeId);
          }
        } catch {
          // ignore corrupt data
        }
      }
      setAuthReady(true);
    }
  }, []);

  // ─── localStorage persistence (fallback mode only) ───
  const persist = useCallback((r: Role, empId: string | null) => {
    if (!useSupabase.current) {
      localStorage.setItem(AUTH_KEY, JSON.stringify({ role: r, currentEmployeeId: empId }));
    }
  }, []);

  const setRole = useCallback(
    (newRole: Role) => {
      // In Supabase mode, role is derived from profile and can't be manually switched
      if (useSupabase.current) return;

      setRoleRaw(newRole);
      if (newRole === "owner") {
        setCurrentEmployeeIdRaw(null);
        persist(newRole, null);
      } else {
        setCurrentEmployeeIdRaw((prev) => {
          persist(newRole, prev);
          return prev;
        });
      }
    },
    [persist]
  );

  const setCurrentEmployeeId = useCallback(
    (id: string | null) => {
      if (useSupabase.current) return;
      setCurrentEmployeeIdRaw(id);
      persist(role, id);
    },
    [role, persist]
  );

  const signOut = useCallback(async () => {
    if (useSupabase.current) {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    }
  }, [router]);

  const isOwner = role === "owner";

  return (
    <AuthContext.Provider
      value={{
        role,
        setRole,
        currentEmployeeId,
        setCurrentEmployeeId,
        isOwner,
        user,
        profile,
        signOut,
        authReady,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

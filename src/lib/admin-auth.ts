import { createServerSupabaseClient } from "./supabase-server";

/**
 * Verify the current session user is a platform admin.
 * Checks the authenticated user's email against the ADMIN_EMAILS env var.
 */
export async function verifyAdmin(): Promise<{ authorized: boolean; email?: string }> {
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (adminEmails.length === 0) return { authorized: false };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return { authorized: false };

  return {
    authorized: adminEmails.includes(user.email.toLowerCase()),
    email: user.email,
  };
}

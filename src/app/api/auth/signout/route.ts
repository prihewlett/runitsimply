import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("auth-signout");

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      log.error("POST", "server-side signOut failed", { error });
      return NextResponse.json({ error: "Sign out failed" }, { status: 500 });
    }

    log.info("POST", "user signed out server-side (cookies cleared)");
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("POST", "signout error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

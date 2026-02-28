import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-activate");

export async function POST(request: NextRequest) {
  try {
    const adminSecret = process.env.ADMIN_SECRET_KEY;
    if (!adminSecret) {
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    // Verify admin secret from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { businessId, action } = body;

    if (!businessId) {
      return NextResponse.json({ error: "businessId is required" }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (action === "deactivate") {
      const { error } = await supabase
        .from("businesses")
        .update({ subscription_status: "cancelled" })
        .eq("id", businessId);

      if (error) {
        log.error("POST", "failed to deactivate", { businessId, error });
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
      }

      log.info("POST", "subscription manually deactivated", { businessId });
      return NextResponse.json({ success: true, status: "cancelled" });
    }

    // Default: activate
    const { error } = await supabase
      .from("businesses")
      .update({ subscription_status: "active" })
      .eq("id", businessId);

    if (error) {
      log.error("POST", "failed to activate", { businessId, error });
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    log.info("POST", "subscription manually activated", { businessId });
    return NextResponse.json({ success: true, status: "active" });
  } catch (err) {
    log.error("POST", "admin activate error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

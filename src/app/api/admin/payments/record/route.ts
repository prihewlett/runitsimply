import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-payments");

export async function POST(request: NextRequest) {
  try {
    const { authorized, email } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      businessId,
      amount = 19.99,
      paymentMethod,
      periodStart,
      periodEnd,
      referenceNote = "",
      activateSubscription = true,
    } = await request.json();

    if (!businessId || !paymentMethod) {
      return NextResponse.json(
        { error: "businessId and paymentMethod are required" },
        { status: 400 }
      );
    }

    const validMethods = ["venmo", "zelle", "stripe", "other"];
    if (!validMethods.includes(paymentMethod)) {
      return NextResponse.json(
        { error: `paymentMethod must be one of: ${validMethods.join(", ")}` },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Insert payment record
    const { data: payment, error: insertError } = await supabase
      .from("subscription_payments")
      .insert({
        business_id: businessId,
        amount,
        payment_method: paymentMethod,
        status: "completed",
        period_start: periodStart || null,
        period_end: periodEnd || null,
        reference_note: referenceNote,
        recorded_by: email || "admin",
      })
      .select("id")
      .single();

    if (insertError) {
      log.error("POST", "failed to insert payment", { insertError });
      // If the table doesn't exist, still allow activating the subscription
      if (!activateSubscription) {
        return NextResponse.json(
          { error: "Failed to record payment. Have you run the database migration?" },
          { status: 500 }
        );
      }
    }

    // Optionally activate subscription
    if (activateSubscription) {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({ subscription_status: "active", trial_ends_at: null })
        .eq("id", businessId);

      if (updateError) {
        log.error("POST", "failed to activate subscription", { updateError });
        return NextResponse.json(
          { error: "Failed to activate subscription" },
          { status: 500 }
        );
      }
    }

    log.info("POST", "payment recorded", {
      paymentId: payment?.id || "no-table",
      businessId,
      paymentMethod,
      amount,
      activateSubscription,
      recordedBy: email,
    });

    return NextResponse.json({ success: true, paymentId: payment?.id || null });
  } catch (err) {
    log.error("POST", "record payment error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

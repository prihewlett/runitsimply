import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-payment-request");

export async function POST(request: NextRequest) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, method, customMessage } = await request.json();

    if (!businessId || !method) {
      return NextResponse.json(
        { error: "businessId and method (sms/email) are required" },
        { status: 400 }
      );
    }

    if (method !== "sms" && method !== "email") {
      return NextResponse.json(
        { error: "method must be 'sms' or 'email'" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Fetch business details
    const { data: business, error } = await supabase
      .from("businesses")
      .select("id, name, email, phone")
      .eq("id", businessId)
      .single();

    if (error || !business) {
      return NextResponse.json(
        { error: "Business not found" },
        { status: 404 }
      );
    }

    const recipient =
      method === "sms" ? business.phone : business.email;

    if (!recipient) {
      return NextResponse.json(
        { error: `Business has no ${method === "sms" ? "phone number" : "email address"} on file` },
        { status: 400 }
      );
    }

    // Platform payment details from env vars
    const platformVenmo = process.env.PLATFORM_VENMO_HANDLE || "";
    const platformZelle = process.env.PLATFORM_ZELLE_EMAIL || "";

    // Build payment request message
    let messageBody: string;

    if (customMessage) {
      messageBody = customMessage;
    } else {
      const lines = [
        `Hi ${business.name || "there"}! Your RunItSimply subscription of $19.99 is due.`,
        "",
        "Pay via:",
      ];

      if (platformVenmo) {
        lines.push(`Venmo: @${platformVenmo}`);
      }

      if (platformZelle) {
        lines.push(`Zelle: ${platformZelle}`);
      }

      lines.push("");
      lines.push("Thank you!");

      messageBody = lines.join("\n");
    }

    if (method === "sms") {
      // Call Twilio directly (avoids internal fetch auth issues)
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        return NextResponse.json({ error: "Twilio is not configured" }, { status: 503 });
      }

      // Normalize to E.164 format (+1XXXXXXXXXX)
      const digits = recipient.replace(/\D/g, "");
      const toNumber =
        digits.length === 10 ? `+1${digits}` :
        digits.length === 11 && digits.startsWith("1") ? `+${digits}` :
        `+${digits}`;

      const twilio = await import("twilio");
      const client = twilio.default(accountSid, authToken);
      await client.messages.create({ body: messageBody, from: fromNumber, to: toNumber });
    } else {
      // Email: delegate to send-email route
      const origin = request.nextUrl.origin;
      const res = await fetch(`${origin}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({
          to: recipient,
          subject: "RunItSimply Pro — Payment Due",
          body: messageBody,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        log.error("POST", "failed to send payment request email", { businessId, error: data.error });
        return NextResponse.json({ error: data.error || "Failed to send email" }, { status: 500 });
      }
    }

    log.info("POST", "payment request sent", {
      businessId,
      method,
      recipient,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("POST", "send payment request error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

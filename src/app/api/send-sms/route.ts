import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to: rawTo, body } = await request.json();

    if (!rawTo || !body) {
      return NextResponse.json(
        { error: "to and body are required" },
        { status: 400 }
      );
    }

    // Normalize to E.164 format (+1XXXXXXXXXX for US numbers)
    const digits = rawTo.replace(/\D/g, "");
    const to = digits.startsWith("1") && digits.length === 11
      ? `+${digits}`
      : digits.length === 10
      ? `+1${digits}`
      : rawTo.startsWith("+") ? rawTo : `+${digits}`;

    // Check if Twilio is configured
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json(
        { error: "Twilio is not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER." },
        { status: 503 }
      );
    }

    // Send SMS via Twilio
    const twilio = await import("twilio");
    const client = twilio.default(accountSid, authToken);

    const message = await client.messages.create({
      body,
      from: fromNumber,
      to,
    });

    return NextResponse.json({
      success: true,
      sid: message.sid,
      status: message.status,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Send SMS error:", message);
    return NextResponse.json(
      { error: message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}

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

    const { method, to, subject, body, jobId } = await request.json();

    if (!method || !to || !body) {
      return NextResponse.json(
        { error: "method, to, and body are required" },
        { status: 400 }
      );
    }

    const origin = request.nextUrl.origin;
    let result: { success: boolean; externalId?: string; error?: string };

    if (method === "email") {
      // Delegate to send-email route
      const res = await fetch(`${origin}/api/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ to, subject: subject || "Invoice", body }),
      });
      const data = await res.json();
      result = {
        success: res.ok,
        externalId: data.id,
        error: data.error,
      };
    } else if (method === "sms") {
      // Delegate to send-sms route
      const res = await fetch(`${origin}/api/send-sms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: request.headers.get("cookie") || "",
        },
        body: JSON.stringify({ to, body }),
      });
      const data = await res.json();
      result = {
        success: res.ok,
        externalId: data.sid,
        error: data.error,
      };
    } else {
      return NextResponse.json(
        { error: "method must be 'email' or 'sms'" },
        { status: 400 }
      );
    }

    // Log delivery to Supabase (fire-and-forget if table exists)
    try {
      await supabase.from("delivery_log").insert({
        method,
        recipient: to,
        status: result.success ? "sent" : "failed",
        external_id: result.externalId || null,
        job_id: jobId || null,
        error_message: result.error || null,
      });
    } catch {
      // delivery_log table may not exist yet, ignore
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      externalId: result.externalId,
    });
  } catch (err) {
    console.error("Send invoice error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

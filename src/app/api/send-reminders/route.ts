import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("send-reminders");

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

    // Get the user's business
    const { data: profile } = await supabase
      .from("profiles")
      .select("business_id")
      .eq("id", user.id)
      .single();

    if (!profile?.business_id) {
      return NextResponse.json({ error: "No business found" }, { status: 400 });
    }

    const businessId = profile.business_id;

    // Get business settings for the name
    const { data: business } = await supabase
      .from("businesses")
      .select("name")
      .eq("id", businessId)
      .single();

    const businessName = business?.name || "Your service provider";

    // Get tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    log.info("POST", "fetching tomorrow's jobs", { businessId, date: tomorrowStr });

    // Get tomorrow's jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("id, client_id, date, time, duration, amount")
      .eq("business_id", businessId)
      .eq("date", tomorrowStr)
      .eq("status", "scheduled");

    if (jobsError) {
      log.error("POST", "failed to fetch jobs", { error: jobsError });
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
    }

    if (!jobs || jobs.length === 0) {
      log.info("POST", "no jobs scheduled for tomorrow", { date: tomorrowStr });
      return NextResponse.json({ sent: 0, failed: 0, skipped: 0, message: "No jobs scheduled for tomorrow" });
    }

    // Get unique client IDs
    const clientIds = [...new Set(jobs.map((j) => j.client_id))];

    // Get client info
    const { data: clients } = await supabase
      .from("clients")
      .select("id, name, contact, phone")
      .in("id", clientIds);

    const clientMap = new Map((clients || []).map((c) => [c.id, c]));

    let sent = 0;
    let failed = 0;
    let skipped = 0;
    const origin = request.nextUrl.origin;

    for (const job of jobs) {
      const client = clientMap.get(job.client_id);
      if (!client?.phone) {
        log.warn("POST", "skipping job - no client phone", { jobId: job.id, clientId: job.client_id });
        skipped++;
        continue;
      }

      const smsBody = `Hi ${client.contact || client.name}! Reminder: your service with ${businessName} is scheduled for tomorrow at ${job.time}. See you then!`;

      try {
        const res = await fetch(`${origin}/api/send-sms`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            cookie: request.headers.get("cookie") || "",
          },
          body: JSON.stringify({ to: client.phone, body: smsBody }),
        });

        const data = await res.json();

        // Log to delivery_log
        try {
          await supabase.from("delivery_log").insert({
            business_id: businessId,
            method: "sms",
            recipient: client.phone,
            status: res.ok ? "sent" : "failed",
            external_id: data.sid || null,
            job_id: job.id,
            error_message: data.error || null,
          });
        } catch {
          // delivery_log table may not exist
        }

        if (res.ok) {
          sent++;
          log.info("POST", "reminder sent", { jobId: job.id, client: client.name });
        } else {
          failed++;
          log.warn("POST", "reminder failed", { jobId: job.id, error: data.error });
        }
      } catch (err) {
        failed++;
        log.error("POST", "reminder exception", { jobId: job.id, error: err instanceof Error ? err.message : String(err) });
      }
    }

    log.info("POST", "reminders complete", { sent, failed, skipped, total: jobs.length });
    return NextResponse.json({ sent, failed, skipped });
  } catch (err) {
    log.error("POST", "unexpected error", { error: err instanceof Error ? err : String(err) });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

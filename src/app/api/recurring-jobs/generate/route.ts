import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";

/**
 * Generate missing recurring job instances for a given date range.
 * POST /api/recurring-jobs/generate
 * Body: { startDate: string, endDate: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { startDate, endDate } = await request.json();

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: "startDate and endDate are required" },
        { status: 400 }
      );
    }

    // Get all recurring parent jobs
    const { data: parentJobs, error: fetchError } = await supabase
      .from("jobs")
      .select("*, job_employees(employee_id)")
      .eq("is_recurring", true)
      .is("parent_job_id", null);

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!parentJobs || parentJobs.length === 0) {
      return NextResponse.json({ generated: 0 });
    }

    let generated = 0;

    for (const parent of parentJobs) {
      const rule = parent.recurrence_rule;
      if (!rule) continue;

      const seriesId = parent.series_id || parent.id;
      const parentDate = new Date(parent.date);
      const rangeStart = new Date(startDate);
      const rangeEnd = new Date(endDate);
      const recEndDate = parent.recurrence_end_date
        ? new Date(parent.recurrence_end_date)
        : null;

      // Calculate which dates need instances
      let currentDate = new Date(parentDate);

      // Move to the first occurrence after or on rangeStart
      while (currentDate < rangeStart) {
        currentDate = getNextDate(currentDate, rule);
      }

      // Generate instances for each date in range
      while (currentDate <= rangeEnd) {
        if (recEndDate && currentDate > recEndDate) break;

        const dateStr = currentDate.toISOString().split("T")[0];

        // Skip the parent job's own date
        if (dateStr === parent.date) {
          currentDate = getNextDate(currentDate, rule);
          continue;
        }

        // Check if an instance already exists for this date + series
        const { data: existing } = await supabase
          .from("jobs")
          .select("id")
          .eq("series_id", seriesId)
          .eq("date", dateStr)
          .limit(1);

        if (!existing || existing.length === 0) {
          // Create the instance
          const employeeIds = (parent.job_employees as { employee_id: string }[])?.map(
            (je: { employee_id: string }) => je.employee_id
          ) || [];

          const { data: newJob } = await supabase
            .from("jobs")
            .insert({
              client_id: parent.client_id,
              date: dateStr,
              time: parent.time,
              duration: parent.duration,
              status: "scheduled",
              amount: parent.amount,
              rate_type: parent.rate_type,
              payment_status: "pending",
              is_recurring: false,
              parent_job_id: parent.id,
              series_id: seriesId,
            })
            .select("id")
            .single();

          if (newJob && employeeIds.length > 0) {
            await supabase.from("job_employees").insert(
              employeeIds.map((empId: string) => ({
                job_id: newJob.id,
                employee_id: empId,
              }))
            );
          }

          generated++;
        }

        currentDate = getNextDate(currentDate, rule);
      }
    }

    return NextResponse.json({ generated });
  } catch (err) {
    console.error("Recurring jobs generation error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getNextDate(
  current: Date,
  rule: "weekly" | "biweekly" | "monthly"
): Date {
  const next = new Date(current);
  switch (rule) {
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "biweekly":
      next.setDate(next.getDate() + 14);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
}

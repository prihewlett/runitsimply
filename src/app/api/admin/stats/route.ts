import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-stats");

export async function GET() {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();

    // Fetch all businesses
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("id, subscription_status, trial_ends_at, created_at");

    if (error) {
      log.error("GET", "failed to fetch businesses", { error });
      return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const totalBusinesses = businesses?.length ?? 0;
    const activeCount = businesses?.filter((b) => b.subscription_status === "active").length ?? 0;
    const trialCount = businesses?.filter((b) => b.subscription_status === "trial").length ?? 0;
    const expiredCount = businesses?.filter((b) => b.subscription_status === "expired").length ?? 0;
    const cancelledCount = businesses?.filter((b) => b.subscription_status === "cancelled").length ?? 0;
    const newThisMonth = businesses?.filter((b) => b.created_at >= monthStart).length ?? 0;
    const monthlyRevenue = activeCount * 19.99;

    // Overdue & expiring trials
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const trialExpiringSoon = (businesses || [])
      .filter((b) => {
        if (b.subscription_status !== "trial" || !b.trial_ends_at) return false;
        const ends = new Date(b.trial_ends_at);
        return ends <= sevenDaysFromNow && ends > now;
      })
      .map((b) => ({
        id: b.id,
        trialEndsAt: b.trial_ends_at,
        daysRemaining: Math.max(
          0,
          Math.ceil(
            (new Date(b.trial_ends_at!).getTime() - now.getTime()) /
              (24 * 60 * 60 * 1000)
          )
        ),
      }));

    const trialExpiringCount = (businesses || []).filter((b) => {
      if (b.subscription_status !== "trial" || !b.trial_ends_at) return false;
      const ends = new Date(b.trial_ends_at);
      return ends <= threeDaysFromNow && ends > now;
    }).length;

    // Get expired business IDs for overdue list
    const expiredBusinesses = (businesses || []).filter(
      (b) => b.subscription_status === "expired"
    );

    // Get total clients and jobs counts + names for overdue/expiring businesses
    const needsAttentionIds = [
      ...expiredBusinesses.map((b) => b.id),
      ...trialExpiringSoon.map((b) => b.id),
    ].filter(Boolean);

    const [clientsRes, jobsRes, namesRes] = await Promise.all([
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("jobs").select("id", { count: "exact", head: true }),
      // Fetch names for overdue + expiring businesses
      needsAttentionIds.length > 0
        ? supabase
            .from("businesses")
            .select("id, name")
            .in("id", needsAttentionIds)
        : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    ]);

    // Fetch payments (gracefully handle if table doesn't exist yet)
    let paymentsData: { business_id: string; created_at: string; amount: number; payment_method: string }[] = [];
    try {
      const paymentsRes = await supabase
        .from("subscription_payments")
        .select("business_id, created_at, amount, payment_method")
        .eq("status", "completed")
        .order("created_at", { ascending: false });
      paymentsData = paymentsRes.data || [];
    } catch {
      // Table may not exist yet — ignore
    }

    // Revenue calculations
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue = paymentsData.reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueThisMonth = paymentsData
      .filter((p) => new Date(p.created_at) >= thisMonthStart)
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const revenueLastMonth = paymentsData
      .filter((p) => {
        const d = new Date(p.created_at);
        return d >= lastMonthStart && d < lastMonthEnd;
      })
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      const amount = paymentsData
        .filter((p) => { const d = new Date(p.created_at); return d >= start && d < end; })
        .reduce((sum, p) => sum + Number(p.amount), 0);
      revenueByMonth.push({ month: label, amount: Math.round(amount * 100) / 100 });
    }

    // Revenue by method
    const revenueByMethod = { stripe: 0, venmo: 0, zelle: 0, other: 0 };
    for (const p of paymentsData) {
      const m = p.payment_method as keyof typeof revenueByMethod;
      if (m in revenueByMethod) revenueByMethod[m] += Number(p.amount);
      else revenueByMethod.other += Number(p.amount);
    }

    // Build name map
    const nameMap: Record<string, string> = {};
    for (const b of namesRes.data || []) {
      nameMap[b.id] = b.name || "Unnamed";
    }

    // Build latest-payment map (first occurrence per business is the most recent)
    const latestPaymentMap: Record<string, string> = {};
    for (const p of paymentsData) {
      if (!latestPaymentMap[p.business_id]) {
        latestPaymentMap[p.business_id] = p.created_at;
      }
    }

    const overdueBusinesses = expiredBusinesses.map((b) => ({
      id: b.id,
      name: nameMap[b.id] || "Unnamed",
      subscriptionStatus: b.subscription_status,
      lastPaymentDate: latestPaymentMap[b.id] || null,
    }));

    const trialExpiringSoonWithNames = trialExpiringSoon.map((b) => ({
      ...b,
      name: nameMap[b.id] || "Unnamed",
    }));

    return NextResponse.json({
      totalBusinesses,
      activeCount,
      trialCount,
      expiredCount,
      cancelledCount,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      newThisMonth,
      totalClients: clientsRes.count ?? 0,
      totalJobs: jobsRes.count ?? 0,
      overdueCount: expiredCount,
      trialExpiringCount,
      trialExpiringSoon: trialExpiringSoonWithNames,
      overdueBusinesses,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueThisMonth: Math.round(revenueThisMonth * 100) / 100,
      revenueLastMonth: Math.round(revenueLastMonth * 100) / 100,
      revenueByMonth,
      revenueByMethod: {
        stripe: Math.round(revenueByMethod.stripe * 100) / 100,
        venmo: Math.round(revenueByMethod.venmo * 100) / 100,
        zelle: Math.round(revenueByMethod.zelle * 100) / 100,
        other: Math.round(revenueByMethod.other * 100) / 100,
      },
    });
  } catch (err) {
    log.error("GET", "stats error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

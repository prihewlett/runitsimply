import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-businesses");

export async function GET(request: NextRequest) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    // Fetch businesses
    let query = supabase
      .from("businesses")
      .select(
        "id, name, phone, email, subscription_status, trial_ends_at, created_at, stripe_customer_id, referral_code, referrals_count, referral_credit, referred_by"
      )
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq("subscription_status", status);
    }

    const { data: businesses, error } = await query;

    if (error) {
      log.error("GET", "failed to fetch businesses", { error });
      return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 });
    }

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ businesses: [] });
    }

    // Get per-business counts by fetching all business_ids
    const [clientsRes, employeesRes, jobsRes] = await Promise.all([
      supabase.from("clients").select("business_id"),
      supabase.from("employees").select("business_id"),
      supabase.from("jobs").select("business_id"),
    ]);

    // Build count maps
    const countMap = (rows: { business_id: string }[] | null) => {
      const map: Record<string, number> = {};
      rows?.forEach((r) => {
        map[r.business_id] = (map[r.business_id] || 0) + 1;
      });
      return map;
    };

    const clientCounts = countMap(clientsRes.data);
    const employeeCounts = countMap(employeesRes.data);
    const jobCounts = countMap(jobsRes.data);

    const result = businesses.map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      phone: b.phone,
      subscriptionStatus: b.subscription_status,
      trialEndsAt: b.trial_ends_at,
      createdAt: b.created_at,
      stripeCustomerId: b.stripe_customer_id,
      referralCode: b.referral_code,
      referralsCount: b.referrals_count,
      referralCredit: b.referral_credit,
      referredBy: b.referred_by,
      clientCount: clientCounts[b.id] || 0,
      employeeCount: employeeCounts[b.id] || 0,
      jobCount: jobCounts[b.id] || 0,
    }));

    return NextResponse.json({ businesses: result });
  } catch (err) {
    log.error("GET", "businesses list error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

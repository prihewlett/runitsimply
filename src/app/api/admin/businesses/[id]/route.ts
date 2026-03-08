import { NextResponse, type NextRequest } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("admin-business-detail");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const supabase = createAdminClient();

    // Fetch business
    const { data: business, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !business) {
      return NextResponse.json({ error: "Business not found" }, { status: 404 });
    }

    // Fetch owner profile, counts, and referral data in parallel
    const [ownerRes, clientsRes, employeesRes, jobsRes, referralsRes] =
      await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("business_id", id)
          .eq("role", "owner")
          .maybeSingle(),
        supabase
          .from("clients")
          .select("id", { count: "exact", head: true })
          .eq("business_id", id),
        supabase
          .from("employees")
          .select("id", { count: "exact", head: true })
          .eq("business_id", id),
        supabase
          .from("jobs")
          .select("id", { count: "exact", head: true })
          .eq("business_id", id),
        // Businesses this one referred
        supabase
          .from("businesses")
          .select("id, name, subscription_status, created_at")
          .eq("referred_by", id),
      ]);

    // Fetch payment history (gracefully handle if table doesn't exist yet)
    let paymentsData: Record<string, unknown>[] = [];
    try {
      const paymentsRes = await supabase
        .from("subscription_payments")
        .select("*")
        .eq("business_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      paymentsData = paymentsRes.data || [];
    } catch {
      // Table may not exist yet — ignore
    }

    // Get referrer business name if referred_by exists
    let referrerName: string | null = null;
    if (business.referred_by) {
      const { data: referrer } = await supabase
        .from("businesses")
        .select("name")
        .eq("id", business.referred_by)
        .single();
      referrerName = referrer?.name ?? null;
    }

    // Get owner's auth email
    let ownerEmail: string | null = null;
    if (ownerRes.data?.id) {
      const { data: authUser } = await supabase.auth.admin.getUserById(
        ownerRes.data.id
      );
      ownerEmail = authUser?.user?.email ?? null;
    }

    return NextResponse.json({
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
        phone: business.phone,
        venmoHandle: business.venmo_handle,
        zelleEmail: business.zelle_email,
        stripeConnected: business.stripe_connected,
        stripeCustomerId: business.stripe_customer_id,
        subscriptionStatus: business.subscription_status,
        trialEndsAt: business.trial_ends_at,
        smsRemindersEnabled: business.sms_reminders_enabled,
        referralCode: business.referral_code,
        referralsCount: business.referrals_count,
        referralCredit: business.referral_credit,
        referredBy: business.referred_by,
        referralCredited: business.referral_credited,
        createdAt: business.created_at,
        updatedAt: business.updated_at,
      },
      owner: ownerRes.data
        ? {
            id: ownerRes.data.id,
            fullName: ownerRes.data.full_name,
            email: ownerEmail,
          }
        : null,
      counts: {
        clients: clientsRes.count ?? 0,
        employees: employeesRes.count ?? 0,
        jobs: jobsRes.count ?? 0,
      },
      referrer: business.referred_by
        ? { id: business.referred_by, name: referrerName }
        : null,
      referrals: (referralsRes.data || []).map((r) => ({
        id: r.id,
        name: r.name,
        subscriptionStatus: r.subscription_status,
        createdAt: r.created_at,
      })),
      payments: paymentsData.map((p) => ({
        id: p.id,
        amount: p.amount,
        paymentMethod: p.payment_method,
        status: p.status,
        periodStart: p.period_start,
        periodEnd: p.period_end,
        stripeInvoiceId: p.stripe_invoice_id,
        referenceNote: p.reference_note,
        recordedBy: p.recorded_by,
        createdAt: p.created_at,
      })),
    });
  } catch (err) {
    log.error("GET", "business detail error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { authorized } = await verifyAdmin();
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Only allow updating safe fields
    const allowed = ["name", "email", "phone", "venmo_handle", "zelle_email", "sms_reminders_enabled"];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
      if (body[camel] !== undefined) updates[key] = body[camel];
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("businesses").update(updates).eq("id", id);

    if (error) {
      log.error("PATCH", "failed to update business", { id, error });
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }

    log.info("PATCH", "business updated", { id, fields: Object.keys(updates) });
    return NextResponse.json({ success: true });
  } catch (err) {
    log.error("PATCH", "update error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

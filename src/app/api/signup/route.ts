import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("signup-api");

export async function POST(request: Request) {
  try {
    const { email, password, businessName, fullName, referralCode } = await request.json();
    log.info("POST", "signup attempt started", { email, businessName, fullName, hasReferral: !!referralCode });

    const supabase = createAdminClient();

    // If a referral code is provided, validate it and find the referrer
    let referrerId: string | null = null;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("businesses")
        .select("id")
        .eq("referral_code", referralCode.trim().toUpperCase())
        .maybeSingle();

      if (referrer) {
        referrerId = referrer.id;
        log.info("POST", "valid referral code found", { referralCode, referrerId });
      } else {
        log.warn("POST", "invalid referral code at signup, ignoring", { referralCode });
      }
    }

    // Step 1: Create the auth user first
    // The handle_new_user trigger should be a no-op (just RETURN NEW)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        business_name: businessName,
        full_name: fullName,
      },
    });

    if (authError) {
      log.error("POST", "auth user creation failed", { email, error: authError });
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }
    log.debug("POST", "auth user created", { userId: authData.user.id });

    // Step 2: Create the business
    // Referred users: no trial, must subscribe (they get $20 off first month at checkout)
    // Non-referred users: normal 14-day free trial
    const isReferred = !!referrerId;
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: businessName || "",
        referral_code: "RIS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        trial_ends_at: isReferred
          ? new Date().toISOString()
          : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: isReferred ? "expired" : "trial",
        referred_by: referrerId,
      })
      .select()
      .single();

    if (bizError) {
      log.error("POST", "business creation failed, cleaning up auth user", {
        userId: authData.user.id, error: bizError,
      });
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create business: " + bizError.message }, { status: 500 });
    }
    log.debug("POST", "business created", { businessId: business.id });

    // Step 3: Create the profile linking user to business
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authData.user.id,
        business_id: business.id,
        role: "owner",
        full_name: fullName || "",
      });

    if (profileError) {
      log.error("POST", "profile creation failed - cleaning up auth user and business", {
        userId: authData.user.id, businessId: business.id, error: profileError,
      });
      await supabase.from("businesses").delete().eq("id", business.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Failed to create profile: " + profileError.message }, { status: 500 });
    }

    log.info("POST", "signup completed successfully", { userId: authData.user.id, businessId: business.id });
    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (err) {
    log.error("POST", "unexpected exception during signup", {
      error: err instanceof Error ? err : String(err),
    });
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

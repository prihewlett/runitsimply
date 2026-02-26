import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("signup-api");

export async function POST(request: Request) {
  try {
    const { email, password, businessName, fullName } = await request.json();
    log.info("POST", "signup attempt started", { email, businessName, fullName });

    const supabase = createAdminClient();

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
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .insert({
        name: businessName || "",
        referral_code: "RIS-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        subscription_status: "trial",
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
      log.error("POST", "profile creation failed - ORPHANED business record remains", {
        userId: authData.user.id, businessId: business.id, error: profileError,
      });
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

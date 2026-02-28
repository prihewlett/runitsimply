import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("stripe-checkout");

export async function POST() {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const priceId = process.env.STRIPE_PRICE_ID;

    if (!stripeKey || !priceId) {
      log.warn("POST", "Stripe not configured");
      return NextResponse.json(
        { error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID." },
        { status: 503 }
      );
    }

    // Verify auth
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
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

    // Get business info
    const { data: business } = await supabase
      .from("businesses")
      .select("id, name, email, stripe_customer_id")
      .eq("id", profile.business_id)
      .single();

    if (!business) {
      return NextResponse.json({ error: "Business not found" }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    // Reuse existing Stripe customer or create new one
    let customerId = business.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email || business.email || undefined,
        name: business.name || undefined,
        metadata: { business_id: business.id },
      });
      customerId = customer.id;

      // Save customer ID
      await supabase
        .from("businesses")
        .update({ stripe_customer_id: customerId })
        .eq("id", business.id);

      log.info("POST", "created Stripe customer", { customerId, businessId: business.id });
    }

    // Create checkout session
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://runitsimply.com";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card", "cashapp", "us_bank_account"],
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            permissions: ["payment_method"],
          },
        },
      },
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/settings?upgraded=true`,
      cancel_url: `${siteUrl}/settings`,
      client_reference_id: business.id,
      metadata: { business_id: business.id },
    });

    log.info("POST", "checkout session created", { sessionId: session.id, businessId: business.id });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    log.error("POST", "checkout error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-server";
import { createModuleLogger } from "@/lib/logger";

const log = createModuleLogger("stripe-webhook");

export async function POST(request: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      log.warn("POST", "Stripe webhook not configured");
      return NextResponse.json({ error: "Not configured" }, { status: 503 });
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 });
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(stripeKey);

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      log.error("POST", "webhook signature verification failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const supabase = createAdminClient();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const businessId = session.client_reference_id || session.metadata?.business_id;

        if (businessId) {
          const { error } = await supabase
            .from("businesses")
            .update({
              subscription_status: "active",
              stripe_customer_id: session.customer as string,
            })
            .eq("id", businessId);

          if (error) {
            log.error("POST", "failed to update subscription status", { businessId, error });
          } else {
            log.info("POST", "subscription activated", { businessId });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          await supabase
            .from("businesses")
            .update({ subscription_status: "cancelled" })
            .eq("id", business.id);

          log.info("POST", "subscription cancelled", { businessId: business.id });
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          await supabase
            .from("businesses")
            .update({ subscription_status: "expired" })
            .eq("id", business.id);

          log.info("POST", "payment failed - subscription expired", { businessId: business.id });
        }
        break;
      }

      default:
        log.debug("POST", "unhandled event type", { type: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    log.error("POST", "webhook error", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

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

            // Log the initial payment
            await supabase.from("subscription_payments").insert({
              business_id: businessId,
              amount: (session.amount_total || 1999) / 100,
              payment_method: "stripe",
              status: "completed",
              stripe_invoice_id: (session.invoice as string) || null,
              recorded_by: "stripe_webhook",
              period_start: new Date().toISOString().split("T")[0],
              period_end: new Date(
                Date.now() + 30 * 24 * 60 * 60 * 1000
              )
                .toISOString()
                .split("T")[0],
            });
          }

          // Credit the referrer $20 on first payment (if referred and not already credited)
          const { data: biz } = await supabase
            .from("businesses")
            .select("referred_by, referral_credited")
            .eq("id", businessId)
            .single();

          if (biz?.referred_by && !biz.referral_credited) {
            // Credit the referrer using the atomic DB function
            const { error: creditError } = await supabase.rpc("credit_referrer", {
              referrer_id: biz.referred_by,
              credit_amount: 20.0,
            });

            if (creditError) {
              log.error("POST", "failed to credit referrer", {
                businessId, referrerId: biz.referred_by, error: creditError,
              });
            } else {
              // Mark as credited to prevent double-crediting on webhook retries
              await supabase
                .from("businesses")
                .update({ referral_credited: true })
                .eq("id", businessId);

              log.info("POST", "referrer credited $20", {
                businessId, referrerId: biz.referred_by,
              });
            }
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

      case "invoice.paid": {
        // Recurring subscription payments (after initial checkout)
        const paidInvoice = event.data.object;
        const paidCustomerId = paidInvoice.customer as string;

        const { data: paidBiz } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", paidCustomerId)
          .single();

        if (paidBiz) {
          // De-duplicate: check if this invoice was already logged
          const { data: existing } = await supabase
            .from("subscription_payments")
            .select("id")
            .eq("stripe_invoice_id", paidInvoice.id)
            .maybeSingle();

          if (!existing) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const inv = paidInvoice as any;
            await supabase.from("subscription_payments").insert({
              business_id: paidBiz.id,
              amount: (inv.amount_paid || 1999) / 100,
              payment_method: "stripe",
              status: "completed",
              stripe_invoice_id: paidInvoice.id,
              recorded_by: "stripe_webhook",
              period_start: inv.period_start
                ? new Date(inv.period_start * 1000).toISOString().split("T")[0]
                : null,
              period_end: inv.period_end
                ? new Date(inv.period_end * 1000).toISOString().split("T")[0]
                : null,
            });

            log.info("POST", "recurring payment logged", { businessId: paidBiz.id, invoiceId: paidInvoice.id });
          }
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

          // Log the failed payment
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const failedInv = invoice as any;
          await supabase.from("subscription_payments").insert({
            business_id: business.id,
            amount: (failedInv.amount_due || 1999) / 100,
            payment_method: "stripe",
            status: "failed",
            stripe_invoice_id: invoice.id,
            recorded_by: "stripe_webhook",
          });

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

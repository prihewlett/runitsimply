-- Add Stripe customer ID for subscription billing
ALTER TABLE businesses
  ADD COLUMN stripe_customer_id TEXT;

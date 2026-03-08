-- Track subscription payments (Stripe, Venmo, Zelle, etc.)
CREATE TABLE subscription_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 19.99,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('stripe','venmo','zelle','other')),
  status TEXT NOT NULL CHECK (status IN ('completed','pending','failed','refunded')) DEFAULT 'completed',
  period_start DATE,
  period_end DATE,
  stripe_invoice_id TEXT,
  reference_note TEXT DEFAULT '',
  recorded_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fetching a business's payment history
CREATE INDEX idx_sub_payments_biz ON subscription_payments(business_id, created_at DESC);

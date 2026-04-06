-- Enable RLS on subscription_payments (was missing from initial migration)
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- Only business owners can view their own business's payments
CREATE POLICY "Owners can view own payments" ON subscription_payments
  FOR SELECT USING (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only business owners can insert payment records
CREATE POLICY "Owners can insert payments" ON subscription_payments
  FOR INSERT WITH CHECK (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Only business owners can update payment records
CREATE POLICY "Owners can update payments" ON subscription_payments
  FOR UPDATE USING (
    business_id = (SELECT business_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'owner')
  );

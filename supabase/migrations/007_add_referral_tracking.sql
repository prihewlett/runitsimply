-- Track referrals: who referred this business, and prevent double-crediting
ALTER TABLE businesses
  ADD COLUMN referred_by UUID REFERENCES businesses(id) ON DELETE SET NULL,
  ADD COLUMN referral_credited BOOLEAN DEFAULT false;

CREATE INDEX idx_businesses_referred_by ON businesses(referred_by) WHERE referred_by IS NOT NULL;

-- Atomically increment referrer's count and credit
CREATE OR REPLACE FUNCTION credit_referrer(referrer_id UUID, credit_amount NUMERIC)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET referrals_count = referrals_count + 1,
      referral_credit = referral_credit + credit_amount
  WHERE id = referrer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

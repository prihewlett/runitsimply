-- Add trial / subscription columns to businesses
ALTER TABLE businesses
  ADD COLUMN trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
  ADD COLUMN subscription_status TEXT
    CHECK (subscription_status IN ('trial', 'active', 'expired', 'cancelled'))
    DEFAULT 'trial';

-- Backfill existing rows
UPDATE businesses
SET trial_ends_at = created_at + interval '14 days',
    subscription_status = CASE
      WHEN created_at + interval '14 days' < now() THEN 'expired'
      ELSE 'trial'
    END
WHERE trial_ends_at IS NULL;

-- Update the signup trigger so new businesses get trial fields explicitly
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_business_id UUID;
BEGIN
  IF NEW.raw_user_meta_data->>'invite_business_id' IS NULL THEN
    -- Create a new business with 14-day trial
    INSERT INTO businesses (name, referral_code, trial_ends_at, subscription_status)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
      'RIS-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6)),
      now() + interval '14 days',
      'trial'
    )
    RETURNING id INTO new_business_id;

    -- Create owner profile
    INSERT INTO profiles (id, business_id, role, full_name)
    VALUES (
      NEW.id,
      new_business_id,
      'owner',
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
  ELSE
    -- Invited employee: link to existing business
    INSERT INTO profiles (id, business_id, role, employee_id, full_name)
    VALUES (
      NEW.id,
      (NEW.raw_user_meta_data->>'invite_business_id')::UUID,
      'employee',
      (NEW.raw_user_meta_data->>'invite_employee_id')::UUID,
      COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );

    -- Update employee invite status
    UPDATE employees
    SET invite_status = 'accepted'
    WHERE id = (NEW.raw_user_meta_data->>'invite_employee_id')::UUID;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

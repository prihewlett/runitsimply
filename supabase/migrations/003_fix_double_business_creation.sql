-- Fix: The signup API (/api/signup) already creates the business + profile
-- for direct signups, but the handle_new_user trigger was ALSO creating them,
-- resulting in duplicate (orphaned) business and profile rows.
--
-- Solution: Make the trigger a no-op for direct signups.
-- Keep the invite path so employee invitations still work via the trigger.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Direct signups (no invite_business_id) are handled entirely by /api/signup.
  -- The API creates the business, profile, and sets trial fields.
  -- We just return NEW here to avoid double-creating those rows.
  IF NEW.raw_user_meta_data->>'invite_business_id' IS NULL THEN
    RETURN NEW;
  END IF;

  -- Invited employee: link to existing business (this path is only
  -- triggered when an employee accepts an invite link, not from the API)
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

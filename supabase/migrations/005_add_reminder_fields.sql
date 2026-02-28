-- Add SMS reminder settings to businesses table
ALTER TABLE businesses
  ADD COLUMN sms_reminders_enabled BOOLEAN DEFAULT false,
  ADD COLUMN reminder_timing TEXT DEFAULT 'day_before';

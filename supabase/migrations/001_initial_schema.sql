-- RunItSimply: Initial Database Schema
-- Multi-tenant architecture with Row Level Security

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════
-- BUSINESSES (root entity for multi-tenancy)
-- ═══════════════════════════════════════════
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  venmo_handle TEXT DEFAULT '',
  zelle_email TEXT DEFAULT '',
  stripe_connected BOOLEAN DEFAULT false,
  employee_self_log BOOLEAN DEFAULT false,
  hide_payroll BOOLEAN DEFAULT false,
  referral_code TEXT DEFAULT '',
  referrals_count INTEGER DEFAULT 0,
  referral_credit NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- PROFILES (extends Supabase auth.users)
-- ═══════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'employee')) DEFAULT 'employee',
  employee_id UUID,
  full_name TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- EMPLOYEES
-- ═══════════════════════════════════════════
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT '',
  rate NUMERIC(10,2) DEFAULT 0,
  pay_type TEXT CHECK (pay_type IN ('hourly', 'perJob')) DEFAULT 'hourly',
  color TEXT DEFAULT '#3B82F6',
  avatar TEXT DEFAULT '',
  invite_email TEXT,
  invite_status TEXT CHECK (invite_status IN ('pending', 'accepted', 'none')) DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- CLIENTS
-- ═══════════════════════════════════════════
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  email TEXT DEFAULT '',
  address TEXT DEFAULT '',
  frequency TEXT CHECK (frequency IN ('Weekly', 'Bi-weekly', 'Monthly', 'One-time')) DEFAULT 'One-time',
  payment_method TEXT CHECK (payment_method IN ('Venmo', 'Zelle', 'Credit Card', 'Check', 'Cash')) DEFAULT 'Cash',
  notes TEXT DEFAULT '',
  service_type TEXT DEFAULT 'other',
  service_rate NUMERIC(10,2),
  service_rate_type TEXT CHECK (service_rate_type IN ('flat', 'hourly')) DEFAULT 'flat',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- JOBS
-- ═══════════════════════════════════════════
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration NUMERIC(4,2) NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled')) DEFAULT 'scheduled',
  amount NUMERIC(10,2) DEFAULT 0,
  rate_type TEXT CHECK (rate_type IN ('flat', 'hourly')) DEFAULT 'flat',
  payment_status TEXT CHECK (payment_status IN ('paid', 'pending', 'overdue')) DEFAULT 'pending',
  payment_via TEXT,
  invoice_sent_at TIMESTAMPTZ,
  -- Recurring job fields (Phase 3)
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT CHECK (recurrence_rule IN ('weekly', 'biweekly', 'monthly')),
  recurrence_end_date DATE,
  parent_job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  series_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- JOB_EMPLOYEES (junction table)
-- ═══════════════════════════════════════════
CREATE TABLE job_employees (
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  PRIMARY KEY (job_id, employee_id)
);

-- ═══════════════════════════════════════════
-- TIME ENTRIES
-- ═══════════════════════════════════════════
CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TEXT NOT NULL,
  clock_out TEXT NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- MESSAGES
-- ═══════════════════════════════════════════
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  contact_type TEXT CHECK (contact_type IN ('client', 'team')) NOT NULL,
  avatar TEXT DEFAULT '',
  color TEXT DEFAULT '#3B82F6',
  unread INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE message_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  from_who TEXT CHECK (from_who IN ('me', 'them')) NOT NULL,
  text TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- EXPENSE CATEGORIES (Phase 4)
-- ═══════════════════════════════════════════
CREATE TABLE expense_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT '',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- EXPENSES (Phase 4)
-- ═══════════════════════════════════════════
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  category_id UUID REFERENCES expense_categories(id) ON DELETE SET NULL,
  vendor TEXT DEFAULT '',
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  receipt_url TEXT,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- DELIVERY LOG (Phase 5)
-- ═══════════════════════════════════════════
CREATE TABLE delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  method TEXT CHECK (method IN ('sms', 'email')) NOT NULL,
  recipient TEXT NOT NULL,
  status TEXT CHECK (status IN ('sent', 'delivered', 'failed', 'bounced')) DEFAULT 'sent',
  external_id TEXT,
  error_message TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════
CREATE INDEX idx_profiles_business ON profiles(business_id);
CREATE INDEX idx_employees_business ON employees(business_id);
CREATE INDEX idx_clients_business ON clients(business_id);
CREATE INDEX idx_jobs_business ON jobs(business_id);
CREATE INDEX idx_jobs_date ON jobs(business_id, date);
CREATE INDEX idx_jobs_client ON jobs(client_id);
CREATE INDEX idx_jobs_series ON jobs(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX idx_jobs_parent ON jobs(parent_job_id) WHERE parent_job_id IS NOT NULL;
CREATE INDEX idx_time_entries_business ON time_entries(business_id);
CREATE INDEX idx_time_entries_employee ON time_entries(employee_id);
CREATE INDEX idx_expenses_business ON expenses(business_id);
CREATE INDEX idx_expenses_date ON expenses(business_id, date);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_expense_categories_business ON expense_categories(business_id);
CREATE INDEX idx_delivery_log_business ON delivery_log(business_id);
CREATE INDEX idx_delivery_log_job ON delivery_log(job_id);

-- ═══════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_log ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's business_id
CREATE OR REPLACE FUNCTION auth.business_id()
RETURNS UUID AS $$
  SELECT business_id FROM public.profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Helper function: check if current user is owner
CREATE OR REPLACE FUNCTION auth.is_owner()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Businesses ──
CREATE POLICY "Users can view own business" ON businesses
  FOR SELECT USING (id = auth.business_id());
CREATE POLICY "Owners can update own business" ON businesses
  FOR UPDATE USING (id = auth.business_id() AND auth.is_owner());

-- ── Profiles ──
CREATE POLICY "Users can view business profiles" ON profiles
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- ── Employees ──
CREATE POLICY "Business members can view employees" ON employees
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Owners can insert employees" ON employees
  FOR INSERT WITH CHECK (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can update employees" ON employees
  FOR UPDATE USING (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can delete employees" ON employees
  FOR DELETE USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Clients ──
CREATE POLICY "Business members can view clients" ON clients
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Owners can insert clients" ON clients
  FOR INSERT WITH CHECK (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can update clients" ON clients
  FOR UPDATE USING (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can delete clients" ON clients
  FOR DELETE USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Jobs ──
CREATE POLICY "Business members can view jobs" ON jobs
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Owners can insert jobs" ON jobs
  FOR INSERT WITH CHECK (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can update jobs" ON jobs
  FOR UPDATE USING (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can delete jobs" ON jobs
  FOR DELETE USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Job Employees ──
CREATE POLICY "Business members can view job assignments" ON job_employees
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND business_id = auth.business_id())
  );
CREATE POLICY "Owners can manage job assignments" ON job_employees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM jobs WHERE id = job_id AND business_id = auth.business_id())
    AND auth.is_owner()
  );

-- ── Time Entries ──
CREATE POLICY "Business members can view time entries" ON time_entries
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Employees can insert own entries" ON time_entries
  FOR INSERT WITH CHECK (
    business_id = auth.business_id()
    AND employee_id = (SELECT employee_id FROM profiles WHERE id = auth.uid())
  );
CREATE POLICY "Owners can manage time entries" ON time_entries
  FOR ALL USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Messages ──
CREATE POLICY "Business members can view messages" ON messages
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Business members can insert messages" ON messages
  FOR INSERT WITH CHECK (business_id = auth.business_id());
CREATE POLICY "Business members can update messages" ON messages
  FOR UPDATE USING (business_id = auth.business_id());
CREATE POLICY "Business members can delete messages" ON messages
  FOR DELETE USING (business_id = auth.business_id());

CREATE POLICY "Business members can view message items" ON message_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM messages WHERE id = message_id AND business_id = auth.business_id())
  );
CREATE POLICY "Business members can insert message items" ON message_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM messages WHERE id = message_id AND business_id = auth.business_id())
  );

-- ── Expense Categories ──
CREATE POLICY "Business members can view expense categories" ON expense_categories
  FOR SELECT USING (business_id = auth.business_id());
CREATE POLICY "Owners can manage expense categories" ON expense_categories
  FOR ALL USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Expenses ──
CREATE POLICY "Owners can view expenses" ON expenses
  FOR SELECT USING (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can manage expenses" ON expenses
  FOR ALL USING (business_id = auth.business_id() AND auth.is_owner());

-- ── Delivery Log ──
CREATE POLICY "Owners can view delivery log" ON delivery_log
  FOR SELECT USING (business_id = auth.business_id() AND auth.is_owner());
CREATE POLICY "Owners can insert delivery log" ON delivery_log
  FOR INSERT WITH CHECK (business_id = auth.business_id() AND auth.is_owner());

-- ═══════════════════════════════════════════
-- AUTH TRIGGERS
-- ═══════════════════════════════════════════

-- Seed default expense categories when a business is created
CREATE OR REPLACE FUNCTION seed_expense_categories()
RETURNS trigger AS $$
BEGIN
  INSERT INTO expense_categories (business_id, name, color, icon, is_default) VALUES
    (NEW.id, 'Supplies', '#3B82F6', 'box', true),
    (NEW.id, 'Equipment', '#10B981', 'wrench', true),
    (NEW.id, 'Vehicle/Gas', '#F59E0B', 'truck', true),
    (NEW.id, 'Insurance', '#8B5CF6', 'shield', true),
    (NEW.id, 'Marketing', '#EC4899', 'megaphone', true),
    (NEW.id, 'Office', '#6366F1', 'building', true),
    (NEW.id, 'Other', '#6B7280', 'folder', true);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER seed_categories_on_business_create
  AFTER INSERT ON businesses
  FOR EACH ROW EXECUTE FUNCTION seed_expense_categories();

-- When a new user signs up, create a business and profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_business_id UUID;
BEGIN
  -- Check if this is a direct signup (not an invite)
  IF NEW.raw_user_meta_data->>'invite_business_id' IS NULL THEN
    -- Create a new business
    INSERT INTO businesses (name, referral_code)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'business_name', ''),
      'RIS-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 6))
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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

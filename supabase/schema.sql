-- REO Command Center — Supabase schema
-- Matches the data model in docs/SPEC.md. Run this against a Supabase
-- project, then swap lib/data-context.tsx's localStorage-backed store for
-- Supabase queries (@supabase/supabase-js) using these tables.
--
-- Not yet wired up: the app currently runs entirely on seeded demo data
-- (lib/data.ts) so it's clickable with zero external services. This file
-- is Phase 2/3 groundwork per docs/SPEC.md.

create extension if not exists "pgcrypto";

create table lenders (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  reimbursement_rule text not null,
  contact_email text not null
);

create table vendors (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid references auth.users (id),
  name text not null,
  trade text not null,
  email text not null,
  phone text
);

create table properties (
  id uuid primary key default gen_random_uuid(),
  address text not null,
  city text not null,
  state text not null,
  zip text not null,
  lender_id uuid not null references lenders (id),
  occupancy_status text not null check (occupancy_status in ('vacant', 'occupied', 'cash_for_keys', 'eviction')),
  list_price numeric(12, 2) not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  title text not null,
  category text not null check (category in ('valuation', 'occupancy', 'repair', 'reporting', 'admin')),
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'done')),
  due_date date not null,
  assigned_vendor_id uuid references vendors (id),
  lender_requirements text not null default ''
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  vendor_id uuid references vendors (id),
  description text not null,
  amount numeric(12, 2) not null,
  incurred_on date not null,
  reimbursement_deadline date not null,
  status text not null default 'unsubmitted'
    check (status in ('unsubmitted', 'submitted', 'approved', 'paid', 'rejected')),
  receipt_url text
);

create table offers (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  buyer_name text not null,
  amount numeric(12, 2) not null,
  status text not null default 'pending' check (status in ('pending', 'countered', 'accepted', 'rejected')),
  submitted_at timestamptz not null default now()
);

create table activity_log (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  actor text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  name text not null,
  kind text not null,
  storage_path text
);

create table mmrs (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references properties (id),
  month date not null,
  sent_at timestamptz
);

-- Row-Level Security: vendors see only their own assigned tasks, and only
-- expenses/documents tied to properties they have an assigned task on.
-- Agents (any authenticated non-vendor user) see everything.

alter table properties enable row level security;
alter table tasks enable row level security;
alter table expenses enable row level security;
alter table offers enable row level security;
alter table activity_log enable row level security;
alter table documents enable row level security;

create or replace function is_vendor()
returns boolean language sql stable as $$
  select exists (select 1 from vendors where auth_user_id = auth.uid());
$$;

create or replace function current_vendor_id()
returns uuid language sql stable as $$
  select id from vendors where auth_user_id = auth.uid();
$$;

create policy "agents see all properties" on properties
  for select using (not is_vendor());

create policy "vendors see properties they have a task on" on properties
  for select using (
    is_vendor() and exists (
      select 1 from tasks where tasks.property_id = properties.id and tasks.assigned_vendor_id = current_vendor_id()
    )
  );

create policy "agents see all tasks" on tasks
  for select using (not is_vendor());

create policy "vendors see only their assigned tasks" on tasks
  for select using (is_vendor() and assigned_vendor_id = current_vendor_id());

create policy "vendors update only their assigned tasks" on tasks
  for update using (is_vendor() and assigned_vendor_id = current_vendor_id());

create policy "agents manage tasks" on tasks
  for all using (not is_vendor());

create policy "agents see all expenses" on expenses
  for select using (not is_vendor());

create policy "vendors see expenses on their properties" on expenses
  for select using (
    is_vendor() and exists (
      select 1 from tasks where tasks.property_id = expenses.property_id and tasks.assigned_vendor_id = current_vendor_id()
    )
  );

create policy "vendors insert their own expenses" on expenses
  for insert with check (is_vendor() and vendor_id = current_vendor_id());

create policy "agents manage expenses" on expenses
  for all using (not is_vendor());

create policy "agents only on offers" on offers for all using (not is_vendor());
create policy "agents only on activity log" on activity_log for all using (not is_vendor());
create policy "agents only on documents" on documents for all using (not is_vendor());

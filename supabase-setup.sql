-- ============================================================
-- Friend Expense Tracker - Supabase Setup
-- Run these in your Supabase SQL editor
-- ============================================================

-- USERS handled by Supabase auth

-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamp default now()
);

-- GROUPS
create table groups (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by uuid references profiles(id),
  created_at timestamp default now()
);

-- GROUP MEMBERS
create table group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade
);

-- TRANSACTIONS
create table transactions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid references groups(id),
  from_user uuid references profiles(id),
  to_user uuid references profiles(id),
  amount numeric,
  remaining_amount numeric,
  note text,
  status text default 'pending',
  created_at timestamp default now()
);

-- REPAYMENTS
create table repayments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid references transactions(id) on delete cascade,
  amount_paid numeric,
  created_at timestamp default now()
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================

alter table profiles enable row level security;
alter table groups enable row level security;
alter table group_members enable row level security;
alter table transactions enable row level security;
alter table repayments enable row level security;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Profiles: users can read all profiles, edit only their own
create policy "Public profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Groups: members can view groups they belong to
create policy "Users can view groups they are members of"
  on groups for select
  to authenticated
  using (
    id in (
      select group_id from group_members where user_id = auth.uid()
    ) or created_by = auth.uid()
  );

create policy "Authenticated users can create groups"
  on groups for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Group creators can update groups"
  on groups for update
  to authenticated
  using (auth.uid() = created_by);

create policy "Group creators can delete groups"
  on groups for delete
  to authenticated
  using (auth.uid() = created_by);

-- Group Members
create policy "Members can view group members"
  on group_members for select
  to authenticated
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Group creators can add members"
  on group_members for insert
  to authenticated
  with check (
    group_id in (
      select id from groups where created_by = auth.uid()
    )
  );

create policy "Group creators can remove members"
  on group_members for delete
  to authenticated
  using (
    group_id in (
      select id from groups where created_by = auth.uid()
    )
  );

-- Transactions
create policy "Users can view transactions in their groups"
  on transactions for select
  to authenticated
  using (
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    ) or from_user = auth.uid() or to_user = auth.uid()
  );

create policy "Authenticated users can create transactions"
  on transactions for insert
  to authenticated
  with check (
    from_user = auth.uid() or
    group_id in (
      select group_id from group_members where user_id = auth.uid()
    )
  );

create policy "Transaction parties can update transactions"
  on transactions for update
  to authenticated
  using (from_user = auth.uid() or to_user = auth.uid());

-- Repayments
create policy "Users can view repayments for their transactions"
  on repayments for select
  to authenticated
  using (
    transaction_id in (
      select id from transactions
      where from_user = auth.uid() or to_user = auth.uid()
    )
  );

create policy "Transaction parties can add repayments"
  on repayments for insert
  to authenticated
  with check (
    transaction_id in (
      select id from transactions
      where from_user = auth.uid() or to_user = auth.uid()
    )
  );

-- ============================================================
-- Trigger: Auto-create profile on signup
-- ============================================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data->>'name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

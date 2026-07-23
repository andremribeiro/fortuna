-- Initial schema. The tables below were created through the Supabase dashboard
-- before migrations were tracked; this file captures them as they exist in
-- production so a fresh database can be rebuilt from scratch.

create table if not exists public.subscriptions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  name               text not null,
  amount             numeric not null,
  currency           text not null default 'EUR',
  billing_cycle      text not null check (billing_cycle in ('monthly', 'yearly', 'weekly', 'custom')),
  next_charge_date   date,
  billing_anchor_day integer,
  category           text,
  notes              text,
  active             boolean not null default true,
  created_at         timestamptz not null default now()
);

create table if not exists public.transactions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  date            date not null,
  amount          numeric not null,
  merchant        text,
  category        text,
  description     text,
  source          text not null default 'manual' check (source in ('manual', 'csv', 'subscription')),
  subscription_id uuid references public.subscriptions (id) on delete set null,
  created_at      timestamptz not null default now()
);

-- Monthly spending budgets, one cap per category per user.
create table if not exists public.budgets (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  category   text not null,
  amount     numeric(12, 2) not null check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, category)
);

-- Dedupes materialized subscription charges. materializeCharges() inserts one
-- row per billing cycle and relies on the resulting 23505 unique violation to
-- skip cycles it has already written — without this index it double-charges.
create unique index if not exists transactions_sub_charge_uidx
  on public.transactions (subscription_id, date)
  where subscription_id is not null;

alter table public.subscriptions enable row level security;
alter table public.transactions  enable row level security;
alter table public.budgets       enable row level security;

drop policy if exists "own subscriptions" on public.subscriptions;
create policy "own subscriptions"
  on public.subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "own transactions" on public.transactions;
create policy "own transactions"
  on public.transactions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage their own budgets" on public.budgets;
create policy "Users manage their own budgets"
  on public.budgets
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create extension if not exists "pgcrypto";

create table if not exists public.customer_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  whatsapp text,
  address_line1 text,
  address_line2 text,
  city text,
  province text,
  postal_code text,
  country text default 'República Dominicana',
  delivery_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_number text not null unique,
  status text not null default 'requested' check (
    status in ('requested', 'confirmed', 'paid', 'shipped', 'completed', 'cancelled')
  ),
  total_amount numeric(12, 2) not null default 0,
  currency text not null default 'DOP',
  items jsonb not null default '[]'::jsonb,
  customer_snapshot jsonb,
  whatsapp_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_orders_user_created_idx
  on public.customer_orders (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists customer_profiles_set_updated_at on public.customer_profiles;
create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists customer_orders_set_updated_at on public.customer_orders;
create trigger customer_orders_set_updated_at
before update on public.customer_orders
for each row execute function public.set_updated_at();

alter table public.customer_profiles enable row level security;
alter table public.customer_orders enable row level security;

drop policy if exists "Customers can read their own profile" on public.customer_profiles;
create policy "Customers can read their own profile"
on public.customer_profiles for select
using (auth.uid() = id);

drop policy if exists "Customers can insert their own profile" on public.customer_profiles;
create policy "Customers can insert their own profile"
on public.customer_profiles for insert
with check (auth.uid() = id);

drop policy if exists "Customers can update their own profile" on public.customer_profiles;
create policy "Customers can update their own profile"
on public.customer_profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Customers can read their own orders" on public.customer_orders;
create policy "Customers can read their own orders"
on public.customer_orders for select
using (auth.uid() = user_id);

drop policy if exists "Customers can create their own orders" on public.customer_orders;
create policy "Customers can create their own orders"
on public.customer_orders for insert
with check (auth.uid() = user_id);

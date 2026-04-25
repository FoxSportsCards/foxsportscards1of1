create table if not exists public.product_inventory (
  product_slug text primary key,
  product_title text,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  track_inventory boolean not null default true,
  low_stock_threshold integer not null default 1 check (low_stock_threshold >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  email text primary key,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.customer_orders
  alter column user_id drop not null;

alter table public.customer_orders
  add column if not exists inventory_applied boolean not null default false,
  add column if not exists telegram_message_id bigint,
  add column if not exists admin_notes text,
  add column if not exists confirmed_at timestamptz,
  add column if not exists rejected_at timestamptz;

alter table public.customer_orders
  drop constraint if exists customer_orders_status_check;

alter table public.customer_orders
  add constraint customer_orders_status_check check (
    status in ('requested', 'confirmed', 'rejected', 'paid', 'shipped', 'completed', 'cancelled')
  );

create index if not exists customer_orders_status_created_idx
  on public.customer_orders (status, created_at desc);

drop trigger if exists product_inventory_set_updated_at on public.product_inventory;
create trigger product_inventory_set_updated_at
before update on public.product_inventory
for each row execute function public.set_updated_at();

alter table public.product_inventory enable row level security;
alter table public.admin_users enable row level security;

drop policy if exists "Anyone can read product inventory" on public.product_inventory;
create policy "Anyone can read product inventory"
on public.product_inventory for select
using (true);

drop policy if exists "Admins can read admin users" on public.admin_users;
create policy "Admins can read admin users"
on public.admin_users for select
using (auth.jwt() ->> 'email' = email);

grant usage on schema public to anon, authenticated;
grant select on public.product_inventory to anon, authenticated;
grant select on public.admin_users to authenticated;
grant select, insert, update on public.product_inventory to service_role;
grant select, insert, update on public.customer_orders to service_role;
grant select, insert, update on public.customer_profiles to service_role;
grant select on public.admin_users to service_role;

create or replace function public.confirm_customer_order(order_id uuid)
returns public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.customer_orders%rowtype;
  item jsonb;
  item_slug text;
  item_qty integer;
  inventory_row public.product_inventory%rowtype;
begin
  select *
  into target_order
  from public.customer_orders
  where id = order_id
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  if target_order.status in ('rejected', 'cancelled') then
    raise exception 'order_closed';
  end if;

  if not target_order.inventory_applied then
    for item in select * from jsonb_array_elements(coalesce(target_order.items, '[]'::jsonb))
    loop
      item_slug := nullif(item ->> 'slug', '');
      item_qty := greatest(coalesce(nullif(item ->> 'qty', '')::integer, 1), 1);

      if item_slug is not null then
        select *
        into inventory_row
        from public.product_inventory
        where product_slug = item_slug
        for update;

        if found and inventory_row.track_inventory then
          if inventory_row.quantity < item_qty then
            raise exception 'insufficient_stock:%', item_slug;
          end if;

          update public.product_inventory
          set quantity = quantity - item_qty
          where product_slug = item_slug;
        end if;
      end if;
    end loop;
  end if;

  update public.customer_orders
  set
    status = 'confirmed',
    inventory_applied = true,
    confirmed_at = coalesce(confirmed_at, now()),
    updated_at = now()
  where id = order_id
  returning * into target_order;

  return target_order;
end;
$$;

create or replace function public.reject_customer_order(order_id uuid, note text default null)
returns public.customer_orders
language plpgsql
security definer
set search_path = public
as $$
declare
  target_order public.customer_orders%rowtype;
begin
  select *
  into target_order
  from public.customer_orders
  where id = order_id
  for update;

  if not found then
    raise exception 'order_not_found';
  end if;

  if target_order.inventory_applied then
    raise exception 'inventory_already_applied';
  end if;

  update public.customer_orders
  set
    status = 'rejected',
    admin_notes = coalesce(note, admin_notes),
    rejected_at = coalesce(rejected_at, now()),
    updated_at = now()
  where id = order_id
  returning * into target_order;

  return target_order;
end;
$$;

revoke all on function public.confirm_customer_order(uuid) from public;
revoke all on function public.reject_customer_order(uuid, text) from public;
grant execute on function public.confirm_customer_order(uuid) to service_role;
grant execute on function public.reject_customer_order(uuid, text) to service_role;

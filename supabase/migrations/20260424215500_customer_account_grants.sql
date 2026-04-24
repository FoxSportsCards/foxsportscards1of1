grant usage on schema public to authenticated;

grant select, insert, update
on public.customer_profiles
to authenticated;

grant select, insert
on public.customer_orders
to authenticated;

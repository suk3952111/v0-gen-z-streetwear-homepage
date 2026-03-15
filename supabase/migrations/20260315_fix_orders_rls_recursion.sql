begin;

-- Break RLS recursion between orders <-> order_items by moving cross-table checks
-- into security definer helper functions.

create or replace function public.can_user_read_order(
  target_order_id uuid,
  target_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_uid uuid;
begin
  current_uid := auth.uid();

  if current_uid is null then
    return false;
  end if;

  if public.is_platform_admin() then
    return true;
  end if;

  if target_user_id = current_uid then
    return true;
  end if;

  return exists (
    select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
     where oi.order_id = target_order_id
       and p.seller_id = current_uid
  );
end;
$$;

create or replace function public.can_user_read_order_item(
  target_order_id uuid,
  target_product_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_uid uuid;
begin
  current_uid := auth.uid();

  if current_uid is null then
    return false;
  end if;

  if public.is_platform_admin() then
    return true;
  end if;

  if exists (
    select 1
      from public.orders o
     where o.id = target_order_id
       and o.user_id = current_uid
  ) then
    return true;
  end if;

  if exists (
    select 1
      from public.products p
     where p.id = target_product_id
       and p.seller_id = current_uid
  ) then
    return true;
  end if;

  return false;
end;
$$;

grant execute on function public.can_user_read_order(uuid, uuid) to anon, authenticated, service_role;
grant execute on function public.can_user_read_order_item(uuid, uuid) to anon, authenticated, service_role;

drop policy if exists orders_customer_read on public.orders;
drop policy if exists orders_seller_or_admin_read on public.orders;
create policy orders_read_via_helper
on public.orders
for select
using (public.can_user_read_order(id, user_id));

drop policy if exists order_items_visible_to_related_parties on public.order_items;
create policy order_items_read_via_helper
on public.order_items
for select
using (public.can_user_read_order_item(order_id, product_id));

commit;


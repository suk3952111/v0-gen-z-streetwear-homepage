begin;

alter table public.product_images
  add column if not exists ai_attributes jsonb;

create index if not exists idx_product_images_ai_attributes_gin
  on public.product_images
  using gin (ai_attributes);

create or replace function public.list_product_images_for_embedding(batch_count integer default 12)
returns table(
  image_id uuid,
  product_id uuid,
  image_url text
)
language sql
stable
set search_path = public
as $$
  select
    pi.id as image_id,
    pi.product_id,
    pi.image_url
  from public.product_images pi
  join public.products p on p.id = pi.product_id
  where (pi.caption_embedding is null or pi.ai_attributes is null)
    and p.is_published = true
    and p.is_deleted = false
  order by pi.is_primary desc, pi.display_order asc, pi.created_at desc
  limit greatest(batch_count, 1);
$$;

grant execute on function public.list_product_images_for_embedding(integer) to anon, authenticated, service_role;

commit;

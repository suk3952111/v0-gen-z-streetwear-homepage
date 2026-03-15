begin;

alter table public.product_images
  add column if not exists caption text,
  add column if not exists caption_embedding vector(768),
  add column if not exists caption_updated_at timestamptz;

create index if not exists idx_product_images_caption_embedding_ivfflat
  on public.product_images
  using ivfflat (caption_embedding vector_cosine_ops)
  with (lists = 100);

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
  where pi.caption_embedding is null
    and p.is_published = true
    and p.is_deleted = false
  order by pi.is_primary desc, pi.display_order asc, pi.created_at desc
  limit greatest(batch_count, 1);
$$;

create or replace function public.match_products_by_image_embedding(
  query_embedding vector(768),
  match_count integer default 24
)
returns table(
  product_id uuid,
  similarity double precision
)
language sql
stable
set search_path = public
as $$
  with scored as (
    select
      pi.product_id,
      max(1 - (pi.caption_embedding <=> query_embedding)) as similarity
    from public.product_images pi
    join public.products p on p.id = pi.product_id
    where pi.caption_embedding is not null
      and p.is_published = true
      and p.is_deleted = false
    group by pi.product_id
  )
  select
    s.product_id,
    s.similarity
  from scored s
  order by s.similarity desc
  limit greatest(match_count, 1);
$$;

create or replace function public.match_products_by_product_embedding(
  source_product_id uuid,
  match_count integer default 24
)
returns table(
  product_id uuid,
  similarity double precision
)
language sql
stable
set search_path = public
as $$
  with source_embeddings as (
    select pi.caption_embedding
    from public.product_images pi
    where pi.product_id = source_product_id
      and pi.caption_embedding is not null
  ),
  scored as (
    select
      pi.product_id,
      max(1 - (pi.caption_embedding <=> se.caption_embedding)) as similarity
    from public.product_images pi
    cross join source_embeddings se
    join public.products p on p.id = pi.product_id
    where pi.caption_embedding is not null
      and pi.product_id <> source_product_id
      and p.is_published = true
      and p.is_deleted = false
    group by pi.product_id
  )
  select
    s.product_id,
    s.similarity
  from scored s
  order by s.similarity desc
  limit greatest(match_count, 1);
$$;

grant execute on function public.list_product_images_for_embedding(integer) to anon, authenticated, service_role;
grant execute on function public.match_products_by_image_embedding(vector(768), integer) to anon, authenticated, service_role;
grant execute on function public.match_products_by_product_embedding(uuid, integer) to anon, authenticated, service_role;

commit;


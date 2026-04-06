create table if not exists public.product_search_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.product_search_tag_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.product_search_tags(id) on delete cascade,
  confidence numeric(4,3),
  source text,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

create index if not exists idx_product_search_tag_relations_tag_product
  on public.product_search_tag_relations(tag_id, product_id);

create index if not exists idx_product_search_tag_relations_product_tag
  on public.product_search_tag_relations(product_id, tag_id);

insert into public.product_search_tags (name, slug)
select pt.name, pt.slug
from public.product_tags pt
on conflict (slug) do update
set name = excluded.name;

insert into public.product_search_tag_relations (product_id, tag_id, confidence, source)
select ptr.product_id, pst.id, 1, 'public-tag-backfill'
from public.product_tag_relations ptr
join public.product_tags pt
  on pt.id = ptr.tag_id
join public.product_search_tags pst
  on pst.slug = pt.slug
on conflict (product_id, tag_id) do update
set confidence = excluded.confidence,
    source = excluded.source;

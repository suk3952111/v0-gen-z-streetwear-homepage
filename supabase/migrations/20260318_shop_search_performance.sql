begin;

create extension if not exists pg_trgm;

-- Speeds up ILIKE '%query%' search on products.name/slug for published items.
create index if not exists idx_products_name_trgm_active
  on public.products
  using gin (name gin_trgm_ops)
  where is_published = true and is_deleted = false;

create index if not exists idx_products_slug_trgm_active
  on public.products
  using gin (slug gin_trgm_ops)
  where is_published = true and is_deleted = false;

-- Supports the default listing sort/filter path used by shop page.
create index if not exists idx_products_publish_deleted_created
  on public.products(is_published, is_deleted, created_at desc, id desc);

-- Tag filter path looks up by tag_id first.
create index if not exists idx_product_tag_relations_tag_product
  on public.product_tag_relations(tag_id, product_id);

commit;


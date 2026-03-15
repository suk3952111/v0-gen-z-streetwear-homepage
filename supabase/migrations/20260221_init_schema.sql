-- =========================================================
-- v0 streetwear commerce schema (Postgres/Supabase)
-- date: 2026-02-21
-- includes: ddl + checks + indexes + triggers + rls draft
-- =========================================================

begin;

-- extensions
create extension if not exists pgcrypto;
create extension if not exists vector;
create extension if not exists btree_gist;

-- =========================================================
-- enums
-- =========================================================

create type public.user_role as enum ('platform_admin', 'seller', 'customer');
create type public.discount_type_enum as enum ('percentage', 'fixed_amount');
create type public.order_status_enum as enum ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
create type public.payment_status_enum as enum ('pending', 'completed', 'failed');
create type public.refund_status_enum as enum ('requested', 'approved', 'completed', 'rejected');
create type public.admin_action_type_enum as enum ('create', 'update', 'delete');

-- =========================================================
-- trigger functions
-- =========================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create or replace function public.set_products_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.is_published = true
     and old.is_published = false
     and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

-- auth.users.last_sign_in_at -> public.users.last_sign_in_at mirror
create or replace function public.sync_last_sign_in_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.last_sign_in_at is distinct from old.last_sign_in_at then
    update public.users
       set last_sign_in_at = new.last_sign_in_at
     where id = new.id;
  end if;
  return new;
end;
$$;
-- auth.users insert -> public.users row upsert
create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_active
  )
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url',
    'customer',
    true
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.users.full_name, excluded.full_name),
    avatar_url = coalesce(public.users.avatar_url, excluded.avatar_url);

  return new;
end;
$$;

-- =========================================================
-- 1) auth / users
-- =========================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);

create table if not exists public.user_addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  recipient_name text not null,
  phone text not null,
  base_address text not null,
  detail_address text,
  city text not null,
  postal_code text not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- =========================================================
-- 2) catalog
-- =========================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  parent_id uuid references public.categories(id) on delete set null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_display_order_non_negative check (display_order >= 0),
  constraint categories_parent_not_self check (parent_id is null or parent_id <> id)
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.users(id) on delete restrict,
  name text not null,
  slug text not null,
  description text,
  category_id uuid not null references public.categories(id) on delete restrict,
  brand_id uuid references public.brands(id) on delete set null,
  base_price numeric(12,2) not null,
  is_published boolean not null default false,
  is_featured boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint products_base_price_non_negative check (base_price >= 0)
);

-- soft delete compatible slug uniqueness
create unique index if not exists products_slug_active_unique
  on public.products(slug)
  where is_deleted = false;

create table if not exists public.promotions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  discount_type public.discount_type_enum not null,
  discount_value numeric(12,2) not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint promotions_discount_non_negative check (discount_value >= 0),
  constraint promotions_percentage_range check (
    discount_type <> 'percentage' or (discount_value > 0 and discount_value <= 100)
  ),
  constraint promotions_valid_window check (start_date < end_date)
);

create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  ip_address text,
  user_agent text,
  viewed_at timestamptz not null default now()
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text,
  sku text not null unique,
  stock_quantity integer not null default 0,
  price_adjustment numeric(12,2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_variants_stock_non_negative check (stock_quantity >= 0)
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order integer not null default 0,
  is_primary boolean not null default false,
  embedding_vector vector(512),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_images_display_order_non_negative check (display_order >= 0)
);

create table if not exists public.product_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.product_tag_relations (
  product_id uuid not null references public.products(id) on delete cascade,
  tag_id uuid not null references public.product_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, tag_id)
);

-- =========================================================
-- 3) orders / payments
-- =========================================================

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type public.discount_type_enum not null,
  discount_value numeric(12,2) not null,
  min_order_amount numeric(12,2),
  max_discount_amount numeric(12,2),
  start_date timestamptz not null,
  end_date timestamptz not null,
  usage_limit integer,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint coupons_discount_non_negative check (discount_value >= 0),
  constraint coupons_percentage_range check (
    discount_type <> 'percentage' or (discount_value > 0 and discount_value <= 100)
  ),
  constraint coupons_min_order_non_negative check (min_order_amount is null or min_order_amount >= 0),
  constraint coupons_max_discount_non_negative check (max_discount_amount is null or max_discount_amount >= 0),
  constraint coupons_usage_limit_non_negative check (usage_limit is null or usage_limit >= 0),
  constraint coupons_usage_count_non_negative check (usage_count >= 0),
  constraint coupons_valid_window check (start_date < end_date)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid not null references public.users(id) on delete restrict,
  status public.order_status_enum not null default 'pending',
  shipping_fee numeric(12,2) not null default 0,
  coupon_id uuid references public.coupons(id) on delete set null,
  payment_method text,
  payment_status public.payment_status_enum not null default 'pending',
  user_address_id uuid references public.user_addresses(id) on delete set null,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  constraint orders_shipping_fee_non_negative check (shipping_fee >= 0)
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null,
  unit_price numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint order_items_quantity_positive check (quantity > 0),
  constraint order_items_unit_price_non_negative check (unit_price >= 0)
);

create table if not exists public.refunds (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  refund_amount numeric(12,2) not null,
  refund_reason text not null,
  status public.refund_status_enum not null default 'requested',
  processed_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  constraint refunds_amount_non_negative check (refund_amount >= 0)
);

-- =========================================================
-- 4) reviews
-- =========================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete restrict,
  order_item_id uuid references public.order_items(id) on delete set null,
  rating integer not null,
  title text,
  content text not null,
  is_verified_purchase boolean not null default false,
  is_published boolean not null default true,
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_range check (rating between 1 and 5),
  constraint reviews_helpful_count_non_negative check (helpful_count >= 0)
);

create table if not exists public.review_images (
  id uuid primary key default gen_random_uuid(),
  review_id uuid not null references public.reviews(id) on delete cascade,
  image_url text not null,
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint review_images_display_order_non_negative check (display_order >= 0)
);

-- =========================================================
-- 5) wishlist / cart
-- =========================================================

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cart_items_quantity_positive check (quantity > 0)
);

-- =========================================================
-- 6) ai image search
-- =========================================================

create table if not exists public.image_search_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  uploaded_image_url text not null,
  query_embedding vector(512) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.image_search_results (
  id uuid primary key default gen_random_uuid(),
  search_log_id uuid not null references public.image_search_logs(id) on delete cascade,
  product_image_id uuid not null references public.product_images(id) on delete cascade,
  similarity_score numeric(8,6) not null,
  rank integer not null,
  created_at timestamptz not null default now(),
  constraint image_search_results_similarity_range check (similarity_score >= 0 and similarity_score <= 1),
  constraint image_search_results_rank_positive check (rank > 0),
  unique (search_log_id, rank)
);

-- =========================================================
-- 7) admin logs
-- =========================================================

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.users(id) on delete restrict,
  action_type public.admin_action_type_enum not null,
  target_table text not null,
  target_id uuid,
  description text,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

-- =========================================================
-- triggers
-- =========================================================

create trigger trg_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger trg_user_addresses_updated_at
before update on public.user_addresses
for each row execute function public.set_updated_at();

create trigger trg_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger trg_brands_updated_at
before update on public.brands
for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger trg_products_published_at
before update on public.products
for each row execute function public.set_products_published_at();

create trigger trg_promotions_updated_at
before update on public.promotions
for each row execute function public.set_updated_at();

create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger trg_product_images_updated_at
before update on public.product_images
for each row execute function public.set_updated_at();

create trigger trg_coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create trigger trg_reviews_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

create trigger trg_cart_items_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

drop trigger if exists trg_auth_users_last_sign_in on auth.users;
create trigger trg_auth_users_last_sign_in
after update of last_sign_in_at on auth.users
for each row execute function public.sync_last_sign_in_at();
drop trigger if exists trg_auth_users_created on auth.users;
create trigger trg_auth_users_created
after insert on auth.users
for each row execute function public.handle_auth_user_created();

-- =========================================================
-- constraints for business rules
-- =========================================================

-- exactly one default address max per user
create unique index if not exists user_addresses_default_one_per_user
  on public.user_addresses(user_id)
  where is_default = true;

-- prevent active promotion overlap per product
alter table public.promotions
drop constraint if exists promotions_no_overlapping_active;

alter table public.promotions
  add constraint promotions_no_overlapping_active
  exclude using gist (
    product_id with =,
    tstzrange(start_date, end_date, '[)') with &&
  )
  where (is_active = true);

-- =========================================================
-- indexes (query-driven)
-- =========================================================

create index if not exists idx_categories_parent_order
  on public.categories(parent_id, display_order);

create index if not exists idx_products_category_publish_deleted
  on public.products(category_id, is_published, is_deleted);

create index if not exists idx_products_seller_publish_deleted
  on public.products(seller_id, is_published, is_deleted);

create index if not exists idx_products_featured
  on public.products(is_featured, created_at desc)
  where is_deleted = false and is_published = true;

create index if not exists idx_promotions_product_window
  on public.promotions(product_id, is_active, start_date, end_date);

create index if not exists idx_product_views_product_viewed_at
  on public.product_views(product_id, viewed_at desc);

create index if not exists idx_product_variants_product
  on public.product_variants(product_id, is_active);

create index if not exists idx_product_images_product_order
  on public.product_images(product_id, is_primary desc, display_order);

create index if not exists idx_orders_user_created_at
  on public.orders(user_id, created_at desc);

create index if not exists idx_orders_status_created_at
  on public.orders(status, created_at desc);

create index if not exists idx_order_items_order
  on public.order_items(order_id);

create index if not exists idx_order_items_product
  on public.order_items(product_id);

create index if not exists idx_refunds_order_status_created
  on public.refunds(order_id, status, created_at desc);

create index if not exists idx_reviews_product_publish_created
  on public.reviews(product_id, is_published, created_at desc);

create index if not exists idx_review_images_review_order
  on public.review_images(review_id, display_order);

create index if not exists idx_wishlists_user_created
  on public.wishlists(user_id, created_at desc);

create index if not exists idx_cart_items_user_updated
  on public.cart_items(user_id, updated_at desc);

create index if not exists idx_image_search_logs_user_created
  on public.image_search_logs(user_id, created_at desc);

create index if not exists idx_image_search_results_log_rank
  on public.image_search_results(search_log_id, rank);

create index if not exists idx_admin_logs_admin_created
  on public.admin_activity_logs(admin_id, created_at desc);

create index if not exists idx_admin_logs_target
  on public.admin_activity_logs(target_table, target_id, created_at desc);

-- vector similarity index
create index if not exists idx_product_images_embedding_ivfflat
  on public.product_images
  using ivfflat (embedding_vector vector_cosine_ops)
  with (lists = 100);

-- =========================================================
-- rls helper functions
-- =========================================================

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid();
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'platform_admin', false);
$$;

create or replace function public.is_seller()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'seller', false);
$$;

-- =========================================================
-- rls (draft)
-- =========================================================

alter table public.users enable row level security;
alter table public.user_addresses enable row level security;
alter table public.products enable row level security;
alter table public.promotions enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.cart_items enable row level security;
alter table public.image_search_logs enable row level security;
alter table public.image_search_results enable row level security;
alter table public.admin_activity_logs enable row level security;

-- users
drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
on public.users
for select
using (id = auth.uid() or public.is_platform_admin());

drop policy if exists users_insert_self_or_admin on public.users;
create policy users_insert_self_or_admin
on public.users
for insert
with check (id = auth.uid() or public.is_platform_admin());

drop policy if exists users_update_self_or_admin on public.users;
create policy users_update_self_or_admin
on public.users
for update
using (id = auth.uid() or public.is_platform_admin())
with check (id = auth.uid() or public.is_platform_admin());

-- addresses
drop policy if exists user_addresses_owner_or_admin on public.user_addresses;
create policy user_addresses_owner_or_admin
on public.user_addresses
for all
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

-- products
drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
using (is_published = true and is_deleted = false);

drop policy if exists products_seller_or_admin_manage on public.products;
create policy products_seller_or_admin_manage
on public.products
for all
using (seller_id = auth.uid() or public.is_platform_admin())
with check (seller_id = auth.uid() or public.is_platform_admin());

-- promotions
drop policy if exists promotions_public_read on public.promotions;
create policy promotions_public_read
on public.promotions
for select
using (is_active = true);

drop policy if exists promotions_seller_or_admin_manage on public.promotions;
create policy promotions_seller_or_admin_manage
on public.promotions
for all
using (
  exists (
    select 1
      from public.products p
     where p.id = promotions.product_id
       and (p.seller_id = auth.uid() or public.is_platform_admin())
  )
)
with check (
  exists (
    select 1
      from public.products p
     where p.id = promotions.product_id
       and (p.seller_id = auth.uid() or public.is_platform_admin())
  )
);

-- orders
drop policy if exists orders_customer_read on public.orders;
create policy orders_customer_read
on public.orders
for select
using (user_id = auth.uid());

drop policy if exists orders_seller_or_admin_read on public.orders;
create policy orders_seller_or_admin_read
on public.orders
for select
using (
  public.is_platform_admin()
  or exists (
    select 1
      from public.order_items oi
      join public.products p on p.id = oi.product_id
     where oi.order_id = orders.id
       and p.seller_id = auth.uid()
  )
);

drop policy if exists orders_customer_insert on public.orders;
create policy orders_customer_insert
on public.orders
for insert
with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists orders_owner_or_staff_update on public.orders;
create policy orders_owner_or_staff_update
on public.orders
for update
using (user_id = auth.uid() or public.is_seller() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_seller() or public.is_platform_admin());

-- order_items
drop policy if exists order_items_visible_to_related_parties on public.order_items;
create policy order_items_visible_to_related_parties
on public.order_items
for select
using (
  exists (
    select 1
      from public.orders o
     where o.id = order_items.order_id
       and (o.user_id = auth.uid() or public.is_platform_admin())
  )
  or exists (
    select 1
      from public.products p
     where p.id = order_items.product_id
       and p.seller_id = auth.uid()
  )
);

drop policy if exists order_items_insert_by_order_owner_or_admin on public.order_items;
create policy order_items_insert_by_order_owner_or_admin
on public.order_items
for insert
with check (
  exists (
    select 1
      from public.orders o
     where o.id = order_items.order_id
       and (o.user_id = auth.uid() or public.is_platform_admin())
  )
);

-- reviews
drop policy if exists reviews_public_published_read on public.reviews;
create policy reviews_public_published_read
on public.reviews
for select
using (is_published = true);

drop policy if exists reviews_owner_or_admin_manage on public.reviews;
create policy reviews_owner_or_admin_manage
on public.reviews
for all
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

-- wishlist / cart
drop policy if exists wishlists_owner_or_admin on public.wishlists;
create policy wishlists_owner_or_admin
on public.wishlists
for all
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists cart_items_owner_or_admin on public.cart_items;
create policy cart_items_owner_or_admin
on public.cart_items
for all
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

-- image search
drop policy if exists image_search_logs_owner_or_admin on public.image_search_logs;
create policy image_search_logs_owner_or_admin
on public.image_search_logs
for all
using (user_id = auth.uid() or public.is_platform_admin())
with check (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists image_search_results_owner_or_admin_read on public.image_search_results;
create policy image_search_results_owner_or_admin_read
on public.image_search_results
for select
using (
  public.is_platform_admin()
  or exists (
    select 1
      from public.image_search_logs l
     where l.id = image_search_results.search_log_id
       and l.user_id = auth.uid()
  )
);

-- admin logs
drop policy if exists admin_activity_logs_admin_only on public.admin_activity_logs;
create policy admin_activity_logs_admin_only
on public.admin_activity_logs
for all
using (public.is_platform_admin())
with check (public.is_platform_admin());

commit;

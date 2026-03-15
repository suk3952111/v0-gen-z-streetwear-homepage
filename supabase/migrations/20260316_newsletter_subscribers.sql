begin;

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'footer',
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;

drop policy if exists newsletter_subscribers_insert_public on public.newsletter_subscribers;
create policy newsletter_subscribers_insert_public
on public.newsletter_subscribers
for insert
with check (true);

drop policy if exists newsletter_subscribers_admin_read on public.newsletter_subscribers;
create policy newsletter_subscribers_admin_read
on public.newsletter_subscribers
for select
using (public.is_platform_admin());

create index if not exists idx_newsletter_subscribers_created_at
  on public.newsletter_subscribers(created_at desc);

commit;


create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  location text,
  job_url text,
  salary text,
  status text not null default 'wishlist'
    check (status in ('wishlist', 'applied', 'interview', 'offer', 'rejected')),
  notes text,
  applied_date date,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;

create policy "Users can view their own jobs"
  on public.jobs for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own jobs"
  on public.jobs for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can edit their own jobs"
  on public.jobs for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own jobs"
  on public.jobs for delete to authenticated
  using ((select auth.uid()) = user_id);
create extension if not exists pgcrypto;

create table if not exists public.app_state (
  id text primary key,
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists app_state_touch_updated_at on public.app_state;

create trigger app_state_touch_updated_at
before update on public.app_state
for each row
execute function public.touch_updated_at();

alter table public.app_state enable row level security;

drop policy if exists "no direct access to app_state" on public.app_state;

create policy "no direct access to app_state"
on public.app_state
for all
using (false)
with check (false);

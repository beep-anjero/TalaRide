-- Phase 6: accounts only. Private ride history must never be added here.
begin;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Passenger'
    check (char_length(btrim(display_name)) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;
create policy "Read own profile" on public.profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "Update own profile" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  requested_name text := btrim(new.raw_user_meta_data ->> 'display_name');
begin
  insert into public.profiles (id, display_name)
  values (new.id, case when char_length(requested_name) between 1 and 80
    then requested_name else 'Passenger' end);
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Accounts created before applying this migration also receive a profile.
insert into public.profiles (id) select id from auth.users on conflict (id) do nothing;
commit;

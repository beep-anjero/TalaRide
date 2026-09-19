create type public.lost_request_status as enum ('active', 'helper_responding', 'resolved', 'expired');
create type public.relay_response_status as enum ('offered', 'dismissed');

create table public.lost_item_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  local_ride_id text not null,
  vehicle_digest text not null check (length(vehicle_digest) = 64),
  item_description text not null check (char_length(item_description) between 1 and 150),
  additional_details text not null default '' check (char_length(additional_details) <= 500),
  status public.lost_request_status not null default 'active',
  created_at timestamptz not null default statement_timestamp(),
  expires_at timestamptz not null default (statement_timestamp() + interval '7 days'),
  resolved_at timestamptz,
  constraint lost_request_expiration check (expires_at = created_at + interval '7 days'),
  constraint lost_request_resolution check (
    (status = 'resolved' and resolved_at is not null) or
    (status <> 'resolved' and resolved_at is null)
  )
);

create unique index lost_item_requests_one_open_per_ride
  on public.lost_item_requests(owner_id, local_ride_id)
  where status in ('active', 'helper_responding');
create index lost_item_requests_match_idx
  on public.lost_item_requests(vehicle_digest, created_at, expires_at)
  where status in ('active', 'helper_responding');

create table public.relay_matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.lost_item_requests(id) on delete cascade,
  helper_id uuid not null references auth.users(id) on delete cascade,
  scanned_at timestamptz not null default statement_timestamp(),
  response public.relay_response_status,
  responded_at timestamptz,
  constraint relay_response_time check (
    (response is null and responded_at is null) or
    (response is not null and responded_at is not null)
  ),
  unique(request_id, helper_id)
);
create index relay_matches_helper_idx on public.relay_matches(helper_id, scanned_at desc);

create table public.relay_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null check (operation in ('create', 'scan', 'respond', 'status', 'list')),
  window_started_at timestamptz not null default statement_timestamp(),
  attempts integer not null default 1 check (attempts > 0),
  primary key(user_id, operation)
);

alter table public.lost_item_requests enable row level security;
alter table public.relay_matches enable row level security;
alter table public.relay_rate_limits enable row level security;

revoke all on public.lost_item_requests, public.relay_matches, public.relay_rate_limits
  from anon, authenticated;
grant select on public.lost_item_requests to authenticated;

create policy "owners read their requests"
  on public.lost_item_requests for select to authenticated
  using (owner_id = (select auth.uid()));
create or replace function public.expire_lost_item_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  update public.lost_item_requests
  set status = 'expired'
  where status in ('active', 'helper_responding') and expires_at <= statement_timestamp();
  get diagnostics changed = row_count;
  return changed;
end;
$$;
revoke all on function public.expire_lost_item_requests() from public, anon, authenticated;
grant execute on function public.expire_lost_item_requests() to service_role;

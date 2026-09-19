create type public.relay_notification_kind as enum ('relay_prompt', 'helper_offered', 'request_resolved', 'request_expired');

alter table public.relay_rate_limits drop constraint relay_rate_limits_operation_check;
alter table public.relay_rate_limits add constraint relay_rate_limits_operation_check
  check (operation in ('create', 'scan', 'respond', 'status', 'list', 'register_push', 'notifications', 'read_notification', 'preferences'));

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null unique check (token ~ '^(Exponent|Expo)PushToken[[][A-Za-z0-9_-]+[]]$'),
  platform text not null check (platform in ('android', 'ios')),
  enabled boolean not null default true,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp()
);
create index push_tokens_user_idx on public.push_tokens(user_id) where enabled;

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  relay_enabled boolean not null default true,
  updated_at timestamptz not null default statement_timestamp()
);

create table public.relay_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_id uuid not null references public.lost_item_requests(id) on delete cascade,
  match_id uuid references public.relay_matches(id) on delete cascade,
  kind public.relay_notification_kind not null,
  is_read boolean not null default false,
  created_at timestamptz not null default statement_timestamp(),
  unique(user_id, request_id, kind, match_id)
);
create index relay_notifications_user_idx on public.relay_notifications(user_id, created_at desc);

alter table public.push_tokens enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.relay_notifications enable row level security;
revoke all on public.push_tokens, public.notification_preferences, public.relay_notifications from anon, authenticated;

create or replace function public.expire_lost_item_requests()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare changed integer;
begin
  with expired as (
    update public.lost_item_requests
    set status = 'expired'
    where status in ('active', 'helper_responding') and expires_at <= statement_timestamp()
    returning id, owner_id
  ), notices as (
    insert into public.relay_notifications(user_id, request_id, kind)
    select owner_id, id, 'request_expired'::public.relay_notification_kind from expired
    on conflict do nothing
    returning 1
  )
  select count(*)::integer into changed from expired;
  return changed;
end;
$$;
revoke all on function public.expire_lost_item_requests() from public, anon, authenticated;
grant execute on function public.expire_lost_item_requests() to service_role;

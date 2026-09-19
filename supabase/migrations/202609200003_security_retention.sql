-- Atomic abuse controls and bounded retention for Phase 9.
create or replace function public.check_relay_rate_limit(
  p_user uuid,
  p_operation text,
  p_maximum integer,
  p_window_seconds integer
) returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  current_attempts integer;
begin
  if p_user is null or p_operation is null or p_operation = '' or
     p_maximum not between 1 and 1000 or p_window_seconds not between 1 and 86400 then
    raise exception 'Invalid rate limit input';
  end if;
  insert into public.relay_rate_limits(user_id, operation, window_started_at, attempts)
  values (p_user, p_operation, now(), 1)
  on conflict (user_id, operation) do update set
    attempts = case
      when relay_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then 1 else relay_rate_limits.attempts + 1 end,
    window_started_at = case
      when relay_rate_limits.window_started_at <= now() - make_interval(secs => p_window_seconds)
        then now() else relay_rate_limits.window_started_at end
  returning attempts into current_attempts;
  return current_attempts <= p_maximum;
end;
$$;

create or replace function public.purge_stale_relay_data() returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  removed integer;
begin
  delete from public.lost_item_requests
   where status in ('resolved', 'expired')
     and coalesce(resolved_at, expires_at) < now() - interval '30 days';
  get diagnostics removed = row_count;
  delete from public.push_tokens
   where (not enabled and updated_at < now() - interval '30 days')
      or updated_at < now() - interval '180 days';
  return removed;
end;
$$;

revoke all on function public.check_relay_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function public.purge_stale_relay_data() from public, anon, authenticated;
grant execute on function public.check_relay_rate_limit(uuid, text, integer, integer) to service_role;
grant execute on function public.purge_stale_relay_data() to service_role;

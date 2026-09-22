-- Record a helper response and its request transition in one locked transaction.
create or replace function public.respond_to_relay_match(
  p_match_id uuid,
  p_helper_id uuid,
  p_response public.relay_response_status
) returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  matched_request_id uuid;
begin
  select match_row.request_id
    into matched_request_id
    from public.relay_matches as match_row
    join public.lost_item_requests as request_row on request_row.id = match_row.request_id
   where match_row.id = p_match_id
     and match_row.helper_id = p_helper_id
     and match_row.response is null
     and request_row.status = 'active'
     and request_row.expires_at > statement_timestamp()
   for update of match_row, request_row;

  if matched_request_id is null then
    return null;
  end if;

  update public.relay_matches
     set response = p_response,
         responded_at = statement_timestamp()
   where id = p_match_id;

  if p_response = 'offered' then
    update public.lost_item_requests
       set status = 'helper_responding'
     where id = matched_request_id;
  end if;

  return matched_request_id;
end;
$$;

revoke all on function public.respond_to_relay_match(uuid, uuid, public.relay_response_status)
  from public, anon, authenticated;
grant execute on function public.respond_to_relay_match(uuid, uuid, public.relay_response_status)
  to service_role;

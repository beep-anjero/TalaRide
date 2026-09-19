import { requireSupabase } from '@/auth/client';
import type { LostRequest, RelayPrompt } from '@/types/models';

type RelayEnvelope = {
  error?: string;
  request?: Record<string, unknown>;
  requests?: Record<string, unknown>[];
  prompts?: Record<string, unknown>[];
};

async function invoke(body: Record<string, unknown>) {
  const { data, error } = await requireSupabase().functions.invoke<RelayEnvelope>(
    'community-relay',
    { body },
  );
  if (error) throw new Error(data?.error || error.message || 'Relay service is unavailable.');
  if (data?.error) throw new Error(data.error);
  return data ?? {};
}
function status(value: unknown): LostRequest['status'] {
  if (value === 'active') return 'Active';
  if (value === 'helper_responding') return 'Helper responding';
  if (value === 'resolved') return 'Resolved';
  return 'Expired';
}
function request(row: Record<string, unknown>): LostRequest {
  return {
    id: String(row.id),
    rideId: String(row.local_ride_id),
    description: String(row.item_description),
    details: String(row.additional_details ?? ''),
    date: String(row.created_at),
    expiresAt: String(row.expires_at),
    status: status(row.status),
  };
}
function prompt(row: Record<string, unknown>, rideId: string): RelayPrompt {
  return {
    matchId: String(row.matchId),
    requestId: String(row.requestId),
    rideId,
    description: String(row.description),
    details: String(row.details ?? ''),
    createdAt: String(row.createdAt),
    expiresAt: String(row.expiresAt),
  };
}

export async function createLostRequest(
  rideId: string,
  vehicle: string,
  description: string,
  details: string,
) {
  const data = await invoke({ action: 'create', rideId, vehicle, description, details });
  if (!data.request) throw new Error('The relay returned an invalid response.');
  return request(data.request);
}
export async function registerFutureScan(rideId: string, vehicle: string) {
  const data = await invoke({ action: 'scan', vehicle });
  return (data.prompts ?? []).map((item) => prompt(item, rideId));
}
export async function respondToRelay(matchId: string, response: 'offered' | 'dismissed') {
  await invoke({ action: 'respond', matchId, response });
}
export async function resolveLostRequest(requestId: string) {
  await invoke({ action: 'status', requestId, status: 'resolved' });
}
export async function listLostRequests() {
  const data = await invoke({ action: 'list' });
  return (data.requests ?? []).map(request);
}

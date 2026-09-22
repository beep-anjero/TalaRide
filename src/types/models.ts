export type IdentifierType = 'MTOP' | 'Body #' | 'Plate #';
export type RelayResponse = 'offered' | 'dismissed';
export type RelayRequestStatus = 'active' | 'helper_responding' | 'resolved' | 'expired';
export type Ride = {
  id: string;
  number: string;
  identifier: IdentifierType;
  date: string;
  note: string;
  location: string;
};
export type LostRequest = {
  id: string;
  rideId: string;
  description: string;
  details: string;
  date: string;
  expiresAt: string;
  status: 'Active' | 'Helper responding' | 'Resolved' | 'Expired';
};
export type RelayPrompt = {
  matchId: string;
  requestId: string;
  rideId: string;
  description: string;
  details: string;
  createdAt: string;
  expiresAt: string;
};
export type Notification = {
  id: string;
  requestId: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
  kind: 'relay_prompt' | 'helper_offered' | 'request_resolved' | 'request_expired';
  matchId?: string;
  description?: string;
  details?: string;
  matchResponse?: RelayResponse | null;
  requestStatus?: RelayRequestStatus;
  expiresAt?: string;
};

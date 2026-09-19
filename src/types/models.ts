export type IdentifierType = 'MTOP' | 'Body #' | 'Plate #';
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
  rideId: string;
  title: string;
  message: string;
  date: string;
  unread: boolean;
  kind: 'found' | 'expired';
};

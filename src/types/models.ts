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
  number: string;
  description: string;
  details: string;
  date: string;
  status: 'Active' | 'Expired';
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

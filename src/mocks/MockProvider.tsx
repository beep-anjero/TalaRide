import { createContext, useContext, useState, type PropsWithChildren } from 'react';
import { initialRides, initialRequests, initialNotifications } from './data';
import type { IdentifierType, LostRequest, Notification, Ride } from '@/types/models';
type MockState = {
  rides: Ride[];
  requests: LostRequest[];
  notifications: Notification[];
  saveRide: (number: string, identifier: IdentifierType) => string;
  updateRide: (id: string, note: string, location: string) => void;
  deleteRide: (id: string) => void;
  createRequest: (ride: Ride, description: string, details: string) => void;
  readNotification: (id: string) => void;
};
const Context = createContext<MockState | null>(null);
/** In-memory UI demonstrations only. No persistence, network, matching, or tracking. */
export function MockProvider({ children }: PropsWithChildren) {
  const [rides, setRides] = useState(initialRides);
  const [requests, setRequests] = useState(initialRequests);
  const [notifications, setNotifications] = useState(initialNotifications);
  const value: MockState = {
    rides,
    requests,
    notifications,
    saveRide(number, identifier) {
      const date = new Date().toISOString();
      const id = `ride-${Date.now()}`;
      setRides((items) => [{ id, number, identifier, date, note: '', location: '' }, ...items]);
      return id;
    },
    updateRide(id, note, location) {
      setRides((items) =>
        items.map((item) => (item.id === id ? { ...item, note, location } : item)),
      );
    },
    deleteRide(id) {
      setRides((items) => items.filter((item) => item.id !== id));
      setRequests((items) => items.filter((item) => item.rideId !== id));
      setNotifications((items) => items.filter((item) => item.rideId !== id));
    },
    createRequest(ride, description, details) {
      setRequests((items) => [
        {
          id: `request-${Date.now()}`,
          rideId: ride.id,
          number: ride.number,
          description,
          details,
          date: new Date().toISOString(),
          status: 'Active',
        },
        ...items.filter((item) => !(item.rideId === ride.id && item.status === 'Active')),
      ]);
    },
    readNotification(id) {
      setNotifications((items) =>
        items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
      );
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMock() {
  const value = useContext(Context);
  if (!value) throw new Error('useMock must be used within MockProvider');
  return value;
}

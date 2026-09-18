import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { initialRides, initialRequests, initialNotifications } from './data';
import type { IdentifierType, LostRequest, Notification, Ride } from '@/types/models';
type MockState = {
  ready: boolean;
  onboardingComplete: boolean;
  signedIn: boolean;
  completeOnboarding: () => Promise<void>;
  startSampleSession: () => void;
  endSampleSession: () => void;
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
const ONBOARDING_KEY = 'talaride.onboarding.complete';
/** In-memory UI demonstrations only. No persistence, network, matching, or tracking. */
export function MockProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [rides, setRides] = useState(initialRides);
  const [requests, setRequests] = useState(initialRequests);
  const [notifications, setNotifications] = useState(initialNotifications);
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((value) => {
        if (active) setOnboardingComplete(value === 'true');
      })
      .catch(() => {
        // The UI remains usable if device storage is temporarily unavailable.
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value: MockState = useMemo(
    () => ({
      ready,
      onboardingComplete,
      signedIn,
      async completeOnboarding() {
        setOnboardingComplete(true);
        try {
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch {
          // Keep the current app session usable; persistence will be retried next onboarding run.
        }
      },
      startSampleSession() {
        setSignedIn(true);
      },
      endSampleSession() {
        setSignedIn(false);
      },
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
    }),
    [onboardingComplete, notifications, ready, requests, rides, signedIn],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMock() {
  const value = useContext(Context);
  if (!value) throw new Error('useMock must be used within MockProvider');
  return value;
}

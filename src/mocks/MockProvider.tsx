import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useLayoutEffect,
  type PropsWithChildren,
} from 'react';
import { initialRequests, initialNotifications } from './data';
import {
  createRide,
  deleteRide as deleteStoredRide,
  initializeRideDatabase,
  listRides,
  updateRide as updateStoredRide,
} from '@/db/rides';
import type { IdentifierType, LostRequest, Notification, Ride } from '@/types/models';
import { useAuth } from '@/auth/AuthProvider';
type MockState = {
  ready: boolean;
  onboardingComplete: boolean;
  signedIn: boolean;
  completeOnboarding: () => Promise<void>;
  ridesLoading: boolean;
  ridesError: string | null;
  rides: Ride[];
  requests: LostRequest[];
  notifications: Notification[];
  saveRide: (number: string, identifier: IdentifierType) => Promise<string>;
  updateRide: (id: string, note: string, location: string) => Promise<void>;
  deleteRide: (id: string) => Promise<void>;
  searchRides: (search: string, identifier: IdentifierType | 'All') => Promise<Ride[]>;
  createRequest: (ride: Ride, description: string, details: string) => void;
  readNotification: (id: string) => void;
};
const Context = createContext<MockState | null>(null);
const ONBOARDING_KEY = 'talaride.onboarding.complete';
/** Local ride storage plus in-memory demonstrations for later relay features. */
export function MockProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const { session, recovery, ready: authReady } = useAuth();
  const localAccountId = session && !recovery ? session.user.id : null;
  const signedIn = !!localAccountId;
  const account = useRef(localAccountId);
  useLayoutEffect(() => {
    account.current = localAccountId;
  }, [localAccountId]);
  const [loadedAccount, setLoadedAccount] = useState<string | null>(null);
  const [ridesLoading, setRidesLoading] = useState(true);
  const [ridesError, setRidesError] = useState<string | null>(null);
  const [rides, setRides] = useState<Ride[]>([]);
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

  useEffect(() => {
    let active = true;
    const accountId = localAccountId;
    async function loadRides() {
      // Schedule initialization before updating state, and honor cancellation on account switches.
      await Promise.resolve();
      if (!active) return;
      setRides([]);
      setLoadedAccount(null);
      setRidesError(null);
      setRidesLoading(!!accountId);
      setRequests(initialRequests);
      setNotifications(initialNotifications);
      if (!accountId) return;
      try {
        await initializeRideDatabase();
        const items = await listRides(accountId);
        if (!active || account.current !== accountId) return;
        setRides(items);
        setLoadedAccount(accountId);
      } catch {
        if (active) setRidesError('Your local rides could not be loaded. Please restart the app.');
      } finally {
        if (active) setRidesLoading(false);
      }
    }
    void loadRides();
    return () => {
      active = false;
    };
  }, [localAccountId]);

  const value: MockState = useMemo(
    () => ({
      ready: ready && authReady,
      onboardingComplete,
      signedIn,
      ridesLoading:
        ridesLoading || (!!localAccountId && loadedAccount !== localAccountId && !ridesError),
      ridesError,
      async completeOnboarding() {
        setOnboardingComplete(true);
        try {
          await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch {
          // Keep the current app session usable; persistence will be retried next onboarding run.
        }
      },
      rides: loadedAccount === localAccountId ? rides : [],
      requests: localAccountId && loadedAccount === localAccountId ? requests : initialRequests,
      notifications:
        localAccountId && loadedAccount === localAccountId ? notifications : initialNotifications,
      async saveRide(number, identifier) {
        if (
          !localAccountId ||
          account.current !== localAccountId ||
          loadedAccount !== localAccountId
        )
          throw new Error('Ride storage is still initializing.');
        const ride = await createRide(localAccountId, number, identifier);
        if (account.current !== localAccountId)
          throw new Error('The account changed. Sign in again to view the saved ride.');
        setRides((items) => [ride, ...items]);
        return ride.id;
      },
      async updateRide(id, note, location) {
        if (!localAccountId || account.current !== localAccountId)
          throw new Error('Ride storage is still initializing.');
        await updateStoredRide(localAccountId, id, note, location);
        if (account.current !== localAccountId) return;
        setRides((items) =>
          items.map((item) => (item.id === id ? { ...item, note, location } : item)),
        );
      },
      async deleteRide(id) {
        if (!localAccountId || account.current !== localAccountId)
          throw new Error('Ride storage is still initializing.');
        await deleteStoredRide(localAccountId, id);
        if (account.current !== localAccountId) return;
        setRides((items) => items.filter((item) => item.id !== id));
        setRequests((items) => items.filter((item) => item.rideId !== id));
        setNotifications((items) => items.filter((item) => item.rideId !== id));
      },
      async searchRides(search, identifier) {
        if (!localAccountId || account.current !== localAccountId) return [];
        const items = await listRides(localAccountId, search, identifier);
        return account.current === localAccountId ? items : [];
      },
      createRequest(ride, description, details) {
        if (
          !localAccountId ||
          account.current !== localAccountId ||
          loadedAccount !== localAccountId ||
          !rides.some((item) => item.id === ride.id)
        )
          return;
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
    [
      localAccountId,
      loadedAccount,
      authReady,
      onboardingComplete,
      notifications,
      ready,
      requests,
      rides,
      ridesError,
      ridesLoading,
      signedIn,
    ],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useMock() {
  const value = useContext(Context);
  if (!value) throw new Error('useMock must be used within MockProvider');
  return value;
}

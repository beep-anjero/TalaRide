import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { useAuth } from '@/auth/AuthProvider';
import {
  getNotificationPreference,
  listRelayNotifications,
  markRelayNotificationRead,
  registerPushToken,
  setNotificationPreference,
} from '@/relay/api';
import type { Notification } from '@/types/models';

type NotificationState = {
  notifications: Notification[];
  enabled: boolean;
  permission: 'granted' | 'denied' | 'undetermined' | 'unavailable';
  error: string | null;
  enable: () => Promise<void>;
  disable: () => Promise<void>;
  refresh: () => Promise<void>;
  read: (id: string) => Promise<void>;
};
const Context = createContext<NotificationState | null>(null);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function projectId() {
  return Constants.easConfig?.projectId ?? Constants.expoConfig?.extra?.eas?.projectId;
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const { session, recovery } = useAuth();
  const userId = session && !recovery ? session.user.id : null;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [permission, setPermission] = useState<NotificationState['permission']>('undetermined');
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    if (!userId) return;
    const [items, preference] = await Promise.all([
      listRelayNotifications(),
      getNotificationPreference(),
    ]);
    setNotifications(items);
    setEnabled(preference);
  }
  async function enable() {
    setError(null);
    if (Platform.OS === 'web' || !Device.isDevice) {
      setPermission('unavailable');
      throw new Error('Push notifications require an installed app on a physical device.');
    }
    if (Platform.OS === 'android')
      await Notifications.setNotificationChannelAsync('relay', {
        name: 'Lost-item relay',
        importance: Notifications.AndroidImportance.DEFAULT,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE,
      });
    let result = await Notifications.getPermissionsAsync();
    if (result.status !== 'granted') result = await Notifications.requestPermissionsAsync();
    setPermission(result.status);
    if (result.status !== 'granted') throw new Error('Notification permission was not granted.');
    const id = projectId();
    if (!id) throw new Error('Push registration requires an EAS project ID.');
    const token = (await Notifications.getExpoPushTokenAsync({ projectId: id })).data;
    await registerPushToken(token, Platform.OS as 'android' | 'ios');
    setEnabled(await setNotificationPreference(true));
  }
  async function disable() {
    setError(null);
    setEnabled(await setNotificationPreference(false));
  }
  async function read(id: string) {
    await markRelayNotificationRead(id);
    setNotifications((items) =>
      items.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  }

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) {
        setNotifications([]);
        setError(null);
      }
    });
    if (!userId)
      return () => {
        active = false;
      };
    Notifications.getPermissionsAsync()
      .then((value) => {
        if (active) setPermission(value.status);
      })
      .catch(() => {
        if (active) setPermission('unavailable');
      });
    Promise.all([listRelayNotifications(), getNotificationPreference()])
      .then(([items, preference]) => {
        if (active) {
          setNotifications(items);
          setEnabled(preference);
        }
      })
      .catch(() => {
        if (active) setError('Notification activity could not be loaded.');
      });
    return () => {
      active = false;
    };
  }, [userId]);
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      if (response.notification.request.content.data?.route === '/activity?tab=notifications')
        router.replace('/activity?tab=notifications');
    });
    return () => subscription.remove();
  }, []);

  const value = { notifications, enabled, permission, error, enable, disable, refresh, read };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useNotifications() {
  const value = useContext(Context);
  if (!value) throw new Error('useNotifications must be used within NotificationProvider');
  return value;
}

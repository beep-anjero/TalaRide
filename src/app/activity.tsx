import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { BottomNav } from '@/components/BottomNav';
import { ActivityCard } from '@/components/ActivityCard';
import { Notice } from '@/components/Notice';
import { Button, Copy, go, s } from '@/components/ui';
import { useMock } from '@/mocks/MockProvider';
import { useNotifications } from '@/notifications/NotificationProvider';
import { formatDate } from '@/mocks/data';
import { colors } from '@/constants/theme';

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab = params.tab === 'notifications' ? 'Notifications' : 'Requests';
  const { requests, relayPrompts, respondToPrompt, resolveRequest, refreshRequests } = useMock();
  const notificationState = useNotifications();
  const [selected, setSelected] = useState<{
    title: string;
    message: string;
    rideId: string;
    requestId?: string;
    matchId?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const initialRefresh = useRef({
    requests: refreshRequests,
    notifications: notificationState.refresh,
  });
  useEffect(() => {
    void initialRefresh.current.requests().catch(() => {});
    void initialRefresh.current.notifications().catch(() => {});
  }, []);
  const currentRequest = selected
    ? requests.find(
        (item) =>
          item.id === selected.requestId &&
          (item.status === 'Active' || item.status === 'Helper responding'),
      )
    : undefined;
  const currentPrompt = selected
    ? relayPrompts.find(
        (item) => item.requestId === selected.requestId || item.matchId === selected.matchId,
      )
    : undefined;
  return (
    <Screen
      style={{ paddingHorizontal: 12, paddingTop: 10 }}
      footer={<BottomNav active="Activity" />}
    >
      <View
        style={[
          s.row,
          { gap: 0, borderBottomWidth: 1, borderColor: colors.border, marginBottom: 16 },
        ]}
      >
        {['Requests', 'Notifications'].map((value) => (
          <Pressable
            key={value}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === value }}
            onPress={() => router.setParams({ tab: value.toLowerCase() })}
            style={{
              flex: 1,
              alignItems: 'center',
              paddingVertical: 14,
              borderBottomWidth: 2,
              borderBottomColor: tab === value ? colors.green : 'transparent',
            }}
          >
            <Copy bold={tab === value}>{value}</Copy>
          </Pressable>
        ))}
      </View>
      {tab === 'Requests' &&
        requests.map((request) => {
          const open = request.status === 'Active' || request.status === 'Helper responding';
          return (
            <ActivityCard
              key={request.id}
              title="Lost-item Request"
              icon={open ? 'notifications' : 'lock-closed'}
              tone={open ? 'active' : 'expired'}
              date={formatDate(request.date)}
              badge={request.status}
              onPress={() =>
                setSelected({
                  title: `Lost-item Request · ${request.status}`,
                  message: `${request.description}${request.details ? `\n${request.details}` : ''}\nExpires ${formatDate(request.expiresAt)}`,
                  rideId: request.rideId,
                  requestId: request.id,
                })
              }
            >
              <Copy style={{ fontSize: 14 }}>{request.description}</Copy>
            </ActivityCard>
          );
        })}
      {tab === 'Notifications' &&
        notificationState.notifications.map((notification) => {
          const request = requests.find((item) => item.id === notification.requestId);
          const prompt = relayPrompts.find((item) => item.requestId === notification.requestId);
          return (
            <ActivityCard
              key={notification.id}
              title={notification.title}
              icon="notifications"
              tone="found"
              unread={notification.unread}
              date={formatDate(notification.date)}
              onPress={() => {
                void notificationState.read(notification.id).catch(() => {});
                setSelected({
                  title: notification.title,
                  message:
                    notification.kind === 'relay_prompt' && notification.description
                      ? `${notification.description}${notification.details ? `\n${notification.details}` : ''}\nYour personal contact details remain private.`
                      : notification.message,
                  rideId: request?.rideId ?? prompt?.rideId ?? '',
                  requestId: notification.requestId,
                  matchId: notification.matchId,
                });
              }}
            >
              <Copy style={{ fontSize: 14, color: colors.muted }}>{notification.message}</Copy>
            </ActivityCard>
          );
        })}
      {tab === 'Notifications' && notificationState.error && (
        <Copy accessibilityRole="alert" style={{ color: colors.red }}>
          {notificationState.error}
        </Copy>
      )}
      {!(tab === 'Requests' ? requests.length : notificationState.notifications.length) && (
        <Copy style={{ textAlign: 'center', marginTop: 30, color: colors.muted }}>
          No {tab.toLowerCase()} yet.
        </Copy>
      )}
      {selected && (
        <Notice
          title={selected.title}
          message={selected.message}
          onClose={() => {
            setSelected(null);
            setError('');
          }}
        >
          {!!error && (
            <Copy accessibilityRole="alert" style={{ color: colors.red }}>
              {error}
            </Copy>
          )}
          {!!selected.rideId && (
            <Button
              label="View Ride"
              onPress={() => {
                const id = selected.rideId;
                setSelected(null);
                go(`/ride/${id}`);
              }}
            />
          )}
          {currentRequest && (
            <Button
              label="Mark as Resolved"
              variant="subtle"
              onPress={async () => {
                try {
                  await resolveRequest(currentRequest.id);
                  setSelected(null);
                } catch (cause) {
                  setError(
                    cause instanceof Error ? cause.message : 'The request could not be resolved.',
                  );
                }
              }}
            />
          )}
          {(currentPrompt || selected.matchId) && (
            <Button
              label="Offer Assistance"
              onPress={async () => {
                try {
                  await respondToPrompt(currentPrompt?.matchId ?? selected.matchId!, 'offered');
                  setSelected(null);
                } catch (cause) {
                  setError(
                    cause instanceof Error ? cause.message : 'Your response could not be sent.',
                  );
                }
              }}
            />
          )}
        </Notice>
      )}
    </Screen>
  );
}

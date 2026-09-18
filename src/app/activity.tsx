import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { BottomNav } from '@/components/BottomNav';
import { ActivityCard } from '@/components/ActivityCard';
import { Notice } from '@/components/Notice';
import { Button, Copy, go, s } from '@/components/ui';
import { useMock } from '@/mocks/MockProvider';
import { formatDate } from '@/mocks/data';
import { colors } from '@/constants/theme';

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ tab?: string }>();
  const tab = params.tab === 'notifications' ? 'Notifications' : 'Requests';
  const { requests, notifications, readNotification } = useMock();
  const [selected, setSelected] = useState<{
    title: string;
    message: string;
    rideId: string;
  } | null>(null);
  const active = requests.filter((item) => item.status === 'Active');
  const expired = requests.filter((item) => item.status === 'Expired');
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
        active.map((request) => (
          <ActivityCard
            key={request.id}
            title={`Lost-item Request\n#${request.number}`}
            icon="notifications"
            date={formatDate(request.date)}
            badge="Active"
            onPress={() =>
              setSelected({
                title: `Lost-item Request #${request.number}`,
                message: `${request.description}${request.details ? `\n${request.details}` : ''}\nActive · 7-day request`,
                rideId: request.rideId,
              })
            }
          >
            <Copy style={{ fontSize: 14 }}>{request.description}</Copy>
          </ActivityCard>
        ))}
      {notifications.map((notification) => (
        <ActivityCard
          key={notification.id}
          title={notification.title}
          icon="checkmark-circle"
          tone="found"
          unread={notification.unread}
          date={formatDate(notification.date)}
          onPress={() => {
            readNotification(notification.id);
            setSelected({
              title: notification.title,
              message:
                'A passenger can help with your lost item. This is a sample notification; live relay matching will be connected in a later phase.',
              rideId: notification.rideId,
            });
          }}
        >
          <Copy style={{ fontSize: 14, color: colors.muted }}>{notification.message}</Copy>
        </ActivityCard>
      ))}
      {expired.map((request) => (
        <ActivityCard
          key={request.id}
          title={`Request Expired\n#${request.number}`}
          icon="lock-closed"
          tone="expired"
          badge="Expired"
          date={formatDate(request.date)}
          onPress={() =>
            setSelected({
              title: `Request Expired #${request.number}`,
              message: `${request.description}\nThis sample request has expired.`,
              rideId: request.rideId,
            })
          }
        >
          <Copy style={{ fontSize: 14 }}>{request.description}</Copy>
        </ActivityCard>
      ))}
      {!(tab === 'Requests'
        ? requests.length + notifications.length
        : expired.length + notifications.length) && (
        <Copy style={{ textAlign: 'center', marginTop: 30, color: colors.muted }}>
          No {tab.toLowerCase()} yet.
        </Copy>
      )}
      {selected && (
        <Notice title={selected.title} message={selected.message} onClose={() => setSelected(null)}>
          <Button
            label="View Ride"
            onPress={() => {
              const id = selected.rideId;
              setSelected(null);
              go(`/ride/${id}`);
            }}
          />
        </Notice>
      )}
    </Screen>
  );
}

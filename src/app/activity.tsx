import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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
  const { requests, relayPrompts, respondToPrompt, resolveRequest, refreshRequests } = useMock();
  const [selected, setSelected] = useState<{
    title: string;
    message: string;
    rideId: string;
  } | null>(null);
  const [error, setError] = useState('');
  const initialRefresh = useRef(refreshRequests);
  useEffect(() => {
    void initialRefresh.current().catch(() => {});
  }, []);
  const currentRequest = selected
    ? requests.find(
        (item) =>
          item.rideId === selected.rideId &&
          (item.status === 'Active' || item.status === 'Helper responding'),
      )
    : undefined;
  const currentPrompt = selected
    ? relayPrompts.find((item) => item.rideId === selected.rideId)
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
                })
              }
            >
              <Copy style={{ fontSize: 14 }}>{request.description}</Copy>
            </ActivityCard>
          );
        })}
      {tab === 'Notifications' &&
        relayPrompts.map((prompt) => (
          <ActivityCard
            key={prompt.matchId}
            title="Lost-item relay prompt"
            icon="notifications"
            tone="found"
            unread
            date={formatDate(prompt.createdAt)}
            onPress={() =>
              setSelected({
                title: 'Can you help find a lost item?',
                message: `${prompt.description}${prompt.details ? `\n${prompt.details}` : ''}\nYour personal contact details remain private.`,
                rideId: prompt.rideId,
              })
            }
          >
            <Copy style={{ fontSize: 14, color: colors.muted }}>{prompt.description}</Copy>
          </ActivityCard>
        ))}
      {!(tab === 'Requests' ? requests.length : relayPrompts.length) && (
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
          <Button
            label="View Ride"
            onPress={() => {
              const id = selected.rideId;
              setSelected(null);
              go(`/ride/${id}`);
            }}
          />
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
          {currentPrompt && (
            <Button
              label="Offer Assistance"
              onPress={async () => {
                try {
                  await respondToPrompt(currentPrompt.matchId, 'offered');
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

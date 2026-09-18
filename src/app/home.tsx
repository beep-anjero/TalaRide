import { Pressable, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Brand, Copy, Icon, IconButton, Title, go, s } from '@/components/ui';
import { BottomNav } from '@/components/BottomNav';
import { RideRow } from '@/components/RideRow';
import { colors } from '@/constants/theme';
import { profile } from '@/mocks/data';
import { useMock } from '@/mocks/MockProvider';
import { LinearGradient } from 'expo-linear-gradient';
export default function HomeScreen() {
  const { rides, requests } = useMock();
  const activeRequests = requests.filter((item) => item.status === 'Active');
  return (
    <Screen footer={<BottomNav active="Home" />}>
      <View style={[s.row, { justifyContent: 'space-between', marginBottom: 22 }]}>
        <Brand />
        <IconButton
          name="notifications-outline"
          label="Open notifications"
          onPress={() => go('/activity?tab=notifications')}
        />
      </View>
      <Title style={{ fontSize: 23, lineHeight: 28 }}>
        Good morning,{`\n`}
        {profile.firstName}!
      </Title>
      <Copy style={{ fontSize: 13, color: colors.muted, marginTop: 6, marginBottom: 20 }}>
        Scan a tricycle or pedicab to record your ride.
      </Copy>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Scan Vehicle"
        onPress={() => go('/scan')}
      >
        <LinearGradient
          colors={['#00844A', '#006435']}
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            minHeight: 112,
            gap: 9,
          }}
        >
          <Icon name="camera" size={44} color={colors.white} />
          <Copy bold style={{ color: colors.white, fontSize: 18 }}>
            Scan Vehicle
          </Copy>
        </LinearGradient>
      </Pressable>
      <View style={[s.row, { marginVertical: 16 }]}>
        {[
          {
            title: 'My Rides',
            value: `${rides.length} rides`,
            icon: 'calendar' as const,
            path: '/rides',
          },
          {
            title: 'Active Requests',
            value: `${activeRequests.length} request${activeRequests.length === 1 ? '' : 's'}`,
            icon: 'notifications' as const,
            path: '/activity',
          },
        ].map((item, index) => (
          <Pressable
            key={item.title}
            accessibilityRole="button"
            onPress={() => go(item.path)}
            style={{
              flex: 1,
              backgroundColor: colors.paleGreen,
              borderRadius: 12,
              padding: 15,
              gap: 6,
            }}
          >
            <View style={[s.row, { justifyContent: 'space-between' }]}>
              <Icon name={item.icon} color={index ? colors.yellow : colors.green} />
              {index === 1 && activeRequests.length > 0 && (
                <View
                  style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.red }}
                />
              )}
            </View>
            <Copy bold style={{ fontSize: 14 }}>
              {item.title}
            </Copy>
            <Copy style={{ fontSize: 12, color: colors.muted }}>{item.value}</Copy>
          </Pressable>
        ))}
      </View>
      <View style={[s.row, { justifyContent: 'space-between' }]}>
        <Copy bold>Recent Rides</Copy>
        <Pressable
          accessibilityRole="button"
          onPress={() => go('/rides')}
          style={{ paddingVertical: 10 }}
        >
          <Copy style={{ color: colors.darkGreen }}>See All</Copy>
        </Pressable>
      </View>
      {rides.slice(0, 2).map((ride) => (
        <RideRow key={ride.id} ride={ride} />
      ))}
      {!rides.length && (
        <Copy style={{ marginVertical: 20 }}>No rides yet. Scan a vehicle to begin.</Copy>
      )}
    </Screen>
  );
}

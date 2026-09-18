import { useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { BottomNav } from '@/components/BottomNav';
import { Notice } from '@/components/Notice';
import { ActionRow, Copy, Icon, replace, s, type IconName } from '@/components/ui';
import { profile } from '@/mocks/data';
import { colors } from '@/constants/theme';

const settings: { label: string; icon: IconName; message: string }[] = [
  {
    label: 'Account Settings',
    icon: 'settings-outline',
    message: `${profile.name}\n${profile.email}\nThis is the sample profile for the UI preview. Account management will be connected later.`,
  },
  {
    label: 'Notifications',
    icon: 'notifications-outline',
    message:
      'Requests and sample notifications are available in Activity. Push notification settings will be connected in a later phase.',
  },
  {
    label: 'Privacy & Data',
    icon: 'shield-checkmark-outline',
    message:
      'TalaRide is designed to record only the vehicle number, date/time, and optional note/location. This UI preview uses in-memory sample data that resets on reload. No tracking or backend is enabled.',
  },
  {
    label: 'Help & Support',
    icon: 'help-circle-outline',
    message:
      'Scan a vehicle, confirm its number, and find your receipt in My Rides. If you left something behind, open the ride and choose Report Lost Item.',
  },
  {
    label: 'About TalaRide',
    icon: 'information-circle-outline',
    message:
      'TalaRide\nRemember every ride.\nPrivacy First · Community Driven · Safety Oriented\nBuilt for Tagum.',
  },
];
export default function ProfileScreen() {
  const [selected, setSelected] = useState<(typeof settings)[number] | null>(null);
  return (
    <Screen footer={<BottomNav active="Profile" />}>
      <View
        style={[
          s.row,
          {
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderColor: colors.border,
            marginBottom: 4,
          },
        ]}
      >
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: '#E8EBE7',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="person-circle" size={66} color="#BCC4BD" />
        </View>
        <View style={{ flex: 1 }}>
          <Copy bold style={{ fontSize: 18 }}>
            {profile.name}
          </Copy>
          <Copy style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>{profile.email}</Copy>
        </View>
      </View>
      {settings.map((setting) => (
        <ActionRow
          key={setting.label}
          icon={setting.icon}
          label={setting.label}
          onPress={() => setSelected(setting)}
        />
      ))}
      <View style={{ marginTop: 12 }}>
        <ActionRow
          icon="trash-outline"
          label="Sign Out"
          danger
          onPress={() => replace('/sign-in')}
        />
      </View>
      {selected && (
        <Notice
          title={selected.label}
          message={selected.message}
          onClose={() => setSelected(null)}
        />
      )}
    </Screen>
  );
}

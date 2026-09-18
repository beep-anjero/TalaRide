import { useRef, useState } from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { BottomNav } from '@/components/BottomNav';
import { Notice } from '@/components/Notice';
import { ActionRow, Button, Copy, Field, Icon, s, type IconName } from '@/components/ui';
import { colors } from '@/constants/theme';
import { useAuth } from '@/auth/AuthProvider';

const settings: { label: string; icon: IconName; message: string }[] = [
  {
    label: 'Account Settings',
    icon: 'settings-outline',
    message:
      'Update the display name on your account. Email changes and account deletion are planned for Phase 9.',
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
      'Your rides are saved locally on this device, including the vehicle number, date/time, and optional note/location. Ride history is not uploaded. Protect your device with a screen lock. Relay requests and notifications are still sample features.',
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
  const { signOut, session, displayName, profileError, updateProfile, refreshProfile } = useAuth();
  const [name, setName] = useState(displayName);
  const [busy, setBusy] = useState(false);
  const locked = useRef(false);
  const [error, setError] = useState('');
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
            {displayName}
          </Copy>
          <Copy style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
            {session?.user.email}
          </Copy>
        </View>
      </View>
      {!!profileError && (
        <>
          <Copy accessibilityRole="alert">{profileError}</Copy>
          <Button label="Retry profile" variant="subtle" onPress={() => void refreshProfile()} />
        </>
      )}
      {!!error && (
        <Copy accessibilityRole="alert" style={{ color: colors.red }}>
          {error}
        </Copy>
      )}
      {settings.map((setting) => (
        <ActionRow
          key={setting.label}
          icon={setting.icon}
          label={setting.label}
          onPress={() => {
            if (!busy) {
              setName(displayName);
              setError('');
              setSelected(setting);
            }
          }}
        />
      ))}
      <View style={{ marginTop: 12 }}>
        <ActionRow
          icon="trash-outline"
          label={busy ? 'Please wait…' : 'Sign Out'}
          danger
          onPress={() => {
            if (locked.current) return;
            locked.current = true;
            setBusy(true);
            setError('');
            void signOut()
              .catch((failure) => setError(failure.message))
              .finally(() => {
                locked.current = false;
                setBusy(false);
              });
          }}
        />
      </View>
      {selected && (
        <Notice
          title={selected.label}
          message={selected.message}
          onClose={() => {
            if (!busy) setSelected(null);
          }}
        >
          {selected.label === 'Account Settings' && (
            <>
              <Copy>{session?.user.email}</Copy>
              <Field
                label="Display name"
                value={name}
                onChangeText={setName}
                maxLength={80}
                editable={!busy}
              />
              {!!error && (
                <Copy accessibilityRole="alert" style={{ color: colors.red }}>
                  {error}
                </Copy>
              )}
              <Button
                label={busy ? 'Saving…' : 'Save Profile'}
                disabled={busy}
                onPress={() => {
                  if (locked.current) return;
                  locked.current = true;
                  setBusy(true);
                  setError('');
                  void updateProfile(name)
                    .then(() => setSelected(null))
                    .catch((failure) => setError(failure.message))
                    .finally(() => {
                      locked.current = false;
                      setBusy(false);
                    });
                }}
              />
            </>
          )}
        </Notice>
      )}
    </Screen>
  );
}

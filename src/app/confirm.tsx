import { useRef, useState } from 'react';
import { Pressable, TextInput, useWindowDimensions, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { ReferenceArt } from '@/components/ReferenceArt';
import { Button, Copy, Header, Icon, Title, replace, s } from '@/components/ui';
import { colors, fonts } from '@/constants/theme';
import { useMock } from '@/mocks/MockProvider';
import type { IdentifierType } from '@/types/models';

export default function ConfirmScreen() {
  const [number, setNumber] = useState('1234');
  const [identifier, setIdentifier] = useState<IdentifierType>('MTOP');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const input = useRef<TextInput>(null);
  const saveLock = useRef(false);
  const { saveRide } = useMock();
  const { width } = useWindowDimensions();
  function confirm() {
    const value = number.trim().toUpperCase();
    if (!/^[A-Z0-9][A-Z0-9 -]{0,14}$/.test(value)) {
      setError('Enter a vehicle number using up to 15 letters, numbers, spaces, or hyphens.');
      return;
    }
    if (saveLock.current) return;
    saveLock.current = true;
    setSaved(true);
    const id = saveRide(value, identifier);
    replace(`/receipt?id=${id}`);
  }
  return (
    <Screen>
      <Header />
      <Title style={{ fontSize: 22, marginBottom: 16 }}>Confirm Vehicle Number</Title>
      <ReferenceArt
        name="vehicle"
        width={Math.min(width - 64, 400)}
        style={{ borderRadius: 10, alignSelf: 'center', marginBottom: 18 }}
      />
      <Copy bold style={{ color: colors.darkGreen, marginBottom: 6 }}>
        Recognized Number
      </Copy>
      <View
        style={[
          s.row,
          {
            backgroundColor: '#E9F5E7',
            borderWidth: 1,
            borderColor: '#D6E8D7',
            borderRadius: 10,
            paddingHorizontal: 12,
          },
        ]}
      >
        <TextInput
          ref={input}
          accessibilityLabel="Recognized vehicle number"
          value={number}
          onChangeText={setNumber}
          maxLength={15}
          autoCapitalize="characters"
          style={{
            flex: 1,
            minWidth: 0,
            textAlign: 'center',
            paddingVertical: 12,
            fontFamily: fonts.bold,
            fontSize: 26,
            color: colors.ink,
          }}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit vehicle number"
          onPress={() => input.current?.focus()}
          style={s.iconButton}
        >
          <Icon name="pencil-outline" size={20} color={colors.darkGreen} />
        </Pressable>
      </View>
      <Copy bold style={{ marginTop: 18, marginBottom: 8, color: colors.darkGreen }}>
        Identifier Type
      </Copy>
      <View style={[s.row, { gap: 6 }]}>
        {(['MTOP', 'Body #', 'Plate #'] as const).map((type) => (
          <Pressable
            key={type}
            accessibilityRole="radio"
            accessibilityState={{ checked: identifier === type }}
            onPress={() => setIdentifier(type)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 44,
              backgroundColor: identifier === type ? colors.green : colors.paleGreen,
              borderRadius: 8,
            }}
          >
            <Copy
              style={{ fontSize: 13, color: identifier === type ? colors.white : colors.muted }}
            >
              {type}
            </Copy>
          </Pressable>
        ))}
      </View>
      {!!error && (
        <Copy accessibilityRole="alert" style={{ color: colors.red, marginTop: 12 }}>
          {error}
        </Copy>
      )}
      <View style={{ gap: 12, marginTop: 32 }}>
        <Button label="Confirm and Save" disabled={saved} onPress={confirm} />
        <Button
          label="Retake Scan"
          icon="refresh-outline"
          variant="subtle"
          onPress={() => replace('/scan')}
        />
      </View>
    </Screen>
  );
}

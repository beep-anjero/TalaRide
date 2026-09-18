import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button, Card, Copy, Detail, Icon, Title, replace } from '@/components/ui';
import { MissingRide } from '@/components/MissingRide';
import { useMock } from '@/mocks/MockProvider';
import { formatDate } from '@/mocks/data';
import { colors } from '@/constants/theme';

export default function ReceiptScreen() {
  const { id = '1234' } = useLocalSearchParams<{ id?: string }>();
  const { rides } = useMock();
  const ride = rides.find((item) => item.id === id);
  if (!ride) return <MissingRide />;
  return (
    <Screen>
      <View style={{ alignItems: 'center', marginTop: 24, marginBottom: 18, gap: 12 }}>
        <View
          style={{
            width: 68,
            height: 68,
            borderRadius: 34,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.green,
          }}
        >
          <Icon name="checkmark" size={48} color={colors.white} />
        </View>
        <Title style={{ fontSize: 23 }}>Ride Saved!</Title>
        <Copy style={{ textAlign: 'center', maxWidth: 280 }}>
          Your ride has been saved locally on your device.
        </Copy>
      </View>
      <Card>
        <Detail icon="calendar-outline" label="Date & Time" value={formatDate(ride.date)} />
        <Detail icon="bus-outline" label="Vehicle Number" value={ride.number} />
        <Detail icon="pricetag-outline" label="Identifier Type" value={ride.identifier} />
        <Detail icon="document-text-outline" label="Note" value={ride.note || 'None'} />
        <Detail icon="location-outline" label="Location" value={ride.location || 'Not saved'} />
      </Card>
      <View style={{ gap: 10, marginTop: 16 }}>
        <Button label="View in My Rides" onPress={() => replace('/rides')} />
        <Button
          label="Scan Another Vehicle"
          variant="outline"
          onPress={() => router.dismissTo('/scan')}
        />
      </View>
    </Screen>
  );
}

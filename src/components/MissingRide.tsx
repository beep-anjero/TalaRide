import { Screen } from './Screen';
import { Button, Copy, Header, Title, replace } from './ui';
export function MissingRide() {
  return (
    <Screen>
      <Header />
      <Title>Ride not found</Title>
      <Copy style={{ marginVertical: 20 }}>This ride is no longer available.</Copy>
      <Button label="View My Rides" onPress={() => replace('/rides')} />
    </Screen>
  );
}

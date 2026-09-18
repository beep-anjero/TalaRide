import { Text, useWindowDimensions, View } from 'react-native';
import { TalaIllustration } from '@/components/TalaIllustration';
import { Screen } from '@/components/Screen';
import { useEffect } from 'react';
import { replace } from '@/components/ui';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => replace('/onboarding'), 2000);
    return () => clearTimeout(timer);
  }, []);
  const { width } = useWindowDimensions();
  const contentWidth = Math.min(width, 480);
  return (
    <Screen scroll={false} style={{ padding: 0 }}>
      <View
        accessibilityLabel="TalaRide. Remember every ride."
        accessible
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <TalaIllustration name="mark" width={92} />
        <View style={{ alignItems: 'center', marginTop: 14 }}>
          <Text style={{ fontSize: 42, fontWeight: '800', color: '#075B3A', letterSpacing: -1.5 }}>
            TalaRide
          </Text>
          <Text style={{ fontSize: 16, fontStyle: 'italic', color: '#087348' }}>
            Remember every ride.
          </Text>
        </View>
      </View>
      <TalaIllustration name="splash" width={contentWidth} />
    </Screen>
  );
}

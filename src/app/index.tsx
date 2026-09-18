import { useWindowDimensions, View } from 'react-native';
import { ReferenceArt } from '@/components/ReferenceArt';
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
        <ReferenceArt name="splashBrand" width={contentWidth * 0.65} />
      </View>
      <ReferenceArt name="city" width={contentWidth} />
    </Screen>
  );
}

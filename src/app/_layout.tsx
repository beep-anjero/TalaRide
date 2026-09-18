import { router, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MockProvider, useMock } from '@/mocks/MockProvider';
import { useFonts } from 'expo-font';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';
import { useEffect } from 'react';

const publicRoutes = new Set<string>(['', 'onboarding', 'sign-in']);

function RouteGuard() {
  const { ready, onboardingComplete, signedIn } = useMock();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;
    const route = segments[0] as string | undefined;
    if (!onboardingComplete && route !== undefined && route !== 'onboarding') {
      router.replace('/onboarding');
    } else if (onboardingComplete && !signedIn && !publicRoutes.has(route ?? '')) {
      router.replace('/sign-in');
    }
  }, [onboardingComplete, ready, segments, signedIn]);

  return null;
}

export default function RootLayout() {
  // Render immediately with the platform font while the optional Roboto assets load.
  // This keeps every route available if a font asset is temporarily unavailable.
  useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  return (
    <MockProvider>
      <StatusBar style="dark" />
      <RouteGuard />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 450,
        }}
      />
    </MockProvider>
  );
}

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MockProvider } from '@/mocks/MockProvider';
import { useFonts } from 'expo-font';
import { Roboto_400Regular } from '@expo-google-fonts/roboto/400Regular';
import { Roboto_500Medium } from '@expo-google-fonts/roboto/500Medium';
import { Roboto_700Bold } from '@expo-google-fonts/roboto/700Bold';

export default function RootLayout() {
  // Render immediately with the platform font while the optional Roboto assets load.
  // This keeps every route available if a font asset is temporarily unavailable.
  useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  return (
    <MockProvider>
      <StatusBar style="dark" />
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

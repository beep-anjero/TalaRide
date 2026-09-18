import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MockProvider } from '@/mocks/MockProvider';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';

export default function RootLayout() {
  const [loaded, error] = useFonts({ Roboto_400Regular, Roboto_500Medium, Roboto_700Bold });
  if (!loaded && !error) return null;
  return (
    <MockProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </MockProvider>
  );
}

import { StyleSheet, Text } from 'react-native';

import { Screen } from '@/components/Screen';

// Temporary launch check; the finalized splash screen belongs to Phase 2.
export default function SetupScreen() {
  return (
    <Screen style={styles.screen}>
      <Text accessibilityRole="header" style={styles.title}>
        TalaRide
      </Text>
      <Text style={styles.message}>Phase 1 setup ready.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: '700', color: '#003D2B' },
  message: { marginTop: 12, fontSize: 16, color: '#17221D' },
});

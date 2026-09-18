import type { ComponentProps } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Safe-area container shared by the upcoming UI screens. */
export function Screen({ style, ...props }: ComponentProps<typeof SafeAreaView>) {
  return <SafeAreaView style={[{ flex: 1, backgroundColor: '#FFFEF9' }, style]} {...props} />;
}

import { useState } from 'react';
import { Pressable, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ReferenceArt } from '@/components/ReferenceArt';
import { Copy, IconButton, go, replace, s } from '@/components/ui';
import { Notice } from '@/components/Notice';
import { colors } from '@/constants/theme';

export default function ScanScreen() {
  const { width } = useWindowDimensions();
  const frameWidth = Math.min(width, 480);
  const [flash, setFlash] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [gallery, setGallery] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#17241C' }}>
      <StatusBar style="light" />
      <View style={{ flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', padding: 20 }}>
        <View style={[s.row, { justifyContent: 'space-between' }]}>
          <IconButton
            name="close"
            label="Close scanner"
            color={colors.white}
            onPress={() => replace('/home')}
          />
          <IconButton
            name={flash ? 'flash' : 'flash-outline'}
            label={flash ? 'Turn flash off' : 'Turn flash on'}
            color={flash ? colors.yellow : colors.white}
            onPress={() => setFlash(!flash)}
          />
        </View>
        <View
          style={{ backgroundColor: colors.green, borderRadius: 10, padding: 12, marginTop: 8 }}
        >
          <Copy bold style={{ color: colors.white, textAlign: 'center' }}>
            Scan the Vehicle
          </Copy>
        </View>
        <View
          accessible
          accessibilityLabel="Placeholder camera preview of vehicle MTOP 1234"
          style={{ flex: 1, minHeight: 260, alignItems: 'center', justifyContent: 'center' }}
        >
          <ReferenceArt
            name="camera"
            width={frameWidth - 40}
            style={{ borderRadius: 16, transform: [{ scaleX: flipped ? -1 : 1 }] }}
          />
        </View>
        <Copy
          style={{
            textAlign: 'center',
            color: colors.white,
            backgroundColor: '#00000066',
            padding: 12,
            borderRadius: 10,
          }}
        >
          Position the MTOP, body, or plate number within the frame.
        </Copy>
        <View style={[s.row, { justifyContent: 'space-between', paddingVertical: 24 }]}>
          <IconButton
            name="image-outline"
            label="Choose vehicle image"
            color={colors.white}
            onPress={() => setGallery(true)}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Capture vehicle"
            onPress={() => go('/confirm')}
            style={{ borderWidth: 3, borderColor: colors.white, borderRadius: 36, padding: 5 }}
          >
            <View
              style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white }}
            />
          </Pressable>
          <IconButton
            name="camera-reverse-outline"
            label="Flip preview"
            color={colors.white}
            onPress={() => setFlipped(!flipped)}
          />
        </View>
        {gallery && (
          <Notice
            title="Choose vehicle image"
            message="Image selection will be connected with the camera feature. You can continue with the sample vehicle."
            onClose={() => setGallery(false)}
          >
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setGallery(false);
                go('/confirm');
              }}
            >
              <Copy bold style={{ color: colors.green }}>
                Use sample vehicle
              </Copy>
            </Pressable>
          </Notice>
        )}
      </View>
    </SafeAreaView>
  );
}

// Shared phone column: moving neon, grain, and stars sit behind every quiz screen.

import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RetroAtmosphere } from '@/components/motion';
import { colors, layout } from '@/theme/tokens';

interface ScreenFrameProps {
  children: ReactNode;
  tone?: 'welcome' | 'play' | 'results';
}

// Keep vertical lists from panning sideways. overflow-x:clip cannot pair with overflow-y:auto
// (it computes back to hidden), so block horizontal gestures and drop the translateZ scroll layer.
export const webScrollStyle: ViewStyle | null =
  Platform.OS === 'web'
    ? ({
        touchAction: 'pan-y',
        overscrollBehaviorX: 'none',
        overflowAnchor: 'none',
        transform: 'none',
      } as unknown as ViewStyle)
    : null;

// The frame fills the navigator card. Pinning it to the viewport made the whole screen slide on tap.
export function ScreenFrame({ children, tone = 'play' }: ScreenFrameProps) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg0, colors.bg1, colors.bg2]} style={StyleSheet.absoluteFill} />
      <RetroAtmosphere tone={tone} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.column}>{children}</View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg0,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          overflow: 'clip',
        } as unknown as ViewStyle)
      : null),
  },
  safe: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  },
  column: {
    flex: 1,
    minHeight: 0,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({ touchAction: 'pan-y', overflow: 'clip' } as unknown as ViewStyle)
      : null),
  },
});

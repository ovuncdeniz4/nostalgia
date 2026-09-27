// Shared phone column: moving neon, grain, and stars sit behind every quiz screen.

import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RetroAtmosphere } from '@/components/motion';
import { colors, layout } from '@/theme/tokens';

interface ScreenFrameProps {
  children: ReactNode;
  tone?: 'welcome' | 'play' | 'results';
}

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
  },
  safe: {
    flex: 1,
    minHeight: 0,
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
  },
});

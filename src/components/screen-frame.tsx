// Shared phone column: neon background behind every quiz screen.

import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, layout } from '@/theme/tokens';

interface ScreenFrameProps {
  children: ReactNode;
}

export function ScreenFrame({ children }: ScreenFrameProps) {
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg0, colors.bg1, colors.bg2]} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.glowLeft]} />
      <View style={[styles.glow, styles.glowRight]} />
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
  },
  safe: {
    flex: 1,
  },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    paddingHorizontal: layout.padding,
    paddingVertical: 16,
  },
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.22,
  },
  glowLeft: {
    top: 40,
    left: -80,
    backgroundColor: colors.magenta,
  },
  glowRight: {
    bottom: 80,
    right: -90,
    backgroundColor: colors.turquoise,
  },
});

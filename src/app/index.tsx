// Welcome screen. The quiz starts from the single call to action.

import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { NeonText } from '@/components/neon-text';
import { ScreenFrame } from '@/components/screen-frame';
import { colors, font } from '@/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenFrame>
      <View style={styles.body}>
        <View style={styles.titles}>
          <NeonText size={34} color={colors.turquoise}>
            90's & 2000's
          </NeonText>
          <NeonText size={64} color={colors.yellow}>
            Nostalgia
          </NeonText>
          <Text style={styles.subtitle}>Quiz Oyunu</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hadi oynayalım"
          onPress={() => router.push('/categories')}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Hadi Oynayalım!</Text>
        </Pressable>
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
  },
  titles: {
    alignItems: 'center',
    gap: 4,
  },
  subtitle: {
    marginTop: 8,
    color: colors.turquoise,
    letterSpacing: 4,
    textTransform: 'uppercase',
    fontSize: 18,
  },
  cta: {
    backgroundColor: colors.magenta,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  pressed: {
    transform: [{ translateY: 2 }],
    borderBottomWidth: 2,
  },
  ctaText: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 22,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

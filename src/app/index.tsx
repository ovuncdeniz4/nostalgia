// Welcome screen. Title fades in over the moving neon; the call to action shimmers.

import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { FadeScale, GlowButton } from '@/components/motion';
import { NeonText } from '@/components/neon-text';
import { ScreenFrame } from '@/components/screen-frame';
import { colors } from '@/theme/tokens';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenFrame tone="welcome">
      <View style={styles.body}>
        <FadeScale>
          <View style={styles.titles}>
            <NeonText
              size={34}
              color={colors.turquoise}
              gradient={[colors.magenta, colors.turquoise, colors.yellow]}
            >
              90's & 2000's
            </NeonText>
            <NeonText size={64} color={colors.yellow} gradient={[colors.yellow, colors.pink, colors.purple]}>
              Nostalgia
            </NeonText>
            <Text style={styles.subtitle}>Quiz Oyunu</Text>
          </View>
        </FadeScale>
        <FadeScale delay={400}>
          <GlowButton label="Hadi Oynayalım!" onPress={() => router.push('/categories')} />
        </FadeScale>
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
});

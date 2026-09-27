// Display titles use the bundled Anton face so Android does not depend on Impact.

import { Platform, StyleSheet, Text, TextStyle } from 'react-native';

import { colors, font } from '@/theme/tokens';

interface NeonTextProps {
  children: string;
  size?: number;
  color?: string;
  style?: TextStyle;
  gradient?: readonly [string, string, string];
}

export function NeonText({ children, size = 42, color = colors.yellow, style, gradient }: NeonTextProps) {
  const webGradient =
    gradient && Platform.OS === 'web'
      ? ({
          color: 'transparent',
          backgroundImage: `linear-gradient(45deg, ${gradient[0]}, ${gradient[1]}, ${gradient[2]})`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        } as TextStyle)
      : null;

  const glow =
    Platform.OS === 'web'
      ? ({ textShadow: `0 0 16px ${color}, 2px 2px 0 rgba(0,0,0,0.85)` } as TextStyle)
      : {
          textShadowColor: color,
          textShadowOffset: { width: 2, height: 2 },
          textShadowRadius: 12,
        };

  return (
    <Text style={[styles.text, { fontSize: size, color }, glow, webGradient, style]}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontFamily: font.display,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

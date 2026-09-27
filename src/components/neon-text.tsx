// Display titles use the bundled Anton face so Android does not depend on Impact.

import { StyleSheet, Text, TextStyle } from 'react-native';

import { colors, font } from '@/theme/tokens';

interface NeonTextProps {
  children: string;
  size?: number;
  color?: string;
  style?: TextStyle;
}

export function NeonText({ children, size = 42, color = colors.yellow, style }: NeonTextProps) {
  return <Text style={[styles.text, { fontSize: size, color }, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontFamily: font.display,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

// Motion taken from the Figma quiz: pulsing neon, grain, shimmer, fade, and bounce.

import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  Easing,
  Keyframe,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

import { colors, font } from '@/theme/tokens';

const GRAIN =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxyZWN0IGZpbHRlcj0idXJsKCNhKSIgaGVpZ2h0PSIxMDAlIiB3aWR0aD0iMTAwJSIvPjwvc3ZnPg==';

type AtmosphereTone = 'welcome' | 'play' | 'results';

const webBlur = (radius: number): ViewStyle | null =>
  Platform.OS === 'web' ? ({ filter: `blur(${radius}px)` } as ViewStyle) : null;

const webClip = Platform.OS === 'web' ? ({ overflow: 'clip' } as unknown as ViewStyle) : null;

function fadeScale(delay: number) {
  return new Keyframe({
    0: { opacity: 0, transform: [{ scale: 0.95 }] },
    100: { opacity: 1, transform: [{ scale: 1 }] },
  })
    .duration(700)
    .delay(delay);
}

const popIn = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.9 }] },
  100: { opacity: 1, transform: [{ scale: 1 }] },
}).duration(280);

function PulseOrb({
  color,
  delay,
  size,
  blur,
  style,
}: {
  color: string;
  delay: number;
  size: number;
  blur: number;
  style: ViewStyle;
}) {
  const shift = useSharedValue(0);

  useEffect(() => {
    shift.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, shift]);

  const animated = useAnimatedStyle(() => ({
    opacity: 0.16 + shift.value * 0.18,
    transform: [{ scale: 1 + shift.value * 0.1 }],
  }));

  return (
    <Animated.View
      style={[
        styles.ignore,
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        webBlur(blur),
        style,
        animated,
      ]}
    />
  );
}

function PulseStar({ style, color, delay }: { style: ViewStyle; color: string; delay: number }) {
  const shift = useSharedValue(0);
  useEffect(() => {
    shift.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }), -1, true),
    );
  }, [delay, shift]);
  const animated = useAnimatedStyle(() => ({ opacity: 0.35 + shift.value * 0.65 }));
  return <Animated.Text style={[styles.star, { color }, style as never, animated]}>★</Animated.Text>;
}

export function RetroAtmosphere({ tone = 'play', stars = true }: { tone?: AtmosphereTone; stars?: boolean }) {
  const orbs: {
    color: string;
    delay: number;
    size: number;
    blur: number;
    style: ViewStyle;
  }[] =
    tone === 'results'
      ? [
          { color: colors.yellow, delay: 0, size: 180, blur: 80, style: { top: '18%', left: '8%' } },
          { color: colors.magenta, delay: 500, size: 180, blur: 80, style: { top: '28%', right: '6%' } },
          { color: colors.turquoise, delay: 1000, size: 180, blur: 80, style: { bottom: '18%', left: '22%' } },
        ]
      : tone === 'welcome'
        ? [
            { color: colors.magenta, delay: 0, size: 240, blur: 100, style: { top: 40, left: -80 } },
            { color: colors.turquoise, delay: 1000, size: 300, blur: 120, style: { bottom: 40, right: -100 } },
            { color: colors.purple, delay: 500, size: 360, blur: 140, style: styles.centerOrb },
          ]
        : [
            { color: colors.purple, delay: 0, size: 240, blur: 100, style: { top: 40, left: -80 } },
            { color: colors.pink, delay: 1000, size: 300, blur: 120, style: { bottom: 80, right: -100 } },
            { color: colors.turquoise, delay: 500, size: 160, blur: 80, style: { top: '34%', right: 24 } },
          ];

  return (
    <View style={[StyleSheet.absoluteFill, styles.ignore, styles.clip, webClip]}>
      {orbs.map((orb) => (
        <PulseOrb key={`${orb.color}-${orb.delay}`} {...orb} />
      ))}
      {stars && tone !== 'results' ? (
        <>
          <PulseStar style={{ top: 120, left: 36 }} color={colors.yellow} delay={200} />
          <PulseStar style={{ top: 180, right: 48 }} color={colors.pink} delay={800} />
        </>
      ) : null}
      {Platform.OS === 'web' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              opacity: 0.03,
              backgroundImage: `url("${GRAIN}")`,
            } as ViewStyle,
          ]}
        />
      ) : null}
    </View>
  );
}

export function FadeScale({
  children,
  delay = 0,
  style,
}: {
  children: ReactNode;
  delay?: number;
  style?: ViewStyle;
}) {
  return (
    <Animated.View entering={fadeScale(delay)} style={style}>
      {children}
    </Animated.View>
  );
}

export function PopIn({ children }: { children: ReactNode }) {
  return <Animated.View entering={popIn}>{children}</Animated.View>;
}

export function Bounce({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const shift = useSharedValue(0);
  useEffect(() => {
    shift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-10, { duration: 450, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 450, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, shift]);
  const animated = useAnimatedStyle(() => ({ transform: [{ translateY: shift.value }] }));
  return <Animated.View style={animated}>{children}</Animated.View>;
}

export function Pulse({ children }: { children: ReactNode }) {
  const scale = useSharedValue(1);
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 250, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 250, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <Animated.View style={animated}>{children}</Animated.View>;
}

function NativeShimmer() {
  const travel = useSharedValue(-1);
  useEffect(() => {
    travel.value = withRepeat(withTiming(1, { duration: 1600, easing: Easing.linear }), -1, false);
  }, [travel]);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateX: travel.value * 240 }],
  }));
  return (
    <View style={styles.shineClip}>
      <Animated.View style={[styles.shine, styles.ignore, animated]}>
        <LinearGradient
          colors={['transparent', 'rgba(255,255,255,0.45)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Web shimmer stays inside the button. A translated bar widens the scrollport and the setup page pans sideways.
const shineWeb =
  Platform.OS === 'web'
    ? StyleSheet.create({
        bar: {
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          backgroundImage:
            'linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)',
          backgroundSize: '45% 100%',
          backgroundRepeat: 'no-repeat',
          animationDuration: '1600ms',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationKeyframes: {
            from: { backgroundPosition: '-20%' },
            to: { backgroundPosition: '120%' },
          },
        } as ViewStyle,
      }).bar
    : null;

export function ShimmerBar() {
  if (shineWeb) {
    return <View style={shineWeb} />;
  }
  return <NativeShimmer />;
}

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  gradient?: readonly [string, string];
  textColor?: string;
  disabled?: boolean;
  style?: ViewStyle;
  leading?: string;
  trailing?: string;
}

export function GlowButton({
  label,
  onPress,
  gradient = [colors.magenta, colors.purple],
  textColor = colors.white,
  disabled = false,
  style,
  leading,
  trailing,
}: GlowButtonProps) {
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ translateY: pressed.value * 4 }, { scale: 1 - pressed.value * 0.04 }],
  }));

  return (
    <Animated.View style={[animated, style, disabled && styles.disabled]}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPress={onPress}
        onPressIn={() => {
          pressed.value = withTiming(1, { duration: 80 });
        }}
        onPressOut={() => {
          pressed.value = withTiming(0, { duration: 140 });
        }}
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.button, webClip]}>
          {disabled ? null : <ShimmerBar />}
          <View style={styles.buttonRow}>
            {leading ? <Text style={[styles.buttonIcon, { color: textColor }]}>{leading}</Text> : null}
            <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>
            {trailing ? <Text style={[styles.buttonIcon, { color: textColor }]}>{trailing}</Text> : null}
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

interface PressScaleProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function PressScale({ children, onPress, disabled = false, style, accessibilityLabel }: PressScaleProps) {
  const pressed = useSharedValue(0);
  const animated = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.05 }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withTiming(1, { duration: 80 });
      }}
      onPressOut={() => {
        pressed.value = withTiming(0, { duration: 120 });
      }}
      style={[style, animated, disabled && styles.disabled]}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  ignore: {
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
  },
  centerOrb: {
    top: '28%',
    left: '50%',
    marginLeft: -180,
  },
  star: {
    position: 'absolute',
    fontSize: 18,
  },
  clip: {
    overflow: 'hidden',
  },
  shineClip: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  shine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 90,
    left: 0,
  },
  button: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  buttonText: {
    fontFamily: font.display,
    fontSize: 22,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  buttonIcon: {
    fontSize: 20,
  },
  disabled: {
    opacity: 0.45,
  },
});

// Category picker. Locked decks open a detail sheet and do not start a game.

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FadeScale, GlowButton, PopIn } from '@/components/motion';
import { NeonText } from '@/components/neon-text';
import { ScreenFrame, webScrollStyle } from '@/components/screen-frame';
import { categories, type Category } from '@/data/categories';
import { colors, font } from '@/theme/tokens';

export default function CategoriesScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Category | null>(null);

  const play = () => {
    if (!selected || selected.locked) {
      return;
    }
    const categoryId = selected.id;
    setSelected(null);
    router.push({ pathname: '/setup', params: { categoryId } });
  };

  return (
    <ScreenFrame>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Geri</Text>
        </Pressable>
        <NeonText
          size={32}
          color={colors.turquoise}
          gradient={[colors.turquoise, colors.magenta, colors.yellow]}
        >
          Kategoriler
        </NeonText>
      </View>
      <ScrollView
        style={[styles.scroll, webScrollStyle]}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category) => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.title}
            onPress={() => setSelected(category)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          >
            <Image source={category.image} style={styles.image} resizeMode="cover" />
            <View style={styles.cardBody}>
              <Text style={styles.emoji}>{category.emoji}</Text>
              <Text style={styles.cardTitle}>{category.title}</Text>
              {category.locked ? <Text style={styles.lock}>Kilitli</Text> : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {selected ? (
        <FadeScale style={styles.modalBackdrop}>
          <PopIn>
            <View style={styles.modal}>
            <Image source={selected.image} style={styles.modalImage} resizeMode="cover" />
            <Text style={styles.emojiLarge}>{selected.emoji}</Text>
            <NeonText size={28} color={colors.yellow}>
              {selected.title}
            </NeonText>
            <Text style={styles.description}>{selected.description}</Text>
            {selected.locked ? (
              <Text style={styles.lockedNote}>Bu kategori yakında açılacak.</Text>
            ) : (
              <GlowButton
                label="Şimdi Oyna"
                onPress={play}
                gradient={[colors.lime, colors.turquoise]}
                textColor={colors.black}
              />
            )}
            <Pressable accessibilityRole="button" onPress={() => setSelected(null)} style={styles.close}>
              <Text style={styles.closeText}>Kapat</Text>
            </Pressable>
            </View>
          </PopIn>
        </FadeScale>
      ) : null}
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: colors.turquoise,
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  list: {
    gap: 14,
    paddingBottom: 24,
  },
  card: {
    height: 156,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.cardBorder,
    backgroundColor: colors.card,
    borderBottomWidth: 6,
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  cardPressed: {
    transform: [{ scale: 0.98 }, { translateY: 2 }],
    borderBottomWidth: 2,
  },
  image: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  cardBody: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15,5,29,0.45)',
  },
  emoji: {
    fontSize: 28,
  },
  cardTitle: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 26,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  lock: {
    color: colors.yellow,
    marginTop: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 2,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
    padding: 16,
  },
  modal: {
    backgroundColor: colors.bg1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
    overflow: 'hidden',
  },
  modalImage: {
    height: 120,
    width: '100%',
    borderRadius: 16,
  },
  emojiLarge: {
    fontSize: 40,
    textAlign: 'center',
  },
  description: {
    color: colors.white,
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
  lockedNote: {
    color: colors.yellow,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  close: {
    paddingVertical: 8,
  },
  closeText: {
    color: colors.textMuted,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

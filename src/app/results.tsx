// Final scoreboard. Replay returns to setup; home clears the round.

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bounce, FadeScale, GlowButton } from '@/components/motion';
import { NeonText } from '@/components/neon-text';
import { ScreenFrame, webScrollStyle } from '@/components/screen-frame';
import { scoreRows, type ScoreRow } from '@/game/engine';
import { useSession } from '@/game/session';
import { loadLastResult, type StoredResult } from '@/storage/prefs';
import { colors, font } from '@/theme/tokens';

export default function ResultsScreen() {
  const router = useRouter();
  const config = useSession((session) => session.config);
  const state = useSession((session) => session.state);
  const reset = useSession((session) => session.reset);
  const [stored, setStored] = useState<StoredResult | null>(null);

  useEffect(() => {
    if (config && state) {
      return;
    }
    let active = true;
    loadLastResult().then((result) => {
      if (active) {
        setStored(result);
      }
    });
    return () => {
      active = false;
    };
  }, [config, state]);

  const rows: ScoreRow[] =
    config && state ? scoreRows(config, state.scores) : (stored?.rows ?? []);
  const mode = config?.mode ?? stored?.mode;
  const categoryId = config?.categoryId ?? stored?.categoryId;
  const winner = mode === 'party' ? rows[0] : undefined;

  const replay = () => {
    if (!categoryId) {
      router.replace('/categories');
      return;
    }
    router.replace({ pathname: '/setup', params: { categoryId } });
  };

  const home = () => {
    reset();
    router.replace('/');
  };

  return (
    <ScreenFrame tone="results">
      <ScrollView style={webScrollStyle} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <FadeScale>
          <NeonText size={48} color={colors.magenta} gradient={[colors.magenta, colors.turquoise, colors.yellow]}>
            Oyun Bitti
          </NeonText>
        </FadeScale>
        {winner ? (
          <Bounce>
            <View style={styles.winner}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={styles.winnerLabel}>Kazanan</Text>
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerScore}>{winner.score} puan</Text>
            </View>
          </Bounce>
        ) : null}
        <View style={styles.board}>
          <Text style={styles.boardTitle}>Son Puanlar</Text>
          {rows.map((row, index) => {
            const leading = index === 0;
            const ink = leading ? colors.black : colors.white;
            return (
              <View key={row.id} style={[styles.row, leading && styles.rowFirst]}>
                <Text style={[styles.place, { color: ink }]}>{index + 1}</Text>
                <Text style={[styles.name, { color: ink }]}>{row.name}</Text>
                <Text style={[styles.score, { color: ink }]}>{row.score}</Text>
              </View>
            );
          })}
        </View>
        <GlowButton label="Tekrar Oyna" onPress={replay} />
        <GlowButton
          label="Başa Dön"
          onPress={home}
          gradient={[colors.turquoise, colors.blue]}
          textColor={colors.black}
        />
      </ScrollView>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: 16,
    paddingBottom: 24,
  },
  winner: {
    backgroundColor: colors.yellow,
    borderRadius: 24,
    padding: 18,
    alignItems: 'center',
    borderBottomWidth: 8,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  trophy: {
    fontSize: 42,
  },
  winnerLabel: {
    color: 'rgba(0,0,0,0.7)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  winnerName: {
    color: colors.black,
    fontFamily: font.display,
    fontSize: 36,
  },
  winnerScore: {
    color: colors.black,
    fontSize: 20,
  },
  board: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 16,
    gap: 10,
  },
  boardTitle: {
    alignSelf: 'center',
    color: colors.white,
    backgroundColor: colors.purple,
    overflow: 'hidden',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontFamily: font.display,
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 16,
    padding: 12,
  },
  rowFirst: {
    backgroundColor: colors.yellow,
  },
  place: {
    width: 28,
    color: colors.white,
    fontFamily: font.display,
    fontSize: 20,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    color: colors.white,
    fontFamily: font.display,
    fontSize: 20,
  },
  score: {
    color: colors.turquoise,
    fontFamily: font.display,
    fontSize: 24,
  },
});

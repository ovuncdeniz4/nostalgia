// Final scoreboard. Replay returns to setup; home clears the round.

import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { NeonText } from '@/components/neon-text';
import { ScreenFrame } from '@/components/screen-frame';
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
    <ScreenFrame>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <NeonText size={48} color={colors.magenta}>
          Oyun Bitti
        </NeonText>
        {winner ? (
          <View style={styles.winner}>
            <Text style={styles.winnerLabel}>Kazanan</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerScore}>{winner.score} puan</Text>
          </View>
        ) : null}
        <View style={styles.board}>
          <Text style={styles.boardTitle}>Son Puanlar</Text>
          {rows.map((row, index) => (
            <View key={row.id} style={[styles.row, index === 0 && styles.rowFirst]}>
              <Text style={[styles.place, index === 0 && styles.nameFirst]}>{index + 1}</Text>
              <Text style={[styles.name, index === 0 && styles.nameFirst]}>{row.name}</Text>
              <Text style={[styles.score, index === 0 && styles.nameFirst]}>{row.score}</Text>
            </View>
          ))}
        </View>
        <Pressable accessibilityRole="button" onPress={replay} style={styles.replay}>
          <Text style={styles.replayText}>Tekrar Oyna</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={home} style={styles.home}>
          <Text style={styles.homeText}>Başa Dön</Text>
        </Pressable>
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
    backgroundColor: colors.card,
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
    backgroundColor: 'rgba(255,255,255,0.08)',
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
  nameFirst: {
    color: colors.black,
  },
  score: {
    color: colors.turquoise,
    fontFamily: font.display,
    fontSize: 24,
  },
  replay: {
    backgroundColor: colors.magenta,
    borderRadius: 16,
    paddingVertical: 14,
  },
  replayText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: font.display,
    letterSpacing: 1,
    fontSize: 18,
  },
  home: {
    backgroundColor: colors.turquoise,
    borderRadius: 16,
    paddingVertical: 14,
  },
  homeText: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: font.display,
    letterSpacing: 1,
    fontSize: 18,
  },
});

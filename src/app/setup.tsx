// Game setup: mode, teams, difficulty, timer, and passes, then a 3 second countdown.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { NeonText } from '@/components/neon-text';
import { ScreenFrame } from '@/components/screen-frame';
import { findCategory } from '@/data/categories';
import {
  PASS_MAX,
  PASS_MIN,
  TIMER_OPTIONS,
  canStartGame,
  type Difficulty,
  type GameMode,
  type Team,
} from '@/game/engine';
import { useSession } from '@/game/session';
import { loadPrefs, savePrefs } from '@/storage/prefs';
import { colors, font } from '@/theme/tokens';

const difficulties: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Kolay' },
  { id: 'medium', label: 'Orta' },
  { id: 'hard', label: 'Zor' },
  { id: 'random', label: 'Rastgele' },
];

export default function SetupScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const category = findCategory(typeof params.categoryId === 'string' ? params.categoryId : undefined);
  const start = useSession((session) => session.start);

  const [mode, setMode] = useState<GameMode>('solo');
  const [teams, setTeams] = useState<Team[]>([
    { id: 1, name: '' },
    { id: 2, name: '' },
  ]);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('random');
  const [roundTimer, setRoundTimer] = useState(60);
  const [passCount, setPassCount] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const startedRound = useRef(false);

  useEffect(() => {
    let active = true;
    loadPrefs().then((prefs) => {
      if (!active) {
        return;
      }
      setDifficulty(prefs.difficulty);
      setRoundTimer(prefs.roundTimer);
      setPassCount(prefs.passCount);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (countdown === null || countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCountdown((value) => (value === null ? null : value - 1));
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
    if (countdown !== 0 || startedRound.current || !category || category.locked) {
      return;
    }
    startedRound.current = true;
    const playableTeams = teams
      .map((team) => ({ ...team, name: team.name.trim() }))
      .filter((team) => team.name.length > 0);
    start({
      mode,
      categoryId: category.id,
      difficulty,
      roundTimer,
      passCount,
      teams: playableTeams,
    });
    void savePrefs({ difficulty, roundTimer, passCount });
    router.replace('/game');
  }, [category, countdown, difficulty, mode, passCount, roundTimer, router, start, teams]);

  if (!category || category.locked) {
    return (
      <ScreenFrame>
        <NeonText size={28}>Kategori yok</NeonText>
        <Pressable onPress={() => router.replace('/categories')} style={styles.primary}>
          <Text style={styles.primaryText}>Kategorilere dön</Text>
        </Pressable>
      </ScreenFrame>
    );
  }

  const ready = canStartGame(mode, teams) && countdown === null;

  const updateTeam = (id: number, name: string) => {
    setTeams((current) => current.map((team) => (team.id === id ? { ...team, name } : team)));
  };

  const addTeam = () => {
    setTeams((current) => {
      if (current.length >= 6) {
        return current;
      }
      const nextId = Math.max(...current.map((team) => team.id)) + 1;
      return [...current, { id: nextId, name: '' }];
    });
  };

  const removeTeam = (id: number) => {
    setTeams((current) => (current.length > 2 ? current.filter((team) => team.id !== id) : current));
  };

  return (
    <ScreenFrame>
      <View style={styles.header}>
        <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
          <Text style={styles.backText}>Geri</Text>
        </Pressable>
        <Text style={styles.emoji}>{category.emoji}</Text>
        <NeonText size={30} color={colors.yellow}>
          {category.title}
        </NeonText>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
        <Text style={styles.section}>Oyun Modu</Text>
        <View style={styles.row}>
          <Choice label="Tek Kişi" selected={mode === 'solo'} onPress={() => setMode('solo')} />
          <Choice label="Grup" selected={mode === 'party'} onPress={() => setMode('party')} />
        </View>

        {mode === 'party' ? (
          <View style={styles.block}>
            <Pressable onPress={() => setTeamsOpen((open) => !open)}>
              <Text style={styles.section}>Takımları Ayarla {teamsOpen ? '−' : '+'}</Text>
            </Pressable>
            {teamsOpen
              ? teams.map((team, index) => (
                  <View key={team.id} style={styles.teamRow}>
                    <Text style={styles.teamIndex}>{index + 1}</Text>
                    <TextInput
                      value={team.name}
                      onChangeText={(name) => updateTeam(team.id, name)}
                      placeholder={`Takım ${index + 1} adı`}
                      placeholderTextColor={colors.textMuted}
                      style={styles.input}
                    />
                    {teams.length > 2 ? (
                      <Pressable accessibilityRole="button" onPress={() => removeTeam(team.id)}>
                        <Text style={styles.remove}>Sil</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))
              : null}
            {teamsOpen && teams.length < 6 ? (
              <Pressable accessibilityRole="button" onPress={addTeam} style={styles.secondary}>
                <Text style={styles.secondaryText}>Takım Ekle</Text>
              </Pressable>
            ) : null}
            {!canStartGame(mode, teams) ? (
              <Text style={styles.warning}>Başlamak için en az 2 takım adı girin</Text>
            ) : null}
          </View>
        ) : null}

        <Pressable onPress={() => setSettingsOpen((open) => !open)}>
          <Text style={styles.section}>
            Ayarlar {settingsOpen ? '−' : '+'} · {roundTimer}s · {passCount} pas
          </Text>
        </Pressable>
        {settingsOpen ? (
          <View style={styles.block}>
            <Text style={styles.label}>Zorluk</Text>
            <View style={styles.row}>
              {difficulties.slice(0, 2).map((item) => (
                <Choice
                  key={item.id}
                  label={item.label}
                  selected={difficulty === item.id}
                  onPress={() => setDifficulty(item.id)}
                />
              ))}
            </View>
            <View style={styles.row}>
              {difficulties.slice(2).map((item) => (
                <Choice
                  key={item.id}
                  label={item.label}
                  selected={difficulty === item.id}
                  onPress={() => setDifficulty(item.id)}
                />
              ))}
            </View>
            <Text style={styles.label}>Tur Süresi</Text>
            <View style={styles.row}>
              {TIMER_OPTIONS.slice(0, 3).map((seconds) => (
                <Choice
                  key={seconds}
                  label={`${seconds}s`}
                  selected={roundTimer === seconds}
                  onPress={() => setRoundTimer(seconds)}
                />
              ))}
            </View>
            <View style={styles.row}>
              {TIMER_OPTIONS.slice(3).map((seconds) => (
                <Choice
                  key={seconds}
                  label={`${seconds}s`}
                  selected={roundTimer === seconds}
                  onPress={() => setRoundTimer(seconds)}
                />
              ))}
            </View>
            <Text style={styles.label}>Pas Sayısı</Text>
            <View style={styles.stepper}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPassCount((count) => Math.max(PASS_MIN, count - 1))}
                style={styles.step}
              >
                <Text style={styles.stepText}>−</Text>
              </Pressable>
              <Text style={styles.passValue}>{passCount}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => setPassCount((count) => Math.min(PASS_MAX, count + 1))}
                style={styles.step}
              >
                <Text style={styles.stepText}>+</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={!ready}
          onPress={() => setCountdown(3)}
          style={[styles.primary, !ready && styles.disabled]}
        >
          <Text style={styles.primaryText}>
            {countdown !== null && countdown > 0 ? `${countdown}... içinde başlıyor` : 'Oyunu Başlat'}
          </Text>
        </Pressable>
      </ScrollView>
    </ScreenFrame>
  );
}

function Choice({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceOn]}
    >
      <Text style={[styles.choiceText, selected && styles.choiceTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  back: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: colors.turquoise,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emoji: {
    fontSize: 36,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  form: {
    flexGrow: 1,
    gap: 12,
    paddingBottom: 8,
  },
  section: {
    color: colors.yellow,
    fontFamily: font.display,
    fontSize: 20,
    letterSpacing: 1,
  },
  label: {
    color: colors.white,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  choice: {
    flex: 1,
    flexBasis: 0,
    backgroundColor: colors.cardStrong,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  choiceOn: {
    backgroundColor: colors.turquoise,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  choiceText: {
    color: colors.white,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: font.display,
    fontSize: 16,
  },
  choiceTextOn: {
    color: colors.black,
  },
  block: {
    gap: 10,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamIndex: {
    color: colors.white,
    width: 24,
    fontFamily: font.display,
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: colors.white,
    backgroundColor: colors.cardStrong,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  remove: {
    color: colors.pink,
    textTransform: 'uppercase',
  },
  secondary: {
    borderRadius: 14,
    paddingVertical: 12,
    backgroundColor: colors.purple,
  },
  secondaryText: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: font.display,
    letterSpacing: 1,
  },
  warning: {
    color: colors.hard,
    textAlign: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  step: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    color: colors.black,
    fontSize: 28,
    lineHeight: 30,
  },
  passValue: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 28,
    minWidth: 36,
    textAlign: 'center',
  },
  primary: {
    backgroundColor: colors.lime,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 'auto',
  },
  disabled: {
    opacity: 0.45,
  },
  primaryText: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: font.display,
    fontSize: 22,
    letterSpacing: 1,
  },
});

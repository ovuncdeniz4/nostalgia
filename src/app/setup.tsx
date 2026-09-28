// Game setup. Layout follows the Figma screen: category card, mode tiles, settings row, start.

import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ViewStyle, type TextStyle } from 'react-native';

import { GlowButton, Pulse, ShimmerBar } from '@/components/motion';
import { NeonText } from '@/components/neon-text';
import { ScreenFrame, webScrollStyle } from '@/components/screen-frame';
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
import { colors, font, tintSurface } from '@/theme/tokens';

const webClip = Platform.OS === 'web' ? ({ overflow: 'clip' } as unknown as ViewStyle) : null;

const difficulties: { id: Difficulty; label: string; accent: string; mark: string }[] = [
  { id: 'easy', label: 'Kolay', accent: colors.yellow, mark: '⭐' },
  { id: 'medium', label: 'Orta', accent: colors.orange, mark: '⭐⭐' },
  { id: 'hard', label: 'Zor', accent: colors.hard, mark: '⭐⭐⭐' },
  { id: 'random', label: 'Rastgele', accent: colors.purple, mark: '🎲' },
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
  const [teamsOpen, setTeamsOpen] = useState(false);
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

  const canStart = canStartGame(mode, teams);
  const counting = countdown !== null && countdown > 0;
  const namedTeams = teams.filter((team) => team.name.trim().length > 0).length;

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
    <ScreenFrame stars={false}>
      <Pressable accessibilityRole="button" accessibilityLabel="Geri" onPress={() => router.back()} style={styles.back}>
        <Text style={styles.backArrow}>←</Text>
      </Pressable>
      <ScrollView
        style={[styles.scroll, webScrollStyle]}
        contentContainerStyle={[styles.form, webClip]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[tintSurface(colors.magenta, 0.34), tintSurface(colors.turquoise, 0.28)]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.categoryCard}
        >
          <View style={styles.emojiTile}>
            <Text style={styles.emoji}>{category.emoji}</Text>
          </View>
          <NeonText
            size={28}
            color={colors.magenta}
            gradient={[colors.magenta, colors.turquoise, colors.turquoise]}
            style={styles.categoryTitle}
          >
            {category.title}
          </NeonText>
        </LinearGradient>

        <View style={styles.sectionRow}>
          <IconBadge glyph="👥" gradient={[colors.turquoise, colors.blue]} />
          <Text style={styles.sectionTitle}>Oyun Modu</Text>
        </View>
        <View style={styles.panel}>
          <View style={styles.row}>
            <Choice
              icon="👤"
              label="Tek Kişi"
              selected={mode === 'solo'}
              gradient={[colors.turquoise, colors.blue]}
              onPress={() => setMode('solo')}
            />
            <Choice
              icon="👥"
              label="Grup"
              selected={mode === 'party'}
              gradient={[colors.magenta, colors.purple]}
              onPress={() => setMode('party')}
            />
          </View>
        </View>

        {mode === 'party' ? (
          <Fold
            glyph="👥"
            gradient={[colors.magenta, colors.purple]}
            ink={colors.white}
            title="Takımları Ayarla"
            subtitle={`${namedTeams} takım hazır`}
            open={teamsOpen}
            onPress={() => setTeamsOpen((open) => !open)}
          >
            {teams.map((team, index) => (
              <View key={team.id} style={styles.teamCard}>
                <LinearGradient colors={teamGradient(index)} style={styles.teamBadge}>
                  <Text style={styles.teamIndex}>{index + 1}</Text>
                </LinearGradient>
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
            ))}
            {teams.length < 6 ? (
              <Pressable accessibilityRole="button" onPress={addTeam} style={styles.secondary}>
                <Text style={styles.secondaryText}>+ Takım Ekle</Text>
              </Pressable>
            ) : null}
            {!canStartGame(mode, teams) ? (
              <Text style={styles.warning}>Başlamak için en az 2 takım adı girin</Text>
            ) : null}
          </Fold>
        ) : null}

        <Fold
          glyph="⚙"
          gradient={[colors.orange, colors.yellow]}
          title="Ayarlar"
          subtitle={`Zorluk · ${roundTimer}s · ${passCount} pas`}
          open={settingsOpen}
          onPress={() => setSettingsOpen((open) => !open)}
        >
          <View style={styles.settingsStack}>
            <View style={styles.settingsGroup}>
              <View style={styles.sectionRow}>
                <IconBadge glyph="⚡" gradient={[colors.orange, colors.yellow]} />
                <Text style={styles.sectionTitle}>Zorluk</Text>
              </View>
              <View style={styles.panel}>
                <View style={styles.row}>
                  {difficulties.slice(0, 2).map((item) => (
                    <Choice
                      key={item.id}
                      label={item.label}
                      mark={item.mark}
                      selected={difficulty === item.id}
                      calm
                      accent={item.accent}
                      onPress={() => setDifficulty(item.id)}
                    />
                  ))}
                </View>
                <View style={styles.row}>
                  {difficulties.slice(2).map((item) => (
                    <Choice
                      key={item.id}
                      label={item.label}
                      mark={item.mark}
                      selected={difficulty === item.id}
                      calm
                      accent={item.accent}
                      onPress={() => setDifficulty(item.id)}
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.settingsGroup}>
              <View style={styles.sectionRow}>
                <IconBadge glyph="⏱" gradient={[colors.pink, colors.purple]} ink={colors.white} />
                <Text style={styles.sectionTitle}>Tur Süresi</Text>
              </View>
              <View style={styles.panel}>
                <View style={styles.row}>
                  {TIMER_OPTIONS.slice(0, 3).map((seconds) => (
                    <Choice
                      key={seconds}
                      label={`${seconds}s`}
                      selected={roundTimer === seconds}
                      calm
                      accent={colors.turquoise}
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
                      calm
                      accent={colors.turquoise}
                      onPress={() => setRoundTimer(seconds)}
                    />
                  ))}
                  <View style={styles.choiceSlot} />
                </View>
              </View>
            </View>

            <View style={styles.passGroup}>
              <View style={styles.sectionRow}>
                <IconBadge glyph="⏭" gradient={[colors.turquoise, colors.blue]} />
                <Text style={styles.sectionTitle}>Pas Sayısı</Text>
              </View>
              <PassSlider value={passCount} onChange={setPassCount} />
            </View>
          </View>
        </Fold>

        <GlowButton
          label="Oyunu Başlat"
          leading={canStart ? '▶' : undefined}
          trailing={canStart ? '🏆' : undefined}
          disabled={!canStart || counting}
          onPress={() => setCountdown(3)}
          gradient={canStart ? [colors.lime, colors.turquoise] : [colors.cardStrong, colors.cardStrong]}
          textColor={canStart ? colors.black : colors.textMuted}
          style={styles.start}
        />
      </ScrollView>
      {counting ? (
        <View style={styles.countdown}>
          <Pulse key={countdown}>
            <NeonText size={120} color={colors.yellow} style={styles.countdownDigit}>
              {String(countdown)}
            </NeonText>
          </Pulse>
        </View>
      ) : null}
    </ScreenFrame>
  );
}

function PassSlider({ value, onChange }: { value: number; onChange: (next: number) => void }) {
  const [width, setWidth] = useState(0);
  const span = PASS_MAX - PASS_MIN;
  const ratio = (value - PASS_MIN) / span;
  const thumb = 36;
  const left = width === 0 ? 0 : ratio * Math.max(0, width - thumb);
  const ticks = [1, 5, 10];

  const pick = (x: number) => {
    if (width <= 0) {
      return;
    }
    const clamped = Math.min(1, Math.max(0, x / width));
    onChange(PASS_MIN + Math.round(clamped * span));
  };

  return (
    <View style={styles.sliderBlock}>
      <View
        accessibilityRole="adjustable"
        accessibilityLabel="Pas sayısı"
        accessibilityValue={{ min: PASS_MIN, max: PASS_MAX, now: value }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={(event) => pick(event.nativeEvent.locationX)}
        onResponderMove={(event) => pick(event.nativeEvent.locationX)}
        style={styles.sliderHit}
      >
        <View style={styles.sliderTrack}>
          <View style={[styles.sliderFill, { width: left + thumb / 2 }]} />
        </View>
        <View style={[styles.sliderThumb, { left }]}>
          <Text style={styles.sliderValue}>{value}</Text>
        </View>
      </View>
      {width > 0 ? (
        <View style={styles.passScale}>
          {ticks.map((tick) => {
            const tickRatio = (tick - PASS_MIN) / span;
            const center = tickRatio * Math.max(0, width - thumb) + thumb / 2;
            return (
              <Text key={tick} style={[styles.passScaleText, { left: center }]}>
                {tick}
              </Text>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

function teamGradient(index: number): readonly [string, string] {
  const palettes: readonly (readonly [string, string])[] = [
    [colors.magenta, colors.purple],
    [colors.turquoise, colors.blue],
    [colors.orange, colors.yellow],
    [colors.pink, colors.magenta],
  ];
  return palettes[index % palettes.length];
}

function IconBadge({
  glyph,
  gradient,
  ink = colors.black,
}: {
  glyph: string;
  gradient: readonly [string, string];
  ink?: string;
}) {
  return (
    <LinearGradient colors={gradient} style={styles.badge}>
      <Text style={[styles.badgeGlyph, { color: ink }]}>{glyph}</Text>
    </LinearGradient>
  );
}

function Fold({
  glyph,
  gradient,
  ink,
  title,
  subtitle,
  open,
  onPress,
  children,
}: {
  glyph: string;
  gradient: readonly [string, string];
  ink?: string;
  title: string;
  subtitle: string;
  open: boolean;
  onPress: () => void;
  children: ReactNode;
}) {
  return (
    <View style={styles.block}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={styles.fold}
      >
        <View style={styles.foldMain}>
          <IconBadge glyph={glyph} gradient={gradient} ink={ink} />
          <View style={styles.foldCopy}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {open ? null : <Text style={styles.foldSub}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.chevronHit}>
          <Text style={styles.chevron}>{open ? '⌃' : '⌄'}</Text>
        </View>
      </Pressable>
      {open ? <View>{children}</View> : null}
    </View>
  );
}

function Choice({
  label,
  icon,
  mark,
  selected,
  onPress,
  gradient,
  fill,
  ink = colors.black,
  calm = false,
  accent,
}: {
  label: string;
  icon?: string;
  mark?: string;
  selected: boolean;
  onPress: () => void;
  gradient?: readonly [string, string];
  fill?: string;
  ink?: string;
  calm?: boolean;
  accent?: string;
}) {
  const calmSelected = Boolean(calm && selected && accent);
  const color = calmSelected && accent ? accent : selected ? ink : colors.white;
  const body = (
    <View style={styles.choiceBody}>
      {icon ? <Text style={styles.choiceIcon}>{icon}</Text> : null}
      <Text style={[styles.choiceText, { color }]}>{label}</Text>
      {mark ? (
        <Text style={[styles.choiceMark, calmSelected ? { color: accent } : null, !selected && styles.markHidden]}>
          {mark}
        </Text>
      ) : null}
    </View>
  );

  return (
    <View style={styles.choiceSlot}>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[
          styles.choice,
          selected && !calmSelected && styles.choiceOn,
          calmSelected && accent ? { borderColor: accent, backgroundColor: tintSurface(accent, 0.28) } : null,
          webClip,
        ]}
      >
        {selected && gradient && !calm ? (
          <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.choiceFill}>
            <ShimmerBar />
            {body}
          </LinearGradient>
        ) : (
          <View style={[styles.choiceFill, selected && fill && !calm ? { backgroundColor: fill } : null]}>
            {selected && !calm ? <ShimmerBar /> : null}
            {body}
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingRight: 12,
  },
  backArrow: {
    color: colors.turquoise,
    fontSize: 28,
    lineHeight: 32,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  form: {
    flexGrow: 1,
    gap: 14,
    paddingBottom: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
    padding: 16,
  },
  emojiTile: {
    width: 72,
    height: 72,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#14081f',
  },
  emoji: {
    fontSize: 36,
  },
  categoryTitle: {
    flex: 1,
    textAlign: 'left',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionTitle: {
    color: colors.yellow,
    fontFamily: font.display,
    fontSize: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.3)',
  },
  badgeGlyph: {
    fontSize: 18,
  },
  panel: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 8,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceSlot: {
    flex: 1,
    minWidth: 0,
  },
  choice: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 2,
    borderColor: 'transparent',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.25)',
  },
  choiceOn: {
    borderColor: 'rgba(255,255,255,0.3)',
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  choiceFill: {
    paddingVertical: 16,
    paddingHorizontal: 6,
    overflow: 'hidden',
    alignItems: 'center',
  },
  choiceBody: {
    alignItems: 'center',
    gap: 6,
  },
  choiceIcon: {
    fontSize: 26,
  },
  choiceText: {
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: font.display,
    fontSize: 15,
  },
  choiceMark: {
    fontSize: 12,
    lineHeight: 16,
    minHeight: 16,
  },
  markHidden: {
    opacity: 0,
  },
  block: {
    gap: 12,
  },
  fold: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 18,
    padding: 14,
  },
  foldMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  foldCopy: {
    flex: 1,
    gap: 2,
  },
  foldSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    letterSpacing: 0.4,
  },
  chevronHit: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  chevron: {
    color: colors.white,
    fontSize: 20,
    lineHeight: 22,
  },
  settingsStack: {
    gap: 22,
  },
  settingsGroup: {
    gap: 10,
  },
  passGroup: {
    gap: 12,
    marginTop: 4,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 12,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamIndex: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 20,
  },
  input: {
    flex: 1,
    color: colors.white,
    backgroundColor: colors.surfaceRaised,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  remove: {
    color: colors.pink,
    textTransform: 'uppercase',
  },
  secondary: {
    borderRadius: 16,
    paddingVertical: 14,
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
  sliderBlock: {
    gap: 10,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  sliderHit: {
    height: 48,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
  },
  sliderFill: {
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.turquoise,
  },
  sliderThumb: {
    position: 'absolute',
    top: 6,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.turquoise,
  },
  sliderValue: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 14,
    lineHeight: 16,
  },
  passScale: {
    height: 18,
    position: 'relative',
  },
  passScaleText: {
    position: 'absolute',
    width: 24,
    marginLeft: -12,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },
  primary: {
    backgroundColor: colors.lime,
    borderRadius: 18,
    paddingVertical: 16,
    marginTop: 16,
  },
  primaryText: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: font.display,
    fontSize: 22,
    letterSpacing: 1,
  },
  start: {
    marginTop: 'auto',
  },
  countdown: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(6, 2, 16, 0.92)',
  },
  countdownDigit: Platform.OS === 'web'
    ? ({
        textShadow: '0 0 28px #FFD93B, 0 6px 0 rgba(0,0,0,0.9)',
      } as TextStyle)
    : {
        textShadowColor: '#FFD93B',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 28,
      },
});

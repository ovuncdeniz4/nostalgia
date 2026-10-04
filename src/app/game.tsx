// Live round: one shared timer, reveal, score, pass, and party handoff.

import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bounce, FadeScale, PopIn, PressScale, Pulse, ShimmerBar } from '@/components/motion';
import { NeonText } from '@/components/neon-text';
import { ScreenFrame, webScrollStyle } from '@/components/screen-frame';
import { PARTY_ROUNDS_PER_TEAM, scoreRows } from '@/game/engine';
import { useSession } from '@/game/session';
import { saveLastResult } from '@/storage/prefs';
import { colors, font, teamPalettes } from '@/theme/tokens';

export default function GameScreen() {
  const router = useRouter();
  const config = useSession((session) => session.config);
  const deck = useSession((session) => session.questions);
  const state = useSession((session) => session.state);
  const phase = useSession((session) => session.phase);
  const showAnswer = useSession((session) => session.showAnswer);
  const exitConfirm = useSession((session) => session.exitConfirm);
  const togglePause = useSession((session) => session.togglePause);
  const requestExit = useSession((session) => session.requestExit);
  const cancelExit = useSession((session) => session.cancelExit);
  const revealAnswer = useSession((session) => session.revealAnswer);
  const markAnswer = useSession((session) => session.markAnswer);
  const pass = useSession((session) => session.pass);
  const tick = useSession((session) => session.tick);
  const resumeAfterTransition = useSession((session) => session.resumeAfterTransition);
  const reset = useSession((session) => session.reset);
  const saved = useRef(false);

  useEffect(() => {
    if (!config || !state) {
      router.replace('/categories');
    }
  }, [config, router, state]);

  useEffect(() => {
    if (phase !== 'playing') {
      return;
    }
    const timer = setInterval(() => tick(), 1000);
    return () => clearInterval(timer);
  }, [phase, tick]);

  // Android back and iOS-style leave: always confirm before discarding the round.
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    const onBack = () => {
      if (exitConfirm) {
        cancelExit();
        return true;
      }
      if (phase === 'playing' || phase === 'paused') {
        requestExit();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [cancelExit, exitConfirm, phase, requestExit]);

  useEffect(() => {
    if (phase !== 'roundTransition') {
      return;
    }
    const timer = setTimeout(() => resumeAfterTransition(), 2000);
    return () => clearTimeout(timer);
  }, [phase, resumeAfterTransition]);

  useEffect(() => {
    if (phase !== 'timesUp' || !config || !state || saved.current) {
      return;
    }
    const timer = setTimeout(() => {
      saved.current = true;
      void saveLastResult({
        mode: config.mode,
        categoryId: config.categoryId,
        rows: scoreRows(config, state.scores),
        finishedAt: new Date().toISOString(),
      });
      useSession.setState({ phase: 'finished' });
      router.replace('/results');
    }, 3000);
    return () => clearTimeout(timer);
  }, [config, phase, router, state]);

  if (!config || !state) {
    return null;
  }

  const question = deck[state.questionIndex];
  const team = config.teams[state.currentTeamIndex];
  const palette = teamPalettes[state.currentTeamIndex % teamPalettes.length];
  const roundNumber = (state.teamRoundCounts[state.currentTeamIndex] ?? 0) + 1;
  const timerColor =
    state.timeRemaining > 30 ? colors.lime : state.timeRemaining > 10 ? colors.orange : colors.hard;
  const paused = phase === 'paused';

  const leave = () => {
    const categoryId = config.categoryId;
    reset();
    router.replace({ pathname: '/setup', params: { categoryId } });
  };

  return (
    <ScreenFrame stars={false}>
      <View style={styles.root}>
        <View style={styles.top}>
          <Pressable accessibilityRole="button" accessibilityLabel="Duraklat" onPress={togglePause} style={styles.topHit}>
            <Text style={styles.icon}>{paused ? '▶' : '⏸'}</Text>
          </Pressable>
          <View style={[styles.timer, { borderColor: timerColor }]}>
            <Text style={[styles.timerText, { color: timerColor }]}>{state.timeRemaining}s</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Oyundan çık" onPress={requestExit} style={styles.exitHit}>
            <Text style={styles.exitGlyph}>✕</Text>
            <Text style={styles.exitLabel}>Çık</Text>
          </Pressable>
        </View>

        <ScrollView style={webScrollStyle} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {config.mode === 'party' && team ? (
          <LinearGradient colors={palette.colors} style={styles.teamBanner}>
            <ShimmerBar />
            <Text style={styles.roundLabel}>
              {roundNumber}/{PARTY_ROUNDS_PER_TEAM}. Tur
            </Text>
            <Text style={styles.teamName}>{team.name}</Text>
          </LinearGradient>
        ) : null}

        {question ? (
          <View style={[styles.card, paused && styles.dimmed]}>
            <Text style={styles.question}>{question.text}</Text>
            <View
              style={[
                styles.difficulty,
                {
                  backgroundColor:
                    question.difficulty === 'easy'
                      ? colors.yellow
                      : question.difficulty === 'medium'
                        ? colors.orange
                        : colors.hard,
                },
              ]}
            />
            {showAnswer ? (
              <FadeScale>
                <View style={styles.answer}>
                  <Text style={styles.answerText}>{question.answer}</Text>
                </View>
              </FadeScale>
            ) : (
              <PressScale onPress={revealAnswer} style={styles.reveal}>
                <Text style={styles.revealText}>Cevabı Göster</Text>
              </PressScale>
            )}
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.question}>Sorular bitti</Text>
          </View>
        )}

        <View style={[styles.actions, paused && styles.dimmed, paused && styles.blocked]}>
          <PressScale onPress={() => markAnswer(true)} style={styles.correct}>
            <Text style={styles.actionDark}>Doğru</Text>
          </PressScale>
          <PressScale onPress={() => markAnswer(false)} style={styles.wrong}>
            <Text style={styles.actionLight}>Yanlış</Text>
          </PressScale>
          <PressScale
            disabled={state.passesLeft <= 0}
            onPress={pass}
            style={styles.pass}
          >
            <Text style={styles.actionLight}>Pas ({state.passesLeft})</Text>
          </PressScale>
        </View>
        </ScrollView>

      {phase === 'timesUp' ? (
        <FadeScale style={styles.overlayFull}>
          <View style={styles.centerBlock}>
            <Bounce>
              <Pulse>
                <NeonText size={52} color={colors.hard} gradient={[colors.hard, colors.orange, colors.yellow]}>
                  Süre doldu
                </NeonText>
              </Pulse>
            </Bounce>
            <View style={styles.dots}>
              {[0, 1, 2].map((index) => (
                <Bounce key={index} delay={index * 200}>
                  <View style={styles.dot} />
                </Bounce>
              ))}
            </View>
            <Text style={styles.handoffLabel}>Sonuçlar hesaplanıyor</Text>
          </View>
        </FadeScale>
      ) : null}

      {phase === 'roundTransition' && team ? (
        <FadeScale style={styles.overlayFull}>
          <View style={styles.centerBlock}>
            <Pulse>
              <NeonText size={40} color={colors.turquoise} gradient={[colors.turquoise, colors.lime, colors.yellow]}>
                Sıradaki takım
              </NeonText>
            </Pulse>
            <Text style={styles.handoffName}>{config.teams[state.currentTeamIndex]?.name ?? ''}</Text>
          </View>
        </FadeScale>
      ) : null}

      {paused && !exitConfirm ? (
        <View style={styles.overlayFull} pointerEvents="box-none">
          <FadeScale style={styles.pauseCard}>
            <NeonText size={36} color={colors.lime}>
              Duraklatıldı
            </NeonText>
            <View style={styles.pauseActions}>
              <Pressable accessibilityRole="button" onPress={togglePause} style={styles.pausePrimary}>
                <Text style={styles.actionDark}>Devam</Text>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={requestExit} style={styles.pauseDanger}>
                <Text style={styles.actionLight}>Oyundan çık</Text>
              </Pressable>
            </View>
          </FadeScale>
        </View>
      ) : null}

      {exitConfirm ? (
        <View style={styles.overlayFull} pointerEvents="auto">
          <FadeScale style={styles.pauseCard}>
            <PopIn>
              <View style={styles.dialog}>
                <NeonText size={32} color={colors.pink}>
                  Oyundan çık?
                </NeonText>
                <Text style={styles.dialogCopy}>Tur ilerlemen kaybolur. Kurulum ekranına dönersin.</Text>
                <View style={styles.dialogActions}>
                  <Pressable accessibilityRole="button" onPress={cancelExit} style={styles.stay}>
                    <Text style={styles.actionDark}>Kal</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={leave} style={styles.leave}>
                    <Text style={styles.actionLight}>Çık</Text>
                  </Pressable>
                </View>
              </View>
            </PopIn>
          </FadeScale>
        </View>
      ) : null}
      </View>
    </ScreenFrame>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    zIndex: 20,
  },
  topHit: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: colors.turquoise,
    fontSize: 22,
    padding: 8,
  },
  exitHit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,20,147,0.22)',
  },
  exitGlyph: {
    color: colors.pink,
    fontSize: 16,
    fontFamily: font.display,
  },
  exitLabel: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timer: {
    minWidth: 88,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
  },
  timerText: {
    fontFamily: font.display,
    fontSize: 28,
  },
  body: {
    gap: 14,
    paddingBottom: 12,
  },
  teamBanner: {
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  roundLabel: {
    color: colors.black,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  teamName: {
    color: colors.black,
    fontFamily: font.display,
    fontSize: 32,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,0,255,0.12)',
    padding: 20,
    gap: 18,
    minHeight: 240,
    justifyContent: 'center',
  },
  dimmed: {
    opacity: 0.35,
  },
  blocked: {
    pointerEvents: 'none',
  },
  question: {
    color: colors.white,
    fontSize: 26,
    lineHeight: 34,
    textAlign: 'center',
  },
  difficulty: {
    alignSelf: 'center',
    height: 6,
    width: '70%',
    borderRadius: 4,
  },
  reveal: {
    alignSelf: 'center',
    backgroundColor: colors.purple,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  revealText: {
    color: colors.white,
    fontFamily: font.display,
    letterSpacing: 1,
    fontSize: 16,
  },
  answer: {
    backgroundColor: colors.yellow,
    borderRadius: 16,
    padding: 16,
  },
  answerText: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: font.display,
    fontSize: 26,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  correct: {
    flex: 1,
    backgroundColor: colors.lime,
    borderRadius: 16,
    paddingVertical: 18,
  },
  wrong: {
    flex: 1,
    backgroundColor: colors.hard,
    borderRadius: 16,
    paddingVertical: 18,
  },
  pass: {
    flex: 1,
    backgroundColor: colors.purple,
    borderRadius: 16,
    paddingVertical: 18,
  },
  disabled: {
    opacity: 0.4,
  },
  actionDark: {
    color: colors.black,
    textAlign: 'center',
    fontFamily: font.display,
    letterSpacing: 1,
  },
  actionLight: {
    color: colors.white,
    textAlign: 'center',
    fontFamily: font.display,
    letterSpacing: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  overlayFull: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.78)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  pauseCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    gap: 20,
  },
  pauseActions: {
    width: '100%',
    gap: 10,
  },
  pausePrimary: {
    backgroundColor: colors.lime,
    borderRadius: 14,
    paddingVertical: 14,
  },
  pauseDanger: {
    backgroundColor: colors.hard,
    borderRadius: 14,
    paddingVertical: 14,
  },
  centerBlock: {
    alignItems: 'center',
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 12,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.pink,
  },
  handoffLabel: {
    color: colors.white,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: font.display,
    fontSize: 20,
  },
  handoffName: {
    color: colors.white,
    fontFamily: font.display,
    fontSize: 36,
    letterSpacing: 1,
    textAlign: 'center',
  },
  dialog: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.bg1,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.cardBorder,
    padding: 20,
    gap: 12,
  },
  dialogCopy: {
    color: colors.white,
    textAlign: 'center',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stay: {
    flex: 1,
    backgroundColor: colors.lime,
    borderRadius: 14,
    paddingVertical: 14,
  },
  leave: {
    flex: 1,
    backgroundColor: colors.hard,
    borderRadius: 14,
    paddingVertical: 14,
  },
});

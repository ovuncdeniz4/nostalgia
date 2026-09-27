// In-memory round. The question bank stays on device; this store dies when the app restarts.

import { create } from 'zustand';

import { questions } from '@/data/questions';
import {
  answerQuestion,
  createInitialState,
  namedTeams,
  passQuestion,
  selectQuestions,
  tickTimer,
  type EngineState,
  type GameConfig,
  type Question,
  type TurnOutcome,
} from '@/game/engine';

export type Phase = 'idle' | 'playing' | 'paused' | 'timesUp' | 'roundTransition' | 'finished';

interface SessionStore {
  config: GameConfig | null;
  questions: Question[];
  state: EngineState | null;
  phase: Phase;
  showAnswer: boolean;
  exitConfirm: boolean;
  start: (config: GameConfig) => void;
  togglePause: () => void;
  requestExit: () => void;
  cancelExit: () => void;
  revealAnswer: () => void;
  markAnswer: (correct: boolean) => void;
  pass: () => void;
  tick: () => void;
  resumeAfterTransition: () => void;
  reset: () => void;
}

const empty = {
  config: null,
  questions: [] as Question[],
  state: null,
  phase: 'idle' as Phase,
  showAnswer: false,
  exitConfirm: false,
};

function applyOutcome(
  outcome: TurnOutcome,
  state: EngineState,
): Pick<SessionStore, 'state' | 'phase' | 'showAnswer'> {
  if (outcome === 'nextTeam') {
    return { state, phase: 'roundTransition', showAnswer: false };
  }
  if (outcome === 'finished') {
    return { state, phase: 'timesUp', showAnswer: false };
  }
  return { state, phase: 'playing', showAnswer: false };
}

export const useSession = create<SessionStore>((set, get) => ({
  ...empty,
  start: (config) => {
    const playable: GameConfig =
      config.mode === 'party' ? { ...config, teams: namedTeams(config.teams) } : { ...config, teams: [] };
    const deck = selectQuestions(questions, playable.categoryId, playable.difficulty);
    const state = createInitialState(playable);
    if (deck.length === 0) {
      set({
        config: playable,
        questions: deck,
        state,
        phase: 'timesUp',
        showAnswer: false,
        exitConfirm: false,
      });
      return;
    }
    set({
      config: playable,
      questions: deck,
      state,
      phase: 'playing',
      showAnswer: false,
      exitConfirm: false,
    });
  },
  togglePause: () => {
    const { phase } = get();
    if (phase === 'playing') {
      set({ phase: 'paused', exitConfirm: false });
      return;
    }
    if (phase === 'paused') {
      set({ phase: 'playing', exitConfirm: false });
    }
  },
  requestExit: () => {
    const { phase } = get();
    if (phase === 'playing' || phase === 'paused') {
      set({ phase: 'paused', exitConfirm: true });
    }
  },
  cancelExit: () => {
    if (get().phase === 'paused') {
      set({ phase: 'playing', exitConfirm: false });
    }
  },
  revealAnswer: () => {
    if (get().phase === 'playing') {
      set({ showAnswer: true });
    }
  },
  markAnswer: (correct) => {
    const { phase, state, config, questions: deck } = get();
    if (phase !== 'playing' || !state || !config) {
      return;
    }
    const result = answerQuestion(state, config, correct, deck.length);
    set(applyOutcome(result.outcome, result.state));
  },
  pass: () => {
    const { phase, state, config, questions: deck } = get();
    if (phase !== 'playing' || !state || !config) {
      return;
    }
    const result = passQuestion(state, config, deck.length);
    if (!result.passed) {
      return;
    }
    set(applyOutcome(result.outcome, result.state));
  },
  tick: () => {
    const { phase, state, config, questions: deck } = get();
    if (phase !== 'playing' || !state || !config) {
      return;
    }
    const result = tickTimer(state, config, deck.length);
    if (result.outcome === 'continue') {
      set({ state: result.state });
      return;
    }
    set(applyOutcome(result.outcome, result.state));
  },
  resumeAfterTransition: () => {
    if (get().phase === 'roundTransition') {
      set({ phase: 'playing' });
    }
  },
  reset: () => set({ ...empty }),
}));

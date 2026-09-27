// Pure quiz rules. Screens and storage stay out of this file so it can be unit tested.

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type Difficulty = QuestionDifficulty | 'random';
export type GameMode = 'solo' | 'party';
export type TurnOutcome = 'continue' | 'nextTeam' | 'finished';

export interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: QuestionDifficulty;
  categoryId: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface GameConfig {
  mode: GameMode;
  categoryId: string;
  difficulty: Difficulty;
  roundTimer: number;
  passCount: number;
  teams: Team[];
}

export interface EngineState {
  questionIndex: number;
  scores: Record<string, number>;
  currentTeamIndex: number;
  teamRoundCounts: Record<number, number>;
  passesLeft: number;
  timeRemaining: number;
}

export interface ScoreRow {
  id: string;
  name: string;
  score: number;
}

export const PARTY_ROUNDS_PER_TEAM = 3;
export const QUESTION_LIMIT = 20;
export const SOLO_SCORE_ID = 'player';
export const TIMER_OPTIONS = [5, 30, 60, 90, 120] as const;
export const PASS_MIN = 1;
export const PASS_MAX = 10;

export function teamScoreId(teamId: number): string {
  return `team-${teamId}`;
}

export function namedTeams(teams: Team[]): Team[] {
  return teams
    .map((team) => ({ ...team, name: team.name.trim() }))
    .filter((team) => team.name.length > 0);
}

export function canStartGame(mode: GameMode, teams: Team[]): boolean {
  if (mode === 'solo') {
    return true;
  }
  return namedTeams(teams).length >= 2;
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swapIndex];
    copy[swapIndex] = current;
  }
  return copy;
}

export function selectQuestions(
  bank: Question[],
  categoryId: string,
  difficulty: Difficulty,
  limit = QUESTION_LIMIT,
  random: () => number = Math.random,
): Question[] {
  const inCategory = bank.filter((question) => question.categoryId === categoryId);
  const filtered =
    difficulty === 'random'
      ? inCategory
      : inCategory.filter((question) => question.difficulty === difficulty);
  return shuffle(filtered, random).slice(0, limit);
}

export function scoreKey(config: GameConfig, teamIndex: number): string {
  if (config.mode === 'solo') {
    return SOLO_SCORE_ID;
  }
  const team = config.teams[teamIndex];
  return team ? teamScoreId(team.id) : SOLO_SCORE_ID;
}

export function createInitialState(config: GameConfig): EngineState {
  const scores: Record<string, number> = {};
  if (config.mode === 'solo') {
    scores[SOLO_SCORE_ID] = 0;
  } else {
    for (const team of config.teams) {
      scores[teamScoreId(team.id)] = 0;
    }
  }

  const teamRoundCounts: Record<number, number> = {};
  config.teams.forEach((_, index) => {
    teamRoundCounts[index] = 0;
  });

  return {
    questionIndex: 0,
    scores,
    currentTeamIndex: 0,
    teamRoundCounts,
    passesLeft: config.passCount,
    timeRemaining: config.roundTimer,
  };
}

export function scoreRows(config: GameConfig, scores: Record<string, number>): ScoreRow[] {
  if (config.mode === 'solo') {
    return [{ id: SOLO_SCORE_ID, name: 'Oyuncu', score: scores[SOLO_SCORE_ID] ?? 0 }];
  }

  return config.teams
    .map((team) => ({
      id: teamScoreId(team.id),
      name: team.name,
      score: scores[teamScoreId(team.id)] ?? 0,
    }))
    .sort((left, right) => right.score - left.score);
}

export function resolveTurnEnd(
  state: EngineState,
  config: GameConfig,
  questionCount: number,
): { state: EngineState; outcome: TurnOutcome } {
  if (config.mode === 'solo') {
    return { state: { ...state, timeRemaining: 0 }, outcome: 'finished' };
  }

  const teamRoundCounts = {
    ...state.teamRoundCounts,
    [state.currentTeamIndex]: (state.teamRoundCounts[state.currentTeamIndex] ?? 0) + 1,
  };
  const allRoundsDone = config.teams.every(
    (_, index) => (teamRoundCounts[index] ?? 0) >= PARTY_ROUNDS_PER_TEAM,
  );
  const deckEmpty = state.questionIndex >= questionCount;

  if (allRoundsDone || deckEmpty) {
    return {
      state: { ...state, teamRoundCounts, timeRemaining: 0 },
      outcome: 'finished',
    };
  }

  const nextTeamIndex = (state.currentTeamIndex + 1) % config.teams.length;
  return {
    state: {
      ...state,
      teamRoundCounts,
      currentTeamIndex: nextTeamIndex,
      timeRemaining: config.roundTimer,
      passesLeft: config.passCount,
    },
    outcome: 'nextTeam',
  };
}

export function answerQuestion(
  state: EngineState,
  config: GameConfig,
  correct: boolean,
  questionCount: number,
): { state: EngineState; outcome: TurnOutcome } {
  const key = scoreKey(config, state.currentTeamIndex);
  const scores = { ...state.scores };
  if (correct) {
    scores[key] = (scores[key] ?? 0) + 1;
  }
  const advanced: EngineState = {
    ...state,
    scores,
    questionIndex: state.questionIndex + 1,
  };
  if (advanced.questionIndex >= questionCount) {
    return resolveTurnEnd(advanced, config, questionCount);
  }
  return { state: advanced, outcome: 'continue' };
}

export function passQuestion(
  state: EngineState,
  config: GameConfig,
  questionCount: number,
): { state: EngineState; outcome: TurnOutcome; passed: boolean } {
  if (state.passesLeft <= 0) {
    return { state, outcome: 'continue', passed: false };
  }
  const advanced: EngineState = {
    ...state,
    passesLeft: state.passesLeft - 1,
    questionIndex: state.questionIndex + 1,
  };
  if (advanced.questionIndex >= questionCount) {
    const ended = resolveTurnEnd(advanced, config, questionCount);
    return { ...ended, passed: true };
  }
  return { state: advanced, outcome: 'continue', passed: true };
}

export function tickTimer(
  state: EngineState,
  config: GameConfig,
  questionCount: number,
): { state: EngineState; outcome: TurnOutcome } {
  if (state.timeRemaining <= 1) {
    return resolveTurnEnd({ ...state, timeRemaining: 0 }, config, questionCount);
  }
  return {
    state: { ...state, timeRemaining: state.timeRemaining - 1 },
    outcome: 'continue',
  };
}

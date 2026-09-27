import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  answerQuestion,
  canStartGame,
  createInitialState,
  passQuestion,
  resolveTurnEnd,
  selectQuestions,
  tickTimer,
  type GameConfig,
  type Question,
} from './engine';

const bank: Question[] = [
  { id: 1, text: 'm-easy', answer: 'a', difficulty: 'easy', categoryId: 'movies' },
  { id: 2, text: 'm-medium', answer: 'b', difficulty: 'medium', categoryId: 'movies' },
  { id: 3, text: 'm-hard', answer: 'c', difficulty: 'hard', categoryId: 'movies' },
  { id: 4, text: 'music', answer: 'd', difficulty: 'easy', categoryId: 'music' },
];

const soloConfig: GameConfig = {
  mode: 'solo',
  categoryId: 'movies',
  difficulty: 'easy',
  roundTimer: 60,
  passCount: 3,
  teams: [],
};

const partyConfig: GameConfig = {
  mode: 'party',
  categoryId: 'movies',
  difficulty: 'random',
  roundTimer: 30,
  passCount: 2,
  teams: [
    { id: 1, name: 'Alpha' },
    { id: 2, name: 'Beta' },
  ],
};

describe('selectQuestions', () => {
  it('keeps only the chosen category and difficulty', () => {
    const selected = selectQuestions(bank, 'movies', 'easy', 20, () => 0);
    assert.deepEqual(
      selected.map((question) => question.id),
      [1],
    );
  });

  it('mixes difficulties inside one category when random is selected', () => {
    const selected = selectQuestions(bank, 'movies', 'random', 20, () => 0);
    assert.equal(selected.length, 3);
    assert.ok(selected.every((question) => question.categoryId === 'movies'));
  });

  it('stops at the question limit', () => {
    const many = Array.from({ length: 25 }, (_, index) => ({
      id: index + 1,
      text: `q${index}`,
      answer: 'a',
      difficulty: 'easy' as const,
      categoryId: 'movies',
    }));
    const selected = selectQuestions(many, 'movies', 'easy', 20, () => 0.5);
    assert.equal(selected.length, 20);
  });
});

describe('scoring and passes', () => {
  it('adds one point only for a correct answer', () => {
    const start = createInitialState(soloConfig);
    const correct = answerQuestion(start, soloConfig, true, 5);
    assert.equal(correct.state.scores.player, 1);
    assert.equal(correct.state.questionIndex, 1);
    assert.equal(correct.outcome, 'continue');

    const wrong = answerQuestion(correct.state, soloConfig, false, 5);
    assert.equal(wrong.state.scores.player, 1);
    assert.equal(wrong.state.questionIndex, 2);
  });

  it('spends a pass without changing the score', () => {
    const start = createInitialState(soloConfig);
    const passed = passQuestion(start, soloConfig, 5);
    assert.equal(passed.passed, true);
    assert.equal(passed.state.passesLeft, 2);
    assert.equal(passed.state.scores.player, 0);
    assert.equal(passed.state.questionIndex, 1);
  });

  it('ignores a pass when none remain', () => {
    const start = { ...createInitialState(soloConfig), passesLeft: 0 };
    const passed = passQuestion(start, soloConfig, 5);
    assert.equal(passed.passed, false);
    assert.equal(passed.state.questionIndex, 0);
  });
});

describe('turn endings', () => {
  it('finishes a solo round when the timer hits zero', () => {
    const start = { ...createInitialState(soloConfig), timeRemaining: 1, questionIndex: 2 };
    const ended = tickTimer(start, soloConfig, 10);
    assert.equal(ended.outcome, 'finished');
    assert.equal(ended.state.timeRemaining, 0);
    assert.equal(ended.state.scores.player, 0);
  });

  it('hands the next party team a fresh timer and pass count', () => {
    const start = createInitialState(partyConfig);
    const ended = resolveTurnEnd(start, partyConfig, 10);
    assert.equal(ended.outcome, 'nextTeam');
    assert.equal(ended.state.currentTeamIndex, 1);
    assert.equal(ended.state.teamRoundCounts[0], 1);
    assert.equal(ended.state.timeRemaining, 30);
    assert.equal(ended.state.passesLeft, 2);
  });

  it('finishes party mode after three rounds for every team', () => {
    let state = createInitialState(partyConfig);
    let outcome: string = 'continue';
    for (let turn = 0; turn < 5; turn += 1) {
      const ended = resolveTurnEnd(state, partyConfig, 10);
      state = ended.state;
      outcome = ended.outcome;
      assert.equal(outcome, 'nextTeam');
    }
    const last = resolveTurnEnd(state, partyConfig, 10);
    assert.equal(last.outcome, 'finished');
    assert.equal(last.state.teamRoundCounts[0], 3);
    assert.equal(last.state.teamRoundCounts[1], 3);
  });

  it('closes the turn when the question deck runs out', () => {
    const start = createInitialState(soloConfig);
    const ended = answerQuestion(start, soloConfig, true, 1);
    assert.equal(ended.outcome, 'finished');
    assert.equal(ended.state.scores.player, 1);
    assert.equal(ended.state.questionIndex, 1);
  });
});

describe('party start rule', () => {
  it('requires two named teams', () => {
    assert.equal(canStartGame('solo', []), true);
    assert.equal(
      canStartGame('party', [
        { id: 1, name: '  ' },
        { id: 2, name: 'Beta' },
      ]),
      false,
    );
    assert.equal(
      canStartGame('party', [
        { id: 1, name: 'Alpha' },
        { id: 2, name: 'Beta' },
      ]),
      true,
    );
  });
});

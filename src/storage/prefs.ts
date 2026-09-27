// Device persistence for setup preferences and the latest scoreboard.

import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Difficulty, ScoreRow } from '@/game/engine';

const PREFS_KEY = 'nostalgia.prefs';
const LAST_RESULT_KEY = 'nostalgia.lastResult';

export interface Prefs {
  difficulty: Difficulty;
  roundTimer: number;
  passCount: number;
}

export interface StoredResult {
  mode: 'solo' | 'party';
  categoryId: string;
  rows: ScoreRow[];
  finishedAt: string;
}

export const defaultPrefs: Prefs = {
  difficulty: 'random',
  roundTimer: 60,
  passCount: 3,
};

export async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = await AsyncStorage.getItem(PREFS_KEY);
    if (!raw) {
      return defaultPrefs;
    }
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      difficulty: parsed.difficulty ?? defaultPrefs.difficulty,
      roundTimer: parsed.roundTimer ?? defaultPrefs.roundTimer,
      passCount: parsed.passCount ?? defaultPrefs.passCount,
    };
  } catch (error) {
    console.warn('Could not read quiz prefs', error);
    return defaultPrefs;
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  try {
    await AsyncStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.warn('Could not save quiz prefs', error);
  }
}

export async function saveLastResult(result: StoredResult): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_RESULT_KEY, JSON.stringify(result));
  } catch (error) {
    console.warn('Could not save the last score', error);
  }
}

export async function loadLastResult(): Promise<StoredResult | null> {
  try {
    const raw = await AsyncStorage.getItem(LAST_RESULT_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as StoredResult;
  } catch (error) {
    console.warn('Could not read the last score', error);
    return null;
  }
}

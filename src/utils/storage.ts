import { getTodayDateString } from './prng';
import type { Difficulty, Board, Notes } from './sudoku';
import {
  serializeNotes,
  deserializeNotes,
  createEmptyNotes,
} from './sudoku';

export type GameStatus = 'not_started' | 'in_progress' | 'won' | 'lost';

export interface DifficultyState {
  status: GameStatus;
  boardState: Board;
  notes: number[][][];
  mistakes: number;
  puzzle: Board;
  solution: Board;
}

export interface DailyStorage {
  date: string;
  easy: DifficultyState | null;
  normal: DifficultyState | null;
  difficult: DifficultyState | null;
}

const STORAGE_KEY = 'daily-sudoku-state';

function getEmptyStorage(date: string): DailyStorage {
  return {
    date,
    easy: null,
    normal: null,
    difficult: null,
  };
}

export function loadStorage(): DailyStorage {
  const today = getTodayDateString();

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getEmptyStorage(today);
    }

    const parsed = JSON.parse(stored) as DailyStorage;

    // Check if it's a new day - reset storage
    if (parsed.date !== today) {
      const newStorage = getEmptyStorage(today);
      saveStorage(newStorage);
      return newStorage;
    }

    return parsed;
  } catch {
    return getEmptyStorage(today);
  }
}

export function saveStorage(storage: DailyStorage): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
}

export function getDifficultyState(
  storage: DailyStorage,
  difficulty: Difficulty
): DifficultyState | null {
  return storage[difficulty];
}

export function saveDifficultyState(
  difficulty: Difficulty,
  state: DifficultyState
): void {
  const storage = loadStorage();
  storage[difficulty] = state;
  saveStorage(storage);
}

export function initializeGame(
  _difficulty: Difficulty,
  puzzle: Board,
  solution: Board
): DifficultyState {
  return {
    status: 'in_progress',
    boardState: puzzle.map((row) => [...row]),
    notes: serializeNotes(createEmptyNotes()),
    mistakes: 0,
    puzzle: puzzle.map((row) => [...row]),
    solution: solution.map((row) => [...row]),
  };
}

export function updateBoardState(
  state: DifficultyState,
  row: number,
  col: number,
  value: number | null
): DifficultyState {
  const newBoard = state.boardState.map((r) => [...r]);
  newBoard[row][col] = value;
  return { ...state, boardState: newBoard };
}

export function updateNotes(
  state: DifficultyState,
  notes: Notes
): DifficultyState {
  return { ...state, notes: serializeNotes(notes) };
}

export function incrementMistakes(state: DifficultyState, maxMistakes: number): DifficultyState {
  const newMistakes = state.mistakes + 1;
  const newStatus: GameStatus = newMistakes >= maxMistakes ? 'lost' : state.status;
  return { ...state, mistakes: newMistakes, status: newStatus };
}

export function setGameWon(state: DifficultyState): DifficultyState {
  return { ...state, status: 'won' };
}

export function getNotes(state: DifficultyState): Notes {
  return deserializeNotes(state.notes);
}

export function isGameLocked(
  storage: DailyStorage,
  difficulty: Difficulty
): boolean {
  const state = storage[difficulty];
  return state !== null && (state.status === 'won' || state.status === 'lost');
}

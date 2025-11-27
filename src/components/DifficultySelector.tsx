import { Lock, CheckCircle, XCircle } from 'lucide-react';
import type { Difficulty } from '../utils/sudoku';
import type { DailyStorage } from '../utils/storage';

interface DifficultySelectorProps {
  currentDifficulty: Difficulty;
  storage: DailyStorage;
  onSelect: (difficulty: Difficulty) => void;
}

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  normal: 'Normal',
  difficult: 'Difficult',
};

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy: 'bg-green-500 hover:bg-green-600',
  normal: 'bg-yellow-500 hover:bg-yellow-600',
  difficult: 'bg-red-500 hover:bg-red-600',
};

export function DifficultySelector({
  currentDifficulty,
  storage,
  onSelect,
}: DifficultySelectorProps) {
  const difficulties: Difficulty[] = ['easy', 'normal', 'difficult'];

  return (
    <div className="flex gap-2 mb-6 justify-center">
      {difficulties.map((difficulty) => {
        const state = storage[difficulty];
        const isLocked = state?.status === 'won' || state?.status === 'lost';
        const isWon = state?.status === 'won';
        const isLost = state?.status === 'lost';
        const isActive = currentDifficulty === difficulty;

        return (
          <button
            key={difficulty}
            onClick={() => !isLocked && onSelect(difficulty)}
            disabled={isLocked}
            className={`
              relative px-4 py-2 rounded-lg font-medium text-white transition-all
              ${isActive ? 'ring-2 ring-offset-2 ring-blue-400' : ''}
              ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-400' : DIFFICULTY_COLORS[difficulty]}
            `}
          >
            <span className="flex items-center gap-2">
              {DIFFICULTY_LABELS[difficulty]}
              {isLocked && (
                <span className="absolute -top-1 -right-1">
                  {isWon && <CheckCircle className="w-4 h-4 text-green-300" />}
                  {isLost && <XCircle className="w-4 h-4 text-red-300" />}
                  {!isWon && !isLost && <Lock className="w-4 h-4" />}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

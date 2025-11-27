import { Trophy, Frown } from 'lucide-react';
import type { GameStatus } from '../utils/storage';

interface GameOverlayProps {
  status: GameStatus;
  maxMistakes: number;
}

export function GameOverlay({ status, maxMistakes }: GameOverlayProps) {
  if (status !== 'won' && status !== 'lost') {
    return null;
  }

  const isWon = status === 'won';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className={`
        bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-2xl
        ${isWon ? 'border-4 border-green-500' : 'border-4 border-red-500'}
      `}
      >
        {isWon ? (
          <>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Puzzle Solved!
            </h2>
            <p className="text-gray-600">
              Congratulations! See you tomorrow for a new challenge.
            </p>
          </>
        ) : (
          <>
            <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Game Over</h2>
            <p className="text-gray-600">
              {maxMistakes} mistakes made. Try again tomorrow!
            </p>
          </>
        )}
      </div>
    </div>
  );
}

import { Eraser, Pencil } from 'lucide-react';
import type { Board } from '../utils/sudoku';
import { countNumber } from '../utils/sudoku';

interface KeypadProps {
  board: Board;
  isPencilMode: boolean;
  onNumberClick: (num: number) => void;
  onErase: () => void;
  onTogglePencil: () => void;
  disabled: boolean;
}

export function Keypad({
  board,
  isPencilMode,
  onNumberClick,
  onErase,
  onTogglePencil,
  disabled,
}: KeypadProps) {
  return (
    <div className="w-full max-w-[400px] mx-auto">
      <div className="grid grid-cols-5 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = countNumber(board, num);
          const isCompleted = count >= 9;

          return (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              disabled={disabled || isCompleted}
              className={`
                relative h-14 text-xl font-bold rounded-lg transition-all
                ${
                  isCompleted
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white active:scale-95'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {num}
              {!isCompleted && (
                <span className="absolute top-1 right-2 text-xs opacity-70">
                  {9 - count}
                </span>
              )}
            </button>
          );
        })}
        <button
          onClick={onErase}
          disabled={disabled}
          className={`
            h-14 rounded-lg transition-all bg-gray-500 hover:bg-gray-600 text-white
            flex items-center justify-center
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
          `}
          aria-label="Erase"
        >
          <Eraser className="w-6 h-6" />
        </button>
      </div>

      <button
        onClick={onTogglePencil}
        disabled={disabled}
        className={`
          w-full h-12 rounded-lg font-medium transition-all flex items-center justify-center gap-2
          ${
            isPencilMode
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <Pencil className="w-5 h-5" />
        Notes {isPencilMode ? 'ON' : 'OFF'}
      </button>
    </div>
  );
}

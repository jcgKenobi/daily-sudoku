import { Cell } from './Cell';
import type { Board, Notes } from '../utils/sudoku';
import { hasConflict } from '../utils/sudoku';

interface GridProps {
  board: Board;
  puzzle: Board;
  notes: Notes;
  selectedCell: [number, number] | null;
  cellAnimations: Map<string, string>;
  onCellSelect: (row: number, col: number) => void;
}

export function Grid({
  board,
  puzzle,
  notes,
  selectedCell,
  cellAnimations,
  onCellSelect,
}: GridProps) {
  const selectedValue =
    selectedCell !== null ? board[selectedCell[0]][selectedCell[1]] : null;

  return (
    <div className="w-full max-w-[400px] aspect-square mx-auto mb-6">
      <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 h-full">
        {board.map((row, rowIndex) =>
          row.map((value, colIndex) => {
            const isSelected =
              selectedCell !== null &&
              selectedCell[0] === rowIndex &&
              selectedCell[1] === colIndex;

            const isHighlighted =
              selectedCell !== null &&
              (selectedCell[0] === rowIndex ||
                selectedCell[1] === colIndex ||
                (Math.floor(selectedCell[0] / 3) ===
                  Math.floor(rowIndex / 3) &&
                  Math.floor(selectedCell[1] / 3) ===
                    Math.floor(colIndex / 3)));

            const isSameNumber =
              selectedValue !== null && value === selectedValue && !isSelected;

            const isOriginal = puzzle[rowIndex][colIndex] !== null;
            const isConflict =
              value !== null && hasConflict(board, rowIndex, colIndex, value);

            const cellKey = `${rowIndex}-${colIndex}`;
            const animationClass = cellAnimations.get(cellKey) || '';

            // Add thicker borders for 3x3 subgrids
            const borderClasses = `
              ${colIndex % 3 === 0 && colIndex !== 0 ? 'border-l-2 border-l-gray-800' : ''}
              ${rowIndex % 3 === 0 && rowIndex !== 0 ? 'border-t-2 border-t-gray-800' : ''}
            `;

            return (
              <div key={cellKey} className={`relative ${borderClasses}`}>
                <Cell
                  value={value}
                  notes={notes[rowIndex][colIndex]}
                  isOriginal={isOriginal}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted && !isSelected}
                  isSameNumber={isSameNumber}
                  isConflict={isConflict}
                  animationClass={animationClass}
                  onClick={() => onCellSelect(rowIndex, colIndex)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

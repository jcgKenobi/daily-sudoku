import { mulberry32, createSeed, seededShuffle } from './prng';

export type Difficulty = 'easy' | 'normal' | 'difficult';
export type CellValue = number | null;
export type Board = CellValue[][];
export type Notes = Set<number>[][];

const HOLES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 30,
  normal: 40,
  difficult: 52,
};

// Check if a number can be placed at a position
function isValid(board: Board, row: number, col: number, num: number): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }

  return true;
}

// Generate a complete valid Sudoku grid using backtracking
function generateFullGrid(random: () => number): Board {
  const board: Board = Array(9)
    .fill(null)
    .map(() => Array(9).fill(null));

  function solve(row: number, col: number): boolean {
    if (row === 9) return true;
    if (col === 9) return solve(row + 1, 0);

    if (board[row][col] !== null) {
      return solve(row, col + 1);
    }

    // Shuffle numbers 1-9 for randomization
    const numbers = seededShuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random);

    for (const num of numbers) {
      if (isValid(board, row, col, num)) {
        board[row][col] = num;
        if (solve(row, col + 1)) return true;
        board[row][col] = null;
      }
    }

    return false;
  }

  solve(0, 0);
  return board;
}

// Count solutions (for uniqueness validation)
function countSolutions(board: Board, maxCount: number = 2): number {
  const copy: Board = board.map((row) => [...row]);
  let count = 0;

  function solve(row: number, col: number): boolean {
    if (count >= maxCount) return true;
    if (row === 9) {
      count++;
      return count >= maxCount;
    }
    if (col === 9) return solve(row + 1, 0);

    if (copy[row][col] !== null) {
      return solve(row, col + 1);
    }

    for (let num = 1; num <= 9; num++) {
      if (isValid(copy, row, col, num)) {
        copy[row][col] = num;
        if (solve(row, col + 1) && count >= maxCount) {
          copy[row][col] = null;
          return true;
        }
        copy[row][col] = null;
      }
    }

    return false;
  }

  solve(0, 0);
  return count;
}

// Check if puzzle can be solved with single-candidate logic (for easy mode)
function canSolveWithSingleCandidate(puzzle: Board): boolean {
  const board: Board = puzzle.map((row) => [...row]);

  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] !== null) continue;

        const candidates: number[] = [];
        for (let num = 1; num <= 9; num++) {
          if (isValid(board, r, c, num)) {
            candidates.push(num);
          }
        }

        if (candidates.length === 1) {
          board[r][c] = candidates[0];
          changed = true;
        }
      }
    }
  }

  // Check if fully solved
  return board.every((row) => row.every((cell) => cell !== null));
}

// Create puzzle by digging holes
function digHoles(
  solution: Board,
  difficulty: Difficulty,
  random: () => number
): Board {
  const puzzle: Board = solution.map((row) => [...row]);
  const holesToDig = HOLES_BY_DIFFICULTY[difficulty];

  // Create list of all cell positions and shuffle
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  const shuffledPositions = seededShuffle(positions, random);

  let dugCount = 0;
  let attempts = 0;
  const maxAttempts = 81 * 3; // Prevent infinite loops

  for (const [row, col] of shuffledPositions) {
    if (dugCount >= holesToDig || attempts >= maxAttempts) break;
    attempts++;

    if (puzzle[row][col] === null) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    // Check uniqueness
    if (countSolutions(puzzle, 2) !== 1) {
      puzzle[row][col] = backup;
      continue;
    }

    // For easy mode, ensure single-candidate solvability
    if (difficulty === 'easy' && !canSolveWithSingleCandidate(puzzle)) {
      puzzle[row][col] = backup;
      continue;
    }

    dugCount++;
  }

  // If we couldn't dig enough holes (rare), try remaining positions
  if (dugCount < holesToDig) {
    for (const [row, col] of shuffledPositions) {
      if (dugCount >= holesToDig) break;
      if (puzzle[row][col] === null) continue;

      const backup = puzzle[row][col];
      puzzle[row][col] = null;

      if (countSolutions(puzzle, 2) !== 1) {
        puzzle[row][col] = backup;
        continue;
      }

      dugCount++;
    }
  }

  return puzzle;
}

// Main function to generate a daily puzzle
export function generateDailyPuzzle(
  dateString: string,
  difficulty: Difficulty
): { puzzle: Board; solution: Board } {
  const seed = createSeed(dateString, difficulty);
  const random = mulberry32(seed);

  const solution = generateFullGrid(random);
  const puzzle = digHoles(solution, difficulty, random);

  return { puzzle, solution };
}

// Check if a move is correct
export function isCorrectMove(
  solution: Board,
  row: number,
  col: number,
  value: number
): boolean {
  return solution[row][col] === value;
}

// Check if there's a conflict in the same row, column, or box
export function hasConflict(
  board: Board,
  row: number,
  col: number,
  value: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === value) return true;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === value) return true;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) return true;
    }
  }

  return false;
}

// Check if the board is completely solved
export function isBoardComplete(board: Board): boolean {
  return board.every((row) => row.every((cell) => cell !== null));
}

// Count how many times a number appears on the board
export function countNumber(board: Board, num: number): number {
  let count = 0;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === num) count++;
    }
  }
  return count;
}

// Create empty notes grid
export function createEmptyNotes(): Notes {
  return Array(9)
    .fill(null)
    .map(() =>
      Array(9)
        .fill(null)
        .map(() => new Set<number>())
    );
}

// Serialize notes for localStorage
export function serializeNotes(notes: Notes): number[][][] {
  return notes.map((row) => row.map((cell) => Array.from(cell)));
}

// Deserialize notes from localStorage
export function deserializeNotes(data: number[][][]): Notes {
  return data.map((row) => row.map((cell) => new Set(cell)));
}

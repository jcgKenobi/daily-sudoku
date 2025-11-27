import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { DifficultySelector } from './components/DifficultySelector';
import { Grid } from './components/Grid';
import { Keypad } from './components/Keypad';
import { StatusBar } from './components/StatusBar';
import { GameOverlay } from './components/GameOverlay';
import { getTodayDateString } from './utils/prng';
import type { Difficulty, Board, Notes } from './utils/sudoku';
import {
  generateDailyPuzzle,
  isCorrectMove,
  isBoardComplete,
  hasConflict,
} from './utils/sudoku';
import type { DailyStorage, DifficultyState } from './utils/storage';
import {
  loadStorage,
  saveDifficultyState,
  initializeGame,
  updateBoardState,
  updateNotes,
  incrementMistakes,
  setGameWon,
  getNotes,
  isGameLocked,
} from './utils/storage';

const MAX_MISTAKES_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 10,
  normal: 7,
  difficult: 5,
};

function App() {
  const [storage, setStorage] = useState<DailyStorage>(() => loadStorage());
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty>('easy');
  const [gameState, setGameState] = useState<DifficultyState | null>(null);
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isPencilMode, setIsPencilMode] = useState(false);
  const [cellAnimations, setCellAnimations] = useState<Map<string, string>>(new Map());
  const [showOverlay, setShowOverlay] = useState(false);

  // Initialize or load game for current difficulty
  const initOrLoadGame = useCallback((difficulty: Difficulty) => {
    const currentStorage = loadStorage();
    setStorage(currentStorage);

    const existingState = currentStorage[difficulty];

    if (existingState) {
      setGameState(existingState);
      if (existingState.status === 'won' || existingState.status === 'lost') {
        setShowOverlay(true);
      }
    } else {
      const dateString = getTodayDateString();
      const { puzzle, solution } = generateDailyPuzzle(dateString, difficulty);
      const newState = initializeGame(difficulty, puzzle, solution);
      saveDifficultyState(difficulty, newState);
      setGameState(newState);
      setStorage(loadStorage());
    }

    setSelectedCell(null);
    setIsPencilMode(false);
  }, []);

  // Load game on mount and when difficulty changes
  useEffect(() => {
    initOrLoadGame(currentDifficulty);
  }, [currentDifficulty, initOrLoadGame]);

  // Handle keyboard input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!gameState || gameState.status !== 'in_progress' || !selectedCell) return;

      const num = parseInt(e.key);
      if (num >= 1 && num <= 9) {
        handleNumberInput(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      } else if (e.key === 'n' || e.key === 'N') {
        setIsPencilMode((prev) => !prev);
      } else if (e.key === 'ArrowUp' && selectedCell[0] > 0) {
        setSelectedCell([selectedCell[0] - 1, selectedCell[1]]);
      } else if (e.key === 'ArrowDown' && selectedCell[0] < 8) {
        setSelectedCell([selectedCell[0] + 1, selectedCell[1]]);
      } else if (e.key === 'ArrowLeft' && selectedCell[1] > 0) {
        setSelectedCell([selectedCell[0], selectedCell[1] - 1]);
      } else if (e.key === 'ArrowRight' && selectedCell[1] < 8) {
        setSelectedCell([selectedCell[0], selectedCell[1] + 1]);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  // Add animation to a cell
  const addCellAnimation = useCallback((row: number, col: number, animation: string) => {
    const key = `${row}-${col}`;
    setCellAnimations((prev) => new Map(prev).set(key, animation));
    setTimeout(() => {
      setCellAnimations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(key);
        return newMap;
      });
    }, 400);
  }, []);

  // Handle number input
  const handleNumberInput = useCallback((num: number) => {
    if (!gameState || gameState.status !== 'in_progress' || !selectedCell) return;

    const [row, col] = selectedCell;

    // Can't modify original cells
    if (gameState.puzzle[row][col] !== null) return;

    if (isPencilMode) {
      // Toggle note
      const notes = getNotes(gameState);
      const cellNotes = notes[row][col];

      if (cellNotes.has(num)) {
        cellNotes.delete(num);
      } else {
        cellNotes.add(num);
      }

      const updatedState = updateNotes(gameState, notes);
      setGameState(updatedState);
      saveDifficultyState(currentDifficulty, updatedState);
    } else {
      // Check for conflicts first (warn but still allow)
      if (hasConflict(gameState.boardState, row, col, num)) {
        addCellAnimation(row, col, 'animate-shake');
      }

      // Check if correct
      const correct = isCorrectMove(gameState.solution, row, col, num);

      let updatedState = updateBoardState(gameState, row, col, num);

      // Clear notes for this cell when placing a number
      const notes = getNotes(updatedState);
      notes[row][col].clear();
      updatedState = updateNotes(updatedState, notes);

      if (correct) {
        addCellAnimation(row, col, 'animate-flash-blue');

        // Check for win
        if (isBoardComplete(updatedState.boardState)) {
          updatedState = setGameWon(updatedState);
          setShowOverlay(true);
        }
      } else {
        addCellAnimation(row, col, 'animate-flash-red');
        updatedState = incrementMistakes(updatedState, MAX_MISTAKES_BY_DIFFICULTY[currentDifficulty]);

        // Check for loss
        if (updatedState.mistakes >= MAX_MISTAKES_BY_DIFFICULTY[currentDifficulty]) {
          setShowOverlay(true);
        }
      }

      setGameState(updatedState);
      saveDifficultyState(currentDifficulty, updatedState);
      setStorage(loadStorage());
    }
  }, [gameState, selectedCell, isPencilMode, currentDifficulty, addCellAnimation]);

  // Handle erase
  const handleErase = useCallback(() => {
    if (!gameState || gameState.status !== 'in_progress' || !selectedCell) return;

    const [row, col] = selectedCell;

    // Can't erase original cells
    if (gameState.puzzle[row][col] !== null) return;

    if (isPencilMode) {
      // Clear all notes for this cell
      const notes = getNotes(gameState);
      notes[row][col].clear();
      const updatedState = updateNotes(gameState, notes);
      setGameState(updatedState);
      saveDifficultyState(currentDifficulty, updatedState);
    } else {
      // Clear the cell value
      const updatedState = updateBoardState(gameState, row, col, null);
      setGameState(updatedState);
      saveDifficultyState(currentDifficulty, updatedState);
    }
  }, [gameState, selectedCell, isPencilMode, currentDifficulty]);

  // Handle cell selection
  const handleCellSelect = useCallback((row: number, col: number) => {
    setSelectedCell([row, col]);
  }, []);

  // Handle difficulty change
  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    setShowOverlay(false);
    setCurrentDifficulty(difficulty);
  }, []);

  // Close overlay when clicking outside (for won/lost states)
  const handleOverlayClose = useCallback(() => {
    if (gameState?.status === 'won' || gameState?.status === 'lost') {
      setShowOverlay(false);
    }
  }, [gameState?.status]);

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const board: Board = gameState.boardState;
  const notes: Notes = getNotes(gameState);
  const isLocked = isGameLocked(storage, currentDifficulty);
  const isGameActive = gameState.status === 'in_progress';

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-lg mx-auto">
        <Header />

        <DifficultySelector
          currentDifficulty={currentDifficulty}
          storage={storage}
          onSelect={handleDifficultyChange}
        />

        <StatusBar mistakes={gameState.mistakes} maxMistakes={MAX_MISTAKES_BY_DIFFICULTY[currentDifficulty]} />

        <Grid
          board={board}
          puzzle={gameState.puzzle}
          notes={notes}
          selectedCell={selectedCell}
          cellAnimations={cellAnimations}
          onCellSelect={handleCellSelect}
        />

        <Keypad
          board={board}
          isPencilMode={isPencilMode}
          onNumberClick={handleNumberInput}
          onErase={handleErase}
          onTogglePencil={() => setIsPencilMode((prev) => !prev)}
          disabled={!isGameActive || isLocked}
        />
      </div>

      {showOverlay && (
        <div onClick={handleOverlayClose}>
          <GameOverlay status={gameState.status} maxMistakes={MAX_MISTAKES_BY_DIFFICULTY[currentDifficulty]} />
        </div>
      )}
    </div>
  );
}

export default App;

import { getTodayDateString } from '../utils/prng';

export function Header() {
  const dateString = getTodayDateString();
  const formattedDate = new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="text-center mb-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Bean's Daily Sudoku</h1>
      <p className="text-gray-500 text-sm">{formattedDate}</p>
    </header>
  );
}

import { AlertTriangle } from 'lucide-react';

interface StatusBarProps {
  mistakes: number;
  maxMistakes: number;
}

export function StatusBar({ mistakes, maxMistakes }: StatusBarProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-4 text-gray-700">
      <AlertTriangle
        className={`w-5 h-5 ${mistakes >= maxMistakes ? 'text-red-500' : 'text-amber-500'}`}
      />
      <span className="font-medium">
        Mistakes:{' '}
        <span className={mistakes >= maxMistakes ? 'text-red-600 font-bold' : ''}>
          {mistakes}
        </span>
        /{maxMistakes}
      </span>
    </div>
  );
}

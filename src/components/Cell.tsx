interface CellProps {
  value: number | null;
  notes: Set<number>;
  isOriginal: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  isConflict: boolean;
  animationClass: string;
  onClick: () => void;
}

export function Cell({
  value,
  notes,
  isOriginal,
  isSelected,
  isHighlighted,
  isSameNumber,
  isConflict,
  animationClass,
  onClick,
}: CellProps) {
  const hasNotes = notes.size > 0;

  let bgClass = 'bg-white';
  if (isSelected) {
    bgClass = 'bg-blue-200';
  } else if (isSameNumber && value !== null) {
    bgClass = 'bg-blue-100';
  } else if (isHighlighted) {
    bgClass = 'bg-gray-100';
  }

  return (
    <button
      onClick={onClick}
      className={`
        w-full h-full flex items-center justify-center
        border border-gray-300 transition-colors
        ${bgClass}
        ${animationClass}
        ${isConflict ? 'text-red-600' : isOriginal ? 'text-gray-800' : 'text-blue-600'}
        ${isOriginal ? 'font-bold' : 'font-medium'}
        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset
      `}
      aria-label={value ? `Cell value ${value}` : 'Empty cell'}
    >
      {value !== null ? (
        <span className="text-xl sm:text-2xl">{value}</span>
      ) : hasNotes ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className="text-[8px] sm:text-[10px] text-gray-500 flex items-center justify-center"
            >
              {notes.has(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

import React from 'react';

interface MacroBarProps {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: 'protein' | 'carbs' | 'fats';
}

export const MacroBar: React.FC<MacroBarProps> = ({
  label,
  consumed,
  goal,
  unit = 'g',
  color
}) => {
  const percentage = goal > 0 ? (consumed / goal) * 100 : 0;
  const isOver = consumed > goal;
  const remaining = goal - consumed;

  const colorStyles = {
    protein: {
      bar: isOver ? 'bg-rose-500' : 'bg-macro-protein',
      bg: 'bg-purple-950/30',
      text: 'text-purple-300',
      border: 'border-purple-500/30'
    },
    carbs: {
      bar: isOver ? 'bg-rose-500' : 'bg-macro-carbs',
      bg: 'bg-sky-950/30',
      text: 'text-sky-300',
      border: 'border-sky-500/30'
    },
    fats: {
      bar: isOver ? 'bg-rose-500' : 'bg-macro-fats',
      bg: 'bg-pink-950/30',
      text: 'text-pink-300',
      border: 'border-pink-500/30'
    }
  };

  const currentStyle = colorStyles[color];

  return (
    <div className="bg-zinc-900/80 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-3.5 flex flex-col gap-2">
      {/* Top Label & Consumed / Goal */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-bold tracking-wide uppercase ${currentStyle.text}`}>
          {label}
        </span>
        <span className="text-xs font-semibold text-zinc-300">
          <strong className="text-zinc-100">{Math.round(consumed)}</strong> / {Math.round(goal)}{unit}
        </span>
      </div>

      {/* Progress Bar Track */}
      <div className="w-full h-2.5 bg-zinc-800/80 dark:bg-[#27272A] rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-500 ${currentStyle.bar}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      {/* Remaining & Percentage */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400">
        <span>
          {isOver ? (
            <span className="text-rose-400 font-medium">
              +{Math.abs(Math.round(remaining))}{unit} excedido
            </span>
          ) : (
            <span>
              Restam <strong className="text-zinc-200">{Math.round(remaining)}{unit}</strong>
            </span>
          )}
        </span>
        <span className="font-mono text-zinc-400">
          {percentage.toFixed(0)}%
        </span>
      </div>
    </div>
  );
};

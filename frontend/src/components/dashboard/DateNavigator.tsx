import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface DateNavigatorProps {
  currentDate: string; // YYYY-MM-DD
  onDateChange: (newDate: string) => void;
}

export const DateNavigator: React.FC<DateNavigatorProps> = ({
  currentDate,
  onDateChange
}) => {
  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const formatDateDisplay = (dateStr: string) => {
    if (dateStr === todayStr) return 'Hoje';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    // Ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (dateStr === yStr) return 'Ontem';

    // Amanhã
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    if (dateStr === tStr) return 'Amanhã';

    return date.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  const shiftDays = (delta: number) => {
    const [year, month, day] = currentDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + delta);
    const newY = date.getFullYear();
    const newM = String(date.getMonth() + 1).padStart(2, '0');
    const newD = String(date.getDate()).padStart(2, '0');
    onDateChange(`${newY}-${newM}-${newD}`);
  };

  return (
    <div className="flex items-center justify-between bg-zinc-900/60 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl px-3 py-2">
      {/* Botão Dia Anterior */}
      <button
        onClick={() => shiftDays(-1)}
        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
        title="Dia anterior"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Seletor Central */}
      <div className="flex items-center gap-2">
        <label className="relative cursor-pointer flex items-center gap-1.5 px-3 py-1 rounded-xl hover:bg-zinc-800/60 transition-colors">
          <CalendarIcon className="w-4 h-4 text-brand-400" />
          <span className="text-sm font-semibold text-zinc-100">
            {formatDateDisplay(currentDate)}
          </span>
          <span className="text-xs text-zinc-500 font-mono">
            ({currentDate.split('-').reverse().slice(0, 2).join('/')})
          </span>
          {/* Input date nativo oculto para clique */}
          <input
            type="date"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            value={currentDate}
            onChange={(e) => {
              if (e.target.value) onDateChange(e.target.value);
            }}
          />
        </label>

        {currentDate !== todayStr && (
          <button
            onClick={() => onDateChange(todayStr)}
            className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 hover:bg-brand-500/30 transition-colors"
          >
            Ir para hoje
          </button>
        )}
      </div>

      {/* Botão Próximo Dia */}
      <button
        onClick={() => shiftDays(1)}
        className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 transition-colors"
        title="Próximo dia"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

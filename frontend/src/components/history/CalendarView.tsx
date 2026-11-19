import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';
import { CalendarDay } from '../../types';
import { DayDetailModal } from './DayDetailModal';

export const CalendarView: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDayDate, setSelectedDayDate] = useState<string | null>(null);

  const loadMonthData = async (ym: string) => {
    setLoading(true);
    try {
      const res = await api.getCalendar(ym);
      setCalendarDays(res.days);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [currentMonth]);

  const shiftMonth = (delta: number) => {
    const [year, month] = currentMonth.split('-').map(Number);
    const date = new Date(year, month - 1 + delta, 1);
    const newYm = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    setCurrentMonth(newYm);
  };

  // Montagem da grade do calendário
  const [year, month] = currentMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay(); // 0 = Domingo

  const monthName = new Date(year, month - 1, 1).toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });

  const dayDataMap = React.useMemo(() => {
    const map = new Map<string, CalendarDay>();
    for (const d of calendarDays) {
      map.set(d.date, d);
    }
    return map;
  }, [calendarDays]);

  const todayStr = React.useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Header do Mês */}
      <div className="flex items-center justify-between bg-zinc-900/80 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100 capitalize">
              {monthName}
            </h3>
            <span className="text-xs text-zinc-400">
              Toque em qualquer dia para ver os detalhes
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => shiftMonth(-1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => shiftMonth(1)}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className="bg-zinc-900/60 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dw, i) => (
            <span key={i} className="text-xs font-semibold text-zinc-500 uppercase tracking-wider py-1">
              {dw}
            </span>
          ))}
        </div>

        {/* Células de dias */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Espaços em branco antes do primeiro dia */}
          {Array.from({ length: firstDayWeekday }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-16 sm:h-20 rounded-xl bg-transparent" />
          ))}

          {/* Dias do mês */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;
            const dayData = dayDataMap.get(dateStr);
            const hasLogs = dayData && dayData.hasLogs;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayDate(dateStr)}
                className={`h-16 sm:h-20 p-1.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all duration-150 hover:scale-[1.03] ${
                  isToday
                    ? 'border-brand-500 bg-brand-500/10'
                    : hasLogs
                    ? 'border-brand-500/40 bg-purple-950/20 hover:border-brand-400'
                    : 'border-zinc-800/80 dark:border-[#27272A]/80 bg-zinc-950/40 dark:bg-[#09090B]/40 hover:bg-zinc-800/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold ${
                      isToday
                        ? 'w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center'
                        : hasLogs
                        ? 'text-brand-300'
                        : 'text-zinc-400'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasLogs && (
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-400 shadow-sm shadow-brand-400 animate-pulse" />
                  )}
                </div>

                {hasLogs ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-extrabold text-zinc-100 font-mono truncate">
                      {dayData.calories} <span className="text-[9px] font-normal text-zinc-400">kcal</span>
                    </span>
                    <div className="w-full h-1 bg-zinc-800 rounded-full mt-0.5 overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${dayData.completedRatio}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-[10px] text-zinc-600 italic">sem log</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de Detalhes do Dia Selecionado */}
      <DayDetailModal
        isOpen={!!selectedDayDate}
        date={selectedDayDate}
        onClose={() => setSelectedDayDate(null)}
        onRefreshCalendar={() => loadMonthData(currentMonth)}
      />
    </div>
  );
};

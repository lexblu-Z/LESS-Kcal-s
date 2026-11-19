import React from 'react';
import { Flame, Calendar, Award, TrendingUp } from 'lucide-react';
import { SummaryStats as SummaryStatsType } from '../../types';

interface SummaryStatsProps {
  stats: SummaryStatsType | null;
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* Média Semanal */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Média Semanal
          </span>
          <Flame className="w-4 h-4 text-brand-400" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-zinc-100">
            {stats.weeklyAverageCalories}
          </span>
          <span className="text-xs text-zinc-400 ml-1">kcal/dia</span>
        </div>
      </div>

      {/* Média Mensal */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Média Mensal
          </span>
          <TrendingUp className="w-4 h-4 text-sky-400" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-zinc-100">
            {stats.monthlyAverageCalories}
          </span>
          <span className="text-xs text-zinc-400 ml-1">kcal/dia</span>
        </div>
      </div>

      {/* Dias Registrados (7d) */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Consistência (7d)
          </span>
          <Calendar className="w-4 h-4 text-purple-400" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-zinc-100">
            {stats.totalTrackedDays7}/7
          </span>
          <span className="text-xs text-zinc-400 ml-1">dias com log</span>
        </div>
      </div>

      {/* Dias Registrados (30d) */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-zinc-400">
          <span className="text-[11px] font-semibold uppercase tracking-wider">
            Consistência (30d)
          </span>
          <Award className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2">
          <span className="text-xl font-extrabold text-zinc-100">
            {stats.totalTrackedDays30}/30
          </span>
          <span className="text-xs text-zinc-400 ml-1">dias</span>
        </div>
      </div>
    </div>
  );
};

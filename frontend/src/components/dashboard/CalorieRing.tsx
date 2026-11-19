import React from 'react';
import { Flame, AlertCircle } from 'lucide-react';

interface CalorieRingProps {
  goal: number;
  consumed: number;
  remaining: number;
  percentage: number;
}

export const CalorieRing: React.FC<CalorieRingProps> = ({
  goal,
  consumed,
  remaining,
  percentage
}) => {
  const isOver = remaining < 0;
  const radius = 80;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  // Limita a exibição do anel a 100% no stroke, mas mostra a porcentagem real no texto
  const visualPercentage = Math.min(percentage, 100);
  const strokeDashoffset = circumference - (visualPercentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      {/* Container SVG */}
      <div className="relative w-56 h-56 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="purpleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C084FC" />
              <stop offset="60%" stop-color="#8B5CF6" />
              <stop offset="100%" stop-color="#6D28D9" />
            </linearGradient>
            <linearGradient id="redRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F87171" />
              <stop offset="100%" stop-color="#EF4444" />
            </linearGradient>
          </defs>

          {/* Anel de fundo */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#27272A"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Anel de progresso */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={isOver ? 'url(#redRingGrad)' : 'url(#purpleRingGrad)'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Informações Centrais */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-zinc-400 mb-0.5">
            <Flame className={`w-3.5 h-3.5 ${isOver ? 'text-rose-400' : 'text-brand-400'}`} />
            <span>CONSUMIDAS</span>
          </div>

          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {Math.round(consumed).toLocaleString('pt-BR')}
            </span>
            <span className="text-xs font-medium text-zinc-400">kcal</span>
          </div>

          <div className="mt-1 text-xs">
            {isOver ? (
              <span className="flex items-center gap-1 text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                <AlertCircle className="w-3 h-3" />
                +{Math.abs(Math.round(remaining))} kcal acima
              </span>
            ) : (
              <span className="text-zinc-400">
                Restam <strong className="text-brand-300">{Math.round(remaining)}</strong> kcal
              </span>
            )}
          </div>

          <div className="mt-1">
            <span className="text-[11px] font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
              {percentage.toFixed(1)}% da meta
            </span>
          </div>
        </div>
      </div>

      {/* Resumo Rodapé do Anel */}
      <div className="grid grid-cols-2 gap-6 w-full max-w-xs mt-2 pt-3 border-t border-zinc-800/60 dark:border-[#27272A]/80 text-center">
        <div>
          <span className="block text-[11px] text-zinc-400 font-medium">Meta Diária</span>
          <span className="text-base font-bold text-zinc-200">
            {Math.round(goal).toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-400">kcal</span>
          </span>
        </div>
        <div>
          <span className="block text-[11px] text-zinc-400 font-medium">
            {isOver ? 'Excedente' : 'Disponível'}
          </span>
          <span className={`text-base font-bold ${isOver ? 'text-rose-400' : 'text-emerald-400'}`}>
            {Math.abs(Math.round(remaining)).toLocaleString('pt-BR')} <span className="text-xs font-normal text-zinc-400">kcal</span>
          </span>
        </div>
      </div>
    </div>
  );
};

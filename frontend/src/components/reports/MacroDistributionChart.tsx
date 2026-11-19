import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { MacroDistributionItem } from '../../types';

interface MacroDistributionChartProps {
  data: MacroDistributionItem[];
}

export const MacroDistributionChart: React.FC<MacroDistributionChartProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-100">
            Distribuição de Macronutrientes
          </h4>
          <span className="text-xs text-zinc-400">
            Consumo diário em gramas (Proteínas, Carboidratos, Gorduras)
          </span>
        </div>
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-macro-protein" />
            <span className="text-zinc-300">Prot</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-macro-carbs" />
            <span className="text-zinc-300">Carb</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-macro-fats" />
            <span className="text-zinc-300">Gord</span>
          </div>
        </div>
      </div>

      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
            <XAxis
              dataKey="dayOfWeek"
              stroke="#71717A"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717A"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}g`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as MacroDistributionItem;
                  return (
                    <div className="bg-zinc-950/95 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-xl p-3 shadow-xl text-xs">
                      <span className="font-bold text-zinc-200 block mb-1">
                        {item.date.split('-').reverse().slice(0, 2).join('/')} ({item.dayOfWeek})
                      </span>
                      <div className="flex flex-col gap-1 font-mono">
                        <span className="text-purple-300">Proteínas: {item.proteins}g</span>
                        <span className="text-sky-300">Carboidratos: {item.carbs}g</span>
                        <span className="text-pink-300">Gorduras: {item.fats}g</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="proteins" fill="#C084FC" radius={[4, 4, 0, 0]} />
            <Bar dataKey="carbs" fill="#38BDF8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="fats" fill="#F472B6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

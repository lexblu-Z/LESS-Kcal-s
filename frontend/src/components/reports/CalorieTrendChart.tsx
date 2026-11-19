import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { CalorieTrendItem } from '../../types';

interface CalorieTrendChartProps {
  data: CalorieTrendItem[];
}

export const CalorieTrendChart: React.FC<CalorieTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-zinc-100">
            Evolução Calórica (Últimos 7 Dias)
          </h4>
          <span className="text-xs text-zinc-400">
            Consumo diário em roxo vs. Linha da Meta
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
            <span className="text-zinc-300">Consumidas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-zinc-400 border border-dashed border-zinc-400" />
            <span className="text-zinc-400">Meta</span>
          </div>
        </div>
      </div>

      <div className="w-full h-56 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="calorieArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload as CalorieTrendItem;
                  return (
                    <div className="bg-zinc-950/95 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-xl p-3 shadow-xl text-xs">
                      <span className="font-bold text-zinc-200 block mb-1">
                        {item.date.split('-').reverse().slice(0, 2).join('/')} ({item.dayOfWeek})
                      </span>
                      <div className="flex flex-col gap-1 font-mono">
                        <span className="text-brand-300 font-bold">
                          Consumo: {item.consumedCalories} kcal
                        </span>
                        <span className="text-zinc-400">
                          Meta: {item.goalCalories} kcal
                        </span>
                        <span className={item.difference > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                          Saldo: {item.difference > 0 ? `+${item.difference}` : item.difference} kcal
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="consumedCalories"
              stroke="#8B5CF6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#calorieArea)"
            />
            <Line
              type="monotone"
              dataKey="goalCalories"
              stroke="#A1A1AA"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

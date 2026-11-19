import React from 'react';
import { Plus, Coffee, Sun, Sunset, Moon, Cookie } from 'lucide-react';
import { MealSummary, MealItemSummary, MealType } from '../../types';
import { MealItemCard } from './MealItemCard';

interface MealSectionProps {
  meal: MealSummary;
  onAddItem: (mealType: MealType) => void;
  onEditItem: (item: MealItemSummary) => void;
  onDeleteItem: (itemId: string) => void;
}

export const MealSection: React.FC<MealSectionProps> = ({
  meal,
  onAddItem,
  onEditItem,
  onDeleteItem
}) => {
  const getMealIcon = (type: MealType) => {
    switch (type) {
      case 'BREAKFAST':
        return <Coffee className="w-4 h-4 text-amber-400" />;
      case 'LUNCH':
        return <Sun className="w-4 h-4 text-brand-400" />;
      case 'AFTERNOON_SNACK':
        return <Cookie className="w-4 h-4 text-pink-400" />;
      case 'DINNER':
        return <Sunset className="w-4 h-4 text-purple-400" />;
      case 'SUPPER':
        return <Moon className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4 transition-all duration-200">
      {/* Cabeçalho da Refeição */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/60 dark:border-[#27272A]/60">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-zinc-800/80 dark:bg-[#18181B] border border-zinc-700/50 dark:border-[#27272A]">
            {getMealIcon(meal.mealType)}
          </div>
          <div>
            <h4 className="text-sm font-bold text-zinc-100">{meal.name}</h4>
            <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
              <span>{Math.round(meal.calories)} kcal</span>
              <span>•</span>
              <span>P: {meal.proteins}g</span>
              <span>C: {meal.carbs}g</span>
              <span>G: {meal.fats}g</span>
            </div>
          </div>
        </div>

        {/* Botão rápido de adicionar neste grupo */}
        <button
          onClick={() => onAddItem(meal.mealType)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 text-xs font-semibold transition-all active:scale-95"
          title={`Adicionar alimento ao ${meal.name}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Adicionar</span>
        </button>
      </div>

      {/* Lista de Itens */}
      <div className="mt-3 flex flex-col gap-2">
        {meal.items.length === 0 ? (
          <div className="py-4 text-center text-xs text-zinc-400 bg-zinc-900/30 dark:bg-[#09090B]/30 rounded-xl border border-dashed border-zinc-800/80 dark:border-[#27272A]/80">
            Nenhum alimento registrado ainda nesta refeição.
          </div>
        ) : (
          meal.items.map((item) => (
            <MealItemCard
              key={item.id}
              item={item}
              onEdit={onEditItem}
              onDelete={onDeleteItem}
            />
          ))
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { Trash2, Edit2 } from 'lucide-react';
import { MealItemSummary } from '../../types';

interface MealItemCardProps {
  item: MealItemSummary;
  onEdit: (item: MealItemSummary) => void;
  onDelete: (itemId: string) => void;
}

export const MealItemCard: React.FC<MealItemCardProps> = ({
  item,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 bg-zinc-900/40 dark:bg-[#121216] hover:bg-zinc-800/40 dark:hover:bg-[#18181B] border border-zinc-800/60 dark:border-[#27272A]/70 rounded-xl transition-colors group">
      {/* Alimento e Quantidade */}
      <div className="flex flex-col min-w-0 flex-1 pr-2">
        <span className="text-sm font-semibold text-zinc-100 truncate">
          {item.name}
        </span>
        <div className="flex items-center gap-2 text-xs text-zinc-400 mt-0.5">
          <span className="font-medium text-brand-300">
            {item.quantity} {item.unit}
          </span>
          <span>•</span>
          <span className="font-mono text-zinc-400">
            P: {item.proteins}g | C: {item.carbs}g | G: {item.fats}g
          </span>
        </div>
      </div>

      {/* Calorias e Ações */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-bold text-zinc-100">
          {Math.round(item.calories)} <span className="text-[11px] font-normal text-zinc-400">kcal</span>
        </span>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 text-zinc-400 hover:text-brand-300 hover:bg-brand-500/10 rounded-lg transition-colors"
            title="Editar quantidade"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Excluir item"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

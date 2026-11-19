import React, { useState, useEffect } from 'react';
import { Heart, Clock, Plus, Check } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem, MealType } from '../../types';
import { Button } from '../ui/Button';

interface FavoritesTabProps {
  currentDate: string;
  initialMealType: MealType;
  onSuccess: () => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({
  currentDate,
  initialMealType,
  onSuccess
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'favorites' | 'recent'>('favorites');
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeSubTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'favorites') {
        const favs = await api.getFavorites();
        setItems(favs);
      } else {
        const recents = await api.getRecentFoods(15);
        setItems(recents);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (food: FoodItem) => {
    setSelectedFood(food);
    setUnit(food.baseUnit || 'g');
    setQuantity(food.servingSize ? food.servingSize : food.baseQuantity || 100);
  };

  const handleQuickAdd = async () => {
    if (!selectedFood || quantity <= 0) return;
    setSubmitting(true);
    try {
      await api.addItem({
        date: currentDate,
        mealType: initialMealType,
        foodId: selectedFood.id,
        name: selectedFood.name,
        quantity: Number(quantity),
        unit
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar alimento.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sub-tabs: Favoritos vs Recentes */}
      <div className="grid grid-cols-2 gap-2 bg-zinc-950 dark:bg-[#09090B] p-1 rounded-xl border border-zinc-800 dark:border-[#27272A]">
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('favorites');
            setSelectedFood(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'favorites'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Favoritos</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveSubTab('recent');
            setSelectedFood(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeSubTab === 'recent'
              ? 'bg-brand-600 text-white shadow-sm'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Recentes</span>
        </button>
      </div>

      {/* Lista */}
      <div className="max-h-56 overflow-y-auto rounded-xl border border-zinc-800 dark:border-[#27272A] bg-zinc-950/40 dark:bg-[#09090B]/40 divide-y divide-zinc-800/60 dark:divide-[#27272A]/60">
        {loading ? (
          <div className="p-4 text-center text-xs text-zinc-400">Carregando alimentos...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-400">
            {activeSubTab === 'favorites'
              ? 'Nenhum alimento favoritado ainda. Toque no ícone de coração na busca para favoritar.'
              : 'Nenhum alimento recente encontrado.'}
          </div>
        ) : (
          items.map((food) => {
            const isSelected = selectedFood?.id === food.id;
            return (
              <div
                key={food.id}
                onClick={() => handleSelect(food)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-500/15 border-l-4 border-brand-500'
                    : 'hover:bg-zinc-900/60 dark:hover:bg-[#18181B]'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {food.name}
                  </span>
                  <span className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {Math.round(food.calories)} kcal / 100{food.baseUnit}
                  </span>
                </div>

                {isSelected ? (
                  <Check className="w-4 h-4 text-brand-400 shrink-0" />
                ) : (
                  <Plus className="w-4 h-4 text-zinc-500 hover:text-brand-300 shrink-0" />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Ajuste de Quantidade e Registro com 2 Cliques */}
      {selectedFood && (
        <div className="bg-zinc-900/90 dark:bg-[#18181B] border border-brand-500/30 rounded-2xl p-3 flex flex-col gap-2.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300 truncate">
              {selectedFood.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Quantidade</label>
              <input
                type="number"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                className="w-full bg-zinc-950 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-100 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-zinc-400 block mb-1">Unidade</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-100 focus:outline-none focus:border-brand-500"
              >
                <option value="g">Gramas (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unidade">Unidade</option>
                <option value="colher de sopa">Colher de sopa</option>
                <option value="concha">Concha</option>
              </select>
            </div>
          </div>

          <Button
            type="button"
            onClick={handleQuickAdd}
            loading={submitting}
            className="w-full"
            size="sm"
          >
            Registrar Novamente ({quantity}{unit})
          </Button>
        </div>
      )}
    </div>
  );
};

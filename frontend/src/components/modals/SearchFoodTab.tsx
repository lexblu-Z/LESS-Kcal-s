import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Check, Heart, PlusCircle } from 'lucide-react';
import { api } from '../../services/api';
import { FoodItem, MealType } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface SearchFoodTabProps {
  initialMealType: MealType;
  currentDate: string;
  onSuccess: () => void;
  onOpenCustomFood: () => void;
}

export const SearchFoodTab: React.FC<SearchFoodTabProps> = ({
  initialMealType,
  currentDate,
  onSuccess,
  onOpenCustomFood
}) => {
  const [query, setQuery] = useState('');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(initialMealType);
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Busca instantânea com debounce
  useEffect(() => {
    let active = true;
    const timer = setTimeout(async () => {
      setLoadingSearch(true);
      try {
        const res = await api.searchFoods(query, undefined, 20);
        if (active) {
          setFoods(res);
          // Se nenhum selecionado e temos resultados, ou se o usuário acabou de digitar
          if (!selectedFood && res.length > 0 && query.length > 1) {
            setSelectedFood(res[0]);
            setUnit(res[0].baseUnit || 'g');
            setQuantity(res[0].baseQuantity || 100);
          }
        }
      } catch (e) {
        console.error('Erro na busca de alimentos:', e);
      } finally {
        if (active) setLoadingSearch(false);
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  // Quando seleciona um alimento
  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setUnit(food.baseUnit || 'g');
    setQuantity(food.servingSize ? food.servingSize : food.baseQuantity || 100);
  };

  // Cálculo proporcional instantâneo na interface
  const calculatedMacros = React.useMemo(() => {
    if (!selectedFood || quantity <= 0) {
      return { calories: 0, proteins: 0, carbs: 0, fats: 0, fibers: 0 };
    }

    const baseQty = selectedFood.baseQuantity || 100;
    let factor = quantity / baseQty;

    const normUnit = unit.toLowerCase();
    if (normUnit === 'unidade' || normUnit === 'porção' || normUnit === 'porcao') {
      const eqGrams = selectedFood.servingSize ? quantity * selectedFood.servingSize : quantity * baseQty;
      factor = eqGrams / baseQty;
    } else if (normUnit === 'colher de sopa') {
      const eqGrams = quantity * (selectedFood.servingSize || 15);
      factor = eqGrams / baseQty;
    } else if (normUnit === 'concha') {
      const eqGrams = quantity * (selectedFood.servingSize || 130);
      factor = eqGrams / baseQty;
    }

    return {
      calories: Math.round(selectedFood.calories * factor * 10) / 10,
      proteins: Math.round(selectedFood.proteins * factor * 10) / 10,
      carbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      fats: Math.round(selectedFood.fats * factor * 10) / 10,
      fibers: Math.round((selectedFood.fibers || 0) * factor * 10) / 10
    };
  }, [selectedFood, quantity, unit]);

  const handleToggleFav = async (e: React.MouseEvent, foodId: string) => {
    e.stopPropagation();
    try {
      const res = await api.toggleFavorite(foodId);
      setFoods((prev) =>
        prev.map((f) => (f.id === foodId ? { ...f, isFavorite: res.isFavorite } : f))
      );
      if (selectedFood && selectedFood.id === foodId) {
        setSelectedFood({ ...selectedFood, isFavorite: res.isFavorite });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMeal = async () => {
    if (!selectedFood || quantity <= 0) return;
    setSubmitting(true);
    try {
      await api.addItem({
        date: currentDate,
        mealType: selectedMealType,
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
    <div className="flex flex-col gap-4">
      {/* Seletor de Refeição */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300">Refeição de Destino</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
          {[
            { id: 'BREAKFAST', label: 'Café' },
            { id: 'LUNCH', label: 'Almoço' },
            { id: 'AFTERNOON_SNACK', label: 'Lanche' },
            { id: 'DINNER', label: 'Jantar' },
            { id: 'SUPPER', label: 'Ceia' }
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMealType(m.id as MealType)}
              className={`py-1.5 text-xs font-medium rounded-xl border transition-all ${
                selectedMealType === m.id
                  ? 'bg-brand-600/30 text-brand-300 border-brand-500 font-bold'
                  : 'bg-zinc-900 dark:bg-[#18181B] text-zinc-400 border-zinc-800 dark:border-[#27272A] hover:text-zinc-200'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input de Busca com autocomplete instantâneo */}
      <div className="relative">
        <Input
          placeholder="Digite o alimento (ex: arroz, frango, feijão, aveia...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          icon={<Search className="w-4 h-4 text-zinc-400" />}
          autoFocus
        />
        {loadingSearch && (
          <div className="absolute right-3.5 top-3">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Lista de Alimentos Sugeridos (TACO / TBCA) */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-zinc-800 dark:border-[#27272A] bg-zinc-950/50 dark:bg-[#09090B]/60 divide-y divide-zinc-800/60 dark:divide-[#27272A]/60">
        {foods.length === 0 ? (
          <div className="p-4 text-center text-xs text-zinc-400">
            {loadingSearch ? 'Buscando alimentos...' : 'Nenhum alimento encontrado.'}
            <div className="mt-2">
              <button
                type="button"
                onClick={onOpenCustomFood}
                className="inline-flex items-center gap-1.5 text-brand-400 hover:text-brand-300 font-semibold text-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Cadastrar alimento novo
              </button>
            </div>
          </div>
        ) : (
          foods.map((food) => {
            const isSelected = selectedFood?.id === food.id;
            return (
              <div
                key={food.id}
                onClick={() => handleSelectFood(food)}
                className={`p-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-brand-500/15 border-l-4 border-brand-500'
                    : 'hover:bg-zinc-900/60 dark:hover:bg-[#18181B]'
                }`}
              >
                <div className="flex flex-col min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-zinc-100 truncate">
                      {food.name}
                    </span>
                    <span className="text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                      {food.source}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                    {Math.round(food.calories)} kcal / 100{food.baseUnit} (P:{food.proteins}g C:{food.carbs}g G:{food.fats}g)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => handleToggleFav(e, food.id)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                  >
                    <Heart className={`w-4 h-4 ${food.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>
                  {isSelected && <Check className="w-4 h-4 text-brand-400" />}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Seção da Regra de Ouro: Usuário escolhe unidade e digita APENAS a quantidade */}
      {selectedFood && (
        <div className="bg-zinc-900/90 dark:bg-[#18181B] border border-brand-500/30 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-300">
              Alimento Selecionado: {selectedFood.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Input de Quantidade */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Quantidade
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity || ''}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                placeholder="Ex: 150"
                className="w-full bg-zinc-950 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] focus:border-brand-500 rounded-xl px-3 py-2 text-sm text-zinc-100 font-bold focus:outline-none"
              />
            </div>

            {/* Seletor de Unidade */}
            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Unidade
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-zinc-950 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] focus:border-brand-500 rounded-xl px-3 py-2 text-sm text-zinc-100 font-medium focus:outline-none cursor-pointer"
              >
                <option value="g">Gramas (g)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unidade">Unidade</option>
                <option value="colher de sopa">Colher de sopa</option>
                <option value="concha">Concha</option>
                <option value="fatia">Fatia</option>
              </select>
            </div>
          </div>

          {/* Prévia Nutricional Calculada Automaticamente */}
          <div className="p-3 bg-zinc-950/80 dark:bg-[#121216] rounded-xl border border-zinc-800 dark:border-[#27272A]">
            <span className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider block mb-1">
              Valores Calculados Automaticamente:
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-brand-300 text-sm">
                {calculatedMacros.calories} kcal
              </span>
              <span className="text-purple-300 font-mono">P: {calculatedMacros.proteins}g</span>
              <span className="text-sky-300 font-mono">C: {calculatedMacros.carbs}g</span>
              <span className="text-pink-300 font-mono">G: {calculatedMacros.fats}g</span>
            </div>
          </div>

          {/* Botão de Confirmação */}
          <Button
            type="button"
            onClick={handleAddMeal}
            loading={submitting}
            disabled={quantity <= 0}
            className="w-full"
          >
            Registrar {quantity}{unit} de {selectedFood.name}
          </Button>
        </div>
      )}

      {/* Botão sutil para cadastrar alimento caso não exista */}
      <div className="pt-1 flex justify-center">
        <button
          type="button"
          onClick={onOpenCustomFood}
          className="text-xs text-zinc-500 hover:text-brand-400 transition-colors"
        >
          Não encontrou? Cadastre um alimento personalizado
        </button>
      </div>
    </div>
  );
};

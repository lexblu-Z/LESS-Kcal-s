import React, { useState } from 'react';
import { Sparkles, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { MealType, AiParsedItem } from '../../types';
import { Button } from '../ui/Button';

interface AiTextTabProps {
  currentDate: string;
  initialMealType: MealType;
  onSuccess: () => void;
}

export const AiTextTab: React.FC<AiTextTabProps> = ({
  currentDate,
  initialMealType,
  onSuccess
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [detectedMealType, setDetectedMealType] = useState<MealType>(initialMealType);
  const [previewItems, setPreviewItems] = useState<AiParsedItem[] | null>(null);

  const sampleTexts = [
    'Comi 150g de arroz, 120g de frango grelhado e 2 ovos',
    'No café da manhã comi 2 fatias de pão de forma, 1 fatia de queijo e 1 xícara de café',
    '1 concha de feijão, 100g de patinho moído e salada de alface e tomate com 1 colher de azeite'
  ];

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await api.parseAiText(text);
      setPreviewItems(res.items);
      if (res.mealType) {
        setDetectedMealType(res.mealType);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao processar texto com IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateItemQty = (index: number, newQty: number) => {
    if (!previewItems) return;
    const updated = [...previewItems];
    const it = updated[index];
    const oldQty = it.quantity > 0 ? it.quantity : 1;
    const ratio = newQty / oldQty;

    updated[index] = {
      ...it,
      quantity: newQty,
      calories: Math.round(it.calories * ratio * 10) / 10,
      proteins: Math.round(it.proteins * ratio * 10) / 10,
      carbs: Math.round(it.carbs * ratio * 10) / 10,
      fats: Math.round(it.fats * ratio * 10) / 10
    };
    setPreviewItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (!previewItems) return;
    setPreviewItems(previewItems.filter((_, i) => i !== index));
  };

  const previewTotals = React.useMemo(() => {
    if (!previewItems) return { calories: 0, proteins: 0, carbs: 0, fats: 0 };
    return previewItems.reduce(
      (acc, it) => ({
        calories: Math.round((acc.calories + it.calories) * 10) / 10,
        proteins: Math.round((acc.proteins + it.proteins) * 10) / 10,
        carbs: Math.round((acc.carbs + it.carbs) * 10) / 10,
        fats: Math.round((acc.fats + it.fats) * 10) / 10
      }),
      { calories: 0, proteins: 0, carbs: 0, fats: 0 }
    );
  }, [previewItems]);

  const handleConfirm = async () => {
    if (!previewItems || previewItems.length === 0) return;
    setSaving(true);
    try {
      await api.confirmAiMeal({
        date: currentDate,
        mealType: detectedMealType,
        items: previewItems.map((it) => ({
          foodId: it.matchedFoodId,
          name: it.matchedFoodName || it.name,
          quantity: it.quantity,
          unit: it.unit
        }))
      });
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Erro ao registrar itens da IA.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Input de Texto Natural */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
          <span>O que você comeu?</span>
          <span className="text-[11px] text-brand-400 font-normal">
            Linguagem natural brasileira
          </span>
        </label>
        <textarea
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ex: Comi 150g de arroz branco, 120g de filé de frango e 2 ovos cozidos..."
          className="w-full bg-zinc-900 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] focus:border-brand-500 rounded-xl p-3 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none transition-colors"
        />
      </div>

      {/* Exemplos Rápidos */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] text-zinc-500 font-medium">Sugestões:</span>
        {sampleTexts.map((sample, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setText(sample)}
            className="text-[11px] px-2 py-1 rounded-lg bg-zinc-900 dark:bg-[#18181B] text-zinc-400 hover:text-brand-300 border border-zinc-800 dark:border-[#27272A] hover:border-brand-500/40 transition-colors truncate max-w-xs"
          >
            {sample}
          </button>
        ))}
      </div>

      {/* Botão de Análise com IA */}
      <Button
        type="button"
        onClick={handleAnalyze}
        loading={loading}
        disabled={!text.trim()}
        icon={<Sparkles className="w-4 h-4 text-purple-300" />}
        className="w-full"
      >
        Analisar e Extrair Alimentos
      </Button>

      {/* Prévia Editável (IA nunca salva sem confirmação do usuário) */}
      {previewItems && (
        <div className="mt-2 bg-zinc-900/90 dark:bg-[#18181B] border border-brand-500/30 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 dark:border-[#27272A]">
            <div>
              <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Prévia da Refeição (Revise antes de salvar)
              </span>
              <span className="text-[11px] text-zinc-400 block mt-0.5">
                Destino: {detectedMealType}
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-white">
                {previewTotals.calories} kcal
              </span>
            </div>
          </div>

          {/* Itens Identificados */}
          <div className="flex flex-col gap-2">
            {previewItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-zinc-950/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A]"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {item.matchedFoodName || item.name}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                    <span className="text-brand-300 font-bold">{Math.round(item.calories)} kcal</span>
                    <span>•</span>
                    <span>P: {item.proteins}g</span>
                    <span>C: {item.carbs}g</span>
                    <span>G: {item.fats}g</span>
                  </div>
                </div>

                {/* Edição Rápida de Quantidade */}
                <div className="flex items-center gap-2 shrink-0">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItemQty(index, parseFloat(e.target.value) || 0)}
                    className="w-16 bg-zinc-900 dark:bg-[#18181B] border border-zinc-700 dark:border-[#27272A] rounded-lg px-2 py-1 text-xs text-center text-zinc-100 font-bold focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-xs text-zinc-400 font-medium">{item.unit}</span>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                    title="Remover este item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de Confirmação Final */}
          <Button
            type="button"
            onClick={handleConfirm}
            loading={saving}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full mt-1"
          >
            Confirmar e Registrar {previewItems.length} Alimentos
          </Button>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Target, Info, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';
import { DailyGoal } from '../../types';

interface GoalSettingsFormProps {
  currentGoal: {
    calories: number;
    proteins: number;
    carbs: number;
    fats: number;
    waterMl?: number;
  } | null;
  currentDate: string;
  onGoalUpdated: (goal: DailyGoal) => void;
}

export const GoalSettingsForm: React.FC<GoalSettingsFormProps> = ({
  currentGoal,
  currentDate,
  onGoalUpdated
}) => {
  const [calories, setCalories] = useState<number>(2000);
  const [proteins, setProteins] = useState<number>(150);
  const [carbs, setCarbs] = useState<number>(200);
  const [fats, setFats] = useState<number>(65);
  const [waterMl, setWaterMl] = useState<number>(2000);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (currentGoal) {
      setCalories(currentGoal.calories);
      setProteins(currentGoal.proteins);
      setCarbs(currentGoal.carbs);
      setFats(currentGoal.fats);
      setWaterMl(currentGoal.waterMl || 2000);
    }
  }, [currentGoal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      const updated = await api.setGoal({
        date: currentDate,
        calories: Number(calories),
        proteins: Number(proteins),
        carbs: Number(carbs),
        fats: Number(fats),
        waterMl: Number(waterMl)
      });
      onGoalUpdated(updated);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar metas.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-zinc-800 dark:border-[#27272A]">
        <div className="p-2 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-100">
            Metas Nutricionais Diárias
          </h3>
          <span className="text-xs text-zinc-400">
            Configure suas metas para hoje ({currentDate.split('-').reverse().slice(0, 2).join('/')})
          </span>
        </div>
      </div>

      {/* Regra Crítica de Versionamento Documentada Visualmente */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-purple-950/20 border border-brand-500/20 text-brand-300 text-xs">
        <Info className="w-4 h-4 shrink-0 text-brand-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Regra de Versionamento:</strong> Alterar as metas hoje define os novos objetivos para o presente e futuro. <strong>As metas salvas nos dias anteriores do seu histórico permanecem 100% preservadas e intactas.</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Meta de Calorias (kcal)"
            type="number"
            step="10"
            min="500"
            value={calories}
            onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Meta de Água (ml)"
            type="number"
            step="100"
            min="0"
            value={waterMl}
            onChange={(e) => setWaterMl(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Input
            label="Proteínas (g)"
            type="number"
            step="1"
            min="0"
            value={proteins}
            onChange={(e) => setProteins(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Carboidratos (g)"
            type="number"
            step="1"
            min="0"
            value={carbs}
            onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Gorduras (g)"
            type="number"
            step="1"
            min="0"
            value={fats}
            onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        {successMsg && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
            <Check className="w-4 h-4" />
            <span>Metas atualizadas com sucesso para {currentDate}!</span>
          </div>
        )}

        <Button type="submit" loading={saving} className="w-full mt-1">
          Salvar Metas Diárias
        </Button>
      </form>
    </div>
  );
};

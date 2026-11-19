import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { api } from '../../services/api';
import { DailySummary } from '../../types';
import { CalorieRing } from '../dashboard/CalorieRing';
import { MacroCards } from '../dashboard/MacroCards';
import { MealSection } from '../dashboard/MealSection';

interface DayDetailModalProps {
  isOpen: boolean;
  date: string | null;
  onClose: () => void;
  onRefreshCalendar?: () => void;
}

export const DayDetailModal: React.FC<DayDetailModalProps> = ({
  isOpen,
  date,
  onClose,
  onRefreshCalendar
}) => {
  const [data, setData] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && date) {
      loadDayDetails(date);
    }
  }, [isOpen, date]);

  const loadDayDetails = async (targetDate: string) => {
    setLoading(true);
    try {
      const summary = await api.getDaily(targetDate);
      setData(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!date) return null;

  const [year, month, day] = date.split('-').map(Number);
  const formattedDate = new Date(year, month - 1, day).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate}
      subtitle="Resumo completo e registros alimentares do dia"
      maxWidth="lg"
    >
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400">Carregando dados do dia...</span>
        </div>
      ) : !data ? (
        <div className="py-8 text-center text-xs text-zinc-400">
          Nenhum dado encontrado para este dia.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-zinc-900/60 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A] rounded-2xl">
            <CalorieRing
              goal={data.goal.calories}
              consumed={data.consumed.calories}
              remaining={data.remaining.calories}
              percentage={data.percentages.calories}
            />
          </div>

          <MacroCards goal={data.goal} consumed={data.consumed} />

          <div className="flex flex-col gap-3 mt-2">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Refeições Registradas
            </h4>
            {data.meals.map((meal) => (
              <MealSection
                key={meal.id}
                meal={meal}
                onAddItem={() => {}}
                onEditItem={() => {}}
                onDeleteItem={async (itemId) => {
                  await api.deleteItem(itemId);
                  loadDayDetails(date);
                  if (onRefreshCalendar) onRefreshCalendar();
                }}
              />
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};

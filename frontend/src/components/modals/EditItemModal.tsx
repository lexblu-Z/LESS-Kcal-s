import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { MealItemSummary } from '../../types';
import { api } from '../../services/api';

interface EditItemModalProps {
  isOpen: boolean;
  item: MealItemSummary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<string>('g');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setQuantity(item.quantity);
      setUnit(item.unit || 'g');
    }
  }, [item]);

  if (!item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;
    setSaving(true);
    try {
      await api.updateItem(item.id, {
        quantity: Number(quantity),
        unit
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar quantidade do alimento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Quantidade"
      subtitle={`Alimento: ${item.name}`}
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Nova Quantidade
            </label>
            <input
              type="number"
              min="0.1"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] rounded-xl px-3 py-2 text-sm text-zinc-100 font-bold focus:outline-none focus:border-brand-500"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Unidade
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-zinc-900 dark:bg-[#121216] border border-zinc-700 dark:border-[#27272A] rounded-xl px-3 py-2 text-sm text-zinc-100 font-medium focus:outline-none focus:border-brand-500 cursor-pointer"
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

        <div className="p-3 bg-zinc-900/60 dark:bg-[#18181B] rounded-xl border border-zinc-800 dark:border-[#27272A] text-xs text-zinc-400">
          Os macronutrientes e calorias totais serão recalculados proporcionalmente na hora.
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Salvar Alteração
          </Button>
        </div>
      </form>
    </Modal>
  );
};

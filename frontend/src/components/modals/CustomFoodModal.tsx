import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { api } from '../../services/api';

interface CustomFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CustomFoodModal: React.FC<CustomFoodModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Personalizados');
  const [calories, setCalories] = useState<number>(0);
  const [proteins, setProteins] = useState<number>(0);
  const [carbs, setCarbs] = useState<number>(0);
  const [fats, setFats] = useState<number>(0);
  const [fibers, setFibers] = useState<number>(0);
  const [baseUnit, setBaseUnit] = useState<'g' | 'ml'>('g');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await api.createCustomFood({
        name: name.trim(),
        category,
        baseUnit,
        calories: Number(calories),
        proteins: Number(proteins),
        carbs: Number(carbs),
        fats: Number(fats),
        fibers: Number(fibers)
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Erro ao cadastrar alimento.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastrar Alimento Novo"
      subtitle="Valores nutricionais para a porção base de 100g ou 100ml"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Input
          label="Nome do Alimento"
          placeholder="Ex: Pão de fermentação natural caseiro"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Categoria</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-900 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-300 block mb-1">Unidade Base</label>
            <select
              value={baseUnit}
              onChange={(e) => setBaseUnit(e.target.value as 'g' | 'ml')}
              className="w-full bg-zinc-900 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-xl px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:border-brand-500"
            >
              <option value="g">Gramas (100g)</option>
              <option value="ml">Mililitros (100ml)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Calorias (kcal)"
            type="number"
            step="any"
            value={calories || ''}
            onChange={(e) => setCalories(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Proteínas (g)"
            type="number"
            step="any"
            value={proteins || ''}
            onChange={(e) => setProteins(parseFloat(e.target.value) || 0)}
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Input
            label="Carboidratos (g)"
            type="number"
            step="any"
            value={carbs || ''}
            onChange={(e) => setCarbs(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Gorduras (g)"
            type="number"
            step="any"
            value={fats || ''}
            onChange={(e) => setFats(parseFloat(e.target.value) || 0)}
            required
          />
          <Input
            label="Fibras (g)"
            type="number"
            step="any"
            value={fibers || ''}
            onChange={(e) => setFibers(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={saving}>
            Salvar Alimento
          </Button>
        </div>
      </form>
    </Modal>
  );
};

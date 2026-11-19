import React, { useState, useRef } from 'react';
import { Camera, Upload, AlertTriangle, CheckCircle2, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { MealType, AiParsedItem } from '../../types';
import { Button } from '../ui/Button';

interface AiPhotoTabProps {
  currentDate: string;
  initialMealType: MealType;
  onSuccess: () => void;
}

export const AiPhotoTab: React.FC<AiPhotoTabProps> = ({
  currentDate,
  initialMealType,
  onSuccess
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewItems, setPreviewItems] = useState<AiParsedItem[] | null>(null);
  const [detectedMealType, setDetectedMealType] = useState<MealType>(initialMealType);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setPreviewItems(null);
    }
  };

  const handleAnalyzePhoto = async () => {
    if (!selectedFile && !imagePreview) return;
    setLoading(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('image', selectedFile);
        res = await api.parseAiPhoto(formData);
      } else if (imagePreview) {
        res = await api.parseAiPhoto({ imageBase64: imagePreview });
      }
      if (res) {
        setPreviewItems(res.items);
        if (res.mealType) setDetectedMealType(res.mealType);
      }
    } catch (err: any) {
      alert(err.message || 'Erro ao analisar a imagem do prato.');
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
      alert(err.message || 'Erro ao registrar itens da foto.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Alerta Explícito Obrigatório de Estimativa */}
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
        <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Atenção:</strong> Pesos e porções identificados por foto são <strong>estimativas visuais</strong>. Ajuste os gramas na prévia antes de confirmar o registro.
        </p>
      </div>

      {/* Upload / Captura de Foto */}
      <div className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 dark:border-[#27272A] hover:border-brand-500/50 rounded-2xl p-6 bg-zinc-900/40 dark:bg-[#121216]/50 transition-colors cursor-pointer text-center"
           onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="flex flex-col items-center gap-3 w-full">
            <img
              src={imagePreview}
              alt="Prévia do prato"
              className="max-h-48 rounded-xl object-cover border border-zinc-700 shadow-md"
            />
            <span className="text-xs text-zinc-400 underline">
              Clique para escolher outra imagem
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center text-brand-400">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-zinc-200">
              Tirar foto do prato ou enviar da galeria
            </span>
            <span className="text-xs text-zinc-500">
              PNG, JPG, JPEG ou WEBP (até 10MB)
            </span>
          </div>
        )}
      </div>

      {/* Botão de Análise de Foto */}
      <Button
        type="button"
        onClick={handleAnalyzePhoto}
        loading={loading}
        disabled={!imagePreview}
        icon={<Upload className="w-4 h-4" />}
        className="w-full"
      >
        Analisar Foto com IA
      </Button>

      {/* Prévia da Foto com Edição de Gramas */}
      {previewItems && (
        <div className="mt-2 bg-zinc-900/90 dark:bg-[#18181B] border border-brand-500/30 rounded-2xl p-4 flex flex-col gap-3 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800 dark:border-[#27272A]">
            <div>
              <span className="text-xs font-bold text-brand-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Alimentos Detectados na Foto
              </span>
              <span className="text-[11px] text-amber-400 block mt-0.5 font-medium">
                Edite os valores em gramas abaixo:
              </span>
            </div>
            <div className="text-right">
              <span className="text-sm font-extrabold text-white">
                {previewTotals.calories} kcal
              </span>
            </div>
          </div>

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
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={handleConfirm}
            loading={saving}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-full mt-1"
          >
            Confirmar e Salvar no {detectedMealType}
          </Button>
        </div>
      )}
    </div>
  );
};

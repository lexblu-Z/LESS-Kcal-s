import React, { useState } from 'react';
import { Search, Sparkles, Camera, Heart } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { SearchFoodTab } from './SearchFoodTab';
import { AiTextTab } from './AiTextTab';
import { AiPhotoTab } from './AiPhotoTab';
import { FavoritesTab } from './FavoritesTab';
import { CustomFoodModal } from './CustomFoodModal';
import { MealType } from '../../types';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  initialMealType?: MealType;
  onSuccess: () => void;
}

type TabType = 'search' | 'ai-text' | 'ai-photo' | 'favorites';

export const AddMealModal: React.FC<AddMealModalProps> = ({
  isOpen,
  onClose,
  currentDate,
  initialMealType = 'LUNCH',
  onSuccess
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [customFoodOpen, setCustomFoodOpen] = useState(false);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'search', label: 'Buscar', icon: <Search className="w-4 h-4" /> },
    { id: 'ai-text', label: 'Texto IA', icon: <Sparkles className="w-4 h-4 text-purple-400" /> },
    { id: 'ai-photo', label: 'Foto IA', icon: <Camera className="w-4 h-4 text-pink-400" /> },
    { id: 'favorites', label: 'Favoritos', icon: <Heart className="w-4 h-4 text-rose-400" /> }
  ];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Registrar Alimento"
        subtitle="Selecione o alimento e informe apenas a quantidade"
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          {/* Navegação de Abas do Modal */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-950 dark:bg-[#09090B] border border-zinc-800 dark:border-[#27272A] rounded-2xl">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  {tab.icon}
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Conteúdo da Aba Ativa */}
          <div className="pt-1">
            {activeTab === 'search' && (
              <SearchFoodTab
                initialMealType={initialMealType}
                currentDate={currentDate}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
                onOpenCustomFood={() => setCustomFoodOpen(true)}
              />
            )}

            {activeTab === 'ai-text' && (
              <AiTextTab
                currentDate={currentDate}
                initialMealType={initialMealType}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
              />
            )}

            {activeTab === 'ai-photo' && (
              <AiPhotoTab
                currentDate={currentDate}
                initialMealType={initialMealType}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
              />
            )}

            {activeTab === 'favorites' && (
              <FavoritesTab
                currentDate={currentDate}
                initialMealType={initialMealType}
                onSuccess={() => {
                  onSuccess();
                  onClose();
                }}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Secundário de Cadastro de Alimento Personalizado */}
      <CustomFoodModal
        isOpen={customFoodOpen}
        onClose={() => setCustomFoodOpen(false)}
        onSuccess={() => {
          setActiveTab('search');
        }}
      />
    </>
  );
};

import React from 'react';
import { Home, Calendar, Plus, BarChart3, User } from 'lucide-react';

export type TabType = 'home' | 'history' | 'reports' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenAddModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/90 dark:bg-[#09090B]/95 backdrop-blur-lg border-t border-zinc-800/80 dark:border-[#27272A] px-3 pb-safe pt-2">
      <nav className="max-w-md mx-auto flex items-center justify-around relative">
        {/* Início */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'home'
              ? 'text-brand-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Início</span>
        </button>

        {/* Histórico */}
        <button
          onClick={() => onSelectTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'history'
              ? 'text-brand-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Histórico</span>
        </button>

        {/* Botão Central de Adicionar Alimento (Destaque Roxo Vibrante) */}
        <div className="relative -top-4 flex flex-col items-center">
          <button
            onClick={onOpenAddModal}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-700 via-brand-600 to-purple-400 text-white flex items-center justify-center shadow-lg shadow-brand-600/50 hover:shadow-brand-500/60 hover:scale-105 active:scale-95 transition-all duration-200 border-4 border-black dark:border-[#09090B]"
            title="Registrar alimento ou refeição"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
          <span className="text-[9px] font-bold text-brand-300 mt-0.5 tracking-wide">
            Adicionar
          </span>
        </div>

        {/* Relatórios */}
        <button
          onClick={() => onSelectTab('reports')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'reports'
              ? 'text-brand-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Relatórios</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            currentTab === 'profile'
              ? 'text-brand-400 font-bold scale-105'
              : 'text-zinc-400 hover:text-zinc-200 font-medium'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Perfil</span>
        </button>
      </nav>
    </div>
  );
};

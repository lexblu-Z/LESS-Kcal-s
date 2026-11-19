import React from 'react';
import { User, LogOut, Download, Moon, Sun, Database, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../ui/Button';

interface UserProfileProps {
  onOpenAuthModal: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [installPrompt, setInstallPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!installPrompt) {
      alert('Para instalar o app, clique no menu de compartilhar do seu navegador e escolha "Adicionar à Tela Inicial".');
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Card do Usuário */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-purple-400 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
            {user ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              {user ? user.name : 'Visitante'}
            </h3>
            <span className="text-xs text-zinc-400">
              {user ? user.email : 'Faça login para sincronizar seus dados'}
            </span>
          </div>
        </div>

        {user ? (
          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors border border-zinc-700/60"
            title="Sair da conta"
          >
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <Button size="sm" onClick={onOpenAuthModal}>
            Entrar / Cadastrar
          </Button>
        )}
      </div>

      {/* Estatísticas e Informações do Sistema */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4 flex flex-col gap-3">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
          Sistema e Base de Dados
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/60 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A]">
            <Database className="w-4 h-4 text-brand-400 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-200 block">Tabelas TACO e TBCA</span>
              <span className="text-zinc-500 text-[11px]">90+ alimentos brasileiros pré-populados</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/60 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-semibold text-zinc-200 block">Isolamento e Segurança</span>
              <span className="text-zinc-500 text-[11px]">JWT + bcrypt com versionamento por data</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ações e Preferências */}
      <div className="bg-zinc-900/70 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] rounded-2xl p-4 flex flex-col gap-2.5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
          Preferências
        </h4>

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A]">
          <div className="flex items-center gap-2.5">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-brand-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Tema de Visualização
              </span>
              <span className="text-[11px] text-zinc-500">
                {theme === 'dark' ? 'Modo Escuro (Preto e Roxo)' : 'Modo Claro'}
              </span>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="px-3 py-1.5 rounded-lg bg-zinc-800 text-xs font-semibold text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            Alternar
          </button>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/60 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A]">
          <div className="flex items-center gap-2.5">
            <Download className="w-4 h-4 text-brand-400" />
            <div>
              <span className="text-xs font-semibold text-zinc-200 block">
                Instalar Aplicativo (PWA)
              </span>
              <span className="text-[11px] text-zinc-500">
                Acesse direto da tela inicial do seu celular
              </span>
            </div>
          </div>
          <button
            onClick={handleInstallPwa}
            className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition-all"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
};

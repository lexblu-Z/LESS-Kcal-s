import React from 'react';
import { Flame, Moon, Sun, WifiOff, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onOpenAddModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAddModal }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-black/80 dark:bg-[#09090B]/80 backdrop-blur-md border-b border-zinc-800 dark:border-[#27272A] px-4 py-3">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 via-brand-500 to-purple-400 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Flame className="w-5 h-5 text-white fill-white/20" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                LESS<span className="text-brand-400">Kcal</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium">
              {user ? `Olá, ${user.name.split(' ')[0]}!` : 'Controle Nutricional'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {!isOnline && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs">
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Modo Offline</span>
            </div>
          )}

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/40 text-brand-300 border border-brand-500/40 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Registrar com IA</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-zinc-900 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A] text-zinc-300 hover:text-white transition-colors"
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-brand-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

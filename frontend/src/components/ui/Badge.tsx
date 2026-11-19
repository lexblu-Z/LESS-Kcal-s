import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'purple' | 'cyan' | 'pink' | 'emerald' | 'amber' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'purple',
  size = 'md',
  className = ''
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold'
  };

  const variantStyles = {
    purple: 'bg-brand-500/15 text-brand-300 border border-brand-500/30',
    cyan: 'bg-sky-500/15 text-sky-300 border border-sky-500/30',
    pink: 'bg-pink-500/15 text-pink-300 border border-pink-500/30',
    emerald: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
    amber: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
    neutral: 'bg-zinc-800 text-zinc-300 border border-zinc-700/50'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

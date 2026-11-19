import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'surface' | 'gradient';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  const variantStyles = {
    default:
      'bg-zinc-900/80 dark:bg-[#121216] border border-zinc-800 dark:border-[#27272A] shadow-sm',
    surface:
      'bg-zinc-900 dark:bg-[#18181B] border border-zinc-800 dark:border-[#27272A]',
    gradient:
      'bg-gradient-to-br from-zinc-900 via-[#121216] to-purple-950/20 border border-brand-500/20'
  };

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-200 ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

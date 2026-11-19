import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-zinc-300 dark:text-zinc-300"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-zinc-400 pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={`w-full bg-zinc-900/90 dark:bg-[#121216] border ${
            error ? 'border-rose-500 focus:border-rose-500' : 'border-zinc-800 dark:border-[#27272A] focus:border-brand-500'
          } rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-brand-500 ${
            icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-rose-400 mt-0.5">{error}</span>}
    </div>
  );
};

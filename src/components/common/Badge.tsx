import React from 'react';

export type BadgeVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-slate-800 border-slate-700 text-slate-300',
    text: 'text-slate-300',
    dot: 'bg-slate-400',
  },
  brand: {
    bg: 'bg-brand-500/10 border-brand-500/30 text-brand-400',
    text: 'text-brand-400',
    dot: 'bg-brand-500',
  },
  success: {
    bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    text: 'text-emerald-400',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    text: 'text-amber-400',
    dot: 'bg-amber-500',
  },
  danger: {
    bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
    text: 'text-rose-400',
    dot: 'bg-rose-500',
  },
  info: {
    bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
    text: 'text-cyan-400',
    dot: 'bg-cyan-500',
  },
  neutral: {
    bg: 'bg-slate-700/50 border-slate-600 text-slate-200',
    text: 'text-slate-200',
    dot: 'bg-slate-300',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const styles = variantStyles[variant];
  const sizeStyles =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${styles.bg} ${sizeStyles} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} />}
      {children}
    </span>
  );
};

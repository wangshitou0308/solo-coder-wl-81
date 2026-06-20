import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent';
  className?: string;
}

const variants = {
  default: 'bg-primary-100 text-primary-700',
  success: 'bg-accent-100 text-accent-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  accent: 'bg-accent-100 text-accent-700',
};

export default function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn('status-badge', variants[variant], className)}>
      {children}
    </span>
  );
}

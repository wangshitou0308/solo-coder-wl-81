import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}

export default function Card({ children, className, dark = false }: CardProps) {
  return (
    <div className={cn(dark ? 'glass-card-dark' : 'glass-card', className)}>
      {children}
    </div>
  );
}

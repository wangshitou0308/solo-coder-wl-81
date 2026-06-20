import { Bell, Search, Calendar } from 'lucide-react';
import { formatDate, getTodayStr } from '@/utils/dateUtils';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-white/60 backdrop-blur-xl border-b border-white/50 sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-primary-800">
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-primary-500 mt-0.5">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 rounded-full border border-primary-100">
            <Calendar className="w-4 h-4 text-primary-500" strokeWidth={2} />
            <span className="text-sm text-primary-700 font-medium">
              {formatDate(getTodayStr())}
            </span>
          </div>

          <div className="relative">
            <button className="w-10 h-10 rounded-full bg-white/80 border border-primary-100 flex items-center justify-center text-primary-600 hover:bg-white hover:text-primary-800 transition-all">
              <Search className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          <button className="relative w-10 h-10 rounded-full bg-white/80 border border-primary-100 flex items-center justify-center text-primary-600 hover:bg-white hover:text-primary-800 transition-all">
            <Bell className="w-4 h-4" strokeWidth={2} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-warning-500 rounded-full animate-pulse-soft" />
          </button>

          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium shadow-md">
            视
          </div>
        </div>
      </div>
    </header>
  );
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyLog } from '@/types';
import { mockDailyLogs } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface DailyLogState {
  logs: DailyLog[];
  initialized: boolean;
  initMockData: () => void;
  addLog: (log: Omit<DailyLog, 'id' | 'createdAt'>) => void;
  updateLog: (id: string, log: Partial<DailyLog>) => void;
  deleteLog: (id: string) => void;
  getLogById: (id: string) => DailyLog | undefined;
}

export const useDailyLogStore = create<DailyLogState>()(
  persist(
    (set, get) => ({
      logs: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ logs: mockDailyLogs, initialized: true });
        }
      },
      addLog: (log) => {
        const newLog: DailyLog = {
          ...log,
          tags: log.tags ?? [],
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ logs: [newLog, ...state.logs] }));
      },
      updateLog: (id, log) => {
        set((state) => ({
          logs: state.logs.map((l) => (l.id === id ? { ...l, ...log } : l)),
        }));
      },
      deleteLog: (id) => {
        set((state) => ({ logs: state.logs.filter((l) => l.id !== id) }));
      },
      getLogById: (id) => {
        return get().logs.find((l) => l.id === id);
      },
    }),
    {
      name: 'vision-dailylog-storage',
    }
  )
);

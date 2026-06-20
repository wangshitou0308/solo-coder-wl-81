import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OptometryRecord } from '@/types';
import { mockOptometryRecords } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface OptometryState {
  records: OptometryRecord[];
  initialized: boolean;
  initMockData: () => void;
  addRecord: (record: Omit<OptometryRecord, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateRecord: (id: string, record: Partial<OptometryRecord>) => void;
  deleteRecord: (id: string) => void;
  getRecordById: (id: string) => OptometryRecord | undefined;
}

export const useOptometryStore = create<OptometryState>()(
  persist(
    (set, get) => ({
      records: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ records: mockOptometryRecords, initialized: true });
        }
      },
      addRecord: (record) => {
        const now = new Date().toISOString();
        const newRecord: OptometryRecord = {
          ...record,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ records: [...state.records, newRecord] }));
      },
      updateRecord: (id, record) => {
        set((state) => ({
          records: state.records.map((r) =>
            r.id === id ? { ...r, ...record, updatedAt: new Date().toISOString() } : r
          ),
        }));
      },
      deleteRecord: (id) => {
        set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
      },
      getRecordById: (id) => {
        return get().records.find((r) => r.id === id);
      },
    }),
    {
      name: 'vision-optometry-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Glasses } from '@/types';
import { mockGlasses } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface GlassesState {
  glasses: Glasses[];
  initialized: boolean;
  initMockData: () => void;
  addGlasses: (glasses: Omit<Glasses, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGlasses: (id: string, glasses: Partial<Glasses>) => void;
  deleteGlasses: (id: string) => void;
  getGlassesById: (id: string) => Glasses | undefined;
}

export const useGlassesStore = create<GlassesState>()(
  persist(
    (set, get) => ({
      glasses: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ glasses: mockGlasses, initialized: true });
        }
      },
      addGlasses: (glasses) => {
        const now = new Date().toISOString();
        const newGlasses: Glasses = {
          ...glasses,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ glasses: [...state.glasses, newGlasses] }));
      },
      updateGlasses: (id, glasses) => {
        set((state) => ({
          glasses: state.glasses.map((g) =>
            g.id === id ? { ...g, ...glasses, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      deleteGlasses: (id) => {
        set((state) => ({ glasses: state.glasses.filter((g) => g.id !== id) }));
      },
      getGlassesById: (id) => {
        return get().glasses.find((g) => g.id === id);
      },
    }),
    {
      name: 'vision-glasses-storage',
    }
  )
);

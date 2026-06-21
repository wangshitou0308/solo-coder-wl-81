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
  setPrimary: (id: string) => void;
  markReplacement: (id: string) => void;
  duplicateGlasses: (id: string) => void;
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
          tags: glasses.tags ?? [],
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
      setPrimary: (id) => {
        set((state) => ({
          glasses: state.glasses.map((g) => {
            if (g.id === id) {
              return { ...g, role: 'primary' as const, status: 'active' as const, updatedAt: new Date().toISOString() };
            }
            if (g.role === 'primary') {
              return { ...g, role: 'standby' as const, updatedAt: new Date().toISOString() };
            }
            return g;
          }),
        }));
      },
      markReplacement: (id) => {
        const target = get().glasses.find((g) => g.id === id);
        if (!target) return;
        const now = new Date().toISOString();
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = target;
        const replacement: Glasses = {
          ...rest,
          status: 'active',
          role: 'primary',
          tags: [...target.tags],
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          glasses: [
            ...state.glasses.map((g) =>
              g.id === id
                ? { ...g, status: 'retired' as const, role: 'retired' as const, updatedAt: now }
                : g.role === 'primary'
                  ? { ...g, role: 'standby' as const, updatedAt: now }
                  : g
            ),
            replacement,
          ],
        }));
      },
      duplicateGlasses: (id) => {
        const target = get().glasses.find((g) => g.id === id);
        if (!target) return;
        const now = new Date().toISOString();
        const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = target;
        const duplicate: Glasses = {
          ...rest,
          tags: [...target.tags],
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ glasses: [...state.glasses, duplicate] }));
      },
    }),
    {
      name: 'vision-glasses-storage',
    }
  )
);

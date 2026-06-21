import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthGoal } from '@/types';
import { mockGoals } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface GoalState {
  goals: HealthGoal[];
  initialized: boolean;
  initMockData: () => void;
  addGoal: (goal: Omit<HealthGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGoal: (id: string, goal: Partial<HealthGoal>) => void;
  deleteGoal: (id: string) => void;
  getGoalById: (id: string) => HealthGoal | undefined;
  updateProgress: (id: string, current: number) => void;
}

export const useGoalStore = create<GoalState>()(
  persist(
    (set, get) => ({
      goals: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ goals: mockGoals, initialized: true });
        }
      },
      addGoal: (goal) => {
        const now = new Date().toISOString();
        const newGoal: HealthGoal = {
          ...goal,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ goals: [...state.goals, newGoal] }));
      },
      updateGoal: (id, goal) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...goal, updatedAt: new Date().toISOString() } : g
          ),
        }));
      },
      deleteGoal: (id) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },
      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },
      updateProgress: (id, current) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, current, updatedAt: new Date().toISOString() }
              : g
          ),
        }));
      },
    }),
    {
      name: 'vision-goal-storage',
    }
  )
);

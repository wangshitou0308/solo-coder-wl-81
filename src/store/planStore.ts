import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { OptometryPlan, PlanStatus } from '@/types';
import { mockPlans } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface PlanState {
  plans: OptometryPlan[];
  initialized: boolean;
  initMockData: () => void;
  addPlan: (plan: Omit<OptometryPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, plan: Partial<OptometryPlan>) => void;
  deletePlan: (id: string) => void;
  getPlanById: (id: string) => OptometryPlan | undefined;
  updateStatus: (id: string, status: PlanStatus) => void;
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plans: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ plans: mockPlans, initialized: true });
        }
      },
      addPlan: (plan) => {
        const now = new Date().toISOString();
        const newPlan: OptometryPlan = {
          ...plan,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ plans: [...state.plans, newPlan] }));
      },
      updatePlan: (id, plan) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id ? { ...p, ...plan, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },
      deletePlan: (id) => {
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) }));
      },
      getPlanById: (id) => {
        return get().plans.find((p) => p.id === id);
      },
      updateStatus: (id, status) => {
        set((state) => ({
          plans: state.plans.map((p) =>
            p.id === id
              ? {
                  ...p,
                  status,
                  completedDate: status === 'completed' ? new Date().toISOString() : p.completedDate,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },
    }),
    {
      name: 'vision-plan-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CommonOrganization } from '@/types';
import { mockOrganizations } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface OrgState {
  organizations: CommonOrganization[];
  initialized: boolean;
  initMockData: () => void;
  add: (org: Omit<CommonOrganization, 'id' | 'useCount'>) => void;
  incrementUseCount: (id: string) => void;
}

export const useOrgStore = create<OrgState>()(
  persist(
    (set, get) => ({
      organizations: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ organizations: mockOrganizations, initialized: true });
        }
      },
      add: (org) => {
        const newOrg: CommonOrganization = {
          ...org,
          id: generateId(),
          useCount: 1,
        };
        set((state) => ({ organizations: [...state.organizations, newOrg] }));
      },
      incrementUseCount: (id) => {
        set((state) => ({
          organizations: state.organizations.map((o) =>
            o.id === id ? { ...o, useCount: o.useCount + 1 } : o
          ),
        }));
      },
    }),
    {
      name: 'vision-org-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '@/types';
import { defaultSettings } from '@/data/mockData';

interface SettingsState extends AppSettings {
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (settings) => {
        set((state) => ({ ...state, ...settings }));
      },
    }),
    {
      name: 'vision-settings-storage',
    }
  )
);

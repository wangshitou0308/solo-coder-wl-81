import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';
import { mockProfiles } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface ProfileState {
  profiles: UserProfile[];
  activeProfileId: string;
  initialized: boolean;
  initMockData: () => void;
  addProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  updateProfile: (id: string, profile: Partial<UserProfile>) => void;
  deleteProfile: (id: string) => void;
  getProfileById: (id: string) => UserProfile | undefined;
  switchProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profiles: [],
      activeProfileId: 'default',
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ profiles: mockProfiles, activeProfileId: 'default', initialized: true });
        }
      },
      addProfile: (profile) => {
        const newProfile: UserProfile = {
          ...profile,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ profiles: [...state.profiles, newProfile] }));
      },
      updateProfile: (id, profile) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...profile } : p
          ),
        }));
      },
      deleteProfile: (id) => {
        set((state) => ({ profiles: state.profiles.filter((p) => p.id !== id) }));
      },
      getProfileById: (id) => {
        return get().profiles.find((p) => p.id === id);
      },
      switchProfile: (id) => {
        const exists = get().profiles.some((p) => p.id === id);
        if (exists) {
          set({ activeProfileId: id });
        }
      },
    }),
    {
      name: 'vision-profile-storage',
    }
  )
);

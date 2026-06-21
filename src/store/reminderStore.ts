import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Reminder } from '@/types';
import { mockReminders } from '@/data/mockData';
import { generateId } from '@/utils/dateUtils';

interface ReminderState {
  reminders: Reminder[];
  initialized: boolean;
  initMockData: () => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'createdAt'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  getReminderById: (id: string) => Reminder | undefined;
  markRead: (id: string) => void;
  dismiss: (id: string) => void;
}

export const useReminderStore = create<ReminderState>()(
  persist(
    (set, get) => ({
      reminders: [],
      initialized: false,
      initMockData: () => {
        if (!get().initialized) {
          set({ reminders: mockReminders, initialized: true });
        }
      },
      addReminder: (reminder) => {
        const newReminder: Reminder = {
          ...reminder,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ reminders: [newReminder, ...state.reminders] }));
      },
      updateReminder: (id, reminder) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, ...reminder } : r
          ),
        }));
      },
      deleteReminder: (id) => {
        set((state) => ({ reminders: state.reminders.filter((r) => r.id !== id) }));
      },
      getReminderById: (id) => {
        return get().reminders.find((r) => r.id === id);
      },
      markRead: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isRead: true } : r
          ),
        }));
      },
      dismiss: (id) => {
        set((state) => ({
          reminders: state.reminders.map((r) =>
            r.id === id ? { ...r, isDismissed: true } : r
          ),
        }));
      },
    }),
    {
      name: 'vision-reminder-storage',
    }
  )
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '@/src/services/storage/mmkv';
import type { Actions, State, Theme } from '@/src/types/types';

export const useAppStore = create<State & Actions>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme: Theme) => set({ theme }),

      hasOnboarded: false,
      setHasOnboarded: (hasOnboarded: boolean) => set({ hasOnboarded }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: (state) => ({ theme: state.theme, hasOnboarded: state.hasOnboarded }),
    },
  ),
);

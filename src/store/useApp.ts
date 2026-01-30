import { getLocales } from 'expo-localization';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvAdapter } from '@/src/services/storage/mmkv';
import type { AccessibilitySettings, Actions, Language, State, Theme } from '@/src/types/types';
import i18n from '../i18n';

export const useAppStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      language: (getLocales()[0]?.languageCode as Language) ?? 'en',
      setLanguage: (language: Language) => {
        i18n.changeLanguage(language);
        set({ language });
      },

      theme: 'light',
      setTheme: (theme: Theme) => set({ theme }),

      hasOnboarded: false,
      setHasOnboarded: (hasOnboarded: boolean) => set({ hasOnboarded }),

      accessibility: {
        disableLiquidGlass: false,
      },
      setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) =>
        set({ accessibility: { ...get().accessibility, [key]: value } }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: (state) => ({
        theme: state.theme,
        hasOnboarded: state.hasOnboarded,
        language: state.language,
        accessibility: state.accessibility,
      }),
    },
  ),
);

import { getLocales } from 'expo-localization';
import { UnistylesRuntime } from 'react-native-unistyles';
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

      theme: 'system',
      setTheme: (mode: Theme) => {
        set({ theme: mode });

        if (mode === 'system') {
          UnistylesRuntime.setAdaptiveThemes(true);
        } else {
          UnistylesRuntime.setAdaptiveThemes(false);
          UnistylesRuntime.setTheme(mode);
        }
      },

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

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (state.theme === 'system') {
          UnistylesRuntime.setAdaptiveThemes(true);
        } else {
          UnistylesRuntime.setAdaptiveThemes(false);
          UnistylesRuntime.setTheme(state.theme);
        }
      },
    },
  ),
);

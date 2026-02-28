import { getLocales } from 'expo-localization';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { mmkvAdapter } from '@/src/services/storage/mmkv';

import type { AccessibilitySettings, Actions, Language, State, Theme } from '@/src/types/types';
import i18n from '../i18n';

const applyTheme = (mode: Theme) => {
  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
};

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

        applyTheme(mode);
      },

      hasOnboarded: false,
      setHasOnboarded: (hasOnboarded: boolean) => set({ hasOnboarded }),

      accessibility: {
        disableLiquidGlass: false,
        isDyslexicFont: false,
        disableItalics: false,
        highContrastText: false,
        reduceMotion: false,
        disableHaptics: false,
      },
      setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) =>
        set({ accessibility: { ...get().accessibility, [key]: value } }),

      isDemoMode: false,
      toggleDemoMode: () => set((s) => ({ isDemoMode: !s.isDemoMode })),

      isNotificationsEnabled: false,
      reminderTimes: ['09:00', '14:00', '20:00'],
      toggleNotifications: () =>
        set((s) => ({ isNotificationsEnabled: !s.isNotificationsEnabled })),
      addReminderTime: (time: string) =>
        set((s) => {
          if (s.reminderTimes.length >= 4 || s.reminderTimes.includes(time)) return s;
          return { reminderTimes: [...s.reminderTimes, time].sort() };
        }),
      removeReminderTime: (time: string) =>
        set((s) => {
          if (s.reminderTimes.length <= 1) return s;
          return { reminderTimes: s.reminderTimes.filter((t) => t !== time) };
        }),
      updateReminderTime: (oldTime: string, newTime: string) =>
        set((s) => {
          if (newTime === oldTime) return s;
          const filtered = s.reminderTimes.filter((t) => t !== oldTime && t !== newTime);
          return { reminderTimes: [...filtered, newTime].sort() };
        }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: (state) => ({
        theme: state.theme,
        hasOnboarded: state.hasOnboarded,
        language: state.language,
        accessibility: state.accessibility,
        isNotificationsEnabled: state.isNotificationsEnabled,
        reminderTimes: state.reminderTimes,
      }),

      onRehydrateStorage: () => (state) => {
        if (!state) return;

        applyTheme(state.theme);
      },
    },
  ),
);

import { getLocales } from 'expo-localization';
import { UnistylesRuntime } from 'react-native-unistyles';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getSecureItem, saveSecureItem } from '@/src/services/secure-storage/secure-storage';
import { mmkvAdapter } from '@/src/services/storage/mmkv';
import type {
  AccessibilitySettings,
  Actions,
  IntentId,
  Language,
  PreferencesState,
  State,
  Theme,
} from '@/src/types/types';
import i18n from '../i18n';

const TRIAL_KEY = 'mosaic_shadow_trial_start';
const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const applyTheme = (_mode: Theme) => {
  // Temporarily force dark mode
  UnistylesRuntime.setAdaptiveThemes(false);
  UnistylesRuntime.setTheme('dark');
  /*
  if (mode === 'system') {
    UnistylesRuntime.setAdaptiveThemes(true);
  } else {
    UnistylesRuntime.setAdaptiveThemes(false);
    UnistylesRuntime.setTheme(mode);
  }
  */
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

      intents: [],
      setIntents: (intents: IntentId[]) => set({ intents }),

      trialStartDate: null,
      isTrialExpired: false,

      completeOnboarding: async () => {
        const stored = await getSecureItem<number>(TRIAL_KEY);
        if (stored === null) {
          const now = Date.now();
          try {
            await saveSecureItem(TRIAL_KEY, now);
            set({ hasOnboarded: true, trialStartDate: now, isTrialExpired: false });
            return true;
          } catch (err) {
            console.warn('[completeOnboarding] failed to save trial start date', err);
            return false;
          }
        } else {
          set({ hasOnboarded: true });
          return true;
        }
      },

      hydrateTrialStatus: async () => {
        const storedDate = await getSecureItem<number>(TRIAL_KEY);
        if (storedDate !== null) {
          const hasExpired = Date.now() - storedDate >= TRIAL_DURATION_MS;
          set({ trialStartDate: storedDate, isTrialExpired: hasExpired });
        } else {
          set({ trialStartDate: null, isTrialExpired: false });
        }
      },

      accessibility: {
        disableLiquidGlass: false,
        isDyslexicFont: false,
        disableItalics: false,
        highContrastText: false,
        reduceMotion: false,
        disableHaptics: false,
      },
      setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) => {
        set({ accessibility: { ...get().accessibility, [key]: value } });
      },

      preferences: {
        firstDayOfWeek: 'sunday',
        timeFormat: 'device',
        hideStreaks: false,
      },
      setPreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => {
        set((s) => ({ preferences: { ...s.preferences, [key]: value } }));
      },

      isDemoMode: false,
      toggleDemoMode: () => set((s) => ({ isDemoMode: !s.isDemoMode })),

      isDeveloperModeEnabled: false,
      setDeveloperMode: (enabled: boolean) => set({ isDeveloperModeEnabled: enabled }),

      isNotificationsEnabled: false,
      isSurpriseMeEnabled: false,
      reminderTimes: ['10:00'],
      toggleNotifications: () =>
        set((s) => ({ isNotificationsEnabled: !s.isNotificationsEnabled })),
      toggleSurpriseMe: () => set((s) => ({ isSurpriseMeEnabled: !s.isSurpriseMeEnabled })),
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

      isAppLockEnabled: false,
      justEnabledBiometrics: false,
      isAuthenticating: false,
      toggleAppLock: (enabled: boolean) => set({ isAppLockEnabled: enabled }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => mmkvAdapter),
      partialize: (state) => ({
        theme: state.theme,
        hasOnboarded: state.hasOnboarded,
        intents: state.intents,
        language: state.language,
        accessibility: state.accessibility,
        preferences: state.preferences,
        isDeveloperModeEnabled: state.isDeveloperModeEnabled,
        isNotificationsEnabled: state.isNotificationsEnabled,
        isSurpriseMeEnabled: state.isSurpriseMeEnabled,
        reminderTimes: state.reminderTimes,
        isAppLockEnabled: state.isAppLockEnabled,
      }),

      merge: (persisted, current) => {
        const p = persisted as Partial<State & Actions>;
        return {
          ...current,
          ...p,
          // Deep-merge so new default keys are never dropped when the persisted
          // snapshot pre-dates a new field being added.
          accessibility: { ...current.accessibility, ...(p.accessibility ?? {}) },
          preferences: { ...current.preferences, ...(p.preferences ?? {}) },
        };
      },

      onRehydrateStorage: () => (state) => {
        if (!state) return;
        applyTheme(state.theme);
      },
    },
  ),
);

export type Theme = 'light' | 'dark' | 'system';

export type IntentId = 'mood_patterns' | 'stress_triggers' | 'therapy_tracking' | 'private_vent';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
  intents: IntentId[];
  trialStartDate: number | null;
  isTrialExpired: boolean;
  language: Language;
  accessibility: AccessibilitySettings;
  preferences: PreferencesState;
  isDemoMode: boolean;
  isDeveloperModeEnabled: boolean;
  isNotificationsEnabled: boolean;
  isSurpriseMeEnabled: boolean;
  reminderTimes: string[];
  isAppLockEnabled: boolean;
  justEnabledBiometrics: boolean;
  isAuthenticating: boolean;
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setIntents: (intents: IntentId[]) => void;
  completeOnboarding: () => Promise<boolean>;
  hydrateTrialStatus: () => Promise<void>;
  setLanguage: (language: Language) => void;
  setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  setPreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void;
  toggleDemoMode: () => void;
  setDeveloperMode: (enabled: boolean) => void;
  toggleNotifications: () => void;
  toggleSurpriseMe: () => void;
  addReminderTime: (time: string) => void;
  removeReminderTime: (time: string) => void;
  updateReminderTime: (oldTime: string, newTime: string) => void;
  toggleAppLock: (enabled: boolean) => void;
};

export type Language = 'en' | 'es';

export interface AccessibilitySettings {
  disableLiquidGlass: boolean;
  isDyslexicFont: boolean;
  disableItalics: boolean;
  highContrastText: boolean;
  reduceMotion: boolean;
  disableHaptics: boolean;
}

export interface PreferencesState {
  firstDayOfWeek: 'sunday' | 'monday';
  timeFormat: 'device' | '12h' | '24h';
  hideStreaks: boolean;
}

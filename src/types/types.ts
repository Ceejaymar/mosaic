export type Theme = 'light' | 'dark' | 'system';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
  language: Language;
  accessibility: AccessibilitySettings;
  preferences: PreferencesState;
  isDemoMode: boolean;
  isNotificationsEnabled: boolean;
  isSurpriseMeEnabled: boolean;
  reminderTimes: string[];
  isAppLockEnabled: boolean;
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setLanguage: (language: Language) => void;
  setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  setPreference: <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) => void;
  toggleDemoMode: () => void;
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

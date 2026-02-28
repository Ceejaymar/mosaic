export type Theme = 'light' | 'dark' | 'system';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
  language: Language;
  accessibility: AccessibilitySettings;
  isDemoMode: boolean;
  isNotificationsEnabled: boolean;
  reminderTimes: string[];
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setLanguage: (language: Language) => void;
  setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) => void;
  toggleDemoMode: () => void;
  toggleNotifications: () => void;
  addReminderTime: (time: string) => void;
  removeReminderTime: (time: string) => void;
  updateReminderTime: (oldTime: string, newTime: string) => void;
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

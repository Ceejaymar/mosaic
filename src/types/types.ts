export type Theme = 'light' | 'dark';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
  language: Language;
  accessibility: AccessibilitySettings;
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setLanguage: (language: Language) => void;
  setAccessibilitySetting: (key: keyof AccessibilitySettings, value: boolean) => void;
};

export type Language = 'en' | 'es';

export interface AccessibilitySettings {
  disableLiquidGlass: boolean;
}

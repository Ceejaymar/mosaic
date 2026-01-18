export type Theme = 'light' | 'dark';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
  language: Language;
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
  setLanguage: (language: Language) => void;
};

export type Language = 'en' | 'es';

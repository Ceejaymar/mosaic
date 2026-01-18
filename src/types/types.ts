export type Theme = 'light' | 'dark';

export type State = {
  theme: Theme;
  hasOnboarded: boolean;
};

export type Actions = {
  setTheme: (theme: Theme) => void;
  setHasOnboarded: (hasOnboarded: boolean) => void;
};

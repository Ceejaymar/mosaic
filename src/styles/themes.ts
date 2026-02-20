const lightTheme = {
  isDark: false as const,
  colors: {
    background: '#ffffff',
    typography: '#000000',
    textMuted: '#8E8E93',
    surface: '#F2F2F7',
    divider: '#D1D1D6',
    mosaicGold: '#E0C097',
    lightGrey: '#808080',
    headerGradient: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.1)'],
    tabBarGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
  },
};

const darkTheme = {
  isDark: true as const,
  colors: {
    background: '#000000',
    typography: '#ffffff',
    textMuted: '#8E8E93',
    surface: '#1C1C1E',
    divider: '#3A3A3C',
    mosaicGold: '#E0C097',
    lightGrey: '#808080',
    headerGradient: ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.1)'],
    tabBarGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
  },
};

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

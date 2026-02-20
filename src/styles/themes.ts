const lightTheme = {
  isDark: false as const,
  colors: {
    background: '#ffffff',
    typography: '#000000',
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
    lightGrey: '#808080',
    headerGradient: ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.1)'],
    tabBarGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
  },
};

// #f2b949'

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

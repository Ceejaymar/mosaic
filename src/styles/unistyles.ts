import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { appThemes } from './themes';

const settings = {
  // initialTheme: () => {
  //   return storage.getString('preferredTheme') ?? 'dark';
  // adaptiveThemes: true,  // cant use with initialTheme
  // },
};

type AppThemes = typeof appThemes;
type AppBreakpoints = typeof breakpoints;

declare module 'react-native-unistyles' {
  export interface UnistylesThemes extends AppThemes {}
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

StyleSheet.configure({
  themes: appThemes,
  breakpoints,
  settings,
});

import { StyleSheet } from 'react-native-unistyles';

import { breakpoints } from './breakpoints';
import { appThemes } from './themes';

const settings = {
  adaptiveThemes: true,
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

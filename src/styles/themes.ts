import { FONT_SIZE, RADIUS, SPACING } from './design-tokens';

// ─── Shared Design Tokens ─────────────────────────────────────────────────────
// Spacing, radius, and font-size are theme-invariant — same values in light and
// dark. Spreading them into each theme object makes them accessible as
// `theme.spacing`, `theme.radius`, and `theme.fontSize` in every Unistyles
// stylesheet, with full TypeScript inference.

const sharedTokens = {
  spacing: SPACING,
  radius: RADIUS,
  fontSize: FONT_SIZE,
} as const;

// ─── Light Theme ──────────────────────────────────────────────────────────────

const lightTheme = {
  isDark: false as const,
  ...sharedTokens,
  colors: {
    background: '#ffffff',
    typography: '#000000',
    textMuted: '#8E8E93',
    surface: '#F2F2F7',
    divider: '#D1D1D6',
    mosaicGold: '#E0C097',
    lightGrey: '#808080',
    /** Dark text for use on accent/gold backgrounds */
    onAccent: '#050505',
    /** Card background that differs from page background */
    tileBackground: '#ffffff',
    /** Shadow color for cards (brand-tinted) */
    tileShadowColor: '#E0C097',
    /** Destructive action color (delete, remove) */
    destructive: '#FF3B30',
    headerGradient: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.1)'],
    tabBarGradient: ['rgba(255,255,255,0)', 'rgba(255,255,255,0.9)'],
    /** Tab bar label/icon when not selected (light background) */
    tabInactive: 'rgba(0,0,0,0.45)',
    /** Light (white-tinted) overlay — gradient highlights, surface shimmer */
    overlayLight: 'rgba(255,255,255,0.12)',
    /** Dark (black-tinted) overlay — tile scrims, shadow gradients */
    overlayDark: 'rgba(0,0,0,0.12)',
    /** Full modal backdrop overlay */
    modalOverlay: 'rgba(0,0,0,0.5)',
  },
};

// ─── Dark Theme ───────────────────────────────────────────────────────────────

const darkTheme = {
  isDark: true as const,
  ...sharedTokens,
  colors: {
    background: '#000000',
    typography: '#ffffff',
    textMuted: '#8E8E93',
    surface: '#1C1C1E',
    divider: '#3A3A3C',
    mosaicGold: '#E0C097',
    lightGrey: '#808080',
    /** Dark text for use on accent/gold backgrounds */
    onAccent: '#050505',
    /** Card background that differs from page background */
    tileBackground: '#1C1C1E',
    /** Shadow color for cards — transparent in dark mode */
    tileShadowColor: 'transparent',
    /** Destructive action color (delete, remove) */
    destructive: '#FF3B30',
    headerGradient: ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.1)'],
    tabBarGradient: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.9)'],
    /** Tab bar label/icon when not selected (dark background) */
    tabInactive: 'rgba(255,255,255,0.45)',
    /** Light (white-tinted) overlay — gradient highlights, surface shimmer */
    overlayLight: 'rgba(255,255,255,0.12)',
    /** Dark (black-tinted) overlay — tile scrims, shadow gradients (stronger in dark) */
    overlayDark: 'rgba(0,0,0,0.20)',
    /** Full modal backdrop overlay */
    modalOverlay: 'rgba(0,0,0,0.5)',
  },
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const appThemes = {
  light: lightTheme,
  dark: darkTheme,
};

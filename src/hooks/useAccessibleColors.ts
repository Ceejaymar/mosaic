import { useUnistyles } from 'react-native-unistyles';

import { useAppStore } from '@/src/store/useApp';

// HC override values mirror the former high-contrast theme definitions.
const HC_LIGHT = { textMuted: '#333333', divider: '#9A9A9A' } as const;
const HC_DARK = { textMuted: '#E0E0E0', divider: '#7A7A7F' } as const;

/**
 * Returns theme.colors with textMuted and divider overridden when the user
 * has enabled High Contrast Text. All other color tokens are passed through
 * unchanged. This replaces the former lightHighContrast / darkHighContrast
 * Unistyles themes, avoiding a global re-render on toggle.
 *
 * Usage:
 *   const colors = useAccessibleColors();
 *   <View style={{ borderColor: colors.divider }} />
 */
export function useAccessibleColors() {
  const { theme } = useUnistyles();
  // Granular selector: only re-renders when highContrastText changes.
  const highContrastText = useAppStore((s) => s.accessibility.highContrastText);

  if (!highContrastText) {
    return theme.colors;
  }

  const hc = theme.isDark ? HC_DARK : HC_LIGHT;

  return {
    ...theme.colors,
    textMuted: hc.textMuted,
    divider: hc.divider,
  };
}

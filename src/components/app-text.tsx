import { forwardRef } from 'react';
import { Text, type TextProps } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import { FONT_SIZE, LETTER_SPACING } from '@/src/styles/design-tokens';
import { getFontFamily } from '@/src/utils/typography';

type SizeVariant = keyof typeof FONT_SIZE;

/** Auto letter-spacing per size tier. */
const SIZE_LETTER_SPACING: Record<SizeVariant, number> = {
  xs: LETTER_SPACING.normal,
  sm: LETTER_SPACING.normal,
  md: LETTER_SPACING.normal,
  base: LETTER_SPACING.normal,
  lg: LETTER_SPACING.normal,
  xl: LETTER_SPACING.tight,
  '2xl': LETTER_SPACING.tight,
  display: LETTER_SPACING.tight,
};

type AppTextProps = TextProps & {
  /** FONT_SIZE token key — sets fontSize + letterSpacing automatically. */
  variant?: SizeVariant;
  /** Font family. Default: 'body' (system). */
  font?: 'body' | 'heading' | 'mono';
  colorVariant?: 'primary' | 'muted' | 'onAccent';
};

export const AppText = forwardRef<Text, AppTextProps>(function AppText(
  { variant, font = 'body', colorVariant, style, ...rest },
  ref,
) {
  const { isDyslexicFont, disableItalics } = useAppStore(
    useShallow((s) => ({
      isDyslexicFont: s.accessibility.isDyslexicFont,
      disableItalics: s.accessibility.disableItalics,
    })),
  );

  const colors = useAccessibleColors();

  // Lowest layer: variant-derived size + letter-spacing (caller style wins over these).
  const base = variant
    ? { fontSize: FONT_SIZE[variant], letterSpacing: SIZE_LETTER_SPACING[variant] }
    : undefined;

  // Highest layer: a11y always wins — font family, italic suppression, color.
  const a11y: Record<string, unknown> = {};
  const resolvedFont = getFontFamily(font, isDyslexicFont);
  if (resolvedFont) a11y.fontFamily = resolvedFont;
  if (disableItalics) a11y.fontStyle = 'normal';
  if (colorVariant === 'muted') a11y.color = colors.textMuted;
  if (colorVariant === 'primary') a11y.color = colors.typography;
  if (colorVariant === 'onAccent') a11y.color = colors.onAccent;

  return <Text ref={ref} style={[base, style, a11y]} {...rest} />;
});

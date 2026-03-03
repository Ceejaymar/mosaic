import { forwardRef } from 'react';
import { Text, type TextProps } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import { getFontFamily } from '@/src/utils/typography';

type AppTextProps = TextProps & {
  variant?: 'heading' | 'body' | 'mono';
  colorVariant?: 'primary' | 'muted' | 'onAccent';
};

export const AppText = forwardRef<Text, AppTextProps>(function AppText(
  { variant = 'body', colorVariant, style, ...rest },
  ref,
) {
  const { isDyslexicFont, disableItalics } = useAppStore(
    useShallow((s) => ({
      isDyslexicFont: s.accessibility.isDyslexicFont,
      disableItalics: s.accessibility.disableItalics,
    })),
  );

  const colors = useAccessibleColors();

  const injected: { fontFamily?: string; fontStyle?: 'normal' | 'italic'; color?: string } = {};

  const resolvedFontFamily = getFontFamily(variant, isDyslexicFont);
  if (resolvedFontFamily) injected.fontFamily = resolvedFontFamily;

  if (disableItalics) injected.fontStyle = 'normal';

  if (colorVariant === 'muted') injected.color = colors.textMuted;
  else if (colorVariant === 'primary') injected.color = colors.typography;

  return <Text ref={ref} style={[style, injected]} {...rest} />;
});

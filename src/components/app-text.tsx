import { forwardRef } from 'react';
import { Text, type TextProps } from 'react-native';

import { useAppStore } from '@/src/store/useApp';
import { getFontFamily } from '@/src/utils/typography';

type AppTextProps = TextProps & {
  variant?: 'heading' | 'body' | 'mono';
};

export const AppText = forwardRef<Text, AppTextProps>(function AppText(
  { variant = 'body', style, ...rest },
  ref,
) {
  const isDyslexicFont = useAppStore((s) => s.accessibility.isDyslexicFont);
  const disableItalics = useAppStore((s) => s.accessibility.disableItalics);

  const injected: { fontFamily?: string; fontStyle?: 'normal' | 'italic' } = {};

  const resolvedFontFamily = getFontFamily(variant, isDyslexicFont);
  if (resolvedFontFamily) {
    injected.fontFamily = resolvedFontFamily;
  }

  if (disableItalics) {
    injected.fontStyle = 'normal';
  }

  return <Text ref={ref} style={[style, injected]} {...rest} />;
});

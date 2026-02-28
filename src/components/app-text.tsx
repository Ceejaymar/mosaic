import { StyleSheet, Text, type TextProps } from 'react-native';

import { useAppStore } from '@/src/store/useApp';
import { getFontFamily, getFontStyle } from '@/src/utils/typography';

type AppTextProps = TextProps & {
  variant?: 'heading' | 'body' | 'mono';
};

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  const isDyslexicFont = useAppStore((s) => s.accessibility.isDyslexicFont);
  const disableItalics = useAppStore((s) => s.accessibility.disableItalics);

  const flat = StyleSheet.flatten(style) ?? {};

  const injected = {
    fontFamily: getFontFamily(variant, isDyslexicFont),
    fontStyle: getFontStyle((flat.fontStyle as 'normal' | 'italic') ?? 'normal', disableItalics),
  };

  return <Text style={[style, injected]} {...rest} />;
}

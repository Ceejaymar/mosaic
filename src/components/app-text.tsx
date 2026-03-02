import { Text, type TextProps } from 'react-native';

import { useAppStore } from '@/src/store/useApp';
import { getFontFamily } from '@/src/utils/typography';

type AppTextProps = TextProps & {
  variant?: 'heading' | 'body' | 'mono';
};

export function AppText({ variant = 'body', style, ...rest }: AppTextProps) {
  const isDyslexicFont = useAppStore((s) => s.accessibility.isDyslexicFont);
  const disableItalics = useAppStore((s) => s.accessibility.disableItalics);

  const injected: { fontFamily?: string; fontStyle?: 'normal' | 'italic' } = {
    fontFamily: getFontFamily(variant, isDyslexicFont),
  };

  if (disableItalics) {
    injected.fontStyle = 'normal';
  }

  return <Text style={[style, injected]} {...rest} />;
}

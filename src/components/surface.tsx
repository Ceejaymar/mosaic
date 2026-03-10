import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type SurfaceVariant = 'card' | 'sheet';

type Props = ViewProps & {
  /** Border radius variant. 'card' = radius.card (16), 'sheet' = radius.sheet (20). Default: 'card'. */
  variant?: SurfaceVariant;
  /** Show a 1px border using theme.colors.divider. Default: true. */
  bordered?: boolean;
  children?: ReactNode;
};

export function Surface({ variant = 'card', bordered = true, style, children, ...rest }: Props) {
  return (
    <View style={[styles.base(variant, bordered), style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: (variant: SurfaceVariant, bordered: boolean) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: variant === 'card' ? theme.radius.card : theme.radius.sheet,
    overflow: 'hidden',
    ...(bordered && {
      borderWidth: 1,
      borderColor: theme.colors.divider,
    }),
  }),
}));

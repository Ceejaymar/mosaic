import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** `'primary'` = gold fill (default), `'secondary'` = surface + border, `'ghost'` = transparent. */
  variant?: 'primary' | 'secondary' | 'ghost';
  /** `'sm'` uses smaller vertical padding and fixed horizontal padding; `'md'` (default) is full-width. */
  size?: 'sm' | 'md';
  /** Adds a color-tinted drop shadow. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function AppButton({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  elevated = false,
  style,
  accessibilityLabel,
}: Props) {
  const colors = useAccessibleColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base(disabled, variant, size, elevated),
        pressed && !disabled && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <AppText style={styles.label(disabled, variant, size, colors.textMuted)}>{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: (
    disabled: boolean,
    variant: 'primary' | 'secondary' | 'ghost',
    size: 'sm' | 'md',
    elevated: boolean,
  ) => ({
    borderRadius: theme.radius.pill,
    paddingVertical: size === 'sm' ? theme.spacing[3] : theme.spacing[4],
    paddingHorizontal: size === 'sm' ? theme.spacing[6] : 0,
    alignItems: 'center' as const,
    backgroundColor: disabled
      ? theme.colors.surface
      : variant === 'primary'
        ? theme.colors.mosaicGold
        : variant === 'secondary'
          ? theme.colors.surface
          : 'transparent',
    borderWidth: variant === 'secondary' ? 1 : 0,
    borderColor: theme.colors.divider,
    ...(elevated && {
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    }),
  }),
  label: (
    disabled: boolean,
    variant: 'primary' | 'secondary' | 'ghost',
    size: 'sm' | 'md',
    textMuted: string,
  ) => ({
    fontSize: size === 'sm' ? theme.fontSize.md : theme.fontSize.base,
    fontWeight: '600' as const,
    color: disabled
      ? textMuted
      : variant === 'primary'
        ? theme.colors.onAccent
        : theme.colors.typography,
  }),
}));

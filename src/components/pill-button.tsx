import { Pressable, type StyleProp, Text, type ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** `'sm'` uses smaller vertical padding and fixed horizontal padding; `'md'` (default) is full-width. */
  size?: 'sm' | 'md';
  /** Adds a color-tinted drop shadow. */
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

export function PillButton({
  label,
  onPress,
  disabled = false,
  size = 'md',
  elevated = false,
  style,
  accessibilityLabel,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.base(disabled, size, elevated),
        pressed && !disabled && { opacity: 0.88, transform: [{ scale: 0.97 }] },
        style,
      ]}
    >
      <Text style={styles.label(disabled, size)}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: (disabled: boolean, size: 'sm' | 'md', elevated: boolean) => ({
    borderRadius: 100,
    paddingVertical: size === 'sm' ? 12 : 16,
    paddingHorizontal: size === 'sm' ? 24 : 0,
    alignItems: 'center',
    backgroundColor: disabled ? theme.colors.surface : theme.colors.mosaicGold,
    ...(elevated && {
      shadowColor: theme.colors.typography,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
    }),
  }),
  label: (disabled: boolean, size: 'sm' | 'md') => ({
    fontSize: size === 'sm' ? 15 : 17,
    fontWeight: '600' as const,
    color: disabled ? theme.colors.textMuted : theme.colors.onAccent,
  }),
}));

import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type SurfaceVariant = 'card' | 'sheet';

type Props = ViewProps & {
  /** Border radius variant. 'card' = radius.card (16), 'sheet' = radius.sheet (20). Default: 'card'. */
  variant?: SurfaceVariant;
  /** Show a 0.5px border. Dark: rgba(255,255,255,0.1). Light: rgba(0,0,0,0.08). Default: true. */
  bordered?: boolean;
  /**
   * Override the default surface shimmer gradient. Pass an accent/mood gradient here
   * to avoid stacking a second LinearGradient inside the child.
   */
  surfaceGradientColors?: readonly string[];
  children?: ReactNode;
};

// Default: top-left highlight → transparent → bottom-right shadow.
// The white shimmer reads as elevation on dark surfaces; barely perceptible on light.
const SURFACE_GRADIENT = ['rgba(255,255,255,0.08)', 'transparent', 'rgba(0,0,0,0.04)'] as const;

export function Surface({
  variant = 'card',
  bordered = true,
  surfaceGradientColors,
  style,
  children,
  ...rest
}: Props) {
  const { theme } = useUnistyles();
  const resolvedGradient = surfaceGradientColors ?? SURFACE_GRADIENT;
  const borderStyle = bordered
    ? {
        borderWidth: 0.5,
        borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
      }
    : undefined;

  return (
    <View style={[styles.base(variant), borderStyle, style]} {...rest}>
      <LinearGradient
        colors={resolvedGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  base: (variant: SurfaceVariant) => ({
    backgroundColor: theme.colors.surface,
    borderRadius: variant === 'card' ? theme.radius.card : theme.radius.sheet,
    overflow: 'hidden',
  }),
}));

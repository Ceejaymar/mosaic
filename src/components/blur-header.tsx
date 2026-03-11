import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

type Props = {
  scrollY: SharedValue<number>;
  children?: ReactNode;
  /** Scroll range over which the blur fades in. Defaults to [20, 70]. */
  fadeRange?: [number, number];
};

export function BlurHeader({ scrollY, children, fadeRange = [20, 70] }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const blurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, fadeRange, [0, 1], Extrapolation.CLAMP),
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, blurStyle]} pointerEvents="none">
        <BlurView
          intensity={80}
          tint={theme.isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
}));

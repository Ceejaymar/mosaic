import { Pressable } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAppStore } from '@/src/store/useApp';

type Props = {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Emotion({ label, color, isSelected, onPress }: Props) {
  const { theme } = useUnistyles();
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  const animStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: isSelected ? color : 'transparent',
      borderColor: isSelected ? color : 'rgba(150, 150, 150, 0.2)',
      transform: [{ scale: withSpring(isSelected ? 1.05 : 1, { reduceMotion: rm }) }],
    };
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={label}
      style={[styles.container, animStyle]}
    >
      <AppText
        variant="heading"
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: isSelected ? theme.colors.onAccent : theme.colors.textMuted,
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
      >
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    width: '31%', // Gives enough room to scale up without hitting the parent's overflow mask
    paddingVertical: theme.spacing[3],
    borderRadius: theme.radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  text: {
    fontSize: theme.fontSize.sm,
    textTransform: 'capitalize',
    includeFontPadding: false,
  },
}));

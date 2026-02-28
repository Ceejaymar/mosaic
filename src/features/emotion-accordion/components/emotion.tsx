import { Pressable, Text } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';

import { useAppStore } from '@/src/store/useApp';

type Props = {
  label: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Emotion({ label, color, isSelected, onPress }: Props) {
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
      <Text
        numberOfLines={1}
        style={[
          styles.text,
          {
            color: isSelected ? '#050505' : '#888888',
            fontWeight: isSelected ? '700' : '600',
          },
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '31%', // Gives enough room to scale up without hitting the parent's overflow mask
    paddingVertical: 12,
    borderRadius: 100,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 13,
    textTransform: 'capitalize',
    includeFontPadding: false,
    fontFamily: 'Fraunces',
  },
});

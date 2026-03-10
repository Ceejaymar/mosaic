import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { LAYOUT } from '@/src/constants/layout';
import { emitOpenCheckInSheet } from '@/src/features/check-in/check-in-sheet-events';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';

const FAB_SIZE = 60;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MainFab() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    hapticLight();
    emitOpenCheckInSheet();
  };

  const safeBottom = Math.max(insets.bottom, 12);

  const fabBottom = safeBottom + LAYOUT.TAB_BAR_HEIGHT / 2 - 20;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        scale.value = withSpring(0.92, { reduceMotion: rm });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { reduceMotion: rm });
      }}
      style={[
        styles.fab,
        {
          backgroundColor: theme.colors.mosaicGold,
          shadowColor: theme.colors.typography,
          bottom: fabBottom,
        },
        fabAnimatedStyle,
      ]}
    >
      <Ionicons name="add" size={32} color={theme.colors.onAccent} />
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    left: '50%',
    marginLeft: -(FAB_SIZE / 2),
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { Alert, Pressable } from 'react-native';
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
import { CHECK_IN_CONSTANTS } from '@/src/features/check-in/constants/check-in';
import { useTodayCheckIns } from '@/src/features/check-in/hooks/useCheckIns';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { hapticLight } from '@/src/lib/haptics/haptics';
import { useAppStore } from '@/src/store/useApp';

const FAB_SIZE = 60;
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MainFab() {
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const insets = useSafeAreaInsets();
  const scale = useSharedValue(1);
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;
  const { todayEntries } = useTodayCheckIns();
  const isLimitReached = todayEntries.length >= CHECK_IN_CONSTANTS.MAX_DAILY_ENTRIES;

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    if (isLimitReached) {
      Alert.alert(
        'Daily Limit Reached',
        'You have already logged your 4 check-ins for today. Great job!',
      );
      return;
    }
    hapticLight();
    emitOpenCheckInSheet();
  };

  const safeBottom = Math.max(insets.bottom, 12);
  const fabBottom = safeBottom + LAYOUT.TAB_BAR_HEIGHT / 2 - 20;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={() => {
        if (!isLimitReached) scale.value = withSpring(0.92, { reduceMotion: rm });
      }}
      onPressOut={() => {
        if (!isLimitReached) scale.value = withSpring(1, { reduceMotion: rm });
      }}
      style={[
        styles.fab,
        isLimitReached
          ? {
              backgroundColor: theme.colors.surface,
              borderColor: colors.divider,
              shadowOpacity: 0,
              elevation: 0,
              bottom: fabBottom,
            }
          : {
              backgroundColor: theme.colors.mosaicGold,
              shadowColor: theme.colors.shadow,
              bottom: fabBottom,
            },
        fabAnimatedStyle,
      ]}
    >
      {!isLimitReached && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.25)', 'rgba(0, 0, 0, 0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
          pointerEvents="none"
        />
      )}
      <Ionicons
        name="add"
        size={32}
        color={isLimitReached ? colors.textMuted : theme.colors.onAccent}
      />
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
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

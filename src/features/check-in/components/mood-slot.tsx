import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, View } from 'react-native';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { AppText } from '@/src/components/app-text';
import { useAccessibleColors } from '@/src/hooks/useAccessibleColors';
import { useAppStore } from '@/src/store/useApp';
import type { TimeSlot } from '../utils/time-of-day';
import { getTimeSlotLabel } from '../utils/time-of-day';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  slot: TimeSlot;
  isCurrentSlot: boolean;
  moodColor?: string;
  moodLabel?: string;
  onPress: () => void;
};

export function MoodSlot({ slot, isCurrentSlot, moodColor, moodLabel, onPress }: Props) {
  const { theme } = useUnistyles();
  const colors = useAccessibleColors();
  const scale = useSharedValue(1);
  const isFilled = !!moodColor;
  const reduceMotion = useAppStore((s) => s.accessibility.reduceMotion);
  const rm = reduceMotion ? ReduceMotion.Always : ReduceMotion.System;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300, reduceMotion: rm });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200, reduceMotion: rm });
      }}
      style={[
        styles.tile,
        { borderColor: colors.divider },
        animatedStyle,
        isFilled && { borderColor: `${moodColor}50` },
        isCurrentSlot && !isFilled && { borderColor: colors.textMuted },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${getTimeSlotLabel(slot)}${moodLabel ? `, ${moodLabel}` : ', tap to check in'}`}
    >
      <LinearGradient
        colors={
          isFilled
            ? [`${moodColor}99`, `${moodColor}22`, 'transparent']
            : isCurrentSlot
              ? [`${theme.colors.mosaicGold}B3`, `${theme.colors.mosaicGold}33`, 'transparent']
              : [theme.colors.overlayLight, 'transparent', 'transparent']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.accentStrip}
      />

      <View style={styles.content}>
        <AppText
          font="mono"
          style={[styles.slotLabel, { color: colors.textMuted }, isFilled && { color: moodColor }]}
        >
          {getTimeSlotLabel(slot).toUpperCase()}
        </AppText>

        <View style={styles.statusArea}>
          {isFilled ? (
            <>
              <View style={[styles.statusDot, { backgroundColor: moodColor }]} />
              <AppText
                font="heading"
                style={[styles.moodLabel, { color: moodColor }]}
                numberOfLines={1}
              >
                {moodLabel}
              </AppText>
            </>
          ) : isCurrentSlot ? (
            <AppText style={styles.nowLabel}>now</AppText>
          ) : (
            <AppText style={[styles.emptyDash, { color: colors.divider }]}>—</AppText>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    flex: 1,
    minHeight: 152,
    backgroundColor: theme.colors.tileBackground,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: theme.colors.tileShadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: theme.isDark ? 0 : 2,
  },
  accentStrip: { height: 1, width: '100%' },
  content: { flex: 1, padding: theme.spacing[4], justifyContent: 'space-between' },
  slotLabel: { fontSize: theme.fontSize.xs, fontWeight: '600', letterSpacing: 1.2 },
  statusArea: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  moodLabel: { fontSize: 16, fontWeight: '600', flex: 1 },
  nowLabel: { fontSize: theme.fontSize.sm, color: theme.colors.mosaicGold, fontWeight: '500' },
  emptyDash: { fontSize: theme.fontSize.lg, fontWeight: '300' },
}));

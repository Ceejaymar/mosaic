import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { StyleSheet } from 'react-native-unistyles';
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
  const scale = useSharedValue(1);
  const isFilled = !!moodColor;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 200 });
      }}
      style={[
        styles.tile,
        animatedStyle,
        isFilled && { borderColor: `${moodColor}50` },
        isCurrentSlot && !isFilled && styles.currentTile,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${getTimeSlotLabel(slot)}${moodLabel ? `, ${moodLabel}` : ', tap to check in'}`}
    >
      <View
        style={[
          styles.accentStrip,
          { backgroundColor: isFilled ? moodColor : isCurrentSlot ? '#E0C097' : 'transparent' },
        ]}
      />

      <View style={styles.content}>
        <Text style={[styles.slotLabel, isFilled && { color: moodColor }]}>
          {getTimeSlotLabel(slot).toUpperCase()}
        </Text>

        <View style={styles.statusArea}>
          {isFilled ? (
            <>
              <View style={[styles.statusDot, { backgroundColor: moodColor }]} />
              <Text style={[styles.moodLabel, { color: moodColor }]} numberOfLines={1}>
                {moodLabel}
              </Text>
            </>
          ) : isCurrentSlot ? (
            <Text style={styles.nowLabel}>now</Text>
          ) : (
            <Text style={styles.emptyDash}>—</Text>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  tile: {
    flex: 1,
    minHeight: 150,
    // Safely mixes background mapping depending on light/dark mode preference
    backgroundColor: theme.isDark ? theme.colors.surface : theme.colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.divider,
    overflow: 'hidden',
    shadowColor: theme.isDark ? 'transparent' : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: theme.isDark ? 0 : 2,
  },
  currentTile: {
    // Uses textMuted for a slightly more prominent border than the standard divider
    borderColor: theme.colors.textMuted,
  },
  accentStrip: { height: 3, width: '100%' },
  content: { flex: 1, padding: 16, justifyContent: 'space-between' },
  slotLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 1.2, color: theme.colors.textMuted },
  statusArea: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  moodLabel: { fontSize: 16, fontWeight: '600', fontFamily: 'Fraunces', flex: 1 },
  nowLabel: { fontSize: 13, color: theme.colors.mosaicGold, fontWeight: '500' },
  emptyDash: { fontSize: 20, color: theme.colors.divider, fontWeight: '300' },
}));

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
        isFilled && { borderColor: `${moodColor ?? ''}50` },
        isCurrentSlot && !isFilled && styles.currentTile,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${getTimeSlotLabel(slot)}${moodLabel ? `, ${moodLabel}` : ', tap to check in'}`}
    >
      {/* Top accent strip */}
      <View
        style={[
          styles.accentStrip,
          {
            backgroundColor: isFilled ? moodColor : isCurrentSlot ? '#E0C097' : 'transparent',
          },
        ]}
      />

      <View style={styles.content}>
        {/* Slot label */}
        <Text style={[styles.slotLabel, isFilled && { color: moodColor }]}>
          {getTimeSlotLabel(slot).toUpperCase()}
        </Text>

        {/* Status */}
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

const styles = StyleSheet.create((theme) => {
  const isDark = theme.isDark;
  return {
    tile: {
      flex: 1,
      minHeight: 150,
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDark ? '#2C2C2E' : '#E5E5EA',
      overflow: 'hidden',
      shadowColor: isDark ? 'transparent' : '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 12,
      elevation: isDark ? 0 : 2,
    },
    currentTile: {
      borderColor: isDark ? '#3A3A3C' : '#D0D0D5',
    },
    accentStrip: {
      height: 3,
      width: '100%',
    },
    content: {
      flex: 1,
      padding: 16,
      justifyContent: 'space-between',
    },
    slotLabel: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.2,
      color: '#8E8E93',
    },
    statusArea: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },
    statusDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    moodLabel: {
      fontSize: 16,
      fontWeight: '600',
      fontFamily: 'Fraunces',
      flex: 1,
    },
    nowLabel: {
      fontSize: 13,
      color: '#E0C097',
      fontWeight: '500',
    },
    emptyDash: {
      fontSize: 20,
      color: isDark ? '#3A3A3C' : '#D0D0D5',
      fontWeight: '300',
    },
  };
});

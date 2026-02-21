import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import { formatTime } from '@/src/features/check-in/utils/format-time';

const SQUIRCLE_SIZE = 16;
const FADE_WIDTH = 20;

type Props = {
  occurredAt: string;
  label: string;
  color: string;
  tags: string[];
  onPress: () => void;
};

export function CheckInHistoryRow({ occurredAt, label, color, tags, onPress }: Props) {
  const { theme } = useUnistyles();
  const formattedTime = formatTime(occurredAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`${label} at ${formattedTime}, tap to edit`}
    >
      <Text style={styles.time}>{formattedTime}</Text>

      <View style={[styles.squircle, { backgroundColor: color }]} />

      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>

      {tags.length > 0 && (
        <View style={styles.tagsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContent}
          >
            {tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Left-edge fade so tags dissolve gracefully into the label */}
          <LinearGradient
            colors={[theme.colors.background, `${theme.colors.background}00`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fadeLeft}
          />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create((theme) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  time: {
    fontSize: 13,
    color: theme.colors.textMuted,
    width: 68,
  },
  squircle: {
    width: SQUIRCLE_SIZE,
    height: SQUIRCLE_SIZE,
    borderRadius: 4,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.typography,
    letterSpacing: -0.4,
    flexShrink: 1,
  },
  tagsContainer: {
    flex: 1,
  },
  tagsContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: 8,
    paddingLeft: FADE_WIDTH,
  },
  fadeLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: FADE_WIDTH,
    pointerEvents: 'none',
  },
  tag: {
    backgroundColor: theme.colors.surface,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
}));

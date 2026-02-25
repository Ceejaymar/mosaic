import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet, useUnistyles } from 'react-native-unistyles';

import type { InsightEntry } from '@/src/features/insights/types';

type Props = { entries: InsightEntry[] };

const TIME_BLOCKS = [
  { id: 'morning', label: 'Morning' },
  { id: 'afternoon', label: 'Afternoon' },
  { id: 'evening', label: 'Evening' },
  { id: 'night', label: 'Night' },
] as const;

export function RhythmBar({ entries }: Props) {
  const { theme } = useUnistyles();

  const rhythmData = useMemo(() => {
    return TIME_BLOCKS.map(({ id, label }) => {
      // 1. Filter entries for this specific time of day
      const timeEntries = entries.filter((e) => e.timeOfDay === id);
      const colorCounts: Record<string, number> = {};
      let totalCount = 0;

      // 2. Tally the core colors
      for (const entry of timeEntries) {
        for (const rawColor of entry.emotions) {
          colorCounts[rawColor] = (colorCounts[rawColor] || 0) + 1;
          totalCount++;
        }
      }

      // 3. Convert to array and sort largest to smallest
      const segments = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([color, count]) => ({ color, flex: count })); // Flex perfectly handles the percentages!

      return { id, label, segments, isEmpty: totalCount === 0 };
    });
  }, [entries]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Rhythm</Text>

      <View style={styles.barContainer}>
        {rhythmData.map((block) => (
          <View key={block.id} style={styles.timeColumn}>
            {/* The individual time block capsule */}
            <View style={styles.capsule}>
              {block.isEmpty ? (
                <View style={[styles.segment, { backgroundColor: theme.colors.surface }]} />
              ) : (
                block.segments.map((seg, i) => (
                  <View
                    key={`${block.id}-${seg.color}-${i}`}
                    style={[styles.segment, { flex: seg.flex, backgroundColor: seg.color }]}
                  />
                ))
              )}
            </View>

            {/* The label perfectly centered under its capsule */}
            <Text style={[styles.label, { color: theme.colors.textMuted }]} numberOfLines={1}>
              {block.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: { paddingHorizontal: 24, marginBottom: 32 },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'Fraunces',
    color: theme.colors.typography,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  barContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 8,
  },
  timeColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  capsule: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  segment: {
    height: '100%',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
  },
}));

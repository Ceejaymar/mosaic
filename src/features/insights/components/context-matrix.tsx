import { useMemo } from 'react';
import { Text, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import type { InsightEntry } from '@/src/features/insights/types';

type Category = 'activities' | 'people' | 'places';
type Props = { entries: InsightEntry[]; category: Category; title: string };

export function ContextMatrix({ entries, category, title }: Props) {
  const topItems = useMemo(() => {
    // 1. Count occurrences of each item and its associated emotions
    const itemStats: Record<string, { total: number; colors: Record<string, number> }> = {};

    for (const entry of entries) {
      const items = entry[category];
      for (const item of items) {
        if (!itemStats[item]) itemStats[item] = { total: 0, colors: {} };
        itemStats[item].total += 1;

        for (const color of entry.coreEmotions) {
          itemStats[item].colors[color] = (itemStats[item].colors[color] || 0) + 1;
        }
      }
    }

    // 2. Sort by frequency and take the top 3
    const sortedItems = Object.entries(itemStats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 3);

    // 3. Format into an array suitable for rendering percentages
    return sortedItems.map(([name, stats]) => {
      // Calculate total emotion tags for this item to get percentages
      const totalEmotions = Object.values(stats.colors).reduce((a, b) => a + b, 0);
      const segments = Object.entries(stats.colors)
        .sort((a, b) => b[1] - a[1]) // largest color segments first
        .map(([color, count]) => ({
          color,
          flex: count / totalEmotions, // Flex directly uses the decimal percentage!
        }));

      return { name, segments };
    });
  }, [entries, category]);

  if (topItems.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.list}>
        {topItems.map((item) => (
          <View key={item.name} style={styles.row}>
            <Text style={styles.label} numberOfLines={1}>
              {item.name}
            </Text>

            {/* The Split-Color Progress Pill */}
            <View style={styles.pillContainer}>
              {item.segments.map((segment, index) => (
                <View
                  key={`${item.name}-${segment.color}-${index}`}
                  style={{ backgroundColor: segment.color, flex: segment.flex }}
                />
              ))}
            </View>
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
    marginBottom: theme.spacing[4],
  },
  list: { gap: theme.spacing[4] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: theme.fontSize.md,
    fontWeight: '500',
    color: theme.colors.typography,
    marginRight: theme.spacing[4],
  },
  pillContainer: {
    flex: 2,
    height: 12,
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden', // Clips the inner flex segments to the rounded corners
    backgroundColor: theme.colors.surface, // fallback
  },
}));
